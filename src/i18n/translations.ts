// 다국어 번역 데이터

export type Language = 'ko' | 'en'

export interface Translations {
  // 노드 타입 이름
  nodes: {
    start: string
    dialogue: string
    choice: string
    battle: string
    shop: string
    event: string
    chapter_end: string
    variable: string
    condition: string
    comment: string
  }

  // 노드 설명
  nodeDescriptions: {
    start: string
    dialogue: string
    choice: string
    battle: string
    shop: string
    event: string
    chapter_end: string
    variable: string
    condition: string
  }

  // 메뉴
  menu: {
    file: string
    edit: string
    view: string
    settings: string
    newProject: string
    openFolder: string
    openRecent: string
    save: string
    saveAs: string
    importJson: string
    exportJson: string
    exportForGame: string
    undo: string
    redo: string
    selectAll: string
    delete: string
    clearRecent: string
    noRecentProjects: string
    autoLayout: string
  }

  // 설정
  settings: {
    language: string
    openLastProjectOnStartup: string
    autoSave: string
    autoSaveEnabled: string
    autoSaveMode: string
    autoSaveModeOnChange: string
    autoSaveModeInterval: string
    autoSaveModeBoth: string
    autoSaveInterval: string
    autoSaveIntervalMinutes: string
  }

  // Inspector
  inspector: {
    nodeId: string
    nodeType: string
    speaker: string
    text: string
    nextNode: string
    choices: string
    addChoice: string
    battleGroupId: string
    battleRewards: string
    eventId: string
    operations: string
    addOperation: string
    conditions: string
    addCondition: string
    defaultOutput: string
    gold: string
    hp: string
    flag: string
    affection: string
    reputation: string
    set: string
    add: string
    subtract: string
    multiply: string
  }

  // 일반
  common: {
    empty: string
    none: string
    default: string
    true: string
    false: string
    value: string
    key: string
    target: string
    action: string
    character: string
    faction: string
  }

  // 사이드바
  sidebar: {
    nodeLibrary: string
    flow: string
    content: string
    logic: string
    editor: string
  }

  // 검색
  search: {
    placeholder: string
    currentCanvas: string
    allFiles: string
    resultCount: string
    noResults: string
    navigate: string
    goTo: string
    close: string
  }
}

