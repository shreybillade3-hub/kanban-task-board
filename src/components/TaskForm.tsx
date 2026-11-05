import { useState, type FormEvent } from 'react'
import type { Priority, Task, TaskInput } from '../lib/board'

interface Props {
  task?: Task
  onSubmit: (input: TaskInput) => void
  onCancel: () => void
}

const field =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900 aria-[invalid=true]:border-rose-500 focus-visible:outline-2 focus-visible:outline-brand-500'

export default function TaskForm({ task, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'Medium')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (title.trim().length < 2) {
      setError('Give the task a title of at least 2 characters.')
      return
    }
    onSubmit({ title: title.trim(), description: description.trim(), priority, dueDate })
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={onCancel}>
      <form
        role="dialog"
        aria-modal="true"
        aria-label={task ? 'Edit task' : 'New task'}
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        noValidate
        className="grid w-full max-w-md gap-4 rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900"
      >
        <h2 className="text-lg font-semibold">{task ? 'Edit task' : 'New task'}</h2>
        <div>
          <label htmlFor="task-title" className="mb-1 block text-sm font-medium">
            Title
          </label>
          <input id="task-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'task-title-error' : undefined} className={field} />
          {error && (
            <p id="task-title-error" role="alert" className="mt-1 text-sm text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="task-desc" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <textarea id="task-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={field} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-priority" className="mb-1 block text-sm font-medium">
              Priority
            </label>
            <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={field}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label htmlFor="task-due" className="mb-1 block text-sm font-medium">
              Due date
            </label>
            <input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={field} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-700">
            Cancel
          </button>
          <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            {task ? 'Save changes' : 'Add task'}
          </button>
        </div>
      </form>
    </div>
  )
}
