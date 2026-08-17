import type { WorthBreakdown } from '../domain/networth'

/**
 * The over-the-wire protocol for a multiplayer game. These messages travel on
 * the WebRTC data channel AFTER a connection is established (signaling — the
 * offer/answer exchange — is handled separately in signaling.ts).
 *
 * Topology is a host-authoritative star: clients send to the host, the host
 * relays a merged roster back to everyone. Each client remains the source of
 * truth for its own balance sheet; only worth summaries are shared.
 */

export interface PlayerWorth extends WorthBreakdown {
  /** Whether the player owns at least one property (needed for the wealth-tax leader rule). */
  ownsProperty: boolean
}

export interface PlayerInfo {
  id: string
  name: string
  /** Hex avatar colour. */
  color: string
}

export interface RosterEntry extends PlayerInfo {
  worth: PlayerWorth
  connected: boolean
  isHost: boolean
}

/** Client → host. */
export type ClientMessage =
  | { t: 'hello'; player: PlayerInfo; worth: PlayerWorth }
  | { t: 'worth'; worth: PlayerWorth }
  | { t: 'bye' }

/** Host → client. */
export type HostMessage =
  | { t: 'welcome'; youId: string; boardId: string; variantId: string }
  | { t: 'roster'; players: RosterEntry[] }
  | { t: 'tax'; delta: number; label: string }
  | { t: 'kick'; reason?: string }

export type NetMessage = ClientMessage | HostMessage

export function encodeMessage(m: NetMessage): string {
  return JSON.stringify(m)
}

export function decodeMessage(raw: string): NetMessage {
  const m = JSON.parse(raw) as { t?: unknown }
  if (!m || typeof m.t !== 'string') throw new Error('Malformed message')
  return m as NetMessage
}
