import { applyAction, createBoard, type Action, type Board, type Outcome } from './board'

export type BoardFeedback = Pick<Outcome, 'status' | 'code'>

type BoardScreenState = {
  board: Board
  feedback: BoardFeedback | null
  createdCount: number
  movedTaskId: string | null
}

export function createBoardScreenState(limit: number): BoardScreenState {
  return { board: createBoard(limit), feedback: null, createdCount: 0, movedTaskId: null }
}

export function boardScreenReducer(state: BoardScreenState, action: Action): BoardScreenState {
  const { board, status, code } = applyAction(state.board, action)

  return {
    board,
    feedback: { status, code },
    createdCount: code === 'created' ? state.createdCount + 1 : state.createdCount,
    movedTaskId: action.type === 'move' && code === 'moved' ? action.id : null,
  }
}
