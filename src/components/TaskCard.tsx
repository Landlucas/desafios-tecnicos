import type { FormEvent } from 'react'
import { columns, type Task } from '../board'
import { columnLabels } from '../column-labels'

function focusDestination(element: HTMLSelectElement | null) {
  element?.focus()
}

type TaskCardProps = {
  task: Task
  restoreFocus: boolean
  onMove: (id: string, to: string) => void
}

export function TaskCard({ task, restoreFocus, onMove }: TaskCardProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const destination = new FormData(event.currentTarget).get('destination')
    onMove(task.id, String(destination ?? ''))
  }

  return (
    <li className="task">
      <span className="task-id">{task.id}</span>
      <h3>{task.title}</h3>
      <form className="move-form" onSubmit={handleSubmit} aria-label={`Move ${task.title} (${task.id})`}>
        <label>Move to
          <select ref={restoreFocus ? focusDestination : undefined} name="destination" defaultValue={task.column}>
            {columns.map(column => <option key={column} value={column}>{columnLabels[column]}</option>)}
          </select>
        </label>
        <button type="submit" className="secondary">Move</button>
      </form>
    </li>
  )
}
