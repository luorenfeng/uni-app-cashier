import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    uni(),
    basicSsl()
  ],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
