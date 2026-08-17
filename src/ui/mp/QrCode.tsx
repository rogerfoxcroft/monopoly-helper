import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/**
 * Renders `value` as a QR code (dark-on-white for reliable scanning in either
 * theme). If the payload is too large for a QR, falls back to showing the raw
 * code for manual copy.
 */
export function QrCode({ value }: { value: string }) {
  const [svg, setSvg] = useState('')
  const [tooBig, setTooBig] = useState(false)

  useEffect(() => {
    let cancelled = false
    QRCode.toString(value, { type: 'svg', errorCorrectionLevel: 'L', margin: 1 })
      .then((s) => {
        if (!cancelled) {
          setSvg(s)
          setTooBig(false)
        }
      })
      .catch(() => {
        if (!cancelled) setTooBig(true)
      })
    return () => {
      cancelled = true
    }
  }, [value])

  if (tooBig) {
    return (
      <div className="rounded-xl bg-surface2 p-3">
        <p className="mb-2 text-xs text-muted">Code too large to scan — copy it across manually:</p>
        <textarea
          readOnly
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          className="h-28 w-full resize-none rounded-lg bg-page p-2 font-mono text-[10px] text-ink"
        />
      </div>
    )
  }

  return (
    <div
      className="mx-auto aspect-square w-full max-w-[16rem] rounded-2xl bg-white p-3 [&_svg]:h-full [&_svg]:w-full"
      // qrcode returns a self-contained SVG string
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
