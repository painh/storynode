# @storynode/game-engine

인터랙티브 스토리/비주얼 노벨을 위한 게임 엔진

## 설치

```bash
npm install @storynode/game-engine
```

## 빠른 시작

```typescript
import { GameEngine, type StoryProject } from '@storynode/game-engine';

// 1. 프로젝트 데이터 준비
const project: StoryProject = {
  name: "My Story",
  version: "1.0.0",
  stages: [{
    id: "stage_1",
    title: "시작",
    chapters: [{
      id: "chapter_1",
      title: "프롤로그",
      startNodeId: "node_1",
      nodes: [
        { id: "node_1", type: "dialogue", text: "이야기가 시작됩니다.", nextNodeId: "node_2" },
        { id: "node_2", type: "choice", text: "어떻게 하시겠습니까?", choices: [
          { id: "c1", text: "앞으로 간다", nextNodeId: "node_3" },
          { id: "c2", text: "뒤를 돌아본다", nextNodeId: "node_4" }
        ]},
        { id: "node_3", type: "dialogue", text: "앞으로 걸어갑니다.", nextNodeId: "end" },
        { id: "node_4", type: "dialogue", text: "뒤를 돌아봅니다.", nextNodeId: "end" },
        { id: "end", type: "chapter_end", text: "끝" }
      ]
    }]
  }]
};

// 2. 엔진 생성
const engine = new GameEngine(project, {
  onNodeChange: (node) => {
    if (!node) return;

    if (node.type === 'dialogue') {
      console.log(`${node.speaker || '나레이션'}: ${node.text}`);
    }
    else if (node.type === 'choice') {
      console.log(node.text);
      node.choices.forEach((c, i) => console.log(`  ${i+1}. ${c.text}`));
    }
    else if (node.type === 'chapter_end') {
      console.log(node.text);
    }
  },
  onGameEnd: () => console.log('게임 종료')
});

// 3. 시작
engine.start();

// 4. 진행
engine.advance();        // 다음 노드로
engine.selectChoice(0);  // 첫 번째 선택지 선택
```

---

## 노드 타입

### dialogue (대화)

