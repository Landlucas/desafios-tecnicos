import type { Column, Task } from '../board'
import { columnLabels } from '../column-labels'
import { TaskCard } from './TaskCard'

const dotClasses: Record<Column, string> = {
  a_fazer: 'bg-[#718079]',
  em_andamento: 'bg-[#a76216]',
  concluido: 'bg-[#297358]',
}

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
    <section className="min-h-72 rounded-[.85rem] border border-line bg-[#eceee7] p-[.9rem] [@media(max-width:52rem)]:min-h-0" data-column={column} aria-labelledby={column}>
      <header className="mb-[.85rem] grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
        <span className={`size-[.52rem] rounded-full ${dotClasses[column]}`} aria-hidden="true" />
        <h2 className="text-[1.12rem] font-bold" id={column}>{columnLabels[column]}</h2>
        <span className="rounded-2xl bg-paper px-[.53rem] py-[.18rem] text-[.8rem] text-muted tabular-nums">{count}</span>
      </header>
      {tasks.length === 0 ? <p className="px-2 py-3 text-[.9rem] text-muted">No tasks</p> : (
        <ul className="grid list-disc gap-[.7rem]">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} restoreFocus={movedTaskId === task.id} onMove={onMove} />
          ))}
        </ul>
      )}
    </section>
  )
}
