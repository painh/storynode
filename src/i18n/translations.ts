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
      keyboardShortcuts: '키보드 단축키',
      reload: '새로고침',
      toggleDevTools: '개발자 도구 토글',
      exportSelectFolder: '게임 내보내기 폴더 선택',
      exportSuccess: '익스포트 완료!\n\n게임 실행 방법:\n1. 익스포트 폴더에서 터미널 열기\n2. npx serve 실행\n3. 브라우저에서 http://localhost:3000 접속',
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
      keyboardShortcuts: 'Keyboard Shortcuts',
      reload: 'Reload',
      toggleDevTools: 'Toggle DevTools',
      exportSelectFolder: 'Select folder to export game',
      exportSuccess: 'Export completed!\n\nTo run the game:\n1. Open terminal in the export folder\n2. Run: npx serve\n3. Open http://localhost:3000 in browser',
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
      settings: '设置',
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
      settings: '設定',
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
      settings: 'Configuración',
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
      settings: '設定',
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
