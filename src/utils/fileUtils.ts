import { invoke } from '@tauri-apps/api/core'
import type { StoryProject, StoryStage, StoryChapter, GameSettings, ProjectResource, CustomNodeTemplate } from '../types/story'

export interface FileInfo {
  name: string
  path: string
  is_directory: boolean
}

export interface ImageResource {
  name: string
  path: string
  data_url: string
}

// Check if running in Tauri environment
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' &&
    ('__TAURI__' in window || '__TAURI_INTERNALS__' in window)
}

// Check if File System Access API is supported
export const isFileSystemAccessSupported = (): boolean => {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

// ============================================
// 웹 File System Access API 관련
// ============================================

// 웹용 디렉토리 핸들 저장소 (메모리에 유지)
let webDirectoryHandle: FileSystemDirectoryHandle | null = null

export function getWebDirectoryHandle(): FileSystemDirectoryHandle | null {
  return webDirectoryHandle
}

export function setWebDirectoryHandle(handle: FileSystemDirectoryHandle | null): void {
  webDirectoryHandle = handle
}

// 웹에서 폴더 선택 다이얼로그 열기
export async function pickWebDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported in this browser')
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
    webDirectoryHandle = handle
    return handle
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return null // 사용자가 취소
    }
    throw error
  }
}

// 웹에서 파일 읽기
async function readWebFile(dirHandle: FileSystemDirectoryHandle, relativePath: string): Promise<string> {
  const parts = relativePath.split('/').filter(p => p)
  let currentHandle: FileSystemDirectoryHandle = dirHandle

  // 경로의 디렉토리 부분 순회
  for (let i = 0; i < parts.length - 1; i++) {
    currentHandle = await currentHandle.getDirectoryHandle(parts[i])
  }

  const fileName = parts[parts.length - 1]
  const fileHandle = await currentHandle.getFileHandle(fileName)
  const file = await fileHandle.getFile()
  return await file.text()
}

// 웹에서 파일 쓰기
async function writeWebFile(dirHandle: FileSystemDirectoryHandle, relativePath: string, content: string): Promise<void> {
  const parts = relativePath.split('/').filter(p => p)
  let currentHandle: FileSystemDirectoryHandle = dirHandle

  // 경로의 디렉토리 부분 순회 (없으면 생성)
  for (let i = 0; i < parts.length - 1; i++) {
    currentHandle = await currentHandle.getDirectoryHandle(parts[i], { create: true })
  }

  const fileName = parts[parts.length - 1]
  const fileHandle = await currentHandle.getFileHandle(fileName, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(content)
  await writable.close()
}

// 웹에서 디렉토리 생성
async function createWebDirectory(dirHandle: FileSystemDirectoryHandle, relativePath: string): Promise<void> {
  const parts = relativePath.split('/').filter(p => p)
  let currentHandle: FileSystemDirectoryHandle = dirHandle

  for (const part of parts) {
    currentHandle = await currentHandle.getDirectoryHandle(part, { create: true })
  }
}

// 웹에서 이미지 파일 목록 가져오기
async function listWebImageFiles(dirHandle: FileSystemDirectoryHandle, relativePath: string): Promise<ImageResource[]> {
  const resources: ImageResource[] = []
  const parts = relativePath.split('/').filter(p => p)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentHandle: any = dirHandle

  try {
    for (const part of parts) {
      currentHandle = await currentHandle.getDirectoryHandle(part)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const entry of currentHandle.values() as AsyncIterable<any>) {
      if (entry.kind === 'file') {
        const ext = entry.name.split('.').pop()?.toLowerCase()
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '')) {
          const file = await entry.getFile()
          const dataUrl = await fileToDataUrl(file)
          resources.push({
            name: entry.name,
            path: `${relativePath}/${entry.name}`,
            data_url: dataUrl,
          })
        }
      }
    }
  } catch (error) {
    // 디렉토리가 없으면 빈 배열 반환
    console.log('[listWebImageFiles] Directory not found:', relativePath)
  }

  return resources
}

// File을 data URL로 변환
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Read a story file
export async function readStoryFile(path: string): Promise<string> {
  if (isTauri()) {
    return await invoke<string>('read_story_file', { path })
  }
  throw new Error('File operations are only available in Tauri environment')
}

// Write a story file
export async function writeStoryFile(path: string, content: string): Promise<void> {
  if (isTauri()) {
    await invoke('write_story_file', { path, content })
    return
  }
  throw new Error('File operations are only available in Tauri environment')
}

// List story files in a directory
export async function listStoryFiles(dir: string): Promise<FileInfo[]> {
  if (isTauri()) {
    return await invoke<FileInfo[]>('list_story_files', { dir })
  }
  throw new Error('File operations are only available in Tauri environment')
}

