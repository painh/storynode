# StoryNode Editor - Claude Code 가이드

## 프로젝트 개요
Unreal Engine 5 Blueprint 스타일의 노드 기반 스토리/다이얼로그 에디터입니다.
Tauri v2 (데스크톱) + 웹 버전을 동시 지원합니다.

## 기술 스택
- **프레임워크**: Tauri v2 (Rust + WebView)
- **프론트엔드**: React 19 + TypeScript
- **노드 캔버스**: React Flow (@xyflow/react)
- **상태 관리**: Zustand + immer
- **스타일링**: CSS Modules (Unreal 다크 테마)
- **빌드**: Vite

## 주요 명령어

```bash
# 개발 서버 (웹)
npm run dev

# 빌드
npm run build

# Tauri 개발 (데스크톱)
npm run tauri dev

# Tauri 빌드 (데스크톱)
npm run tauri build
```

## 폴더 구조

```
src/
├── components/layout/    # Header, Sidebar, Inspector
├── features/
│   ├── canvas/          # React Flow 캔버스
│   ├── nodes/           # 노드 컴포넌트들
│   ├── edges/           # 엣지 컴포넌트
│   └── inspector/       # 속성 편집기
├── stores/              # Zustand 상태 관리
├── types/               # TypeScript 타입 정의
├── utils/               # 유틸리티 함수
└── i18n/                # 다국어 지원 (한국어/영어)
```

## 노드 타입
- `start`: 시작 노드
- `dialogue`: 대사 노드
- `choice`: 선택지 노드
- `battle`: 전투 노드
- `shop`: 상점 노드
- `event`: 이벤트 노드
- `chapter_end`: 챕터 종료 노드
- `variable`: 변수 조작 노드
- `condition`: 조건 분기 노드

## 작업 완료 후 커밋
작업이 끝나면 반드시 변경사항을 커밋해주세요:

```bash
git add .
git commit -m "feat: 작업 내용 요약"
```

## 릴리즈
태그를 push하면 GitHub Actions로 자동 릴리즈됩니다:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## 참고사항
- gosunideckbuilding 프로젝트의 story.ts 타입과 호환됩니다
- 노드 위치는 챕터별로 canvasStore에 저장됩니다
- Undo/Redo는 zundo 라이브러리로 구현되어 있습니다
