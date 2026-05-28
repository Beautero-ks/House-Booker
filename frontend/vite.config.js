import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { cwd } from 'node:process'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_DEV_SERVER_PORT || 3000),
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_GATEWAY_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
