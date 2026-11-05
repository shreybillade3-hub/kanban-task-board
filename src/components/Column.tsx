import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { isOverdue, type ColumnId, type Task } from '../lib/board'
import TaskCard from './TaskCard'

interface Props {
  id: ColumnId
  title: string
  tasks: Task[]
  total: number
  today: string
  dragDisabled: boolean
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onMove: (id: string, to: ColumnId) => void
}

export default function Column({ id, title, tasks, total, today, dragDisabled, onEdit, onDelete, onMove }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <section
      aria-labelledby={`col-${id}`}
      className={`flex min-h-48 flex-col rounded-2xl border p-3 transition-colors ${
        isOver ? 'border-brand-500 bg-brand-50 dark:bg-slate-900' : 'border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/60'
      }`}
    >
      <h2 id={`col-${id}`} className="mb-3 flex items-center justify-between px-1 text-sm font-semibold">
        {title}
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300" aria-label={`${total} tasks`}>
          {tasks.length === total ? total : `${tasks.length} / ${total}`}
        </span>
      </h2>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="flex flex-1 flex-col gap-2">
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} column={id} overdue={isOverdue(t, id, today)} dragDisabled={dragDisabled} onEdit={onEdit} onDelete={onDelete} onMove={onMove} />
          ))}
          {tasks.length === 0 && <li className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-700">{total === 0 ? 'No tasks yet' : 'No matches'}</li>}
        </ul>
      </SortableContext>
    </section>
  )
}
