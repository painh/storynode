import { invoke } from '@tauri-apps/api/core'
import type { StoryProject, StoryStage, StoryChapter, GameSettings, ProjectResource, EditorData } from '../types/story'

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
  resources?: ProjectResource[]
  editorData?: EditorData
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
  if (!isTauri()) {
    throw new Error('Folder operations are only available in Tauri environment')
  }

  // 1. 프로젝트 메타데이터 저장
  const projectMeta: ProjectMeta = {
    name: project.name,
    version: project.version,
    stages: project.stages.map(s => s.id),
    gameSettings: project.gameSettings,
    resources: project.resources,
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
 * 폴더 구조에서 프로젝트 로드
 */
export async function loadProjectFromFolder(projectDir: string): Promise<StoryProject> {
  if (!isTauri()) {
    throw new Error('Folder operations are only available in Tauri environment')
  }

  // 1. 프로젝트 메타데이터 로드
  const projectMetaJson = await readStoryFile(`${projectDir}/project.json`)
  const projectMeta: ProjectMeta = JSON.parse(projectMetaJson)

  // 2. 각 스테이지 로드
  const stages: StoryStage[] = []
  for (const stageId of projectMeta.stages) {
    const stageDir = `${projectDir}/${stageId}`

    // 스테이지 메타데이터
    const stageMetaJson = await readStoryFile(`${stageDir}/stage.json`)
    const stageMeta: StageMeta = JSON.parse(stageMetaJson)

    // 각 챕터 로드
    const chapters: StoryChapter[] = []
    for (const chapterId of stageMeta.chapters) {
      const chapterJson = await readStoryFile(`${stageDir}/${chapterId}.json`)
      chapters.push(JSON.parse(chapterJson))
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

  // characters 폴더 스캔
  const characterFiles = await listImageFiles(`${projectDir}/characters`)
  for (const file of characterFiles) {
    resources.push({
      id: `char_${file.name.replace(/\.[^/.]+$/, '')}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      type: 'character',
      path: file.data_url, // base64 data URL 사용
    })
  }

  // backgrounds 폴더 스캔
  const backgroundFiles = await listImageFiles(`${projectDir}/backgrounds`)
  for (const file of backgroundFiles) {
    resources.push({
      id: `bg_${file.name.replace(/\.[^/.]+$/, '')}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      type: 'background',
      path: file.data_url, // base64 data URL 사용
    })
  }

  return {
    name: projectMeta.name,
    version: projectMeta.version,
    stages,
    gameSettings: projectMeta.gameSettings,
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
