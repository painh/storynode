import { invoke } from '@tauri-apps/api/core'
import { save } from '@tauri-apps/plugin-dialog'
import JSZip from 'jszip'
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

// Download file in web environment (with File System Access API support)
export async function downloadJson(content: string, filename: string): Promise<void> {
  const blob = new Blob([content], { type: 'application/json' })

  // Tauri 환경에서는 저장 다이얼로그 표시
  if (isTauri()) {
    try {
      const savePath = await save({
        defaultPath: filename,
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })

      if (savePath) {
        await invoke('write_story_file', { path: savePath, content })
      }
    } catch (error) {
      console.error('Failed to save JSON file:', error)
      throw error
    }
  } else if (isFileSystemAccessSupported()) {
    // 웹 환경에서 File System Access API 지원 시 저장 다이얼로그 표시
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'JSON',
          accept: { 'application/json': ['.json'] },
        }],
      })
      const writable = await fileHandle.createWritable()
      await writable.write(blob)
      await writable.close()
    } catch (error) {
      // 사용자가 취소한 경우 (AbortError) 무시
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to save JSON file:', error)
        throw error
      }
    }
  } else {
    // File System Access API 미지원 시 기존 다운로드 방식
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// Download project as JSON (legacy function name kept for compatibility)
export async function downloadProjectAsZip(project: StoryProject): Promise<void> {
  const json = JSON.stringify(project, null, 2)
  await downloadJson(json, `${project.name.toLowerCase().replace(/\s+/g, '_')}.story.json`)
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
 * 게임 빌드를 ZIP으로 다운로드
 * 폴더 구조 유지 + 이미지 리소스 포함
 */
export async function downloadGameBuildAsZip(
  project: StoryProject,
  htmlTemplate: string
): Promise<void> {
  const zip = new JSZip()

  // 1. index.html 추가
  zip.file('index.html', htmlTemplate)

  // 2. project.json 추가 (스테이지 ID 목록만)
  const projectMeta = {
    name: project.name,
    version: project.version,
    stages: project.stages.map(s => s.id),
    gameSettings: project.gameSettings,
  }
  zip.file('project.json', JSON.stringify(projectMeta, null, 2))

  // 3. 각 스테이지 폴더 생성
  for (const stage of project.stages) {
    const stageFolder = zip.folder(stage.id)
    if (!stageFolder) continue

    // stage.json
    const stageMeta = {
      id: stage.id,
      title: stage.title,
      description: stage.description || '',
      partyCharacters: stage.partyCharacters || [],
      chapters: stage.chapters.map(c => c.id),
    }
    stageFolder.file('stage.json', JSON.stringify(stageMeta, null, 2))

    // 각 챕터 JSON
    for (const chapter of stage.chapters) {
      // 챕터 데이터에서 이미지 경로를 상대 경로로 변환
      const chapterData = convertImagePathsForExport(chapter)
      stageFolder.file(`${chapter.id}.json`, JSON.stringify(chapterData, null, 2))
    }
  }

  // 4. 이미지 리소스 추가
  if (project.resources && project.resources.length > 0) {
    const resourcesFolder = zip.folder('resources')
    const imagesFolder = resourcesFolder?.folder('images')

    if (imagesFolder) {
      for (const resource of project.resources) {
        if (resource.type === 'image' && resource.path) {
          // data URL을 바이너리로 변환
          if (resource.path.startsWith('data:')) {
            const base64Data = resource.path.split(',')[1]
            if (base64Data) {
              const extension = getImageExtension(resource.path)
              const filename = `${resource.name}.${extension}`
              imagesFolder.file(filename, base64Data, { base64: true })
            }
          }
        }
      }
    }
  }

  // 5. ZIP 생성
  const content = await zip.generateAsync({ type: 'blob' })

  // 프로젝트 이름을 안전한 파일명으로 변환 (공백 -> 언더스코어, 특수문자 제거)
  const safeName = project.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '') || 'game'
  const defaultFileName = `${safeName}.zip`

  // Tauri 환경에서는 저장 다이얼로그 표시
  if (isTauri()) {
    try {
      const savePath = await save({
        defaultPath: defaultFileName,
        filters: [{ name: 'ZIP Archive', extensions: ['zip'] }],
      })

      if (savePath) {
        // Blob을 ArrayBuffer로 변환 후 Uint8Array로 변환
        const arrayBuffer = await content.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)

        // Rust 백엔드로 파일 저장
        await invoke('write_binary_file', {
          path: savePath,
          data: Array.from(uint8Array),
        })
      }
      // 사용자가 취소한 경우 아무것도 하지 않음
    } catch (error) {
      console.error('Failed to save ZIP file:', error)
      throw error
    }
  } else if (isFileSystemAccessSupported()) {
    // 웹 환경에서 File System Access API 지원 시 저장 다이얼로그 표시
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: defaultFileName,
        types: [{
          description: 'ZIP Archive',
          accept: { 'application/zip': ['.zip'] },
        }],
      })
      const writable = await fileHandle.createWritable()
      await writable.write(content)
      await writable.close()
    } catch (error) {
      // 사용자가 취소한 경우 (AbortError) 무시
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to save ZIP file:', error)
        throw error
      }
    }
  } else {
    // File System Access API 미지원 시 기존 다운로드 방식
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = defaultFileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

/**
 * data URL에서 이미지 확장자 추출
 */
function getImageExtension(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/(\w+);/)
  if (match) {
    const ext = match[1]
    // jpeg -> jpg
    return ext === 'jpeg' ? 'jpg' : ext
  }
  return 'png' // 기본값
}

