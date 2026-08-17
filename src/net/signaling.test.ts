import { describe, expect, it } from 'vitest'
import { packSignal, unpackSignal, type Signal } from './signaling'

// A representative data-channel-only SDP (trimmed but realistic in shape).
const SAMPLE_SDP = `v=0
o=- 4611731400430051336 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0
m=application 9 UDP/DTLS/SCTP webrtc-datachannel
c=IN IP4 0.0.0.0
a=candidate:1 1 udp 2113937151 abcd1234-5678.local 54321 typ host
a=ice-ufrag:aaaa
a=ice-pwd:bbbbbbbbbbbbbbbbbbbbbbbb
a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF
a=setup:actpass
a=mid:0
a=sctp-port:5000
`

describe('signaling pack/unpack', () => {
  it('round-trips an offer', () => {
    const sig: Signal = { kind: 'offer', room: 'WXYZ', sdp: SAMPLE_SDP }
    expect(unpackSignal(packSignal(sig))).toEqual(sig)
  })

  it('round-trips an answer', () => {
    const sig: Signal = { kind: 'answer', room: 'WXYZ', sdp: SAMPLE_SDP }
    expect(unpackSignal(packSignal(sig))).toEqual(sig)
  })

  it('produces a URL-safe code (no +, /, or =)', () => {
    const code = packSignal({ kind: 'offer', room: 'WXYZ', sdp: SAMPLE_SDP })
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('compresses a realistic multi-candidate SDP below its raw length', () => {
    // Real offers carry many repetitive candidate lines — highly compressible.
    const candidates = Array.from(
      { length: 12 },
      (_, i) => `a=candidate:${i} 1 udp 2113937151 abcd1234-5678-90ab-cdef.local ${50000 + i} typ host`,
    ).join('\n')
    const big = SAMPLE_SDP + candidates + '\n'
    const code = packSignal({ kind: 'offer', room: 'WXYZ', sdp: big })
    expect(code.length).toBeLessThan(big.length)
    expect(unpackSignal(code).sdp).toBe(big)
  })
})
