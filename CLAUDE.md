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


## 작업 완료 후 커밋
작업이 끝나면 반드시 변경사항을 커밋해주세요:

```bash
git add .
git commit -m "feat: 작업 내용 요약"
```

양식을 꼭 지켜주세요. 한글로 작성해주세요.

## 릴리즈
태그를 push하면 GitHub Actions로 자동 릴리즈됩니다:

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 버전 올리기
버전을 올릴 때는 반드시 사용자에게 얼마나 올릴지 확인하세요:
- **patch** (0.0.x): 버그 수정, 사소한 변경
- **minor** (0.x.0): 새로운 기능 추가, 하위 호환 유지
- **major** (x.0.0): 큰 변경, 하위 호환 깨짐

한 번에 너무 큰 폭으로 버전을 올리지 마세요.

## 참고사항
- gosunideckbuilding 프로젝트의 story.ts 타입과 호환됩니다
- 노드 위치는 챕터별로 canvasStore에 저장됩니다
- Undo/Redo는 zundo 라이브러리로 구현되어 있습니다
