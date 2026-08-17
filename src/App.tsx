import { lazy, Suspense, useState } from 'react'
import type { Board, Variant } from './domain/types'
import { useGame } from './state/useGame'
import { GameScreen } from './ui/GameScreen'
import { HomeScreen, type HomeMode } from './ui/HomeScreen'
import { StartScreen } from './ui/StartScreen'

const Multiplayer = lazy(() =>
  import('./ui/mp/Multiplayer').then((m) => ({ default: m.Multiplayer })),
)

function Loading() {
  return (
    <div className="flex min-h-full items-center justify-center text-sm text-muted">Loading…</div>
  )
}

export default function App() {
  const game = useGame()
  const [screen, setScreen] = useState<'home' | HomeMode>('home')

  // A single-player game in progress always takes over.
  if (game.session && game.board) {
    return <GameScreen game={game} />
  }

  const start = (board: Board, variant: Variant) => {
    setScreen('home')
    game.start(board, variant)
  }

  const goHome = () => setScreen('home')

  switch (screen) {
    case 'single':
      return <StartScreen onStart={start} onBack={goHome} />
    case 'host':
      return (
        <Suspense fallback={<Loading />}>
          <Multiplayer mode="host" onExit={goHome} />
        </Suspense>
      )
    case 'join':
      return (
        <Suspense fallback={<Loading />}>
          <Multiplayer mode="join" onExit={goHome} />
        </Suspense>
      )
    default:
      return <HomeScreen onSelect={setScreen} />
  }
}
