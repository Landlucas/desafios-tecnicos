import type { FormEvent } from 'react'

function focusTaskId(element: HTMLInputElement | null) {
  element?.focus()
}

export function TaskForm({ onCreate }: { onCreate: (id: string, title: string) => void }) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    onCreate(String(fields.get('id') ?? ''), String(fields.get('title') ?? ''))
  }

  return (
    <form className="create-form" aria-label="New task" noValidate onSubmit={handleSubmit}>
      <label>Task ID
        <input ref={focusTaskId} name="id" required autoComplete="off" />
      </label>
      <label>Task title
        <input name="title" required autoComplete="off" />
      </label>
      <button type="submit">Add task</button>
    </form>
  )
}
