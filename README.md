# StoryNode Editor

[![CI](https://github.com/painh/storynode/actions/workflows/ci.yml/badge.svg)](https://github.com/painh/storynode/actions/workflows/ci.yml)

노드 기반 비주얼 노벨 / 인터랙티브 스토리 에디터

Unreal Engine Blueprint 스타일의 직관적인 노드 편집으로 복잡한 분기 스토리를 쉽게 만들 수 있습니다.

## 온라인에서 바로 사용하기

**[https://painh.github.io/storynode/](https://painh.github.io/storynode/)**

브라우저에서 바로 사용할 수 있습니다. 설치 없이 시작하세요!

## 데스크톱 앱 다운로드

네이티브 앱이 필요하다면 [Releases](https://github.com/painh/storynode/releases) 페이지에서 다운로드하세요.

- **Windows**: `.msi` 또는 `.exe` 파일
- **macOS (Apple Silicon)**: `aarch64.dmg` 파일
- **macOS (Intel)**: `x64.dmg` 파일
- **Linux**: `.deb` 또는 `.AppImage` 파일

## 주요 기능

- **노드 기반 편집** - 드래그 앤 드롭으로 스토리 플로우 구성
- **다양한 노드 타입** - 대화, 선택지, 조건 분기, 변수, 이미지, 스크립트 등
- **실시간 미리보기** - 에디터 내에서 바로 플레이 테스트
- **이미지 효과** - Fade, Slide, Zoom, Shake 등 다양한 효과 조합 가능
- **HTML 익스포트** - 단일 HTML 파일로 게임 배포
- **커스텀 노드** - 재사용 가능한 노드 템플릿 생성
- **자동 레이아웃** - 노드 자동 정렬
- **Undo/Redo** - 무제한 실행 취소

## 개발

```bash
# 의존성 설치
npm install

# 웹 개발 서버
npm run dev

# Tauri 데스크톱 개발
npm run tauri dev

# 빌드
npm run build
npm run tauri build
```

## 기술 스택

- React 19 + TypeScript
- Tauri v2 (Rust)
- React Flow (@xyflow/react)
- Zustand + Immer
- Vite

## 라이센스

MIT License - 자유롭게 사용하세요!
