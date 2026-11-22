import type { BoardFeedback } from '../board-screen-state'

const messages: Record<BoardFeedback['code'], string> = {
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

const statusLabels: Record<BoardFeedback['status'], string> = {
  success: 'Success',
  failure: 'Failed',
  no_change: 'No change',
}

export function ActionFeedback({ feedback }: { feedback: BoardFeedback | null }) {
  return (
    <p className="feedback" role="status" data-status={feedback?.status}>
      {feedback ? <><strong>{statusLabels[feedback.status]}.</strong> {messages[feedback.code]}</> : null}
    </p>
  )
}
