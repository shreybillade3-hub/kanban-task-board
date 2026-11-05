import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useMemo, useState } from 'react'
import Column from './components/Column'
import { CardBody } from './components/TaskCard'
import TaskForm from './components/TaskForm'
import ThemeToggle from './components/ThemeToggle'
import useBoard from './hooks/useBoard'
import useTheme from './hooks/useTheme'
import { columns, filtersActive, findColumn, isOverdue, matchesFilters, todayISO, type ColumnId, type Filters, type Priority, type Task } from './lib/board'

const isColumn = (id: string): id is ColumnId => columns.some((c) => c.id === id)

export default function App() {
  const { theme, toggle } = useTheme()
  const [board, dispatch] = useBoard()
  const [today] = useState(todayISO)
  const [filters, setFilters] = useState<Filters>({ query: '', priority: 'All' })
  const [editing, setEditing] = useState<Task | 'new' | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const total = columns.reduce((n, c) => n + board[c.id].length, 0)
  const dragDisabled = filtersActive(filters)
  const visible = useMemo(
    () => Object.fromEntries(columns.map((c) => [c.id, board[c.id].filter((t) => matchesFilters(t, filters))])) as Record<ColumnId, Task[]>,
    [board, filters],
  )
  const activeTask = activeId ? columns.flatMap((c) => board[c.id]).find((t) => t.id === activeId) : undefined
  const activeColumn = activeId ? findColumn(board, activeId) : undefined

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const from = findColumn(board, String(active.id))
    const overId = String(over.id)
    const to = isColumn(overId) ? overId : findColumn(board, overId)
    if (!from || !to || from === to) return
    const index = isColumn(overId) ? board[to].length : board[to].findIndex((t) => t.id === overId)
    dispatch({ type: 'move', id: String(active.id), to, index })
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over || active.id === over.id) return
    const col = findColumn(board, String(active.id))
    const overId = String(over.id)
    if (col && !isColumn(overId) && findColumn(board, overId) === col) {
      dispatch({ type: 'move', id: String(active.id), to: col, index: board[col].findIndex((t) => t.id === overId) })
    }
  }

  const save = (input: Omit<Task, 'id'>) => {
    if (editing && editing !== 'new') dispatch({ type: 'update', id: editing.id, patch: input })
    else dispatch({ type: 'add', task: { ...input, id: crypto.randomUUID() } })
    setEditing(null)
  }

  const field =
    'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 focus-visible:outline-2 focus-visible:outline-brand-500'

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kanban Task Board</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Drag cards, or use the keyboard: focus a handle, press Space, then arrow keys</p>
        </div>
        <ThemeToggle theme={theme} onToggle={toggle} />
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setEditing('new')} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">
          + New task
        </button>
        <input type="search" aria-label="Search tasks" placeholder="Search tasks" value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} className={`${field} min-w-48 flex-1 sm:flex-none`} />
        <select aria-label="Filter by priority" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value as Priority | 'All' })} className={field}>
          <option value="All">All priorities</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        {total === 0 && (
          <button type="button" onClick={() => dispatch({ type: 'examples' })} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-500">
            Load example tasks
          </button>
        )}
        {total > 0 && (
          <button type="button" onClick={() => dispatch({ type: 'clear' })} className="text-sm font-medium text-rose-600 hover:underline dark:text-rose-400">
            Clear board
          </button>
        )}
      </div>
      {dragDisabled && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Reordering is paused while filters are active.</p>}

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {columns.map((c) => (
            <Column
              key={c.id}
              id={c.id}
              title={c.title}
              tasks={visible[c.id]}
              total={board[c.id].length}
              today={today}
              dragDisabled={dragDisabled}
              onEdit={setEditing}
              onDelete={(id) => dispatch({ type: 'delete', id })}
              onMove={(id, to) => dispatch({ type: 'move', id, to })}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask && activeColumn && (
            <div className="rounded-xl border border-brand-500 bg-white p-3 shadow-lg dark:bg-slate-900">
              <CardBody task={activeTask} column={activeColumn} overdue={isOverdue(activeTask, activeColumn, today)} dragDisabled onEdit={() => {}} onDelete={() => {}} onMove={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {editing && <TaskForm task={editing === 'new' ? undefined : editing} onSubmit={save} onCancel={() => setEditing(null)} />}
    </div>
  )
}
