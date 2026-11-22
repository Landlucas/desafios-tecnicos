import { useState, type FormEvent } from 'react'
import { defaultLimit, isValidLimit } from '../board'

export function SetupForm({ onStart }: { onStart: (limit: number) => void }) {
  const [error, setError] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = String(new FormData(event.currentTarget).get('limit') ?? '')
    const limit = Number(input)
    if (input === '' || !isValidLimit(limit)) {
      setError(true)
      return
    }
    onStart(limit)
  }

  return (
    <form className="setup panel" onSubmit={handleSubmit} noValidate aria-labelledby="setup-heading">
      <h2 id="setup-heading">Board setup</h2>
      <p id="limit-hint">Choose the maximum number of tasks allowed in In Progress.</p>
      <label htmlFor="limit">In Progress limit</label>
      <input id="limit" name="limit" type="number" min="0" step="1" required defaultValue={defaultLimit}
        aria-describedby="limit-hint" aria-invalid={error} onChange={() => setError(false)} />
      {error ? (
        <p className="feedback" data-status="failure" role="alert">Enter a whole number of zero or more.</p>
      ) : null}
      <button type="submit">Start board</button>
    </form>
  )
}
