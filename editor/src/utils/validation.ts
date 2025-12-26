// 프로젝트 유효성 검사 유틸리티

import type { StoryProject, StoryStage, StoryChapter } from '../types/story'

// 유효성 검사 이슈 타입
export type ValidationIssueType = 'error' | 'warning'

// 유효성 검사 이슈
export interface ValidationIssue {
  type: ValidationIssueType
  message: string
  stageId?: string
  stageTitle?: string
  chapterId?: string
  chapterTitle?: string
  nodeId?: string
}

// 유효성 검사 결과
export interface ValidationResult {
  isValid: boolean
  issues: ValidationIssue[]
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

// 챕터 유효성 검사
export function validateChapter(
  chapter: StoryChapter,
  stageId: string,
  stageTitle: string
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // 시작 노드 체크
  const startNodes = chapter.nodes.filter(n => n.type === 'start')
  if (startNodes.length === 0) {
    issues.push({
      type: 'error',
      message: '시작 노드가 없습니다',
      stageId,
      stageTitle,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
    })
  } else if (startNodes.length > 1) {
    issues.push({
      type: 'warning',
      message: `시작 노드가 ${startNodes.length}개 있습니다 (1개만 권장)`,
      stageId,
      stageTitle,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
    })
  }

  // 챕터 종료 노드 체크
  const endNodes = chapter.nodes.filter(n => n.type === 'chapter_end')
  if (endNodes.length === 0) {
    issues.push({
      type: 'error',
      message: '챕터 종료 노드가 없습니다',
      stageId,
      stageTitle,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
    })
  }

  return issues
}

// 스테이지 유효성 검사
export function validateStage(stage: StoryStage): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // 챕터가 없는 경우
  if (stage.chapters.length === 0) {
    issues.push({
      type: 'warning',
      message: '챕터가 없습니다',
      stageId: stage.id,
      stageTitle: stage.title,
    })
    return issues
  }

  // 각 챕터 검사
  for (const chapter of stage.chapters) {
    const chapterIssues = validateChapter(chapter, stage.id, stage.title)
    issues.push(...chapterIssues)
  }

  return issues
}

// 프로젝트 전체 유효성 검사
export function validateProject(project: StoryProject): ValidationResult {
  const issues: ValidationIssue[] = []

  // 스테이지가 없는 경우
  if (project.stages.length === 0) {
    issues.push({
      type: 'error',
      message: '스테이지가 없습니다',
    })
  } else {
    // 각 스테이지 검사
    for (const stage of project.stages) {
      const stageIssues = validateStage(stage)
      issues.push(...stageIssues)
    }
  }

  const errors = issues.filter(i => i.type === 'error')
  const warnings = issues.filter(i => i.type === 'warning')

  return {
    isValid: errors.length === 0,
    issues,
    errors,
    warnings,
  }
}

// 특정 챕터만 검사 (게임 플레이 시)
export function validateChapterById(
  project: StoryProject,
  stageId: string,
  chapterId: string
): ValidationResult {
  const issues: ValidationIssue[] = []

  const stage = project.stages.find(s => s.id === stageId)
  if (!stage) {
    issues.push({
      type: 'error',
      message: '스테이지를 찾을 수 없습니다',
      stageId,
    })
    return { isValid: false, issues, errors: issues, warnings: [] }
  }

  const chapter = stage.chapters.find(c => c.id === chapterId)
  if (!chapter) {
    issues.push({
      type: 'error',
      message: '챕터를 찾을 수 없습니다',
      stageId,
      stageTitle: stage.title,
      chapterId,
    })
    return { isValid: false, issues, errors: issues, warnings: [] }
  }

  const chapterIssues = validateChapter(chapter, stage.id, stage.title)
  issues.push(...chapterIssues)

  const errors = issues.filter(i => i.type === 'error')
  const warnings = issues.filter(i => i.type === 'warning')

  return {
    isValid: errors.length === 0,
    issues,
    errors,
    warnings,
  }
}

// 이슈를 사람이 읽기 쉬운 문자열로 변환
export function formatValidationIssue(issue: ValidationIssue): string {
  const parts: string[] = []
  
  if (issue.stageTitle) {
    parts.push(`[${issue.stageTitle}]`)
  }
  if (issue.chapterTitle) {
    parts.push(`[${issue.chapterTitle}]`)
  }
  
  parts.push(issue.message)
  
  return parts.join(' ')
}

// 이슈 목록을 요약 문자열로 변환
export function formatValidationSummary(result: ValidationResult): string {
  if (result.isValid && result.warnings.length === 0) {
    return '유효성 검사 통과'
  }

  const lines: string[] = []
  
  if (result.errors.length > 0) {
    lines.push(`오류 ${result.errors.length}개:`)
    for (const error of result.errors) {
      lines.push(`  - ${formatValidationIssue(error)}`)
    }
  }
  
  if (result.warnings.length > 0) {
    if (lines.length > 0) lines.push('')
    lines.push(`경고 ${result.warnings.length}개:`)
    for (const warning of result.warnings) {
      lines.push(`  - ${formatValidationIssue(warning)}`)
    }
  }
  
  return lines.join('\n')
}
