import { useState } from 'react'
import type { Board, Variant } from './domain/types'
import { useGame } from './state/useGame'
import { ComingSoon } from './ui/ComingSoon'
import { GameScreen } from './ui/GameScreen'
import { HomeScreen, type HomeMode } from './ui/HomeScreen'
import { StartScreen } from './ui/StartScreen'

export default function App() {
  const game = useGame()
  const [screen, setScreen] = useState<'home' | HomeMode>('home')

  // A game in progress always takes over (single-player resume).
  if (game.session && game.board) {
    return <GameScreen game={game} />
  }

  const start = (board: Board, variant: Variant) => {
    setScreen('home') // so leaving the game returns here
    game.start(board, variant)
  }

  switch (screen) {
    case 'single':
      return <StartScreen onStart={start} onBack={() => setScreen('home')} />
    case 'host':
      return (
        <ComingSoon
          title="Host a game"
          blurb="Multiplayer is on the way. You'll host a game and other players scan a code to join — over your Wi-Fi or personal hotspot, no internet needed."
          onBack={() => setScreen('home')}
        />
      )
    case 'join':
      return (
        <ComingSoon
          title="Join a game"
          blurb="Multiplayer is on the way. You'll scan the host's code to join their game and see everyone's net worth live."
          onBack={() => setScreen('home')}
        />
      )
    default:
      return <HomeScreen onSelect={setScreen} />
  }
}
