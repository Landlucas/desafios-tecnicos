import { useMemo, useReducer } from 'react'
import { canUndo, columns, tasksInColumn } from '../board'
import { boardScreenReducer, createBoardScreenState } from '../board-screen-state'
import { ActionFeedback } from './ActionFeedback'
import { BoardColumn } from './BoardColumn'
import { TaskForm } from './TaskForm'

export function BoardScreen({ limit }: { limit: number }) {
  const [{ board, feedback, createdCount, movedTaskId }, dispatch] =
    useReducer(boardScreenReducer, limit, createBoardScreenState)

  const columnTasks = useMemo(
    () => columns.map(column => ({ column, tasks: tasksInColumn(board, column) })),
    [board],
  )

  function createTask(id: string, title: string) {
    dispatch({ type: 'create', id, title })
  }

  function moveTask(id: string, to: string) {
    dispatch({ type: 'move', id, to })
  }

  return (
    <>
      <div className="toolbar panel">
        <TaskForm key={createdCount} onCreate={createTask} />
        <button className="secondary undo" type="button" disabled={!canUndo(board)}
          onClick={() => dispatch({ type: 'undo' })}>
          <span aria-hidden="true">↶</span> Undo
        </button>
      </div>
      <ActionFeedback feedback={feedback} />
      <div className="columns">
        {columnTasks.map(({ column, tasks }) => (
          <BoardColumn key={column} column={column} tasks={tasks} limit={board.limit}
            movedTaskId={movedTaskId} onMove={moveTask} />
        ))}
      </div>
    </>
  )
}
