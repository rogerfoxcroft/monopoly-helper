import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Deployed to https://<user>.github.io/monopoly-helper/
export default defineConfig({
  base: '/monopoly-helper/',
  plugins: [react(), tailwindcss()],
})
