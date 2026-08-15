import { useGame } from './state/useGame'
import { GameScreen } from './ui/GameScreen'
import { StartScreen } from './ui/StartScreen'

export default function App() {
  const game = useGame()

  if (!game.session || !game.board) {
    return <StartScreen onStart={game.start} />
  }

  return <GameScreen game={game} />
}
