import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.message.includes('Module level directives cause errors when bundled, "use client"')) {
          return;
        }
        warn(warning);
      }
    }
  }
})
