import { addTask, deleteTask, emptyBoard, exampleTasks, moveTask, updateTask, type Board, type ColumnId, type Task, type TaskInput } from './board'

export type Action =
  | { type: 'add'; task: Task }
  | { type: 'update'; id: string; patch: Partial<TaskInput> }
  | { type: 'delete'; id: string }
  | { type: 'move'; id: string; to: ColumnId; index?: number }
  | { type: 'examples' }
  | { type: 'clear' }

export function boardReducer(board: Board, action: Action): Board {
  switch (action.type) {
    case 'add':
      return addTask(board, action.task)
    case 'update':
      return updateTask(board, action.id, action.patch)
    case 'delete':
      return deleteTask(board, action.id)
    case 'move':
      return moveTask(board, action.id, action.to, action.index)
    case 'examples':
      return exampleTasks.reduce((b, t) => addTask(b, { ...t, id: `${t.id}-${Date.now()}` }), board)
    case 'clear':
      return emptyBoard()
  }
}
