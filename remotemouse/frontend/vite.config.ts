import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const allowedHost = env.VITE_ALLOWED_HOST || env.ALLOWED_HOST;
  return {
    plugins: [react()],
    server: {
      allowedHosts: allowedHost ? [allowedHost, 'localhost'] : ['localhost', '0.0.0.0'],
      host: '0.0.0.0'
    }
  }
})
