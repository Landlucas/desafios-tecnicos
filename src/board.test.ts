import { describe, expect, it } from 'vitest'
import { applyAction, canUndo, createBoard, tasksInColumn, type Board } from './board'

function add(board: Board, id: string, title = id) {
  return applyAction(board, { type: 'create', id, title })
}

function move(board: Board, id: string, to: string) {
  return applyAction(board, { type: 'move', id, to })
}

function undo(board: Board) {
  return applyAction(board, { type: 'undo' })
}

describe('Work Board', () => {
  it('creates a text task in To Do without mutating the input board', () => {
    const before = createBoard()
    const result = add(before, '003', 'Write docs')
    expect(result.status).toBe('success')
    expect(tasksInColumn(result.board, 'a_fazer')).toEqual([
      { id: '003', title: 'Write docs', column: 'a_fazer' },
    ])
    expect(tasksInColumn(before, 'a_fazer')).toEqual([])
    expect(canUndo(before)).toBe(false)
    expect(canUndo(result.board)).toBe(true)
  })

  it.each(['a_fazer', 'em_andamento', 'concluido'] as const)('sorts %s by text ID', (column) => {
    const initial = add(add(createBoard(), '2').board, '10').board
    const board = move(move(initial, '2', column).board, '10', column).board
    expect(tasksInColumn(board, column).map(task => task.id)).toEqual(['10', '2'])
  })

  it.each([
    ['a_fazer', 'em_andamento'],
    ['a_fazer', 'concluido'],
    ['em_andamento', 'a_fazer'],
    ['em_andamento', 'concluido'],
    ['concluido', 'a_fazer'],
    ['concluido', 'em_andamento'],
  ] as const)('moves a task from %s to %s', (from, to) => {
    const start = add(createBoard(), 'A').board
    const board = move(start, 'A', from).board
    const result = move(board, 'A', to)
    expect(result.status).toBe('success')
    expect(tasksInColumn(result.board, to).map(task => task.id)).toEqual(['A'])
    expect(tasksInColumn(result.board, from)).toEqual([])
    expect(tasksInColumn(board, from).map(task => task.id)).toEqual(['A'])
  })

  it('accepts two tasks by default and rejects the third without recording a move', () => {
    let board = createBoard()
    for (const id of ['A', 'B', 'C']) board = add(board, id).board
    board = move(board, 'A', 'em_andamento').board
    board = move(board, 'B', 'em_andamento').board

    const result = move(board, 'C', 'em_andamento')
    expect(result).toMatchObject({ status: 'failure', code: 'in_progress_full' })
    expect(result.board).toBe(board)
    expect(tasksInColumn(board, 'em_andamento').map(task => task.id)).toEqual(['A', 'B'])
    expect(tasksInColumn(undo(result.board).board, 'a_fazer').map(task => task.id)).toEqual(['B', 'C'])
  })

  it('treats a same-column move at capacity as a no-op', () => {
    const start = add(createBoard(1), 'A').board
    const full = move(start, 'A', 'em_andamento').board
    const result = move(full, 'A', 'em_andamento')

    expect(result).toMatchObject({ status: 'no_change', code: 'same_column' })
    expect(result.board).toBe(full)
    expect(undo(result.board).board).toEqual(start)
  })

  it.each([
    ['missing', 'a_fazer', 'unknown_task'],
    ['A', 'unknown', 'unknown_column'],
    ['A', '__proto__', 'unknown_column'],
  ])('rejects move of %s to %s', (id, column, code) => {
    const board = add(createBoard(), 'A').board
    const result = move(board, id, column)
    expect(result).toMatchObject({ status: 'failure', code })
    expect(result.board).toBe(board)
  })

  it.each([
    [' A ', 'Different title', 'duplicate_id'],
    [' ', 'Title', 'invalid_task'],
    ['B', ' ', 'invalid_task'],
  ])('rejects invalid creation with ID %j and title %j', (id, title, code) => {
    const board = add(createBoard(), 'A').board
    const result = add(board, id, title)
    expect(result).toMatchObject({ status: 'failure', code })
    expect(result.board).toBe(board)
  })

  it('handles IDs that resemble object property names', () => {
    const board = add(createBoard(), '__proto__', '  Example  ').board
    expect(tasksInColumn(board, 'a_fazer')).toEqual([
      { id: '__proto__', title: 'Example', column: 'a_fazer' },
    ])
  })

  it('blocks entry into In Progress when its limit is zero', () => {
    const board = add(createBoard(0), 'A').board
    const result = move(board, 'A', 'em_andamento')
    expect(result).toMatchObject({ status: 'failure', code: 'in_progress_full' })
    expect(result.board).toBe(board)
  })

  it.each([-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects an invalid capacity of %s',
    (limit) => expect(() => createBoard(limit)).toThrow(RangeError),
  )

  it('restores each prior board in reverse order, including a full column', () => {
    const empty = createBoard(1)
    const created = add(empty, 'A').board
    const started = move(created, 'A', 'em_andamento').board
    const done = move(started, 'A', 'concluido').board
    const latest = add(done, 'B').board
    let board = latest
    for (const snapshot of [done, started, created, empty]) {
      const result = undo(board)
      expect(result.status).toBe('success')
      expect(result.board).toEqual(snapshot)
      board = result.board
    }
    expect(canUndo(board)).toBe(false)
  })

  it('returns the contract result for empty Undo', () => {
    const board = createBoard()
    const result = undo(board)
    expect(result).toMatchObject({ status: 'no_change', code: 'nada_a_desfazer' })
    expect(result.board).toBe(board)
  })
})
