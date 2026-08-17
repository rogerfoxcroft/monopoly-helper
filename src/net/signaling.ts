import { deflate, inflate } from 'pako'

/**
 * Serverless signaling: pack a WebRTC offer/answer into a compact,
 * URL-safe string small enough for a QR code, and back again.
 *
 * The SDP is JSON-wrapped, deflate-compressed, then base64url-encoded. SDP is
 * highly compressible, so a data-channel-only description comfortably fits a QR.
 */

export type SignalKind = 'offer' | 'answer'

export interface Signal {
  kind: SignalKind
  /** Short room code, so a scanned answer can be sanity-checked against its offer. */
  room: string
  sdp: string
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(code: string): Uint8Array {
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((code.length + 3) % 4)
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export function packSignal(sig: Signal): string {
  // Compact tuple form to shave bytes before compression.
  const json = JSON.stringify([sig.kind === 'offer' ? 'o' : 'a', sig.room, sig.sdp])
  return bytesToBase64Url(deflate(new TextEncoder().encode(json)))
}

export function unpackSignal(code: string): Signal {
  const json = new TextDecoder().decode(inflate(base64UrlToBytes(code)))
  const [k, room, sdp] = JSON.parse(json) as [string, string, string]
  return { kind: k === 'o' ? 'offer' : 'answer', room, sdp }
}
