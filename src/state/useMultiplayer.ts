import { useCallback, useRef, useState } from 'react'
import { genId, playerColor, ZERO_WORTH } from '../net/identity'
import { HostRoom, JoinClient } from '../net/room'
import type { PlayerInfo, PlayerWorth, RosterEntry } from '../net/protocol'
import type { Holding } from '../domain/types'

export type MpRole = 'host' | 'client'

export interface Welcome {
  boardId: string
  variantId: string
}

export interface PendingTax {
  seq: number
  delta: number
  label: string
}

export interface UseMultiplayer {
  role: MpRole | null
  me: PlayerInfo | null
  roster: RosterEntry[]
  welcome: Welcome | null
  connected: boolean
  // host
  startHost: (name: string, boardId: string, variantId: string) => void
  createInvite: () => Promise<string>
  completeInvite: (answerCode: string) => Promise<void>
  // client
  startJoin: (name: string) => void
  acceptInvite: (offerCode: string) => Promise<string>
  // both
  sendState: (worth: PlayerWorth, holdings: Holding[]) => void
  leave: () => void
  // host: send per-player tax deltas; returns the host's own delta
  applyHostTax: (deltas: Map<string, number>, label: string) => number
  // client: the most recent tax delta the host pushed, for the game to apply
  pendingTax: PendingTax | null
}

export function useMultiplayer(): UseMultiplayer {
  const [role, setRole] = useState<MpRole | null>(null)
  const [me, setMe] = useState<PlayerInfo | null>(null)
  const [roster, setRoster] = useState<RosterEntry[]>([])
  const [welcome, setWelcome] = useState<Welcome | null>(null)
  const [connected, setConnected] = useState(false)
  const [pendingTax, setPendingTax] = useState<PendingTax | null>(null)

  const hostRef = useRef<HostRoom | null>(null)
  const clientRef = useRef<JoinClient | null>(null)
  const taxSeq = useRef(0)

  const startHost = useCallback((name: string, boardId: string, variantId: string) => {
    const info: PlayerInfo = { id: genId(), name: name.trim() || 'Host', color: playerColor(0) }
    const room = new HostRoom(info, ZERO_WORTH, boardId, variantId, setRoster)
    hostRef.current = room
    setMe(info)
    setRole('host')
    setRoster(room.roster())
    setConnected(true)
  }, [])

  const createInvite = useCallback(() => {
    if (!hostRef.current) throw new Error('Not hosting')
    return hostRef.current.createInvite()
  }, [])

  const completeInvite = useCallback((answerCode: string) => {
    if (!hostRef.current) throw new Error('Not hosting')
    return hostRef.current.completeInvite(answerCode)
  }, [])

  const startJoin = useCallback((name: string) => {
    const info: PlayerInfo = {
      id: genId(),
      name: name.trim() || 'Player',
      color: playerColor(1 + Math.floor(Math.random() * 5)),
    }
    const client = new JoinClient(info, ZERO_WORTH, [], {
      onWelcome: (boardId, variantId) => {
        setWelcome({ boardId, variantId })
        setConnected(true)
      },
      onRoster: setRoster,
      onTax: (delta, label) => {
        taxSeq.current += 1
        setPendingTax({ seq: taxSeq.current, delta, label })
      },
      onClose: () => setConnected(false),
    })
    clientRef.current = client
    setMe(info)
    setRole('client')
  }, [])

  const acceptInvite = useCallback((offerCode: string) => {
    if (!clientRef.current) throw new Error('Not joining')
    return clientRef.current.acceptInvite(offerCode)
  }, [])

  const sendState = useCallback((worth: PlayerWorth, holdings: Holding[]) => {
    hostRef.current?.setHostState(worth, holdings)
    clientRef.current?.sendState(worth, holdings)
  }, [])

  const applyHostTax = useCallback((deltas: Map<string, number>, label: string) => {
    return hostRef.current?.sendTax(deltas, label) ?? 0
  }, [])

  const leave = useCallback(() => {
    hostRef.current?.close()
    clientRef.current?.close()
    hostRef.current = null
    clientRef.current = null
    setRole(null)
    setMe(null)
    setRoster([])
    setWelcome(null)
    setConnected(false)
  }, [])

  return {
    role,
    me,
    roster,
    welcome,
    connected,
    startHost,
    createInvite,
    completeInvite,
    startJoin,
    acceptInvite,
    sendState,
    leave,
    applyHostTax,
    pendingTax,
  }
}
