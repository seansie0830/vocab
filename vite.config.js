import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // 將 cssMinify 設定為 'lightningcss'
    cssMinify: 'lightningcss',
  }
})
