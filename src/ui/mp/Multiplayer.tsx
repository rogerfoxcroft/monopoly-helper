import { useEffect } from 'react'
import { getBoard } from '../../boards'
import { getVariant } from '../../variants'
import { computeWorth } from '../../domain/networth'
import { useGame } from '../../state/useGame'
import { useMultiplayer } from '../../state/useMultiplayer'
import { GameScreen } from '../GameScreen'
import { HostFlow } from './HostFlow'
import { JoinFlow } from './JoinFlow'

interface MultiplayerProps {
  mode: 'host' | 'join'
  onExit: () => void
}

/**
 * Owns the multiplayer session: a room connection plus a local (non-persisted)
 * game. Runs the lobby/join wizard until a game starts, then renders the shared
 * game screen with a live leaderboard and broadcasts this player's worth.
 */
export function Multiplayer({ mode, onExit }: MultiplayerProps) {
  const mp = useMultiplayer()
  const game = useGame({ persist: false })
  const { sendWorth } = mp

  // Joiner: start the local game once the host welcomes us with the rules.
  useEffect(() => {
    if (mode === 'join' && mp.welcome && !game.session) {
      const board = getBoard(mp.welcome.boardId)
      if (board) game.start(board, getVariant(mp.welcome.variantId))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mp.welcome])

  // Broadcast our worth whenever the local game changes.
  useEffect(() => {
    if (!game.session || !game.board) return
    const w = computeWorth(game.board, game.session.present)
    sendWorth({ ...w, ownsProperty: game.session.present.holdings.length > 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.session, sendWorth])

  const exit = () => {
    mp.leave()
    onExit()
  }

  if (game.session && game.board) {
    const gameWithLeave = { ...game, quit: exit }
    return (
      <GameScreen game={gameWithLeave} multiplayer={{ roster: mp.roster, meId: mp.me?.id ?? '' }} />
    )
  }

  if (mode === 'host') {
    return (
      <HostFlow
        mp={mp}
        onExit={exit}
        onStart={(boardId, variantId) => {
          const board = getBoard(boardId)
          if (board) game.start(board, getVariant(variantId))
        }}
      />
    )
  }
  return <JoinFlow mp={mp} onExit={exit} />
}
