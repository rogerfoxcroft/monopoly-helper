import { Peer } from './peer'
import { shortCode } from './identity'
import { packSignal, unpackSignal } from './signaling'
import {
  decodeMessage,
  encodeMessage,
  type ClientMessage,
  type HostMessage,
  type PlayerInfo,
  type PlayerWorth,
  type RosterEntry,
} from './protocol'

/**
 * Host side of a multiplayer game. Maintains one WebRTC peer per joiner,
 * merges everyone's worth into a roster, and broadcasts it back (star relay).
 * The host is itself a player.
 */
export class HostRoom {
  readonly room = shortCode()
  private peers = new Map<string, { peer: Peer; info: PlayerInfo; worth: PlayerWorth }>()
  private pending?: Peer

  constructor(
    private host: PlayerInfo,
    private hostWorth: PlayerWorth,
    private boardId: string,
    private variantId: string,
    private onRoster: (roster: RosterEntry[]) => void,
  ) {}

  /** Begin adding a player: returns the offer code to show as a QR. */
  async createInvite(): Promise<string> {
    this.pending?.close()
    const peer = new Peer({
      onMessage: (d) => this.onPeerMessage(peer, d),
      onClose: () => this.removePeer(peer),
    })
    this.pending = peer
    const offer = await peer.createOffer()
    return packSignal({ kind: 'offer', room: this.room, sdp: offer })
  }

  /** Finish adding the player using the answer code scanned back from them. */
  async completeInvite(answerCode: string): Promise<void> {
    if (!this.pending) throw new Error('No invite in progress')
    const sig = unpackSignal(answerCode)
    if (sig.kind !== 'answer') throw new Error('That code is not a join response')
    const peer = this.pending
    this.pending = undefined
    await peer.acceptAnswer(sig.sdp)
  }

  /** Update the host's own worth and rebroadcast. */
  setHostWorth(worth: PlayerWorth): void {
    this.hostWorth = worth
    this.broadcast()
  }

  /** Send each player their wealth-tax delta; returns the host's own delta. */
  sendTax(deltas: Map<string, number>, label: string): number {
    for (const [id, entry] of this.peers) {
      const delta = deltas.get(id)
      if (delta != null) entry.peer.send(encodeMessage({ t: 'tax', delta, label }))
    }
    return deltas.get(this.host.id) ?? 0
  }

  roster(): RosterEntry[] {
    const list: RosterEntry[] = [
      { ...this.host, worth: this.hostWorth, connected: true, isHost: true },
    ]
    for (const e of this.peers.values()) {
      list.push({
        ...e.info,
        worth: e.worth,
        connected: e.peer.connectionState === 'connected',
        isHost: false,
      })
    }
    return list
  }

  close(): void {
    this.pending?.close()
    for (const e of this.peers.values()) e.peer.close()
    this.peers.clear()
  }

  private onPeerMessage(peer: Peer, data: string) {
    let msg: ClientMessage
    try {
      msg = decodeMessage(data) as ClientMessage
    } catch {
      return
    }
    if (msg.t === 'hello') {
      this.peers.set(msg.player.id, { peer, info: msg.player, worth: msg.worth })
      peer.send(
        encodeMessage({
          t: 'welcome',
          youId: msg.player.id,
          boardId: this.boardId,
          variantId: this.variantId,
        }),
      )
      this.broadcast()
    } else if (msg.t === 'worth') {
      for (const e of this.peers.values()) {
        if (e.peer === peer) e.worth = msg.worth
      }
      this.broadcast()
    } else if (msg.t === 'bye') {
      this.removePeer(peer)
    }
  }

  private removePeer(peer: Peer) {
    for (const [id, e] of this.peers) {
      if (e.peer === peer) this.peers.delete(id)
    }
    this.broadcast()
  }

  private broadcast() {
    const roster = this.roster()
    const msg = encodeMessage({ t: 'roster', players: roster })
    for (const e of this.peers.values()) e.peer.send(msg)
    this.onRoster(roster)
  }
}

export interface JoinCallbacks {
  onWelcome: (boardId: string, variantId: string, youId: string) => void
  onRoster: (roster: RosterEntry[]) => void
  onTax: (delta: number, label: string) => void
  onClose: () => void
}

/** Client side: a single connection to the host. */
export class JoinClient {
  private peer: Peer

  constructor(
    private me: PlayerInfo,
    private myWorth: PlayerWorth,
    private cb: JoinCallbacks,
  ) {
    this.peer = new Peer({
      onOpen: () =>
        this.peer.send(encodeMessage({ t: 'hello', player: this.me, worth: this.myWorth })),
      onMessage: (d) => this.onHostMessage(d),
      onClose: () => this.cb.onClose(),
    })
  }

  /** Consume the host's offer code, returning our answer code to show back. */
  async acceptInvite(offerCode: string): Promise<string> {
    const sig = unpackSignal(offerCode)
    if (sig.kind !== 'offer') throw new Error('That code is not a host invite')
    const answer = await this.peer.acceptOffer(sig.sdp)
    return packSignal({ kind: 'answer', room: sig.room, sdp: answer })
  }

  sendWorth(worth: PlayerWorth): void {
    this.myWorth = worth
    this.peer.send(encodeMessage({ t: 'worth', worth }))
  }

  close(): void {
    this.peer.send(encodeMessage({ t: 'bye' }))
    this.peer.close()
  }

  private onHostMessage(data: string) {
    let msg: HostMessage
    try {
      msg = decodeMessage(data) as HostMessage
    } catch {
      return
    }
    if (msg.t === 'welcome') this.cb.onWelcome(msg.boardId, msg.variantId, msg.youId)
    else if (msg.t === 'roster') this.cb.onRoster(msg.players)
    else if (msg.t === 'tax') this.cb.onTax(msg.delta, msg.label)
  }
}
