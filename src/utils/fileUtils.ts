import { invoke } from '@tauri-apps/api/core'
import type { StoryProject } from '../types/story'

export interface FileInfo {
  name: string
  path: string
  is_directory: boolean
}

// Check if running in Tauri environment
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window
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

// Save project to JSON file
export async function saveProject(path: string, project: StoryProject): Promise<void> {
  const json = JSON.stringify(project, null, 2)
  await writeStoryFile(path, json)
}

// Load project from JSON file
export async function loadProject(path: string): Promise<StoryProject> {
  const json = await readStoryFile(path)
  return JSON.parse(json) as StoryProject
}

// Export project for gosunideckbuilding compatibility
export function exportForGame(project: StoryProject): string {
  // The format is already compatible, just export stages
  return JSON.stringify({ stages: project.stages }, null, 2)
}

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
