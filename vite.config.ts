import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Tell Vite not to touch the MediaPipe CDN import at all
  optimizeDeps: {
    exclude: ['@mediapipe/tasks-vision'],
  },

  build: {
    rollupOptions: {
      // Prevent Rollup from trying to bundle the CDN URL
      external: (id: string) => id.includes('cdn.jsdelivr.net'),
    },
  },
})