// Check if a file exists
export async function fileExists(path: string): Promise<boolean> {
  if (isTauri()) {
    return await invoke<boolean>('file_exists', { path })
  }
  return false
}

// Create a directory
export async function createDirectory(path: string): Promise<void> {
  if (isTauri()) {
    await invoke('create_directory', { path })
    return
  }
  throw new Error('File operations are only available in Tauri environment')
}

// Delete a file or directory
export async function deletePath(path: string): Promise<void> {
  if (isTauri()) {
    await invoke('delete_path', { path })
    return
  }
  throw new Error('File operations are only available in Tauri environment')
}

// List image files in a directory (returns with base64 data)
export async function listImageFiles(dir: string): Promise<ImageResource[]> {
  if (isTauri()) {
    return await invoke<ImageResource[]>('list_image_files', { dir })
  }
  return []
}

// ============================================
// 폴더 기반 프로젝트 저장/로드
// ============================================

interface ProjectMeta {
  name: string
  version: string
  stages: string[] // stage IDs
  gameSettings?: GameSettings
  customNodeTemplates?: CustomNodeTemplate[]
  // resources는 저장하지 않음 - 폴더에서 직접 로드
}

interface StageMeta {
  id: string
  title: string
  description: string
  partyCharacters: string[]
  chapters: string[] // chapter IDs
}

/**
 * 폴더 구조로 프로젝트 저장
 *
 * projectDir/
 * ├── project.json           # 프로젝트 메타데이터
 * ├── stage_1/
 * │   ├── stage.json         # 스테이지 정보
 * │   ├── chapter_1.json     # 챕터 데이터
 * │   └── chapter_2.json
 * └── stage_2/
 *     ├── stage.json
 *     └── chapter_1.json
 */
export async function saveProjectToFolder(projectDir: string, project: StoryProject): Promise<void> {
  // 웹 환경에서 File System Access API 사용
  if (!isTauri() && webDirectoryHandle) {
    return await saveProjectToFolderWeb(webDirectoryHandle, project)
  }

  if (!isTauri()) {
    throw new Error('Folder operations are only available in Tauri environment or with File System Access API')
  }

  // 1. 프로젝트 메타데이터 저장 (resources는 저장하지 않음 - 폴더에서 직접 로드)
  const projectMeta: ProjectMeta = {
    name: project.name,
    version: project.version,
    stages: project.stages.map(s => s.id),
    gameSettings: project.gameSettings,
    customNodeTemplates: project.customNodeTemplates,
  }
  await writeStoryFile(`${projectDir}/project.json`, JSON.stringify(projectMeta, null, 2))

  // 2. 각 스테이지 저장
  for (const stage of project.stages) {
    const stageDir = `${projectDir}/${stage.id}`
    await createDirectory(stageDir)

    // 스테이지 메타데이터
    const stageMeta: StageMeta = {
      id: stage.id,
      title: stage.title,
      description: stage.description || '',
      partyCharacters: stage.partyCharacters || [],
      chapters: stage.chapters.map(c => c.id),
    }
    await writeStoryFile(`${stageDir}/stage.json`, JSON.stringify(stageMeta, null, 2))

    // 각 챕터 저장
    for (const chapter of stage.chapters) {
      await writeStoryFile(`${stageDir}/${chapter.id}.json`, JSON.stringify(chapter, null, 2))
    }
  }
}

/**
 * 웹 File System Access API를 사용하여 프로젝트 저장
 */
async function saveProjectToFolderWeb(dirHandle: FileSystemDirectoryHandle, project: StoryProject): Promise<void> {
  // 1. 프로젝트 메타데이터 저장
  const projectMeta: ProjectMeta = {
    name: project.name,
    version: project.version,
    stages: project.stages.map(s => s.id),
    gameSettings: project.gameSettings,
    customNodeTemplates: project.customNodeTemplates,
  }
  await writeWebFile(dirHandle, 'project.json', JSON.stringify(projectMeta, null, 2))

  // 2. 각 스테이지 저장
  for (const stage of project.stages) {
    await createWebDirectory(dirHandle, stage.id)

    // 스테이지 메타데이터
    const stageMeta: StageMeta = {
      id: stage.id,
      title: stage.title,
      description: stage.description || '',
      partyCharacters: stage.partyCharacters || [],
      chapters: stage.chapters.map(c => c.id),
    }
    await writeWebFile(dirHandle, `${stage.id}/stage.json`, JSON.stringify(stageMeta, null, 2))

    // 각 챕터 저장
    for (const chapter of stage.chapters) {
      await writeWebFile(dirHandle, `${stage.id}/${chapter.id}.json`, JSON.stringify(chapter, null, 2))
    }
  }
}

/**
 * 폴더 구조에서 프로젝트 로드
 */