export const translations: Record<Language, Translations> = {
  ko: {
    nodes: {
      start: '시작',
      dialogue: '대사',
      choice: '선택지',
      battle: '전투',
      shop: '상점',
      event: '이벤트',
      chapter_end: '챕터 종료',
      variable: '변수',
      condition: '조건',
      comment: '코멘트',
    },
    nodeDescriptions: {
      start: '스토리 시작점',
      dialogue: '대사 또는 나레이션',
      choice: '플레이어 선택지',
      battle: '전투 발생',
      shop: '상점 열기',
      event: '이벤트 발생',
      chapter_end: '챕터 종료',
      variable: '변수 조작',
      condition: '조건 분기',
    },
    menu: {
      file: '파일',
      edit: '편집',
      view: '보기',
      settings: '설정',
      newProject: '새 프로젝트',
      openFolder: '폴더 열기...',
      openRecent: '최근 프로젝트',
      save: '저장',
      saveAs: '다른 이름으로 저장...',
      importJson: 'JSON 가져오기...',
      exportJson: 'JSON으로 내보내기',
      exportForGame: '게임용으로 내보내기',
      undo: '실행 취소',
      redo: '다시 실행',
      selectAll: '모두 선택',
      delete: '삭제',
      clearRecent: '최근 기록 지우기',
      noRecentProjects: '최근 프로젝트 없음',
      autoLayout: '자동 정렬',
    },
    settings: {
      language: '언어',
      openLastProjectOnStartup: '시작 시 마지막 프로젝트 열기',
      autoSave: '자동 저장',
      autoSaveEnabled: '자동 저장 활성화',
      autoSaveMode: '저장 방식',
      autoSaveModeOnChange: '변경 시 저장',
      autoSaveModeInterval: '일정 시간마다 저장',
      autoSaveModeBoth: '둘 다',
      autoSaveInterval: '저장 간격',
      autoSaveIntervalMinutes: '분',
    },
    inspector: {
      nodeId: '노드 ID',
      nodeType: '노드 타입',
      speaker: '화자',
      text: '내용',
      nextNode: '다음 노드',
      choices: '선택지',
      addChoice: '선택지 추가',
      battleGroupId: '전투 그룹 ID',
      battleRewards: '전투 보상',
      eventId: '이벤트 ID',
      operations: '연산',
      addOperation: '연산 추가',
      conditions: '조건',
      addCondition: '조건 추가',
      defaultOutput: '기본 출력',
      gold: '골드',
      hp: 'HP',
      flag: '플래그',
      affection: '호감도',
      reputation: '평판',
      set: '설정',
      add: '더하기',
      subtract: '빼기',
      multiply: '곱하기',
    },
    common: {
      empty: '(비어있음)',
      none: '없음',
      default: '기본값',
      true: '참',
      false: '거짓',
      value: '값',
      key: '키',
      target: '대상',
      action: '동작',
      character: '캐릭터',
      faction: '세력',
    },
    sidebar: {
      nodeLibrary: '노드 라이브러리',
      flow: '흐름',
      content: '콘텐츠',
      logic: '로직',
      editor: '에디터',
    },
    search: {
      placeholder: '검색어를 입력하세요...',
      currentCanvas: '현재 캔버스',
      allFiles: '전체 파일',
      resultCount: '{count}개 결과',
      noResults: '검색 결과가 없습니다',
      navigate: '이동',
      goTo: '선택',
      close: '닫기',
    },
  },
  en: {
    nodes: {
      start: 'Start',
      dialogue: 'Dialogue',
      choice: 'Choice',
      battle: 'Battle',
      shop: 'Shop',
      event: 'Event',
      chapter_end: 'Chapter End',
      variable: 'Variable',
      condition: 'Condition',
      comment: 'Comment',
    },
    nodeDescriptions: {
      start: 'Story start point',
      dialogue: 'Dialogue or narration',
      choice: 'Player choices',
      battle: 'Start battle',
      shop: 'Open shop',
      event: 'Trigger event',
      chapter_end: 'End chapter',
      variable: 'Variable operations',
      condition: 'Condition branch',
    },
    menu: {
      file: 'File',
      edit: 'Edit',
      view: 'View',
      settings: 'Settings',
      newProject: 'New Project',
      openFolder: 'Open Folder...',
      openRecent: 'Open Recent',
      save: 'Save',
      saveAs: 'Save As...',
      importJson: 'Import JSON...',
      exportJson: 'Export as JSON',
      exportForGame: 'Export for Game',
      undo: 'Undo',
      redo: 'Redo',
      selectAll: 'Select All',
      delete: 'Delete',
      clearRecent: 'Clear Recent',
      noRecentProjects: 'No recent projects',
      autoLayout: 'Auto Layout',
    },
    settings: {
      language: 'Language',
      openLastProjectOnStartup: 'Open last project on startup',
      autoSave: 'Auto Save',
      autoSaveEnabled: 'Enable auto save',
      autoSaveMode: 'Save mode',
      autoSaveModeOnChange: 'Save on change',
      autoSaveModeInterval: 'Save at interval',
      autoSaveModeBoth: 'Both',
      autoSaveInterval: 'Save interval',
      autoSaveIntervalMinutes: 'min',
    },
    inspector: {
      nodeId: 'Node ID',
      nodeType: 'Node Type',
      speaker: 'Speaker',
      text: 'Text',
      nextNode: 'Next Node',
      choices: 'Choices',
      addChoice: 'Add Choice',
      battleGroupId: 'Battle Group ID',
      battleRewards: 'Battle Rewards',
      eventId: 'Event ID',
      operations: 'Operations',
      addOperation: 'Add Operation',
      conditions: 'Conditions',
      addCondition: 'Add Condition',
      defaultOutput: 'Default Output',
      gold: 'Gold',
      hp: 'HP',
      flag: 'Flag',
      affection: 'Affection',
      reputation: 'Reputation',
      set: 'Set',
      add: 'Add',
      subtract: 'Subtract',
      multiply: 'Multiply',
    },
    common: {
      empty: '(empty)',
      none: 'None',
      default: 'Default',
      true: 'True',
      false: 'False',
      value: 'Value',
      key: 'Key',
      target: 'Target',
      action: 'Action',
      character: 'Character',
      faction: 'Faction',
    },
    sidebar: {
      nodeLibrary: 'Node Library',
      flow: 'Flow',
      content: 'Content',
      logic: 'Logic',
      editor: 'Editor',
    },
    search: {
      placeholder: 'Search...',
      currentCanvas: 'Current Canvas',
      allFiles: 'All Files',
      resultCount: '{count} results',
      noResults: 'No results found',
      navigate: 'Navigate',
      goTo: 'Go to',
      close: 'Close',
    },
  },
}

// OS 언어 감지
export function detectSystemLanguage(): Language {
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('ko')) {
    return 'ko'
  }
  return 'en'
}
