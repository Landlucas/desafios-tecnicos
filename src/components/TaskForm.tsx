import { type SubmitEvent, useCallback } from 'react'
import { fieldClass, labelClass, primaryButtonClass } from '../ui-classes'

function focusTaskId(element: HTMLInputElement | null) {
  element?.focus()
}

export function TaskForm({ onCreate }: { onCreate: (id: string, title: string) => void }) {
  const handleSubmit = useCallback((event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    onCreate(String(fields.get('id') ?? ''), String(fields.get('title') ?? ''))
  }, [onCreate])

  return (
    <form className="grid grid-cols-[minmax(6rem,11rem)_minmax(8rem,26rem)_auto] items-end justify-start gap-3 [@media(max-width:38rem)]:grid-cols-1" aria-label="New task" noValidate onSubmit={handleSubmit}>
      <label className={labelClass}>Task ID
        <input className={`${fieldClass} w-full`} ref={focusTaskId} name="id" required autoComplete="off" />
      </label>
      <label className={labelClass}>Task title
        <input className={`${fieldClass} w-full`} name="title" required autoComplete="off" />
      </label>
      <button className={`${primaryButtonClass} [@media(max-width:38rem)]:justify-self-start`} type="submit">Add task</button>
    </form>
  )
}
