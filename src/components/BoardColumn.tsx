import type { Column, Task } from '../board'
import { columnLabels } from '../column-labels'
import { TaskCard } from './TaskCard'

type BoardColumnProps = {
  column: Column
  tasks: readonly Task[]
  limit: number
  movedTaskId: string | null
  onMove: (id: string, to: string) => void
}

export function BoardColumn({ column, tasks, limit, movedTaskId, onMove }: BoardColumnProps) {
  const count = column === 'em_andamento' ? `${tasks.length} / ${limit}` : tasks.length

  return (
    <section className="column" data-column={column} aria-labelledby={column}>
      <header className="column-heading">
        <span className="column-dot" aria-hidden="true" />
        <h2 id={column}>{columnLabels[column]}</h2>
        <span className="count">{count}</span>
      </header>
      {tasks.length === 0 ? <p className="empty">No tasks</p> : (
        // biome-ignore lint/a11y/noRedundantRoles: Safari can hide lists with list-style: none from assistive technology.
        <ul className="tasks" role="list">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} restoreFocus={movedTaskId === task.id} onMove={onMove} />
          ))}
        </ul>
      )}
    </section>
  )
}