/**
 * 챕터 데이터의 이미지 경로를 내보내기용 상대 경로로 변환
 */
function convertImagePathsForExport(chapter: StoryChapter): StoryChapter {
  const converted = JSON.parse(JSON.stringify(chapter)) as StoryChapter

  for (const node of converted.nodes) {
    if (node.type === 'image' && node.imageData?.resourcePath) {
      const resourcePath = node.imageData.resourcePath
      // data URL인 경우 파일명만 추출하여 상대 경로로 변환
      if (resourcePath.startsWith('data:')) {
        // 리소스 이름으로 경로 생성 (나중에 실제 파일명과 매칭)
        // 이 경우는 처리하지 않음 - 이미 저장된 프로젝트에서는 파일명이 있어야 함
      } else if (!resourcePath.startsWith('/') && !resourcePath.includes('://')) {
        // 이미 상대 경로면 그대로 유지
        node.imageData.resourcePath = resourcePath
      }
    }
  }

  return converted
}

// ============================================
// 실행 파일 내보내기 (Standalone Game Export)
// ============================================

/**
 * 사용 가능한 플레이어 바이너리 목록 조회
 */
export async function listPlayerBinaries(): Promise<string[]> {
  if (!isTauri()) {
    return []
  }
  try {
    return await invoke<string[]>('list_player_binaries')
  } catch (error) {
    console.error('Failed to list player binaries:', error)
    return []
  }
}

/**
 * 프로젝트를 ZIP 데이터로 변환 (바이너리용)
 */
export async function createGameZipData(project: StoryProject): Promise<Uint8Array> {
  const zip = new JSZip()

  // project.json
  const projectMeta = {
    name: project.name,
    version: project.version,
    stages: project.stages.map(s => s.id),
    gameSettings: project.gameSettings,
    variables: project.variables,
  }
  zip.file('project.json', JSON.stringify(projectMeta, null, 2))

  // 각 스테이지 폴더
  for (const stage of project.stages) {
    const stageFolder = zip.folder(stage.id)
    if (!stageFolder) continue

    const stageMeta = {
      id: stage.id,
      title: stage.title,
      description: stage.description || '',
      partyCharacters: stage.partyCharacters || [],
      chapters: stage.chapters.map(c => c.id),
    }
    stageFolder.file('stage.json', JSON.stringify(stageMeta, null, 2))

    for (const chapter of stage.chapters) {
      const chapterData = convertImagePathsForExport(chapter)
      stageFolder.file(`${chapter.id}.json`, JSON.stringify(chapterData, null, 2))
    }
  }

  // 이미지 리소스
  if (project.resources && project.resources.length > 0) {
    const resourcesFolder = zip.folder('resources')
    const imagesFolder = resourcesFolder?.folder('images')

    if (imagesFolder) {
      for (const resource of project.resources) {
        if (resource.type === 'image' && resource.path) {
          if (resource.path.startsWith('data:')) {
            const base64Data = resource.path.split(',')[1]
            if (base64Data) {
              const extension = getImageExtension(resource.path)
              const filename = `${resource.name}.${extension}`
              imagesFolder.file(filename, base64Data, { base64: true })
            }
          }
        }
      }
    }
  }

  const arrayBuffer = await zip.generateAsync({ type: 'arraybuffer' })
  return new Uint8Array(arrayBuffer)
}

/**
 * 독립 실행 파일로 게임 내보내기 (Tauri only)
 */
export async function exportStandaloneGame(
  project: StoryProject,
  playerBinaryName: string,
  outputPath: string
): Promise<void> {
  if (!isTauri()) {
    throw new Error('Standalone export is only available in Tauri environment')
  }

  // 1. 프로젝트를 ZIP 데이터로 변환
  const zipData = await createGameZipData(project)

  // 2. Rust 백엔드에서 바이너리 결합
  await invoke('export_standalone_game', {
    playerBinaryName,
    gameZipData: Array.from(zipData),
    outputPath,
  })
}

// ============================================
// 서버 API 저장/로드 (임베드 모드용)
// ============================================

/**
 * 서버 API로 프로젝트 저장
 * Wizardry editor-server의 /api/events 엔드포인트 사용
 */
