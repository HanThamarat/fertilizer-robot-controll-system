import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = new URL(
    env.VITE_API_URL || '/api',
    'http://localhost:3000',
  ).origin

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': backendTarget,
        '/socket.io': { target: backendTarget, ws: true },
      },
    },
  }
})
