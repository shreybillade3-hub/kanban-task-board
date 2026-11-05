import { useEffect, useReducer } from 'react'
import { columns, emptyBoard, type Board } from '../lib/board'
import { boardReducer } from '../lib/reducer'

const KEY = 'kanban-board'

function load(): Board {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyBoard()
    const parsed = JSON.parse(raw) as Partial<Board>
    const board = emptyBoard()
    for (const c of columns) if (Array.isArray(parsed[c.id])) board[c.id] = parsed[c.id]!
    return board
  } catch {
    return emptyBoard()
  }
}

export default function useBoard() {
  const [board, dispatch] = useReducer(boardReducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(board))
    } catch {
      /* storage unavailable */
    }
  }, [board])

  return [board, dispatch] as const
}
