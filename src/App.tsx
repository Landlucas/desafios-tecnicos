import { useState } from 'react'
import { BoardScreen } from './components/BoardScreen'
import { SetupForm } from './components/SetupForm'

export function App() {
  const [limit, setLimit] = useState<number | null>(null)

  return (
    <main className="workspace">
      <header className="page-heading">
        <h1>Work Board</h1>
        <p>Tasks reset when you refresh the page.</p>
      </header>
      {limit === null ? <SetupForm onStart={setLimit} /> : <BoardScreen limit={limit} />}
    </main>
  )
}
