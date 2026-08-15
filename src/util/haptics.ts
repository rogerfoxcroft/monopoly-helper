/**
 * Fire a short haptic tap where supported (progressive enhancement).
 *
 * Uses the Vibration API. Supported on Android/Chrome; iOS Safari does NOT
 * implement it, so on iPhone this is silently a no-op. Fails safe everywhere.
 */
export function haptic(pattern: number | number[] = 10): void {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // Some browsers throw if called outside a user gesture — ignore.
  }
}
