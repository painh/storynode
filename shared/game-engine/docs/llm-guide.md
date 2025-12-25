# StoryNode LLM Guide

이 문서는 LLM이 @storynode/game-engine을 사용하여 인터랙티브 스토리를 작성할 때 참고하는 가이드입니다.

---

## 역할 설정

```
당신은 @storynode/game-engine 형식의 인터랙티브 스토리를 작성하는 작가입니다.
JSON 형식으로 스토리 노드를 작성하며, 대화, 선택지, 조건 분기를 활용해
플레이어가 선택에 따라 다른 결과를 경험하는 스토리를 만듭니다.
```

---

## JSON 스키마

### 프로젝트 전체 구조

```json
{
  "name": "스토리 제목",
  "version": "1.0.0",
  "stages": [
    {
      "id": "stage_1",
      "title": "제1막",
      "chapters": [
        {
          "id": "chapter_1",
          "title": "제1장: 시작",
          "startNodeId": "첫번째_노드_id",
          "nodes": []
        }
      ]
    }
  ],
  "variables": {
    "gold": 100,
    "hp": 100
  }
}
```

### 노드 작성 규칙

1. **모든 노드는 고유한 `id`가 필요합니다**
2. **`nextNodeId`는 실제로 존재하는 노드 ID를 가리켜야 합니다**
3. **chapter의 `startNodeId`는 첫 번째 노드 ID입니다**
4. **마지막은 반드시 `chapter_end` 노드로 끝나야 합니다**

---

## 노드 타입별 템플릿

### 1. 대화 노드 (dialogue)

```json
{
  "id": "intro_1",
  "type": "dialogue",
  "text": "어둠이 내려앉은 숲길. 당신은 홀로 걷고 있다.",
  "nextNodeId": "intro_2"
}
```

**화자가 있는 대화:**
```json
{
  "id": "intro_2",
  "type": "dialogue",
  "speaker": "수상한 노인",
  "text": "이봐, 젊은이. 이 숲을 혼자 지나가려는 건가?",
  "nextNodeId": "intro_3"
}
```

---

### 2. 선택지 노드 (choice)

**기본 선택지:**
```json
{
  "id": "choice_1",
  "type": "choice",
  "text": "노인이 당신에게 묻는다.",
  "choices": [
    {
      "id": "c1_a",
      "text": "\"네, 마을까지 가는 길입니다.\"",
      "nextNodeId": "polite_response"
    },
    {
      "id": "c1_b",
      "text": "\"당신에게 상관없는 일이오.\"",
      "nextNodeId": "rude_response"
    }
  ]
}
```

**조건부 선택지 (골드 필요):**
```json
{
  "id": "shop_choice",
  "type": "choice",
  "text": "상인이 물건을 보여준다.",
  "choices": [
    {
      "id": "buy_sword",
      "text": "검 구매 (50 골드)",
      "condition": { "type": "gold", "min": 50 },
      "effects": { "gold": -50, "setFlags": { "has_sword": true } },
      "nextNodeId": "bought_sword"
    },
    {
      "id": "buy_potion",
      "text": "포션 구매 (20 골드)",
      "condition": { "type": "gold", "min": 20 },
      "effects": { "gold": -20, "hp": 30 },
      "nextNodeId": "bought_potion"
    },
    {
      "id": "leave_shop",
      "text": "가게를 나간다",
      "nextNodeId": "exit_shop"
    }
  ]
}
```

**호감도 조건:**
```json
{
  "id": "romance_choice",
  "type": "choice",
  "text": "엘라가 당신을 바라본다.",
  "choices": [
    {
      "id": "confess",
      "text": "고백한다",
      "condition": { "type": "affection", "characterId": "ella", "min": 50 },
      "nextNodeId": "confession_success"
    },
    {
      "id": "talk",
      "text": "대화를 나눈다",
      "effects": { "affection": [{ "characterId": "ella", "delta": 5 }] },
      "nextNodeId": "casual_talk"
    }
  ]
}
```

---

### 3. 조건 분기 노드 (condition)

플레이어에게 보이지 않고 자동으로 분기합니다.

```json
{
  "id": "check_flag",
  "type": "condition",
  "conditionBranches": [
    {
      "condition": { "type": "flag", "flagKey": "saved_princess", "flagValue": true },
      "nextNodeId": "hero_ending"
    },
    {
      "condition": { "type": "gold", "min": 1000 },
      "nextNodeId": "rich_ending"
    }
  ],
  "defaultNextNodeId": "normal_ending"
}
```

