import { type SubmitEvent, useCallback } from 'react'
import { columns, type Task } from '../board'
import { columnLabels } from '../column-labels'
import { fieldClass, labelClass, secondaryButtonClass } from '../ui-classes'

function focusDestination(element: HTMLSelectElement | null) {
  element?.focus()
}

type TaskCardProps = {
  task: Task
  restoreFocus: boolean
  onMove: (id: string, to: string) => void
}

export function TaskCard({ task, restoreFocus, onMove }: TaskCardProps) {
  const handleSubmit = useCallback((event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const destination = new FormData(event.currentTarget).get('destination')
    onMove(task.id, String(destination ?? ''))
  }, [onMove, task.id])

  return (
    <li className="rounded-[.63rem] border border-line bg-paper p-[.8rem] marker:text-transparent">
      <span className="mb-[.3rem] block font-[ui-monospace,monospace] text-[.78rem] wrap-anywhere text-muted">{task.id}</span>
      <h3 className="text-[1.13rem] leading-[1.3] font-bold wrap-anywhere">{task.title}</h3>
      <form className="mt-[.85rem] grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3" onSubmit={handleSubmit} aria-label={`Move ${task.title} (${task.id})`}>
        <label className={labelClass}>Move to
          <select className={`${fieldClass} w-full`} ref={restoreFocus ? focusDestination : undefined} name="destination" defaultValue={task.column}>
            {columns.map(column => <option key={column} value={column}>{columnLabels[column]}</option>)}
          </select>
        </label>
        <button type="submit" className={secondaryButtonClass}>Move</button>
      </form>
    </li>
  )
}
