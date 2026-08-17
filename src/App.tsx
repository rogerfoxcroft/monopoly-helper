import { lazy, Suspense, useState } from 'react'
import type { Board, Variant } from './domain/types'
import { useGame } from './state/useGame'
import { GameScreen } from './ui/GameScreen'
import { HomeScreen, type HomeMode } from './ui/HomeScreen'
import { StartScreen } from './ui/StartScreen'

const HostFlow = lazy(() => import('./ui/mp/HostFlow').then((m) => ({ default: m.HostFlow })))
const JoinFlow = lazy(() => import('./ui/mp/JoinFlow').then((m) => ({ default: m.JoinFlow })))

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
          <HostFlow onExit={goHome} />
        </Suspense>
      )
    case 'join':
      return (
        <Suspense fallback={<Loading />}>
          <JoinFlow onExit={goHome} />
        </Suspense>
      )
    default:
      return <HomeScreen onSelect={setScreen} />
  }
}
