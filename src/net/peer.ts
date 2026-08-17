/**
 * A thin wrapper around a single WebRTC peer connection with one data channel,
 * using non-trickle ICE so the full offer/answer (candidates included) can be
 * exchanged out-of-band via a QR code.
 *
 * No ICE servers are configured — on the same LAN/hotspot, host candidates
 * (and mDNS resolution) are enough, and it keeps everything offline.
 */

export interface PeerCallbacks {
  onOpen?: () => void
  onMessage?: (data: string) => void
  onClose?: () => void
  onStateChange?: (state: RTCPeerConnectionState) => void
}

const RTC_CONFIG: RTCConfiguration = { iceServers: [] }
const ICE_TIMEOUT_MS = 3000

/** Resolve once ICE gathering completes (or a timeout elapses). */
function waitForIceComplete(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => {
      pc.removeEventListener('icegatheringstatechange', check)
      resolve()
    }
    const check = () => {
      if (pc.iceGatheringState === 'complete') done()
    }
    pc.addEventListener('icegatheringstatechange', check)
    setTimeout(done, ICE_TIMEOUT_MS)
  })
}

export class Peer {
  readonly pc: RTCPeerConnection
  private channel?: RTCDataChannel

  constructor(private cb: PeerCallbacks = {}) {
    this.pc = new RTCPeerConnection(RTC_CONFIG)
    this.pc.addEventListener('connectionstatechange', () =>
      this.cb.onStateChange?.(this.pc.connectionState),
    )
    // The answerer receives its channel via this event.
    this.pc.addEventListener('datachannel', (e) => this.bind(e.channel))
  }

  private bind(ch: RTCDataChannel) {
    this.channel = ch
    ch.onopen = () => this.cb.onOpen?.()
    ch.onclose = () => this.cb.onClose?.()
    ch.onmessage = (e) => {
      if (typeof e.data === 'string') this.cb.onMessage?.(e.data)
    }
  }

  /** Offerer: create the channel and return the local offer SDP. */
  async createOffer(): Promise<string> {
    this.bind(this.pc.createDataChannel('game'))
    await this.pc.setLocalDescription(await this.pc.createOffer())
    await waitForIceComplete(this.pc)
    return this.pc.localDescription!.sdp
  }

  /** Answerer: consume a remote offer, return the local answer SDP. */
  async acceptOffer(offerSdp: string): Promise<string> {
    await this.pc.setRemoteDescription({ type: 'offer', sdp: offerSdp })
    await this.pc.setLocalDescription(await this.pc.createAnswer())
    await waitForIceComplete(this.pc)
    return this.pc.localDescription!.sdp
  }

  /** Offerer: finish the handshake with the remote answer SDP. */
  async acceptAnswer(answerSdp: string): Promise<void> {
    await this.pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
  }

  send(data: string): boolean {
    if (this.channel?.readyState === 'open') {
      this.channel.send(data)
      return true
    }
    return false
  }

  get connectionState(): RTCPeerConnectionState {
    return this.pc.connectionState
  }

  close(): void {
    this.channel?.close()
    this.pc.close()
  }
}
