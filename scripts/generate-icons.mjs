// Renders the app icon SVG to the PNG sizes the PWA manifest needs.
// Run with: node scripts/generate-icons.mjs
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const publicDir = fileURLToPath(new URL('../public/', import.meta.url))
mkdirSync(publicDir, { recursive: true })

// Emerald rounded tile with a white Monopoly house, kept within the maskable
// safe zone (centre 80%) so it survives platform masking.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#059669"/>
  <polygon points="256,150 372,258 372,382 140,382 140,258" fill="#ffffff"/>
  <rect x="228" y="312" width="56" height="70" rx="6" fill="#059669"/>
  <rect x="176" y="284" width="44" height="40" rx="5" fill="#059669"/>
  <rect x="292" y="284" width="44" height="40" rx="5" fill="#059669"/>
</svg>`

const targets = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32.png' },
]

for (const { size, name } of targets) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(publicDir + name)
  console.log('wrote', name)
}
