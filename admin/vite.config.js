import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.jpeg'],
      manifest: {
        name: 'ITF Admin Portal',
        short_name: 'ITF Admin',
        description: 'Administrative Portal for ITF OF INDIA',
        theme_color: '#0a1128',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'logo.jpeg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: 'logo.jpeg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg,jpg,webp}']
      }
    })
  ],
})
