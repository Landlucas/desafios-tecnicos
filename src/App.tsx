import { useEffect, useReducer, useRef, useState, type FormEvent } from 'react'
import {
  applyAction, canUndo, columns, createBoard, defaultLimit, isValidLimit, tasksInColumn,
  type Action, type Board, type Column, type Outcome,
} from './board'

const labels: Record<Column, string> = {
  a_fazer: 'To Do',
  em_andamento: 'In Progress',
  concluido: 'Done',
}

const messages: Record<Outcome['code'], string> = {
  created: 'Task added to To Do.',
  moved: 'Task moved.',
  undid_creation: 'Undid the creation.',
  undid_move: 'Undid the move.',
  invalid_task: 'Enter a task ID and title.',
  duplicate_id: 'This task ID is already in use.',
  unknown_task: 'This task ID was not found.',
  unknown_column: 'This column was not found.',
  in_progress_full: 'In Progress is full. Move a task out to free a slot.',
  same_column: 'The task is already in that column.',
  nada_a_desfazer: 'There is nothing to undo.',
}

const feedbackLabels: Record<Outcome['status'], string> = {
  success: 'Success',
  failure: 'Failed',
  no_change: 'No change',
}

const emptyDraft = { id: '', title: '' }
type ScreenState = {
  board: Board
  draft: typeof emptyDraft
  feedback: (Pick<Outcome, 'status' | 'code'> & { movedTaskId?: string }) | null
}
type ScreenAction =
  | { type: 'edit'; field: keyof typeof emptyDraft; value: string }
  | { type: 'board'; action: Action }

function reducer(state: ScreenState, event: ScreenAction): ScreenState {
  if (event.type === 'edit') {
    return { ...state, draft: { ...state.draft, [event.field]: event.value } }
  }
  const { board, status, code } = applyAction(state.board, event.action)
  return {
    board,
    draft: code === 'created' ? emptyDraft : state.draft,
    feedback: {
      status, code,
      movedTaskId: event.action.type === 'move' && code === 'moved' ? event.action.id : undefined,
    },
  }
}

function Setup({ onStart }: { onStart: (board: Board) => void }) {
  const [limit, setLimit] = useState(String(defaultLimit))
  const [error, setError] = useState(false)

  function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const capacity = Number(limit)
    if (limit === '' || !isValidLimit(capacity)) {
      setError(true)
      return
    }
    onStart(createBoard(capacity))
  }

  return (
    <form className="setup panel" onSubmit={start} noValidate aria-labelledby="setup-heading">
      <h2 id="setup-heading">Board setup</h2>
      <p id="limit-hint">Choose the maximum number of tasks allowed in In Progress.</p>
      <label htmlFor="limit">In Progress limit</label>
      <input id="limit" type="number" min="0" step="1" required value={limit}
        aria-describedby="limit-hint" aria-invalid={error}
        onChange={event => { setLimit(event.target.value); setError(false) }} />
      {error && <p className="feedback" data-status="failure" role="alert">Enter a whole number of zero or more.</p>}
      <button type="submit">Start board</button>
    </form>
  )
}

type Task = ReturnType<typeof tasksInColumn>[number]

function focusDestination(element: HTMLSelectElement | null) {
  element?.focus()
}

function TaskCard({ task, restoreFocus, onMove }: {
  task: Task
  restoreFocus: boolean
  onMove: (id: string, to: string) => void
}) {
  const [destination, setDestination] = useState<string>(task.column)
  return (
    <li className="task">
      <span className="task-id">{task.id}</span>
      <h3>{task.title}</h3>
      <form className="move-form" onSubmit={event => { event.preventDefault(); onMove(task.id, destination) }}
        aria-label={`Move ${task.title} (${task.id})`}>
        <label>Move to
          <select ref={restoreFocus ? focusDestination : undefined} value={destination}
            onChange={event => setDestination(event.target.value)}>
            {columns.map(column => <option key={column} value={column}>{labels[column]}</option>)}
          </select>
        </label>
        <button type="submit" className="secondary">Move</button>
      </form>
    </li>
  )
}

function BoardScreen({ initialBoard }: { initialBoard: Board }) {
  const [{ board, draft, feedback }, dispatch] = useReducer(reducer, {
    board: initialBoard, draft: emptyDraft, feedback: null,
  })
  const idInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (feedback === null || feedback.code === 'created') idInput.current?.focus()
  }, [feedback])

  function perform(action: Action) {
    dispatch({ type: 'board', action })
  }

  return (
    <>
      <div className="toolbar panel">
        <form className="create-form" aria-label="New task" noValidate onSubmit={event => {
          event.preventDefault()
          perform({ type: 'create', ...draft })
        }}>
          <label>Task ID
            <input ref={idInput} value={draft.id} required autoComplete="off"
              onChange={event => dispatch({ type: 'edit', field: 'id', value: event.target.value })} />
          </label>
          <label>Task title
            <input value={draft.title} required autoComplete="off"
              onChange={event => dispatch({ type: 'edit', field: 'title', value: event.target.value })} />
          </label>
          <button type="submit">Add task</button>
        </form>
        <button className="secondary undo" type="button" disabled={!canUndo(board)}
          onClick={() => perform({ type: 'undo' })}>
          <span aria-hidden="true">↶</span> Undo
        </button>
      </div>
      <p className="feedback" role="status" data-status={feedback?.status}>
        {feedback && <><strong>{feedbackLabels[feedback.status]}.</strong> {messages[feedback.code]}</>}
      </p>
      <div className="columns">
        {columns.map(column => {
          const tasks = tasksInColumn(board, column)
          return (
            <section key={column} className="column" data-column={column} aria-labelledby={column}>
              <header className="column-heading">
                <span className="column-dot" aria-hidden="true" />
                <h2 id={column}>{labels[column]}</h2>
                <span className="count">
                  {column === 'em_andamento' ? `${tasks.length} / ${board.limit}` : tasks.length}
                </span>
              </header>
              {tasks.length === 0 ? <p className="empty">No tasks</p> : (
                <ul className="tasks" role="list">
                  {tasks.map(task => (
                    <TaskCard key={task.id} task={task} restoreFocus={feedback?.movedTaskId === task.id}
                      onMove={(id, to) => perform({ type: 'move', id, to })} />
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </>
  )
}

export function App() {
  const [initialBoard, setInitialBoard] = useState<Board | null>(null)

  return (
    <main className="workspace">
      <header className="page-heading">
        <h1>Work Board</h1>
        <p>Tasks reset when you refresh the page.</p>
      </header>
      {initialBoard ? <BoardScreen initialBoard={initialBoard} /> : <Setup onStart={setInitialBoard} />}
    </main>
  )
}
