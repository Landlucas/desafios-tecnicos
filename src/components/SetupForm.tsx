import { type SubmitEvent, useCallback, useState } from 'react'
import { defaultLimit, isValidLimit } from '../board'
import { feedbackClass, feedbackToneClasses, fieldClass, labelClass, panelClass, primaryButtonClass } from '../ui-classes'

export function SetupForm({ onStart }: { onStart: (limit: number) => void }) {
  const [error, setError] = useState(false)

  const handleSubmit = useCallback((event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input = String(new FormData(event.currentTarget).get('limit') ?? '')
    const limit = Number(input)
    if (input === '' || !isValidLimit(limit)) {
      setError(true)
      return
    }
    onStart(limit)
  }, [onStart])

  return (
    <form className={`${panelClass} grid w-full max-w-[30rem] gap-3`} onSubmit={handleSubmit} noValidate aria-labelledby="setup-heading">
      <h2 className="text-[1.12rem] font-bold" id="setup-heading">Board setup</h2>
      <p className="text-muted" id="limit-hint">Choose the maximum number of tasks allowed in In Progress.</p>
      <label className={labelClass} htmlFor="limit">In Progress limit</label>
      <input className={`${fieldClass} w-36`} id="limit" name="limit" type="number" min="0" step="1" required defaultValue={defaultLimit}
        aria-describedby="limit-hint" aria-invalid={error} onChange={() => setError(false)} />
      {error ? (
        <p className={`${feedbackClass} ${feedbackToneClasses.failure}`} data-status="failure" role="alert">Enter a whole number of zero or more.</p>
      ) : null}
      <button className={`${primaryButtonClass} justify-self-start`} type="submit">Start board</button>
    </form>
  )
}