export async function loadProjectFromFolder(projectDir: string): Promise<StoryProject> {
  // 웹 환경에서 File System Access API 사용
  if (!isTauri() && webDirectoryHandle) {
    return await loadProjectFromFolderWeb(webDirectoryHandle)
  }

  if (!isTauri()) {
    throw new Error('Folder operations are only available in Tauri environment or with File System Access API')
  }

  // 1. 프로젝트 메타데이터 로드
  let projectMeta: ProjectMeta
  try {
    const projectMetaJson = await readStoryFile(`${projectDir}/project.json`)
    console.log('[loadProject] project.json raw:', projectMetaJson.substring(0, 500))
    projectMeta = JSON.parse(projectMetaJson)
    console.log('[loadProject] project.json parsed:', projectMeta)
  } catch (error) {
    console.error('[loadProject] Failed to parse project.json:', error)
    throw new Error(`Failed to parse project.json: ${(error as Error).message}`)
  }

  // 2. 각 스테이지 로드
  const stages: StoryStage[] = []
  for (const stageId of projectMeta.stages) {
    const stageDir = `${projectDir}/${stageId}`

    // 스테이지 메타데이터
    let stageMeta: StageMeta
    try {
      const stageMetaJson = await readStoryFile(`${stageDir}/stage.json`)
      console.log(`[loadProject] ${stageId}/stage.json raw:`, stageMetaJson.substring(0, 500))
      stageMeta = JSON.parse(stageMetaJson)
      console.log(`[loadProject] ${stageId}/stage.json parsed:`, stageMeta)
    } catch (error) {
      console.error(`[loadProject] Failed to parse ${stageDir}/stage.json:`, error)
      throw new Error(`Failed to parse ${stageDir}/stage.json: ${(error as Error).message}`)
    }

    // 각 챕터 로드
    const chapters: StoryChapter[] = []
    for (const chapterId of stageMeta.chapters) {
      try {
        const chapterJson = await readStoryFile(`${stageDir}/${chapterId}.json`)
        console.log(`[loadProject] ${stageId}/${chapterId}.json raw:`, chapterJson.substring(0, 500))
        const chapter = JSON.parse(chapterJson)
        console.log(`[loadProject] ${stageId}/${chapterId}.json parsed, nodes:`, chapter.nodes?.length)
        chapters.push(chapter)
      } catch (error) {
        console.error(`[loadProject] Failed to parse ${stageDir}/${chapterId}.json:`, error)
        throw new Error(`Failed to parse ${stageDir}/${chapterId}.json: ${(error as Error).message}`)
      }
    }

    stages.push({
      id: stageMeta.id,
      title: stageMeta.title,
      description: stageMeta.description,
      partyCharacters: stageMeta.partyCharacters,
      chapters,
    })
  }

  // 3. 리소스 폴더 스캔 (새로운 구조: resources/images)
  const resources: ProjectResource[] = []

  // resources/images 폴더 스캔
  console.log('[loadProject] Scanning resources/images folder:', `${projectDir}/resources/images`)
  const imageFiles = await listImageFiles(`${projectDir}/resources/images`)
  console.log('[loadProject] Image files found:', imageFiles.length, imageFiles.map(f => f.name))
  for (const file of imageFiles) {
    resources.push({
      id: `img_${file.name.replace(/\.[^/.]+$/, '')}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      type: 'image',
      path: file.data_url, // base64 data URL 사용
    })
  }

  console.log('[loadProject] Total resources loaded:', resources.length)
  return {
    name: projectMeta.name,
    version: projectMeta.version,
    stages,
    gameSettings: projectMeta.gameSettings,
    customNodeTemplates: projectMeta.customNodeTemplates,
    resources,
  }
}

/**
 * 웹 File System Access API를 사용하여 프로젝트 로드
 */
async function loadProjectFromFolderWeb(dirHandle: FileSystemDirectoryHandle): Promise<StoryProject> {
  // 1. 프로젝트 메타데이터 로드
  let projectMeta: ProjectMeta
  try {
    const projectMetaJson = await readWebFile(dirHandle, 'project.json')
    console.log('[loadProjectWeb] project.json raw:', projectMetaJson.substring(0, 500))
    projectMeta = JSON.parse(projectMetaJson)
    console.log('[loadProjectWeb] project.json parsed:', projectMeta)
  } catch (error) {
    console.error('[loadProjectWeb] Failed to parse project.json:', error)
    throw new Error(`Failed to parse project.json: ${(error as Error).message}`)
  }

  // 2. 각 스테이지 로드
  const stages: StoryStage[] = []
  for (const stageId of projectMeta.stages) {
    // 스테이지 메타데이터
    let stageMeta: StageMeta
    try {
      const stageMetaJson = await readWebFile(dirHandle, `${stageId}/stage.json`)
      console.log(`[loadProjectWeb] ${stageId}/stage.json raw:`, stageMetaJson.substring(0, 500))
      stageMeta = JSON.parse(stageMetaJson)
      console.log(`[loadProjectWeb] ${stageId}/stage.json parsed:`, stageMeta)
    } catch (error) {
      console.error(`[loadProjectWeb] Failed to parse ${stageId}/stage.json:`, error)
      throw new Error(`Failed to parse ${stageId}/stage.json: ${(error as Error).message}`)
    }

    // 각 챕터 로드
    const chapters: StoryChapter[] = []
    for (const chapterId of stageMeta.chapters) {
      try {
        const chapterJson = await readWebFile(dirHandle, `${stageId}/${chapterId}.json`)
        console.log(`[loadProjectWeb] ${stageId}/${chapterId}.json raw:`, chapterJson.substring(0, 500))
        const chapter = JSON.parse(chapterJson)
        console.log(`[loadProjectWeb] ${stageId}/${chapterId}.json parsed, nodes:`, chapter.nodes?.length)
        chapters.push(chapter)
      } catch (error) {
        console.error(`[loadProjectWeb] Failed to parse ${stageId}/${chapterId}.json:`, error)
        throw new Error(`Failed to parse ${stageId}/${chapterId}.json: ${(error as Error).message}`)
      }
    }

    stages.push({
      id: stageMeta.id,
      title: stageMeta.title,
      description: stageMeta.description,
      partyCharacters: stageMeta.partyCharacters,
      chapters,
    })
  }

  // 3. 리소스 폴더 스캔
  const resources: ProjectResource[] = []
  console.log('[loadProjectWeb] Scanning resources/images folder')
  const imageFiles = await listWebImageFiles(dirHandle, 'resources/images')
  console.log('[loadProjectWeb] Image files found:', imageFiles.length, imageFiles.map(f => f.name))
  for (const file of imageFiles) {
    resources.push({
      id: `img_${file.name.replace(/\.[^/.]+$/, '')}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      type: 'image',
      path: file.data_url,
    })
  }

  console.log('[loadProjectWeb] Total resources loaded:', resources.length)
  return {
    name: projectMeta.name,
    version: projectMeta.version,
    stages,
    gameSettings: projectMeta.gameSettings,
    customNodeTemplates: projectMeta.customNodeTemplates,
    resources,
  }
}

