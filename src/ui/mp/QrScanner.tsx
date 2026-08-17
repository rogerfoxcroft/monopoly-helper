import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

interface QrScannerProps {
  onResult: (text: string) => void
}

/**
 * Camera QR scanner using getUserMedia + jsQR, with a manual paste fallback for
 * when the camera is unavailable or scanning is awkward.
 */
export function QrScanner({ onResult }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [manual, setManual] = useState('')
  const doneRef = useRef(false)

  useEffect(() => {
    let stream: MediaStream | null = null
    let raf = 0
    doneRef.current = false

    const tick = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!doneRef.current && video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const w = video.videoWidth
        const h = video.videoHeight
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h)
          const img = ctx.getImageData(0, 0, w, h)
          const code = jsQR(img.data, w, h)
          if (code?.data) {
            doneRef.current = true
            onResult(code.data.trim())
            return
          }
        }
      }
      raf = requestAnimationFrame(tick)
    }

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        stream = s
        const video = videoRef.current
        if (video) {
          video.srcObject = s
          void video.play()
          raf = requestAnimationFrame(tick)
        }
      })
      .catch(() => setError('Camera unavailable — paste the code below instead.'))

    return () => {
      doneRef.current = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [onResult])

  return (
    <div>
      {!error && (
        <div className="relative mx-auto aspect-square w-full max-w-[18rem] overflow-hidden rounded-2xl bg-black">
          <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-6 rounded-xl ring-2 ring-white/70" />
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
      {error && <p className="mb-2 text-sm text-warn">{error}</p>}

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted">Paste code manually</summary>
        <textarea
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="Paste the scanned code here"
          className="mt-2 h-24 w-full resize-none rounded-lg bg-surface2 p-2 font-mono text-[10px] text-ink"
        />
        <button
          onClick={() => manual.trim() && onResult(manual.trim())}
          disabled={!manual.trim()}
          className="mt-2 w-full rounded-lg bg-surface2 py-2 text-sm font-semibold text-ink active:bg-surface3 disabled:opacity-40"
        >
          Use pasted code
        </button>
      </details>
    </div>
  )
}
