import { useState } from 'react'
import { BoardScreen } from './components/BoardScreen'
import { SetupForm } from './components/SetupForm'

export function App() {
  const [limit, setLimit] = useState<number | null>(null)

  return (
    <main className="mx-auto my-[clamp(2rem,6vw,5rem)] w-[min(76rem,calc(100%_-_3rem))] [@media(max-width:38rem)]:w-[calc(100%_-_2rem)]">
      <header className="mb-7 border-t-[.3rem] border-brand pt-[1.1rem]">
        <h1 className="text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.05] font-bold tracking-[-.06em]">Work Board</h1>
        <p className="mt-[.6rem] text-muted">Tasks reset when you refresh the page.</p>
      </header>
      {limit === null ? <SetupForm onStart={setLimit} /> : <BoardScreen limit={limit} />}
    </main>
  )
}
