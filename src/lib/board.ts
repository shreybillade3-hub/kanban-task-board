export type ColumnId = 'todo' | 'doing' | 'done'
export type Priority = 'Low' | 'Medium' | 'High'

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  dueDate: string // YYYY-MM-DD or ''
}

export type Board = Record<ColumnId, Task[]>

export const columns: { id: ColumnId; title: string }[] = [
  { id: 'todo', title: 'To do' },
  { id: 'doing', title: 'In progress' },
  { id: 'done', title: 'Done' },
]

export const emptyBoard = (): Board => ({ todo: [], doing: [], done: [] })

export type TaskInput = Omit<Task, 'id'>

export function findColumn(board: Board, taskId: string): ColumnId | undefined {
  return columns.find((c) => board[c.id].some((t) => t.id === taskId))?.id
}

export function addTask(board: Board, task: Task, column: ColumnId = 'todo'): Board {
  return { ...board, [column]: [...board[column], task] }
}

export function updateTask(board: Board, id: string, patch: Partial<TaskInput>): Board {
  const next = emptyBoard()
  for (const c of columns) next[c.id] = board[c.id].map((t) => (t.id === id ? { ...t, ...patch } : t))
  return next
}

export function deleteTask(board: Board, id: string): Board {
  const next = emptyBoard()
  for (const c of columns) next[c.id] = board[c.id].filter((t) => t.id !== id)
  return next
}

/** Moves a task to `to` at `index` (end of the column when omitted). Returns the same board when nothing changes. */
export function moveTask(board: Board, id: string, to: ColumnId, index?: number): Board {
  const from = findColumn(board, id)
  if (!from) return board
  const task = board[from].find((t) => t.id === id)!
  const without = board[from].filter((t) => t.id !== id)
  const target = from === to ? without : [...board[to]]
  const at = Math.max(0, Math.min(index ?? target.length, target.length))
  const inserted = [...target.slice(0, at), task, ...target.slice(at)]

  if (from === to) {
    const unchanged = inserted.every((t, i) => t.id === board[to][i].id)
    return unchanged ? board : { ...board, [to]: inserted }
  }
  return { ...board, [from]: without, [to]: inserted }
}

export interface Filters {
  query: string
  priority: Priority | 'All'
}

export const filtersActive = (f: Filters) => f.query.trim() !== '' || f.priority !== 'All'

export function matchesFilters(task: Task, f: Filters): boolean {
  const q = f.query.trim().toLowerCase()
  if (f.priority !== 'All' && task.priority !== f.priority) return false
  return !q || `${task.title} ${task.description}`.toLowerCase().includes(q)
}

export const isOverdue = (task: Task, column: ColumnId, today: string) =>
  column !== 'done' && task.dueDate !== '' && task.dueDate < today

export const todayISO = () => new Date().toISOString().slice(0, 10)

export const exampleTasks: Task[] = [
  { id: 'ex-1', title: 'Plan the sprint', description: 'List what the team wants to finish this week.', priority: 'High', dueDate: '' },
  { id: 'ex-2', title: 'Review pull requests', description: 'Check open PRs and leave feedback.', priority: 'Medium', dueDate: '' },
  { id: 'ex-3', title: 'Update the README', description: 'Add setup steps and screenshots.', priority: 'Low', dueDate: '' },
]
