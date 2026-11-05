import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => localStorage.clear())

async function addTask(title: string, priority?: string) {
  await userEvent.click(screen.getByRole('button', { name: '+ New task' }))
  await userEvent.type(screen.getByLabelText('Title'), title)
  if (priority) await userEvent.selectOptions(screen.getByLabelText('Priority'), priority)
  await userEvent.click(screen.getByRole('button', { name: 'Add task' }))
}

const column = (name: string) => screen.getByRole('region', { name: new RegExp(`^${name}`) })

describe('Kanban board', () => {
  it('starts empty and adds a task to To do', async () => {
    render(<App />)
    expect(screen.getAllByText('No tasks yet')).toHaveLength(3)
    await addTask('Write tests')
    expect(within(column('To do')).getByText('Write tests')).toBeInTheDocument()
  })

  it('validates the title', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: '+ New task' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add task' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/title of at least 2/i)
  })

  it('moves a task between columns with the accessible select', async () => {
    render(<App />)
    await addTask('Ship it')
    await userEvent.selectOptions(screen.getByLabelText('Move Ship it to'), 'done')
    expect(within(column('Done')).getByText('Ship it')).toBeInTheDocument()
    expect(within(column('To do')).queryByText('Ship it')).not.toBeInTheDocument()
  })

  it('edits and deletes a task', async () => {
    render(<App />)
    await addTask('Old title')
    await userEvent.click(screen.getByRole('button', { name: 'Edit Old title' }))
    const input = screen.getByLabelText('Title')
    await userEvent.clear(input)
    await userEvent.type(input, 'New title')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByText('New title')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Delete New title' }))
    expect(screen.queryByText('New title')).not.toBeInTheDocument()
  })

  it('filters by search text and pauses reordering', async () => {
    render(<App />)
    await addTask('Alpha')
    await addTask('Beta')
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search tasks' }), 'alp')
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
    expect(screen.getByText(/reordering is paused/i)).toBeInTheDocument()
  })

  it('filters by priority', async () => {
    render(<App />)
    await addTask('Urgent thing', 'High')
    await addTask('Calm thing', 'Low')
    await userEvent.selectOptions(screen.getByLabelText('Filter by priority'), 'High')
    expect(screen.getByText('Urgent thing')).toBeInTheDocument()
    expect(screen.queryByText('Calm thing')).not.toBeInTheDocument()
  })

  it('persists the board in localStorage and restores it', async () => {
    const { unmount } = render(<App />)
    await addTask('Remember me')
    unmount()
    render(<App />)
    expect(screen.getByText('Remember me')).toBeInTheDocument()
  })

  it('loads clearly labeled example tasks on request', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Load example tasks' }))
    expect(screen.getByText('Plan the sprint')).toBeInTheDocument()
  })
})
