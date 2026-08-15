import { useEffect, useState } from 'react'

export type ThemePref = 'system' | 'light' | 'dark'

const KEY = 'monopoly-helper:theme'

export function getStoredTheme(): ThemePref {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    // ignore
  }
  return 'system'
}

/** Apply a preference by toggling the `data-theme` attribute on <html>. */
export function applyTheme(pref: ThemePref): void {
  const root = document.documentElement
  if (pref === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', pref)
}

function store(pref: ThemePref): void {
  try {
    localStorage.setItem(KEY, pref)
  } catch {
    // ignore
  }
}

/** React state for the theme preference, persisted and applied to <html>. */
export function useTheme(): [ThemePref, (pref: ThemePref) => void] {
  const [pref, setPref] = useState<ThemePref>(() => getStoredTheme())
  useEffect(() => {
    applyTheme(pref)
  }, [pref])
  const set = (p: ThemePref) => {
    store(p)
    setPref(p)
  }
  return [pref, set]
}
