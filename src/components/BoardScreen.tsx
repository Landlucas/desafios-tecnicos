import { useCallback, useMemo, useReducer } from 'react'
import { canUndo, columns, tasksInColumn } from '../board'
import { boardScreenReducer, createBoardScreenState } from '../board-screen-state'
import { panelClass, secondaryButtonClass } from '../ui-classes'
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

  const createTask = useCallback((id: string, title: string) => {
    dispatch({ type: 'create', id, title })
  }, [])

  const moveTask = useCallback((id: string, to: string) => {
    dispatch({ type: 'move', id, to })
  }, [])

  return (
    <>
      <div className={`${panelClass} grid grid-cols-[minmax(0,1fr)_auto] items-end gap-5 [@media(max-width:38rem)]:grid-cols-1`}>
        <TaskForm key={createdCount} onCreate={createTask} />
        <button className={`${secondaryButtonClass} [@media(max-width:38rem)]:justify-self-start`} type="button" disabled={!canUndo(board)}
          onClick={() => dispatch({ type: 'undo' })}>
          <span className="mr-1" aria-hidden="true">↶</span> Undo
        </button>
      </div>
      <ActionFeedback feedback={feedback} />
      <div className="grid grid-cols-3 gap-4 [@media(max-width:52rem)]:grid-cols-1">
        {columnTasks.map(({ column, tasks }) => (
          <BoardColumn key={column} column={column} tasks={tasks} limit={board.limit}
            movedTaskId={movedTaskId} onMove={moveTask} />
        ))}
      </div>
    </>
  )
}
