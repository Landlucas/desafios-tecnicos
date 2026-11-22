export const columns = ['a_fazer', 'em_andamento', 'concluido'] as const
export type Column = typeof columns[number]

export type Task = Readonly<{ id: string; title: string; column: Column }>
type InverseAction = Readonly<
  | { type: 'remove_created'; id: string }
  | { type: 'restore_column'; id: string; column: Column }
>

export type Board = Readonly<{
  limit: number
  tasks: readonly Task[]
  history: readonly InverseAction[]
}>

export type Action =
  | { type: 'create'; id: string; title: string }
  | { type: 'move'; id: string; to: string }
  | { type: 'undo' }

export type Outcome = { board: Board } & (
  | { status: 'success'; code: 'created' | 'moved' | 'undid_creation' | 'undid_move' }
  | { status: 'failure'; code: 'invalid_task' | 'duplicate_id' | 'unknown_task' | 'unknown_column' | 'in_progress_full' }
  | { status: 'no_change'; code: 'same_column' | 'nada_a_desfazer' }
)

export const defaultLimit = 2

export function isValidLimit(limit: number) {
  return Number.isSafeInteger(limit) && limit >= 0
}

export function createBoard(limit = defaultLimit): Board {
  if (!isValidLimit(limit)) throw new RangeError('In Progress limit must be a nonnegative safe integer.')
  return { limit, tasks: [], history: [] }
}

export function tasksInColumn(board: Board, column: Column): Task[] {
  return board.tasks
    .filter(task => task.column === column)
    .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
}

export function canUndo(board: Board) {
  return board.history.length > 0
}

function countInProgress(board: Board) {
  return board.tasks.filter(task => task.column === 'em_andamento').length
}

function commit(board: Board, tasks: readonly Task[], inverse: InverseAction): Board {
  return { ...board, tasks, history: [...board.history, inverse] }
}

function setColumn(tasks: readonly Task[], id: string, column: Column): Task[] {
  return tasks.map(task => task.id === id ? { ...task, column } : task)
}

function createTask(board: Board, action: Extract<Action, { type: 'create' }>): Outcome {
  const id = action.id.trim()
  const title = action.title.trim()
  if (!id || !title) return { board, status: 'failure', code: 'invalid_task' }
  if (board.tasks.some(task => task.id === id)) {
    return { board, status: 'failure', code: 'duplicate_id' }
  }

  return {
    board: commit(board, [...board.tasks, { id, title, column: 'a_fazer' }], { type: 'remove_created', id }),
    status: 'success',
    code: 'created',
  }
}

function moveTask(board: Board, id: string, to: string): Outcome {
  const task = board.tasks.find(candidate => candidate.id === id)
  if (!task) return { board, status: 'failure', code: 'unknown_task' }

  const destination = columns.find(column => column === to)
  if (!destination) return { board, status: 'failure', code: 'unknown_column' }
  if (task.column === destination) return { board, status: 'no_change', code: 'same_column' }
  if (destination === 'em_andamento' && countInProgress(board) >= board.limit) {
    return { board, status: 'failure', code: 'in_progress_full' }
  }

  return {
    board: commit(board, setColumn(board.tasks, id, destination), { type: 'restore_column', id, column: task.column }),
    status: 'success',
    code: 'moved',
  }
}

function undo(board: Board): Outcome {
  const inverse = board.history.at(-1)
  if (!inverse) return { board, status: 'no_change', code: 'nada_a_desfazer' }

  const history = board.history.slice(0, -1)
  if (inverse.type === 'remove_created') {
    const tasks = board.tasks.filter(task => task.id !== inverse.id)
    return { board: { ...board, tasks, history }, status: 'success', code: 'undid_creation' }
  }
  const tasks = setColumn(board.tasks, inverse.id, inverse.column)
  return { board: { ...board, tasks, history }, status: 'success', code: 'undid_move' }
}

export function applyAction(board: Board, action: Action): Outcome {
  switch (action.type) {
    case 'create': return createTask(board, action)
    case 'move': return moveTask(board, action.id, action.to)
    case 'undo': return undo(board)
  }
}
