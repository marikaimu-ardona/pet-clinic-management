import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Served from a GitHub Pages project subpath in production; root in dev.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/pet-clinic-management/' : '/',
  plugins: [react()],
}))
