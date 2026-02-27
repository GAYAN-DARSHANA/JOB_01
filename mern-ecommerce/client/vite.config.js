import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
*/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Change from 5173 to 3000
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})