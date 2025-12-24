// 다국어 번역 데이터

export type Language = 'ko' | 'en' | 'zh-CN' | 'zh-TW' | 'es' | 'ja'

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
    image: string
    javascript: string
    custom: string
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
    image: string
    javascript: string
    custom: string
  }

  // 메뉴
  menu: {
    file: string
    edit: string
    view: string
    help: string
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
    keyboardShortcuts: string
    reload: string
    toggleDevTools: string
    exportSelectFolder: string
    exportSuccess: string
    projectSettings: string
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
    gameSettings: string
    saveBeforeGameRun: string
  }

  // 프로젝트 설정
  projectSettings: {
    title: string
    projectInfo: string
    projectName: string
    projectVersion: string
    gameSettings: string
    gameMode: string
    gameModeVisualNovel: string
    gameModeTextAdventure: string
    defaultTheme: string
    themeDark: string
    themeLight: string
    themeRetro: string
    themeNovel: string
    themeCyberpunk: string
  }

  // 내보내기
  export: {
    title: string
    exportType: string
    exportTypeWeb: string
    exportTypeWebDesc: string
    exportTypeExecutable: string
    exportTypeExecutableDesc: string
    platform: string
    platformWindows: string
    platformMacOS: string
    platformLinux: string
    noBinariesAvailable: string
    outputPath: string
    selectOutputPath: string
    export: string
    exporting: string
    exportSuccess: string
    exportFailed: string
    cancel: string
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
    resultPosition: string
    noResults: string
    navigate: string
    goTo: string
    goToKeepOpen: string
    close: string
    previous: string
    next: string
  }

  // 도움말 툴팁
  help: {
    // 공통
    id: string
    speaker: string
    text: string
    javascript: string
    // 이미지 노드
    imageResource: string
    layer: string
    layerOrder: string
    alignment: string
    flipHorizontal: string
    effects: string
    slide: string
    zoom: string
    duration: string
    exitEffect: string
    transitionTiming: string
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
      image: '이미지',
      javascript: 'JavaScript',
      custom: '커스텀',
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
      image: '이미지 표시',
      javascript: 'JavaScript 코드 실행',
      custom: '사용자 정의 노드',
    },
    menu: {
      file: '파일',
      edit: '편집',
      view: '보기',
      help: '도움말',
      settings: '에디터 설정',
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
      keyboardShortcuts: '키보드 단축키',
      reload: '새로고침',
      toggleDevTools: '개발자 도구 토글',
      exportSelectFolder: '게임 내보내기 폴더 선택',
      exportSuccess: '익스포트 완료!\n\n게임 실행 방법:\n1. 익스포트 폴더에서 터미널 열기\n2. npx serve 실행\n3. 브라우저에서 http://localhost:3000 접속',
      projectSettings: '프로젝트 설정',
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
      gameSettings: '게임 실행',
      saveBeforeGameRun: '게임 실행 전 자동 저장',
    },
    projectSettings: {
      title: '프로젝트 설정',
      projectInfo: '프로젝트 정보',
      projectName: '프로젝트 이름',
      projectVersion: '버전',
      gameSettings: '게임 설정',
      gameMode: '게임 모드',
      gameModeVisualNovel: '비주얼 노벨',
      gameModeTextAdventure: '텍스트 어드벤처',
      defaultTheme: '기본 테마',
      themeDark: '다크',
      themeLight: '라이트',
      themeRetro: '레트로',
      themeNovel: '노벨',
      themeCyberpunk: '사이버펑크',
    },
    export: {
      title: '게임 내보내기',
      exportType: '내보내기 유형',
      exportTypeWeb: '웹 (ZIP)',
      exportTypeWebDesc: '웹 브라우저에서 실행 가능한 ZIP 파일',
      exportTypeExecutable: '실행 파일',
      exportTypeExecutableDesc: '독립 실행 가능한 데스크톱 애플리케이션',
      platform: '플랫폼',
      platformWindows: 'Windows',
      platformMacOS: 'macOS',
      platformLinux: 'Linux',
      noBinariesAvailable: '사용 가능한 플레이어 바이너리가 없습니다',
      outputPath: '저장 경로',
      selectOutputPath: '경로 선택...',
      export: '내보내기',
      exporting: '내보내는 중...',
      exportSuccess: '내보내기 완료!',
      exportFailed: '내보내기 실패',
      cancel: '취소',
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
      resultPosition: '{current} / {total}',
      noResults: '검색 결과가 없습니다',
      navigate: '이동',
      goTo: '선택',
      goToKeepOpen: '이동(유지)',
      close: '닫기',
      previous: '이전',
      next: '다음',
    },
    help: {
      id: '노드의 고유 식별자입니다.\n자동으로 생성되며 수정할 수 없습니다.',
      speaker: '대사를 말하는 화자의 이름입니다.\n비워두면 나레이터로 처리됩니다.',
      text: '노드에 표시될 텍스트 내용입니다.\n대사, 선택지 질문, 챕터 종료 메시지 등에 사용됩니다.',
      javascript: 'JavaScript 코드를 실행합니다.\ngameState, setFlag, getFlag 등의 함수를 사용할 수 있습니다.',
      imageResource: '표시할 이미지를 선택합니다.\n프로젝트의 리소스 탭에서 먼저 이미지를 추가해야 합니다.',
      layer: '이미지가 표시될 레이어입니다.\n• background: 배경 레이어 (가장 뒤)\n• character: 캐릭터 레이어 (배경 앞)',
      layerOrder: '같은 레이어 내에서의 표시 순서입니다.\n숫자가 클수록 앞에 표시됩니다.\n같은 레이어+순서의 이미지는 교체됩니다.',
      alignment: '이미지의 가로 정렬 위치입니다.\n• Left: 왼쪽 정렬\n• Center: 중앙 정렬\n• Right: 오른쪽 정렬\n• Custom: 직접 x, y 좌표 지정',
      flipHorizontal: '이미지를 좌우로 뒤집습니다.\n캐릭터가 반대 방향을 바라보게 할 때 유용합니다.',
      effects: '이미지 등장 시 재생할 효과입니다.\n여러 효과를 조합할 수 있습니다.\n• Fade In: 서서히 나타남\n• Shake: 흔들림\n• Bounce: 튀어오름\n• Flash: 깜빡임\n• Pulse: 확대/축소 펄스',
      slide: '이미지가 화면 밖에서 들어오는 효과입니다.\n1개만 선택할 수 있습니다.',
      zoom: '이미지의 크기 변화 효과입니다.\n• Zoom In: 작은 상태에서 확대\n• Zoom Out: 큰 상태에서 축소',
      duration: '효과 애니메이션의 지속 시간입니다.\n밀리초(ms) 단위로 설정합니다.\n예: 500 = 0.5초',
      exitEffect: '같은 레이어+순서에 있는 기존 이미지의 퇴장 효과입니다.\n새 이미지로 교체될 때 적용됩니다.',
      transitionTiming: '퇴장과 등장 효과의 타이밍입니다.\n• 순차: 기존 이미지가 사라진 후 새 이미지 등장\n• 동시: 기존 이미지가 사라지면서 새 이미지 등장',
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
      image: 'Image',
      javascript: 'JavaScript',
      custom: 'Custom',
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
      image: 'Display image',
      javascript: 'Execute JavaScript code',
      custom: 'Custom node',
    },
    menu: {
      file: 'File',
      edit: 'Edit',
      view: 'View',
      help: 'Help',
      settings: 'Editor Settings',
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
      keyboardShortcuts: 'Keyboard Shortcuts',
      reload: 'Reload',
      toggleDevTools: 'Toggle DevTools',
      exportSelectFolder: 'Select folder to export game',
      exportSuccess: 'Export completed!\n\nTo run the game:\n1. Open terminal in the export folder\n2. Run: npx serve\n3. Open http://localhost:3000 in browser',
      projectSettings: 'Project Settings',
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
      gameSettings: 'Game Run',
      saveBeforeGameRun: 'Save before game run',
    },
    projectSettings: {
      title: 'Project Settings',
      projectInfo: 'Project Info',
      projectName: 'Project Name',
      projectVersion: 'Version',
      gameSettings: 'Game Settings',
      gameMode: 'Game Mode',
      gameModeVisualNovel: 'Visual Novel',
      gameModeTextAdventure: 'Text Adventure',
      defaultTheme: 'Default Theme',
      themeDark: 'Dark',
      themeLight: 'Light',
      themeRetro: 'Retro',
      themeNovel: 'Novel',
      themeCyberpunk: 'Cyberpunk',
    },
    export: {
      title: 'Export Game',
      exportType: 'Export Type',
      exportTypeWeb: 'Web (ZIP)',
      exportTypeWebDesc: 'ZIP file that runs in web browsers',
      exportTypeExecutable: 'Executable',
      exportTypeExecutableDesc: 'Standalone desktop application',
      platform: 'Platform',
      platformWindows: 'Windows',
      platformMacOS: 'macOS',
      platformLinux: 'Linux',
      noBinariesAvailable: 'No player binaries available',
      outputPath: 'Output Path',
      selectOutputPath: 'Select path...',
      export: 'Export',
      exporting: 'Exporting...',
      exportSuccess: 'Export completed!',
      exportFailed: 'Export failed',
      cancel: 'Cancel',
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
      resultPosition: '{current} / {total}',
      noResults: 'No results found',
      navigate: 'Navigate',
      goTo: 'Go to',
      goToKeepOpen: 'Go (Keep)',
      close: 'Close',
      previous: 'Previous',
      next: 'Next',
    },
    help: {
      id: 'Unique identifier for the node.\nAutomatically generated and cannot be modified.',
      speaker: 'Name of the character speaking.\nLeft empty for narrator.',
      text: 'Text content to display in the node.\nUsed for dialogue, choice prompts, chapter end messages, etc.',
      javascript: 'Execute JavaScript code.\nAvailable functions: gameState, setFlag, getFlag, etc.',
      imageResource: 'Select the image to display.\nImages must be added in the Resources tab first.',
      layer: 'Layer where the image will be displayed.\n• background: Background layer (furthest back)\n• character: Character layer (in front of background)',
      layerOrder: 'Display order within the same layer.\nHigher numbers appear in front.\nImages with same layer+order will be replaced.',
      alignment: 'Horizontal alignment of the image.\n• Left: Align left\n• Center: Align center\n• Right: Align right\n• Custom: Set x, y coordinates manually',
      flipHorizontal: 'Flip the image horizontally.\nUseful when character needs to face opposite direction.',
      effects: 'Effects to play when image appears.\nMultiple effects can be combined.\n• Fade In: Gradually appear\n• Shake: Shaking\n• Bounce: Bouncing\n• Flash: Blinking\n• Pulse: Scale pulse',
      slide: 'Effect for image sliding in from outside screen.\nOnly one can be selected.',
      zoom: 'Image scale change effect.\n• Zoom In: Enlarge from small\n• Zoom Out: Shrink from large',
      duration: 'Duration of the effect animation.\nSet in milliseconds (ms).\nExample: 500 = 0.5 seconds',
      exitEffect: 'Exit effect for existing image at same layer+order.\nApplied when replaced with new image.',
      transitionTiming: 'Timing of exit and entrance effects.\n• Sequential: New image appears after old one exits\n• Crossfade: New image appears while old one exits',
    },
  },

  // 중국어 간체 (Simplified Chinese)
  'zh-CN': {
    nodes: {
      start: '开始',
      dialogue: '对话',
      choice: '选项',
      battle: '战斗',
      shop: '商店',
      event: '事件',
      chapter_end: '章节结束',
      variable: '变量',
      condition: '条件',
      image: '图像',
      javascript: 'JavaScript',
      custom: '自定义',
      comment: '注释',
    },
    nodeDescriptions: {
      start: '故事起点',
      dialogue: '对话或旁白',
      choice: '玩家选项',
      battle: '开始战斗',
      shop: '打开商店',
      event: '触发事件',
      chapter_end: '结束章节',
      variable: '变量操作',
      condition: '条件分支',
      image: '显示图像',
      javascript: '执行JavaScript代码',
      custom: '自定义节点',
    },
    menu: {
      file: '文件',
      edit: '编辑',
      view: '视图',
      help: '帮助',
      settings: '编辑器设置',
      newProject: '新建项目',
      openFolder: '打开文件夹...',
      openRecent: '最近项目',
      save: '保存',
      saveAs: '另存为...',
      importJson: '导入JSON...',
      exportJson: '导出为JSON',
      exportForGame: '导出游戏',
      undo: '撤销',
      redo: '重做',
      selectAll: '全选',
      delete: '删除',
      clearRecent: '清除记录',
      noRecentProjects: '没有最近项目',
      autoLayout: '自动布局',
      keyboardShortcuts: '键盘快捷键',
      reload: '刷新',
      toggleDevTools: '切换开发者工具',
      exportSelectFolder: '选择游戏导出文件夹',
      exportSuccess: '导出完成！\n\n运行游戏方法：\n1. 在导出文件夹中打开终端\n2. 运行 npx serve\n3. 在浏览器中打开 http://localhost:3000',
      projectSettings: '项目设置',
    },
    settings: {
      language: '语言',
      openLastProjectOnStartup: '启动时打开上次项目',
      autoSave: '自动保存',
      autoSaveEnabled: '启用自动保存',
      autoSaveMode: '保存方式',
      autoSaveModeOnChange: '更改时保存',
      autoSaveModeInterval: '定时保存',
      autoSaveModeBoth: '两者都',
      autoSaveInterval: '保存间隔',
      autoSaveIntervalMinutes: '分钟',
      gameSettings: '游戏运行',
      saveBeforeGameRun: '运行游戏前保存',
    },
    projectSettings: {
      title: '项目设置',
      projectInfo: '项目信息',
      projectName: '项目名称',
      projectVersion: '版本',
      gameSettings: '游戏设置',
      gameMode: '游戏模式',
      gameModeVisualNovel: '视觉小说',
      gameModeTextAdventure: '文字冒险',
      defaultTheme: '默认主题',
      themeDark: '深色',
      themeLight: '浅色',
      themeRetro: '复古',
      themeNovel: '小说',
      themeCyberpunk: '赛博朋克',
    },
    export: {
      title: '导出游戏',
      exportType: '导出类型',
      exportTypeWeb: '网页 (ZIP)',
      exportTypeWebDesc: '可在网页浏览器中运行的ZIP文件',
      exportTypeExecutable: '可执行文件',
      exportTypeExecutableDesc: '独立运行的桌面应用程序',
      platform: '平台',
      platformWindows: 'Windows',
      platformMacOS: 'macOS',
      platformLinux: 'Linux',
      noBinariesAvailable: '没有可用的播放器二进制文件',
      outputPath: '输出路径',
      selectOutputPath: '选择路径...',
      export: '导出',
      exporting: '正在导出...',
      exportSuccess: '导出完成！',
      exportFailed: '导出失败',
      cancel: '取消',
    },
    inspector: {
      nodeId: '节点ID',
      nodeType: '节点类型',
      speaker: '说话者',
      text: '内容',
      nextNode: '下一节点',
      choices: '选项',
      addChoice: '添加选项',
      battleGroupId: '战斗组ID',
      battleRewards: '战斗奖励',
      eventId: '事件ID',
      operations: '操作',
      addOperation: '添加操作',
      conditions: '条件',
      addCondition: '添加条件',
      defaultOutput: '默认输出',
      gold: '金币',
      hp: 'HP',
      flag: '标志',
      affection: '好感度',
      reputation: '声望',
      set: '设置',
      add: '加',
      subtract: '减',
      multiply: '乘',
    },
    common: {
      empty: '(空)',
      none: '无',
      default: '默认',
      true: '真',
      false: '假',
      value: '值',
      key: '键',
      target: '目标',
      action: '动作',
      character: '角色',
      faction: '阵营',
    },
    sidebar: {
      nodeLibrary: '节点库',
      flow: '流程',
      content: '内容',
      logic: '逻辑',
      editor: '编辑器',
    },
    search: {
      placeholder: '输入搜索内容...',
      currentCanvas: '当前画布',
      allFiles: '所有文件',
      resultCount: '{count}个结果',
      resultPosition: '{current} / {total}',
      noResults: '未找到结果',
      navigate: '导航',
      goTo: '跳转',
      goToKeepOpen: '跳转(保持)',
      close: '关闭',
      previous: '上一个',
      next: '下一个',
    },
    help: {
      id: '节点的唯一标识符。\n自动生成，无法修改。',
      speaker: '说话角色的名称。\n留空则为旁白。',
      text: '节点中显示的文本内容。\n用于对话、选项提示、章节结束消息等。',
      javascript: '执行JavaScript代码。\n可用函数：gameState、setFlag、getFlag等。',
      imageResource: '选择要显示的图像。\n必须先在资源选项卡中添加图像。',
      layer: '图像显示的图层。\n• background：背景层（最后面）\n• character：角色层（背景前面）',
      layerOrder: '同一图层内的显示顺序。\n数字越大越靠前。\n相同图层+顺序的图像会被替换。',
      alignment: '图像的水平对齐方式。\n• Left：左对齐\n• Center：居中\n• Right：右对齐\n• Custom：手动设置x、y坐标',
      flipHorizontal: '水平翻转图像。\n当角色需要朝向相反方向时很有用。',
      effects: '图像出现时播放的效果。\n可以组合多种效果。\n• Fade In：渐显\n• Shake：抖动\n• Bounce：弹跳\n• Flash：闪烁\n• Pulse：脉冲缩放',
      slide: '图像从屏幕外滑入的效果。\n只能选择一个。',
      zoom: '图像缩放变化效果。\n• Zoom In：从小放大\n• Zoom Out：从大缩小',
      duration: '效果动画的持续时间。\n以毫秒（ms）为单位设置。\n例如：500 = 0.5秒',
      exitEffect: '同一图层+顺序的现有图像的退出效果。\n被新图像替换时应用。',
      transitionTiming: '退出和进入效果的时机。\n• 顺序：旧图像退出后新图像出现\n• 交叉淡入淡出：新图像出现的同时旧图像退出',
    },
  },

  // 중국어 번체 (Traditional Chinese)
  'zh-TW': {
    nodes: {
      start: '開始',
      dialogue: '對話',
      choice: '選項',
      battle: '戰鬥',
      shop: '商店',
      event: '事件',
      chapter_end: '章節結束',
      variable: '變數',
      condition: '條件',
      image: '圖像',
      javascript: 'JavaScript',
      custom: '自訂',
      comment: '註解',
    },
    nodeDescriptions: {
      start: '故事起點',
      dialogue: '對話或旁白',
      choice: '玩家選項',
      battle: '開始戰鬥',
      shop: '開啟商店',
      event: '觸發事件',
      chapter_end: '結束章節',
      variable: '變數操作',
      condition: '條件分支',
      image: '顯示圖像',
      javascript: '執行JavaScript程式碼',
      custom: '自訂節點',
    },
    menu: {
      file: '檔案',
      edit: '編輯',
      view: '檢視',
      help: '說明',
      settings: '編輯器設定',
      newProject: '新增專案',
      openFolder: '開啟資料夾...',
      openRecent: '最近專案',
      save: '儲存',
      saveAs: '另存新檔...',
      importJson: '匯入JSON...',
      exportJson: '匯出為JSON',
      exportForGame: '匯出遊戲',
      undo: '復原',
      redo: '重做',
      selectAll: '全選',
      delete: '刪除',
      clearRecent: '清除記錄',
      noRecentProjects: '沒有最近專案',
      autoLayout: '自動排版',
      keyboardShortcuts: '鍵盤快速鍵',
      reload: '重新整理',
      toggleDevTools: '切換開發人員工具',
      exportSelectFolder: '選擇遊戲匯出資料夾',
      exportSuccess: '匯出完成！\n\n執行遊戲方法：\n1. 在匯出資料夾中開啟終端機\n2. 執行 npx serve\n3. 在瀏覽器中開啟 http://localhost:3000',
      projectSettings: '專案設定',
    },
    settings: {
      language: '語言',
      openLastProjectOnStartup: '啟動時開啟上次專案',
      autoSave: '自動儲存',
      autoSaveEnabled: '啟用自動儲存',
      autoSaveMode: '儲存方式',
      autoSaveModeOnChange: '變更時儲存',
      autoSaveModeInterval: '定時儲存',
      autoSaveModeBoth: '兩者皆是',
      autoSaveInterval: '儲存間隔',
      autoSaveIntervalMinutes: '分鐘',
      gameSettings: '遊戲執行',
      saveBeforeGameRun: '執行遊戲前儲存',
    },
    projectSettings: {
      title: '專案設定',
      projectInfo: '專案資訊',
      projectName: '專案名稱',
      projectVersion: '版本',
      gameSettings: '遊戲設定',
      gameMode: '遊戲模式',
      gameModeVisualNovel: '視覺小說',
      gameModeTextAdventure: '文字冒險',
      defaultTheme: '預設主題',
      themeDark: '深色',
      themeLight: '淺色',
      themeRetro: '復古',
      themeNovel: '小說',
      themeCyberpunk: '賽博龐克',
    },
    export: {
      title: '匯出遊戲',
      exportType: '匯出類型',
      exportTypeWeb: '網頁 (ZIP)',
      exportTypeWebDesc: '可在網頁瀏覽器中執行的ZIP檔案',
      exportTypeExecutable: '可執行檔',
      exportTypeExecutableDesc: '獨立執行的桌面應用程式',
      platform: '平台',
      platformWindows: 'Windows',
      platformMacOS: 'macOS',
      platformLinux: 'Linux',
      noBinariesAvailable: '沒有可用的播放器二進位檔案',
      outputPath: '輸出路徑',
      selectOutputPath: '選擇路徑...',
      export: '匯出',
      exporting: '正在匯出...',
      exportSuccess: '匯出完成！',
      exportFailed: '匯出失敗',
      cancel: '取消',
    },
    inspector: {
      nodeId: '節點ID',
      nodeType: '節點類型',
      speaker: '說話者',
      text: '內容',
      nextNode: '下一節點',
      choices: '選項',
      addChoice: '新增選項',
      battleGroupId: '戰鬥組ID',
      battleRewards: '戰鬥獎勵',
      eventId: '事件ID',
      operations: '操作',
      addOperation: '新增操作',
      conditions: '條件',
      addCondition: '新增條件',
      defaultOutput: '預設輸出',
      gold: '金幣',
      hp: 'HP',
      flag: '標記',
      affection: '好感度',
      reputation: '聲望',
      set: '設定',
      add: '加',
      subtract: '減',
      multiply: '乘',
    },
    common: {
      empty: '(空)',
      none: '無',
      default: '預設',
      true: '真',
      false: '假',
      value: '值',
      key: '鍵',
      target: '目標',
      action: '動作',
      character: '角色',
      faction: '陣營',
    },
    sidebar: {
      nodeLibrary: '節點庫',
      flow: '流程',
      content: '內容',
      logic: '邏輯',
      editor: '編輯器',
    },
    search: {
      placeholder: '輸入搜尋內容...',
      currentCanvas: '目前畫布',
      allFiles: '所有檔案',
      resultCount: '{count}個結果',
      resultPosition: '{current} / {total}',
      noResults: '找不到結果',
      navigate: '導覽',
      goTo: '跳轉',
      goToKeepOpen: '跳轉(保持)',
      close: '關閉',
      previous: '上一個',
      next: '下一個',
    },
    help: {
      id: '節點的唯一識別碼。\n自動產生，無法修改。',
      speaker: '說話角色的名稱。\n留空則為旁白。',
      text: '節點中顯示的文字內容。\n用於對話、選項提示、章節結束訊息等。',
      javascript: '執行JavaScript程式碼。\n可用函式：gameState、setFlag、getFlag等。',
      imageResource: '選擇要顯示的圖像。\n必須先在資源選項卡中新增圖像。',
      layer: '圖像顯示的圖層。\n• background：背景層（最後面）\n• character：角色層（背景前面）',
      layerOrder: '同一圖層內的顯示順序。\n數字越大越靠前。\n相同圖層+順序的圖像會被取代。',
      alignment: '圖像的水平對齊方式。\n• Left：靠左\n• Center：置中\n• Right：靠右\n• Custom：手動設定x、y座標',
      flipHorizontal: '水平翻轉圖像。\n當角色需要朝向相反方向時很有用。',
      effects: '圖像出現時播放的效果。\n可以組合多種效果。\n• Fade In：漸顯\n• Shake：抖動\n• Bounce：彈跳\n• Flash：閃爍\n• Pulse：脈衝縮放',
      slide: '圖像從螢幕外滑入的效果。\n只能選擇一個。',
      zoom: '圖像縮放變化效果。\n• Zoom In：從小放大\n• Zoom Out：從大縮小',
      duration: '效果動畫的持續時間。\n以毫秒（ms）為單位設定。\n例如：500 = 0.5秒',
      exitEffect: '同一圖層+順序的現有圖像的退出效果。\n被新圖像取代時套用。',
      transitionTiming: '退出和進入效果的時機。\n• 順序：舊圖像退出後新圖像出現\n• 交叉淡入淡出：新圖像出現的同時舊圖像退出',
    },
  },

  // 스페인어 (Spanish)
  es: {
    nodes: {
      start: 'Inicio',
      dialogue: 'Diálogo',
      choice: 'Elección',
      battle: 'Batalla',
      shop: 'Tienda',
      event: 'Evento',
      chapter_end: 'Fin de Capítulo',
      variable: 'Variable',
      condition: 'Condición',
      image: 'Imagen',
      javascript: 'JavaScript',
      custom: 'Personalizado',
      comment: 'Comentario',
    },
    nodeDescriptions: {
      start: 'Punto de inicio de la historia',
      dialogue: 'Diálogo o narración',
      choice: 'Opciones del jugador',
      battle: 'Iniciar batalla',
      shop: 'Abrir tienda',
      event: 'Activar evento',
      chapter_end: 'Finalizar capítulo',
      variable: 'Operaciones de variable',
      condition: 'Rama condicional',
      image: 'Mostrar imagen',
      javascript: 'Ejecutar código JavaScript',
      custom: 'Nodo personalizado',
    },
    menu: {
      file: 'Archivo',
      edit: 'Editar',
      view: 'Ver',
      help: 'Ayuda',
      settings: 'Configuración del editor',
      newProject: 'Nuevo Proyecto',
      openFolder: 'Abrir Carpeta...',
      openRecent: 'Proyectos Recientes',
      save: 'Guardar',
      saveAs: 'Guardar Como...',
      importJson: 'Importar JSON...',
      exportJson: 'Exportar como JSON',
      exportForGame: 'Exportar para Juego',
      undo: 'Deshacer',
      redo: 'Rehacer',
      selectAll: 'Seleccionar Todo',
      delete: 'Eliminar',
      clearRecent: 'Limpiar Recientes',
      noRecentProjects: 'Sin proyectos recientes',
      autoLayout: 'Diseño Automático',
      keyboardShortcuts: 'Atajos de Teclado',
      reload: 'Recargar',
      toggleDevTools: 'Alternar Herramientas de Desarrollo',
      exportSelectFolder: 'Seleccionar carpeta para exportar el juego',
      exportSuccess: '¡Exportación completada!\n\nPara ejecutar el juego:\n1. Abrir terminal en la carpeta de exportación\n2. Ejecutar: npx serve\n3. Abrir http://localhost:3000 en el navegador',
      projectSettings: 'Configuración del Proyecto',
    },
    settings: {
      language: 'Idioma',
      openLastProjectOnStartup: 'Abrir último proyecto al iniciar',
      autoSave: 'Guardado Automático',
      autoSaveEnabled: 'Habilitar guardado automático',
      autoSaveMode: 'Modo de guardado',
      autoSaveModeOnChange: 'Guardar al cambiar',
      autoSaveModeInterval: 'Guardar por intervalo',
      autoSaveModeBoth: 'Ambos',
      autoSaveInterval: 'Intervalo de guardado',
      autoSaveIntervalMinutes: 'min',
      gameSettings: 'Ejecutar Juego',
      saveBeforeGameRun: 'Guardar antes de ejecutar el juego',
    },
    projectSettings: {
      title: 'Configuración del Proyecto',
      projectInfo: 'Información del Proyecto',
      projectName: 'Nombre del Proyecto',
      projectVersion: 'Versión',
      gameSettings: 'Configuración del Juego',
      gameMode: 'Modo de Juego',
      gameModeVisualNovel: 'Novela Visual',
      gameModeTextAdventure: 'Aventura de Texto',
      defaultTheme: 'Tema Predeterminado',
      themeDark: 'Oscuro',
      themeLight: 'Claro',
      themeRetro: 'Retro',
      themeNovel: 'Novela',
      themeCyberpunk: 'Ciberpunk',
    },
    export: {
      title: 'Exportar Juego',
      exportType: 'Tipo de Exportación',
      exportTypeWeb: 'Web (ZIP)',
      exportTypeWebDesc: 'Archivo ZIP ejecutable en navegadores web',
      exportTypeExecutable: 'Ejecutable',
      exportTypeExecutableDesc: 'Aplicación de escritorio independiente',
      platform: 'Plataforma',
      platformWindows: 'Windows',
      platformMacOS: 'macOS',
      platformLinux: 'Linux',
      noBinariesAvailable: 'No hay binarios de reproductor disponibles',
      outputPath: 'Ruta de Salida',
      selectOutputPath: 'Seleccionar ruta...',
      export: 'Exportar',
      exporting: 'Exportando...',
      exportSuccess: '¡Exportación completada!',
      exportFailed: 'Exportación fallida',
      cancel: 'Cancelar',
    },
    inspector: {
      nodeId: 'ID del Nodo',
      nodeType: 'Tipo de Nodo',
      speaker: 'Hablante',
      text: 'Texto',
      nextNode: 'Siguiente Nodo',
      choices: 'Opciones',
      addChoice: 'Agregar Opción',
      battleGroupId: 'ID del Grupo de Batalla',
      battleRewards: 'Recompensas de Batalla',
      eventId: 'ID del Evento',
      operations: 'Operaciones',
      addOperation: 'Agregar Operación',
      conditions: 'Condiciones',
      addCondition: 'Agregar Condición',
      defaultOutput: 'Salida Predeterminada',
      gold: 'Oro',
      hp: 'HP',
      flag: 'Bandera',
      affection: 'Afecto',
      reputation: 'Reputación',
      set: 'Establecer',
      add: 'Sumar',
      subtract: 'Restar',
      multiply: 'Multiplicar',
    },
    common: {
      empty: '(vacío)',
      none: 'Ninguno',
      default: 'Predeterminado',
      true: 'Verdadero',
      false: 'Falso',
      value: 'Valor',
      key: 'Clave',
      target: 'Objetivo',
      action: 'Acción',
      character: 'Personaje',
      faction: 'Facción',
    },
    sidebar: {
      nodeLibrary: 'Biblioteca de Nodos',
      flow: 'Flujo',
      content: 'Contenido',
      logic: 'Lógica',
      editor: 'Editor',
    },
    search: {
      placeholder: 'Buscar...',
      currentCanvas: 'Lienzo Actual',
      allFiles: 'Todos los Archivos',
      resultCount: '{count} resultados',
      resultPosition: '{current} / {total}',
      noResults: 'No se encontraron resultados',
      navigate: 'Navegar',
      goTo: 'Ir a',
      goToKeepOpen: 'Ir (Mantener)',
      close: 'Cerrar',
      previous: 'Anterior',
      next: 'Siguiente',
    },
    help: {
      id: 'Identificador único del nodo.\nGenerado automáticamente y no se puede modificar.',
      speaker: 'Nombre del personaje que habla.\nDejar vacío para narrador.',
      text: 'Contenido de texto a mostrar en el nodo.\nUsado para diálogos, opciones, mensajes de fin de capítulo, etc.',
      javascript: 'Ejecutar código JavaScript.\nFunciones disponibles: gameState, setFlag, getFlag, etc.',
      imageResource: 'Seleccionar la imagen a mostrar.\nLas imágenes deben agregarse primero en la pestaña Recursos.',
      layer: 'Capa donde se mostrará la imagen.\n• background: Capa de fondo (más atrás)\n• character: Capa de personaje (frente al fondo)',
      layerOrder: 'Orden de visualización dentro de la misma capa.\nNúmeros más altos aparecen al frente.\nImágenes con misma capa+orden serán reemplazadas.',
      alignment: 'Alineación horizontal de la imagen.\n• Left: Alinear izquierda\n• Center: Alinear centro\n• Right: Alinear derecha\n• Custom: Establecer coordenadas x, y manualmente',
      flipHorizontal: 'Voltear la imagen horizontalmente.\nÚtil cuando el personaje necesita mirar en dirección opuesta.',
      effects: 'Efectos a reproducir cuando aparece la imagen.\nSe pueden combinar múltiples efectos.\n• Fade In: Aparecer gradualmente\n• Shake: Sacudir\n• Bounce: Rebotar\n• Flash: Parpadear\n• Pulse: Pulso de escala',
      slide: 'Efecto de imagen deslizándose desde fuera de pantalla.\nSolo se puede seleccionar uno.',
      zoom: 'Efecto de cambio de escala de imagen.\n• Zoom In: Agrandar desde pequeño\n• Zoom Out: Reducir desde grande',
      duration: 'Duración de la animación del efecto.\nEstablecer en milisegundos (ms).\nEjemplo: 500 = 0.5 segundos',
      exitEffect: 'Efecto de salida para imagen existente en misma capa+orden.\nAplicado al ser reemplazada por nueva imagen.',
      transitionTiming: 'Momento de efectos de salida y entrada.\n• Secuencial: Nueva imagen aparece después de que sale la anterior\n• Cruzado: Nueva imagen aparece mientras sale la anterior',
    },
  },

  // 일본어 (Japanese)
  ja: {
    nodes: {
      start: '開始',
      dialogue: 'セリフ',
      choice: '選択肢',
      battle: 'バトル',
      shop: 'ショップ',
      event: 'イベント',
      chapter_end: 'チャプター終了',
      variable: '変数',
      condition: '条件',
      image: '画像',
      javascript: 'JavaScript',
      custom: 'カスタム',
      comment: 'コメント',
    },
    nodeDescriptions: {
      start: 'ストーリー開始点',
      dialogue: 'セリフまたはナレーション',
      choice: 'プレイヤーの選択肢',
      battle: 'バトル開始',
      shop: 'ショップを開く',
      event: 'イベント発生',
      chapter_end: 'チャプター終了',
      variable: '変数操作',
      condition: '条件分岐',
      image: '画像表示',
      javascript: 'JavaScriptコード実行',
      custom: 'カスタムノード',
    },
    menu: {
      file: 'ファイル',
      edit: '編集',
      view: '表示',
      help: 'ヘルプ',
      settings: 'エディター設定',
      newProject: '新規プロジェクト',
      openFolder: 'フォルダを開く...',
      openRecent: '最近のプロジェクト',
      save: '保存',
      saveAs: '名前を付けて保存...',
      importJson: 'JSONをインポート...',
      exportJson: 'JSONでエクスポート',
      exportForGame: 'ゲーム用にエクスポート',
      undo: '元に戻す',
      redo: 'やり直し',
      selectAll: 'すべて選択',
      delete: '削除',
      clearRecent: '履歴をクリア',
      noRecentProjects: '最近のプロジェクトなし',
      autoLayout: '自動レイアウト',
      keyboardShortcuts: 'キーボードショートカット',
      reload: '再読み込み',
      toggleDevTools: '開発者ツールを切り替え',
      exportSelectFolder: 'ゲームエクスポート先を選択',
      exportSuccess: 'エクスポート完了！\n\nゲームの実行方法：\n1. エクスポートフォルダでターミナルを開く\n2. npx serve を実行\n3. ブラウザで http://localhost:3000 を開く',
      projectSettings: 'プロジェクト設定',
    },
    settings: {
      language: '言語',
      openLastProjectOnStartup: '起動時に前回のプロジェクトを開く',
      autoSave: '自動保存',
      autoSaveEnabled: '自動保存を有効化',
      autoSaveMode: '保存方式',
      autoSaveModeOnChange: '変更時に保存',
      autoSaveModeInterval: '一定時間ごとに保存',
      autoSaveModeBoth: '両方',
      autoSaveInterval: '保存間隔',
      autoSaveIntervalMinutes: '分',
      gameSettings: 'ゲーム実行',
      saveBeforeGameRun: 'ゲーム実行前に保存',
    },
    projectSettings: {
      title: 'プロジェクト設定',
      projectInfo: 'プロジェクト情報',
      projectName: 'プロジェクト名',
      projectVersion: 'バージョン',
      gameSettings: 'ゲーム設定',
      gameMode: 'ゲームモード',
      gameModeVisualNovel: 'ビジュアルノベル',
      gameModeTextAdventure: 'テキストアドベンチャー',
      defaultTheme: 'デフォルトテーマ',
      themeDark: 'ダーク',
      themeLight: 'ライト',
      themeRetro: 'レトロ',
      themeNovel: 'ノベル',
      themeCyberpunk: 'サイバーパンク',
    },
    export: {
      title: 'ゲームをエクスポート',
      exportType: 'エクスポートタイプ',
      exportTypeWeb: 'ウェブ (ZIP)',
      exportTypeWebDesc: 'ウェブブラウザで実行可能なZIPファイル',
      exportTypeExecutable: '実行ファイル',
      exportTypeExecutableDesc: 'スタンドアロンデスクトップアプリケーション',
      platform: 'プラットフォーム',
      platformWindows: 'Windows',
      platformMacOS: 'macOS',
      platformLinux: 'Linux',
      noBinariesAvailable: '利用可能なプレイヤーバイナリがありません',
      outputPath: '出力パス',
      selectOutputPath: 'パスを選択...',
      export: 'エクスポート',
      exporting: 'エクスポート中...',
      exportSuccess: 'エクスポート完了！',
      exportFailed: 'エクスポート失敗',
      cancel: 'キャンセル',
    },
    inspector: {
      nodeId: 'ノードID',
      nodeType: 'ノードタイプ',
      speaker: '話者',
      text: '内容',
      nextNode: '次のノード',
      choices: '選択肢',
      addChoice: '選択肢を追加',
      battleGroupId: 'バトルグループID',
      battleRewards: 'バトル報酬',
      eventId: 'イベントID',
      operations: '操作',
      addOperation: '操作を追加',
      conditions: '条件',
      addCondition: '条件を追加',
      defaultOutput: 'デフォルト出力',
      gold: 'ゴールド',
      hp: 'HP',
      flag: 'フラグ',
      affection: '好感度',
      reputation: '評判',
      set: '設定',
      add: '加算',
      subtract: '減算',
      multiply: '乗算',
    },
    common: {
      empty: '(空)',
      none: 'なし',
      default: 'デフォルト',
      true: '真',
      false: '偽',
      value: '値',
      key: 'キー',
      target: '対象',
      action: 'アクション',
      character: 'キャラクター',
      faction: '勢力',
    },
    sidebar: {
      nodeLibrary: 'ノードライブラリ',
      flow: 'フロー',
      content: 'コンテンツ',
      logic: 'ロジック',
      editor: 'エディタ',
    },
    search: {
      placeholder: '検索...',
      currentCanvas: '現在のキャンバス',
      allFiles: 'すべてのファイル',
      resultCount: '{count}件の結果',
      resultPosition: '{current} / {total}',
      noResults: '結果が見つかりません',
      navigate: 'ナビゲート',
      goTo: '移動',
      goToKeepOpen: '移動(維持)',
      close: '閉じる',
      previous: '前へ',
      next: '次へ',
    },
    help: {
      id: 'ノードの固有識別子です。\n自動生成され、変更できません。',
      speaker: '話すキャラクターの名前です。\n空の場合はナレーターになります。',
      text: 'ノードに表示するテキスト内容です。\nセリフ、選択肢の質問、チャプター終了メッセージなどに使用されます。',
      javascript: 'JavaScriptコードを実行します。\n使用可能な関数：gameState、setFlag、getFlagなど。',
      imageResource: '表示する画像を選択します。\n先にリソースタブで画像を追加する必要があります。',
      layer: '画像が表示されるレイヤーです。\n• background：背景レイヤー（最も奥）\n• character：キャラクターレイヤー（背景の手前）',
      layerOrder: '同じレイヤー内での表示順序です。\n数字が大きいほど手前に表示されます。\n同じレイヤー+順序の画像は置き換えられます。',
      alignment: '画像の水平方向の配置です。\n• Left：左揃え\n• Center：中央揃え\n• Right：右揃え\n• Custom：x、y座標を手動で設定',
      flipHorizontal: '画像を水平に反転します。\nキャラクターを反対方向に向かせたい時に便利です。',
      effects: '画像が表示される時に再生するエフェクトです。\n複数のエフェクトを組み合わせることができます。\n• Fade In：徐々に表示\n• Shake：振動\n• Bounce：バウンス\n• Flash：点滅\n• Pulse：スケールパルス',
      slide: '画像が画面外からスライドインするエフェクトです。\n1つのみ選択可能です。',
      zoom: '画像のスケール変化エフェクトです。\n• Zoom In：小さい状態から拡大\n• Zoom Out：大きい状態から縮小',
      duration: 'エフェクトアニメーションの持続時間です。\nミリ秒（ms）単位で設定します。\n例：500 = 0.5秒',
      exitEffect: '同じレイヤー+順序にある既存画像の退出エフェクトです。\n新しい画像に置き換えられる時に適用されます。',
      transitionTiming: '退出と登場エフェクトのタイミングです。\n• 順次：古い画像が退出後に新しい画像が登場\n• クロスフェード：古い画像が退出しながら新しい画像が登場',
    },
  },
}

// OS 언어 감지
export function detectSystemLanguage(): Language {
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('ko')) {
    return 'ko'
  }
  if (lang.startsWith('zh')) {
    // 간체/번체 구분
    if (lang.includes('tw') || lang.includes('hk') || lang.includes('hant')) {
      return 'zh-TW'
    }
    return 'zh-CN'
  }
  if (lang.startsWith('ja')) {
    return 'ja'
  }
  if (lang.startsWith('es')) {
    return 'es'
  }
  return 'en'
}
