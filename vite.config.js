import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { anthropicProxyPlugin } from './vite-plugin-anthropic-proxy.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.ANTHROPIC_API_KEY

  if (!apiKey && env.VITE_DEMO_MODE !== 'true') {
    console.warn(
      '\n⚠️  ANTHROPIC_API_KEY is not set.\n' +
        '   Create .env in this folder with either:\n' +
        '   ANTHROPIC_API_KEY=sk-ant-...\n' +
        '   or VITE_DEMO_MODE=true for offline demo responses.\n' +
        '   Then restart: npm run dev\n',
    )
  }

  return {
    plugins: [react(), tailwindcss(), anthropicProxyPlugin(apiKey)],
  }
})