export async function saveProjectToServer(
  serverUrl: string,
  projectId: string,
  project: StoryProject
): Promise<void> {
  // 프로젝트 데이터 변환 (API 형식에 맞게)
  const apiProject = {
    id: projectId,
    name: project.name,
    version: project.version,
    stages: project.stages.map(stage => ({
      ...stage,
      chapters: stage.chapters.map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        nodes: chapter.nodes,
        commentNodes: chapter.commentNodes,
        startNodeId: chapter.startNodeId,
      }))
    })),
    gameSettings: project.gameSettings,
    customNodeTemplates: project.customNodeTemplates,
  }

  const response = await fetch(`${serverUrl}/api/events/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiProject),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`Failed to save project: ${error.error || response.statusText}`)
  }

  console.log('[saveProjectToServer] Project saved successfully:', projectId)
}

/**
 * 서버 API에서 프로젝트 로드
 * 정적 파일은 상대 경로로 로드 (같은 origin에서 서빙됨)
 * Wizardry 구조 지원: stages/stage_id/chapters/chapter_id.json
 */
export async function loadProjectFromServer(
  serverUrl: string,
  projectId: string
): Promise<StoryProject | null> {
  try {
    // 개발 모드에서는 Wizardry dev 서버(5183)에서 데이터 로드
    // serverUrl이 editor-server(3001)를 가리키면, data는 같은 호스트의 5183에서 가져옴
    const isDev = serverUrl.includes('localhost:3001')
    const baseUrl = isDev
      ? `http://localhost:5183/data/events/${projectId}`
      : `../data/events/${projectId}`
    console.log('[loadProjectFromServer] Loading from:', baseUrl, isDev ? '(dev mode)' : '')
    const response = await fetch(`${baseUrl}/project.json`)

    if (!response.ok) {
      if (response.status === 404) {
        console.log('[loadProjectFromServer] Project not found:', projectId)
        return null
      }
      throw new Error(`Failed to load project: ${response.statusText}`)
    }

    const projectMeta = await response.json()
    console.log('[loadProjectFromServer] Project meta loaded:', projectMeta)

    // 각 스테이지/챕터 로드
    const stages: StoryStage[] = []

    // stages가 배열인 경우 처리 (Wizardry 형식: stages는 전체 객체 배열)
    for (const stageMeta of projectMeta.stages) {
      // stageMeta가 문자열(ID)인 경우 (기존 StoryNode 형식)
      if (typeof stageMeta === 'string') {
        const stageResponse = await fetch(`${baseUrl}/stages/${stageMeta}/stage.json`)
        if (!stageResponse.ok) continue

        const stageData = await stageResponse.json()
        const chapters: StoryChapter[] = []

        for (const chapterId of stageData.chapters) {
          const chapterResponse = await fetch(
            `${baseUrl}/stages/${stageMeta}/chapters/${chapterId}.json`
          )
          if (chapterResponse.ok) {
            chapters.push(await chapterResponse.json())
          }
        }

        stages.push({
          id: stageData.id,
          title: stageData.title,
          description: stageData.description,
          partyCharacters: stageData.partyCharacters || [],
          chapters,
        })
      } else {
        // stageMeta가 객체인 경우 (Wizardry 형식)
        const stageId = stageMeta.id
        const chapters: StoryChapter[] = []

        // chapters 배열에서 각 챕터 로드
        for (const chapterMeta of stageMeta.chapters || []) {
          const chapterId = typeof chapterMeta === 'string' ? chapterMeta : chapterMeta.id
          const chapterResponse = await fetch(
            `${baseUrl}/stages/${stageId}/chapters/${chapterId}.json`
          )
          if (chapterResponse.ok) {
            const chapter = await chapterResponse.json()
            console.log(`[loadProjectFromServer] Loaded chapter: ${chapterId}`, chapter.title)
            chapters.push(chapter)
          } else {
            console.warn(`[loadProjectFromServer] Failed to load chapter: ${chapterId}`)
          }
        }

        stages.push({
          id: stageId,
          title: stageMeta.title,
          description: stageMeta.description || '',
          partyCharacters: stageMeta.partyCharacters || [],
          chapters,
        })
      }
    }

    console.log('[loadProjectFromServer] Loaded stages:', stages.map(s => `${s.id} (${s.chapters.length} chapters)`))

    return {
      name: projectMeta.name,
      version: projectMeta.version,
      stages,
      variables: projectMeta.variables,
      gameSettings: projectMeta.gameSettings,
      customNodeTemplates: projectMeta.customNodeTemplates,
      resources: [],
    }
  } catch (error) {
    console.error('[loadProjectFromServer] Failed to load project:', error)
    return null
  }
}

/**
 * 서버가 온라인인지 확인
 */
export async function checkServerOnline(serverUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${serverUrl}/api/events`, {
      method: 'HEAD',
    })
    return response.ok
  } catch {
    return false
  }
}