```json
{
  "id": "node_1",
  "type": "dialogue",
  "speaker": "캐릭터 이름",
  "text": "대화 내용",
  "nextNodeId": "다음_노드_id"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | O | 고유 ID |
| type | "dialogue" | O | |
| text | string | O | 대화 내용 |
| speaker | string | X | 화자 이름 (없으면 나레이션) |
| nextNodeId | string | X | 다음 노드 ID |
| onEnterEffects | Effects | X | 노드 진입 시 효과 |

---

### choice (선택지)

```json
{
  "id": "node_2",
  "type": "choice",
  "text": "선택 전 표시할 텍스트",
  "choices": [
    {
      "id": "choice_1",
      "text": "선택지 1",
      "nextNodeId": "다음_노드_id"
    },
    {
      "id": "choice_2",
      "text": "선택지 2 (골드 100 이상)",
      "nextNodeId": "rich_path",
      "condition": { "type": "gold", "min": 100 },
      "effects": { "gold": -50 }
    }
  ]
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | O | 고유 ID |
| type | "choice" | O | |
| choices | Choice[] | O | 선택지 배열 |
| text | string | X | 선택 전 표시할 텍스트 |

**Choice 구조:**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string | O | 선택지 고유 ID |
| text | string | O | 선택지 텍스트 |
| nextNodeId | string | X | 선택 시 이동할 노드 |
| condition | Condition | X | 선택 가능 조건 |
| effects | Effects | X | 선택 시 적용 효과 |

---

### condition (조건 분기)

플레이어에게 보이지 않고 자동으로 조건에 따라 분기합니다.

```json
{
  "id": "node_3",
  "type": "condition",
  "conditionBranches": [
    {
      "condition": { "type": "flag", "flagKey": "has_key", "flagValue": true },
      "nextNodeId": "with_key"
    },
    {
      "condition": { "type": "gold", "min": 50 },
      "nextNodeId": "rich_path"
    }
  ],
  "defaultNextNodeId": "default_path"
}
```

- 위에서부터 순서대로 조건 체크
- 첫 번째로 만족하는 조건의 `nextNodeId`로 이동
- 모두 불만족 시 `defaultNextNodeId`로 이동

---

### variable (변수 조작)

플레이어에게 보이지 않고 자동으로 변수를 조작하고 다음 노드로 이동합니다.

```json
{
  "id": "node_4",
  "type": "variable",
  "variableOperations": [
    { "target": "gold", "action": "add", "value": 100 },
    { "target": "hp", "action": "subtract", "value": 10 },
    { "target": "flag", "action": "set", "key": "visited_cave", "value": true },
    { "target": "affection", "action": "add", "characterId": "npc1", "value": 5 }
  ],
  "nextNodeId": "next"
}
```

| target | action | 필요 필드 |
|--------|--------|----------|
| gold | set, add, subtract, multiply | value |
| hp | set, add, subtract, multiply | value |
| flag | set | key, value |
| affection | set, add, subtract | characterId, value |
| reputation | set, add, subtract | factionId, value |

---

### image (이미지)

```json
{
  "id": "img_1",
  "type": "image",
  "imageData": {
    "resourcePath": "images/background.png",
    "layer": "background",
    "effect": "fadeIn",
    "effectDuration": 500
  },
  "nextNodeId": "next"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| resourcePath | string | 이미지 경로 (비우면 해당 레이어 제거) |
| layer | "background" \| "character" | 레이어 종류 |
| layerOrder | number | 같은 레이어 내 순서 (기본 0) |
| alignment | "left" \| "center" \| "right" | 캐릭터 위치 |
| effect | ImageEffect | 효과 |
| effectDuration | number | 효과 지속시간 (ms) |

**ImageEffect 종류:**
`fadeIn`, `slideLeft`, `slideRight`, `slideUp`, `slideDown`, `zoomIn`, `zoomOut`, `shake`, `bounce`, `flash`, `pulse`

---

### chapter_end (챕터 종료)

```json
{
  "id": "end",
  "type": "chapter_end",
  "text": "제1장 완료"
}
```

---

## 조건 (Condition)

choice의 `condition`이나 condition 노드의 `conditionBranches`에서 사용합니다.

| type | 설명 | 필드 |
|------|------|------|
| gold | 골드 범위 체크 | min?, max?, value? |
| hp | HP 범위 체크 | min?, max?, value? |
| flag | 플래그 값 체크 | flagKey, flagValue? |
| choice_made | 특정 선택을 했는지 | choiceId |
| affection | 캐릭터 호감도 | characterId, min?, max?, value? |
| reputation | 진영 평판 | factionId, min?, max?, value? |

**예시:**

```json
// 골드 100 이상
{ "type": "gold", "min": 100 }

// HP 정확히 50
{ "type": "hp", "value": 50 }

// 플래그 has_key가 true
{ "type": "flag", "flagKey": "has_key", "flagValue": true }

// choice_1a 선택지를 골랐었는지
{ "type": "choice_made", "choiceId": "choice_1a" }

// npc1 호감도 30 이상
{ "type": "affection", "characterId": "npc1", "min": 30 }
```

---

## 효과 (Effects)

choice의 `effects`나 노드의 `onEnterEffects`에서 사용합니다.

```json
{
  "gold": 50,
  "hp": -10,
  "setFlags": {
    "quest_started": true,
    "visited_count": 3
  },
  "affection": [
    { "characterId": "npc1", "delta": 10 }
  ],
  "reputation": [
    { "factionId": "guild", "delta": -5 }
  ]
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| gold | number | 골드 증감 (음수면 감소) |
| hp | number | HP 증감 |
| setFlags | object | 플래그 설정 |
| affection | array | 호감도 변경 |
| reputation | array | 평판 변경 |

---

## 전체 프로젝트 구조

```json
{
  "name": "게임 이름",
  "version": "1.0.0",
  "stages": [
    {
      "id": "stage_1",
      "title": "제1막",
      "chapters": [
        {
          "id": "chapter_1",
          "title": "제1장",
          "startNodeId": "첫_노드_id",
          "nodes": [ /* 노드 배열 */ ]
        }
      ]
    }
  ],
  "variables": {
    "gold": 100,
    "hp": 100,
    "flags": { "tutorial_done": false }
  },
  "gameSettings": {
    "defaultGameMode": "visualNovel",
    "defaultThemeId": "dark"
  }
}
```

---

## API 레퍼런스

### GameEngine

```typescript
const engine = new GameEngine(project, options);
```

**옵션:**

```typescript
{
  onStateChange?: (state: GameState) => void,  // 상태 변경 시
  onNodeChange?: (node: StoryNode | null) => void,  // 노드 변경 시
  onGameEnd?: () => void  // 챕터 종료 시
}
```

**메서드:**

| 메서드 | 설명 |
|--------|------|
| `start(stageId?, chapterId?)` | 게임 시작 |
| `advance()` | 다음 노드로 진행 (dialogue에서만 동작) |
| `selectChoice(index)` | 선택지 선택 (0부터 시작) |
| `restart()` | 현재 챕터 재시작 |
| `getState()` | 현재 GameState 반환 |
| `getVariables()` | 현재 변수값 반환 |
| `getCurrentNode()` | 현재 노드 반환 |
| `getHistory()` | 히스토리 배열 반환 |
| `evaluateCondition(condition)` | 조건 평가 (true/false) |

### GameState

```typescript
{
  currentNodeId: string,
  currentStageId: string,
  currentChapterId: string,
  variables: {
    gold: number,
    hp: number,
    flags: Record<string, unknown>,
    affection: Record<string, number>,
    reputation: Record<string, number>,
    choicesMade: string[]
  },
  history: HistoryEntry[],
  activeImages: ActiveImage[]
}
```

---

## 라이선스

MIT