// ============================================
// 레거시: 단일 JSON 파일
// ============================================

// Save project to single JSON file (legacy)
export async function saveProject(path: string, project: StoryProject): Promise<void> {
  const json = JSON.stringify(project, null, 2)
  await writeStoryFile(path, json)
}

// Load project from single JSON file (legacy)
export async function loadProject(path: string): Promise<StoryProject> {
  const json = await readStoryFile(path)
  return JSON.parse(json) as StoryProject
}

// Export project for gosunideckbuilding compatibility
export function exportForGame(project: StoryProject): string {
  // The format is already compatible, just export stages
  return JSON.stringify({ stages: project.stages }, null, 2)
}

// ============================================
// 웹 환경 폴백
// ============================================

// Download file in web environment (fallback)
export function downloadJson(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Download project as ZIP (for web environment)
export async function downloadProjectAsZip(project: StoryProject): Promise<void> {
  // 웹에서는 JSZip 라이브러리가 필요하므로, 단일 JSON으로 폴백
  const json = JSON.stringify(project, null, 2)
  downloadJson(json, `${project.name.toLowerCase().replace(/\s+/g, '_')}.story.json`)
}

// ============================================
// 게임 빌드 익스포트
// ============================================

// Copy directory (Tauri only)
async function copyDirectory(src: string, dest: string): Promise<void> {
  if (isTauri()) {
    await invoke('copy_directory', { src, dest })
    return
  }
  throw new Error('Copy directory is only available in Tauri environment')
}

// Write text file (Tauri only)
async function writeTextFile(path: string, content: string): Promise<void> {
  if (isTauri()) {
    await invoke('write_text_file', { path, content })
    return
  }
  throw new Error('Write text file is only available in Tauri environment')
}

/**
 * 게임 빌드 익스포트 (Tauri 환경)
 * 프로젝트 폴더를 복사하고 index.html 추가
 */
export async function exportGameBuild(
  projectDir: string,
  exportDir: string,
  htmlTemplate: string
): Promise<void> {
  if (!isTauri()) {
    throw new Error('Export game build is only available in Tauri environment')
  }

  // 1. 프로젝트 폴더 복사
  await copyDirectory(projectDir, exportDir)

  // 2. index.html 생성
  await writeTextFile(`${exportDir}/index.html`, htmlTemplate)
}

/**
 * 게임 빌드를 단일 HTML로 다운로드 (웹 환경 폴백)
 * 모든 데이터를 HTML에 임베딩
 */
export function downloadGameBuildAsHtml(htmlContent: string, projectName: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_game.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
