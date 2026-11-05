import { describe, expect, it } from 'vitest'
import { addTask, deleteTask, emptyBoard, filtersActive, findColumn, isOverdue, matchesFilters, moveTask, updateTask, type Task } from './board'

const task = (id: string, over: Partial<Task> = {}): Task => ({ id, title: `Task ${id}`, description: '', priority: 'Medium', dueDate: '', ...over })

const seed = () => {
  let b = emptyBoard()
  b = addTask(b, task('a'))
  b = addTask(b, task('b'))
  b = addTask(b, task('c'), 'doing')
  return b
}

describe('board operations', () => {
  it('adds tasks to the end of a column', () => {
    expect(seed().todo.map((t) => t.id)).toEqual(['a', 'b'])
  })

  it('finds the column of a task', () => {
    expect(findColumn(seed(), 'c')).toBe('doing')
    expect(findColumn(seed(), 'zzz')).toBeUndefined()
  })

  it('moves a task across columns at an index', () => {
    const b = moveTask(seed(), 'a', 'doing', 0)
    expect(b.todo.map((t) => t.id)).toEqual(['b'])
    expect(b.doing.map((t) => t.id)).toEqual(['a', 'c'])
  })

  it('appends when no index is given', () => {
    expect(moveTask(seed(), 'a', 'done').done.map((t) => t.id)).toEqual(['a'])
  })

  it('reorders within a column', () => {
    expect(moveTask(seed(), 'a', 'todo', 1).todo.map((t) => t.id)).toEqual(['b', 'a'])
  })

  it('returns the same board when nothing changes', () => {
    const b = seed()
    expect(moveTask(b, 'a', 'todo', 0)).toBe(b)
    expect(moveTask(b, 'missing', 'done')).toBe(b)
  })

  it('updates and deletes', () => {
    expect(updateTask(seed(), 'a', { title: 'New' }).todo[0].title).toBe('New')
    expect(deleteTask(seed(), 'a').todo.map((t) => t.id)).toEqual(['b'])
  })

  it('does not mutate the original board', () => {
    const b = seed()
    moveTask(b, 'a', 'done')
    expect(b.todo).toHaveLength(2)
  })
})

describe('filters and due dates', () => {
  const t = task('x', { title: 'Write docs', description: 'API reference', priority: 'High' })

  it('matches by text and priority', () => {
    expect(matchesFilters(t, { query: 'api', priority: 'All' })).toBe(true)
    expect(matchesFilters(t, { query: 'zzz', priority: 'All' })).toBe(false)
    expect(matchesFilters(t, { query: '', priority: 'Low' })).toBe(false)
  })

  it('knows when filters are active', () => {
    expect(filtersActive({ query: '', priority: 'All' })).toBe(false)
    expect(filtersActive({ query: ' a ', priority: 'All' })).toBe(true)
  })

  it('flags overdue tasks except done ones', () => {
    const due = task('d', { dueDate: '2026-01-01' })
    expect(isOverdue(due, 'todo', '2026-02-01')).toBe(true)
    expect(isOverdue(due, 'done', '2026-02-01')).toBe(false)
    expect(isOverdue(task('n'), 'todo', '2026-02-01')).toBe(false)
  })
})