---

### 4. 변수 조작 노드 (variable)

플레이어에게 보이지 않고 자동으로 변수를 조작합니다.

```json
{
  "id": "give_reward",
  "type": "variable",
  "variableOperations": [
    { "target": "gold", "action": "add", "value": 100 },
    { "target": "flag", "action": "set", "key": "quest_complete", "value": true },
    { "target": "affection", "action": "add", "characterId": "merchant", "value": 10 }
  ],
  "nextNodeId": "after_reward"
}
```

---

### 5. 챕터 종료 노드 (chapter_end)

```json
{
  "id": "chapter_end",
  "type": "chapter_end",
  "text": "제1장 완료\n\n당신의 모험은 이제 막 시작되었다..."
}
```

---

## 완전한 예제 (미니 스토리)

```json
{
  "name": "숲속의 만남",
  "version": "1.0.0",
  "stages": [{
    "id": "main",
    "title": "메인 스토리",
    "chapters": [{
      "id": "ch1",
      "title": "제1장: 숲속의 노인",
      "startNodeId": "start",
      "nodes": [
        {
          "id": "start",
          "type": "dialogue",
          "text": "어둠이 내려앉은 숲길을 걷고 있다.",
          "nextNodeId": "meet_old_man"
        },
        {
          "id": "meet_old_man",
          "type": "dialogue",
          "speaker": "수상한 노인",
          "text": "이봐, 젊은이. 이 숲을 혼자 지나가려는 건가?",
          "nextNodeId": "first_choice"
        },
        {
          "id": "first_choice",
          "type": "choice",
          "text": "어떻게 대답할까?",
          "choices": [
            {
              "id": "polite",
              "text": "\"네, 마을까지 가는 중입니다.\"",
              "effects": { "affection": [{ "characterId": "old_man", "delta": 10 }] },
              "nextNodeId": "polite_path"
            },
            {
              "id": "rude",
              "text": "무시하고 지나간다.",
              "effects": { "affection": [{ "characterId": "old_man", "delta": -10 }] },
              "nextNodeId": "rude_path"
            }
          ]
        },
        {
          "id": "polite_path",
          "type": "dialogue",
          "speaker": "노인",
          "text": "허허, 예의 바른 젊은이로군. 이걸 가져가게.",
          "nextNodeId": "receive_gift",
          "onEnterEffects": { "gold": 50 }
        },
        {
          "id": "receive_gift",
          "type": "dialogue",
          "text": "노인에게서 50 골드를 받았다!",
          "nextNodeId": "ending"
        },
        {
          "id": "rude_path",
          "type": "dialogue",
          "speaker": "노인",
          "text": "흥, 요즘 젊은것들은...",
          "nextNodeId": "ending"
        },
        {
          "id": "ending",
          "type": "chapter_end",
          "text": "제1장 완료"
        }
      ]
    }]
  }],
  "variables": {
    "gold": 0,
    "hp": 100
  }
}
```

---

## 주의사항

1. **ID 규칙**
   - 모든 ID는 영문, 숫자, 언더스코어만 사용
   - 예: `intro_1`, `choice_battle_1`, `npc_greeting`

2. **nextNodeId 검증**
   - 반드시 같은 챕터 내 존재하는 노드 ID를 가리켜야 함
   - 없는 ID를 가리키면 게임이 멈춤

3. **choice 노드에서는 advance() 불가**
   - 반드시 selectChoice(index)로 선택해야 진행

4. **condition/variable 노드는 자동 진행**
   - 플레이어에게 보이지 않고 바로 다음 노드로 이동

5. **Effects vs VariableOperations**
   - `effects`: 간단한 증감 (choice, onEnterEffects에서 사용)
   - `variableOperations`: 복잡한 조작 (variable 노드에서 사용)

---

## 권장 스토리 구조

```
start (dialogue)
  → 상황 설명 (dialogue)
  → 첫 선택 (choice)
    → 분기 A (dialogue들...)
    → 분기 B (dialogue들...)
  → 분기 합류 (dialogue)
  → 조건 체크 (condition)
    → 조건 만족 루트
    → 기본 루트
  → 클라이맥스 선택 (choice)
  → 엔딩들 (dialogue)
  → chapter_end
```
