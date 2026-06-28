import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1100,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})
