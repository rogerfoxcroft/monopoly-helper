import { useEffect, useState } from 'react'
import { getBoard } from '../../boards'
import { getVariant } from '../../variants'
import { computeWorth } from '../../domain/networth'
import { computeRoundTax } from '../../domain/wealthtax'
import { useGame } from '../../state/useGame'
import { useMultiplayer } from '../../state/useMultiplayer'
import { useWakeLock } from '../../state/useWakeLock'
import { GameScreen, type HostTaxView } from '../GameScreen'
import { AddPlayerSheet } from './AddPlayerSheet'
import { HostFlow } from './HostFlow'
import { JoinFlow } from './JoinFlow'
import { ReconnectFlow } from './ReconnectFlow'

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
  const { sendState } = mp
  const [addingPlayer, setAddingPlayer] = useState(false)

  // Keep the screen awake during a multiplayer game so it doesn't sleep and
  // drop the WebRTC connection.
  useWakeLock(mp.role !== null)

  // Joiner: start the local game once the host welcomes us with the rules.
  useEffect(() => {
    if (mode === 'join' && mp.welcome && !game.session) {
      const board = getBoard(mp.welcome.boardId)
      if (board) game.start(board, getVariant(mp.welcome.variantId))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mp.welcome])

  // Broadcast our worth and holdings whenever the local game changes, and again
  // whenever we (re)connect so a rejoining player resyncs immediately.
  const connected = mp.connected
  useEffect(() => {
    if (!game.session || !game.board || !connected) return
    const holdings = game.session.present.holdings
    const w = computeWorth(game.board, game.session.present)
    sendState({ ...w, ownsProperty: holdings.length > 0 }, holdings)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.session, sendState, connected])

  // Client: apply a wealth-tax delta pushed by the host (undoable adjustCash).
  const taxSeq = mp.pendingTax?.seq
  useEffect(() => {
    const tax = mp.pendingTax
    if (!tax || !game.session || tax.delta === 0) return
    game.dispatch({ type: 'adjustCash', amount: tax.delta, note: tax.label })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxSeq])

  const exit = () => {
    mp.leave()
    onExit()
  }

  if (game.session && game.board) {
    // A client whose connection to the host dropped: offer to rescan and rejoin
    // (their local game is untouched).
    if (mode === 'join' && !connected) {
      return <ReconnectFlow mp={mp} onExit={exit} />
    }

    const gameWithLeave = { ...game, quit: exit }

    // Host-only wealth-tax control, computed live from the roster.
    let hostTax: HostTaxView | undefined
    if (mp.role === 'host' && game.variant?.wealthTax) {
      const rule = game.variant.wealthTax
      const preview = computeRoundTax(rule, mp.roster)
      hostTax = {
        preview,
        apply: () => {
          const t = computeRoundTax(rule, mp.roster)
          if (!t) return
          const deltas = new Map(t.deltas.map((d) => [d.id, d.delta]))
          const hostDelta = mp.applyHostTax(deltas, 'Wealth tax')
          if (hostDelta !== 0) {
            game.dispatch({ type: 'adjustCash', amount: hostDelta, note: 'Wealth tax' })
          }
        },
      }
    }

    return (
      <>
        <GameScreen
          game={gameWithLeave}
          multiplayer={{ roster: mp.roster, meId: mp.me?.id ?? '' }}
          hostTax={hostTax}
          onAddPlayer={mp.role === 'host' ? () => setAddingPlayer(true) : undefined}
        />
        {mp.role === 'host' && (
          <AddPlayerSheet open={addingPlayer} mp={mp} onClose={() => setAddingPlayer(false)} />
        )}
      </>
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
