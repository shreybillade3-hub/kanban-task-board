import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { columns, type ColumnId, type Task } from '../lib/board'

interface Props {
  task: Task
  column: ColumnId
  overdue: boolean
  dragDisabled: boolean
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onMove: (id: string, to: ColumnId) => void
}

const badge: Record<Task['priority'], string> = {
  High: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
}

export function CardBody({ task, column, overdue, dragDisabled, onEdit, onDelete, onMove, handle }: Props & { handle?: Record<string, unknown> }) {
  return (
    <>
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label={`Drag ${task.title}`}
          disabled={dragDisabled}
          className="mt-0.5 cursor-grab touch-none rounded px-1 text-slate-400 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-slate-200"
          {...handle}
        >
          ⠿
        </button>
        <div className="min-w-0 flex-1">
          <p className="break-words font-medium">{task.title}</p>
          {task.description && <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-400">{task.description}</p>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-full px-2 py-0.5 font-medium ${badge[task.priority]}`}>{task.priority}</span>
        {task.dueDate && (
          <span className={overdue ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}>
            {overdue ? 'Overdue · ' : 'Due '}
            {task.dueDate}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <label className="sr-only" htmlFor={`move-${task.id}`}>
          Move {task.title} to
        </label>
        <select
          id={`move-${task.id}`}
          value={column}
          onChange={(e) => onMove(task.id, e.target.value as ColumnId)}
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
        >
          {columns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => onEdit(task)} className="font-medium text-brand-600 hover:underline dark:text-brand-500" aria-label={`Edit ${task.title}`}>
          Edit
        </button>
        <button type="button" onClick={() => onDelete(task.id)} className="font-medium text-rose-600 hover:underline dark:text-rose-400" aria-label={`Delete ${task.title}`}>
          Delete
        </button>
      </div>
    </>
  )
}

export default function TaskCard(props: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.task.id, disabled: props.dragDisabled })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${isDragging ? 'opacity-40' : ''}`}
    >
      <CardBody {...props} handle={{ ...attributes, ...listeners }} />
    </li>
  )
}
