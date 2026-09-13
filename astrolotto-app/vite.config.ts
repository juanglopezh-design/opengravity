import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true, // listen on 0.0.0.0
    port: 5173,
    allowedHosts: true, // allow public tunnels like trycloudflare.com
  },
})
