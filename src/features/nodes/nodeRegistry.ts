import { DialogueNode } from './DialogueNode'
import { ChoiceNode } from './ChoiceNode'
import type { NodeTypes } from '@xyflow/react'

export const nodeTypes: NodeTypes = {
  dialogue: DialogueNode,
  choice: ChoiceNode,
}
