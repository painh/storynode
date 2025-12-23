import { DialogueNode } from './DialogueNode'
import { ChoiceNode } from './ChoiceNode'
import { StartNode } from './StartNode'
import { BattleNode } from './BattleNode'
import { ShopNode } from './ShopNode'
import { EventNode } from './EventNode'
import { ChapterEndNode } from './ChapterEndNode'
import { VariableNode } from './VariableNode'
import { ConditionNode } from './ConditionNode'
import { CommentNode } from './CommentNode'
import type { NodeTypes } from '@xyflow/react'

export const nodeTypes: NodeTypes = {
  start: StartNode,
  dialogue: DialogueNode,
  choice: ChoiceNode,
  battle: BattleNode,
  shop: ShopNode,
  event: EventNode,
  chapter_end: ChapterEndNode,
  variable: VariableNode,
  condition: ConditionNode,
  comment: CommentNode,
}
