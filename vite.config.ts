import { defineConfig } from 'vite'
import { execSync } from 'node:child_process'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// Git hash for cache invalidation of localStorage game data
const buildHash = execSync('git rev-parse --short HEAD').toString().trim()

export default defineConfig({
  base: '/dnd-character-builder/',
  define: {
    __BUILD_HASH__: JSON.stringify(buildHash),
  },
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'pwa-192x192.svg', 'pwa-512x512.svg'],
      manifest: {
        name: 'D&D Character Builder',
        short_name: 'DnD Builder',
        description: 'Create and manage your D&D 5e, Brancalonia, and Apocalisse characters',
        theme_color: '#292524',
        background_color: '#1c1917',
        display: 'standalone',
        scope: '/dnd-character-builder/',
        start_url: '/dnd-character-builder/',
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\.(?:pdf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pdf-templates',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-lib': ['pdf-lib'],
          // WSG 3.3 + 3.8: Game data split per module — loaded on demand per wizard step
          'game-dnd5e-races': ['./src/data/dnd5e/races.ts'],
          'game-dnd5e-classes': ['./src/data/dnd5e/classes.ts'],
          'game-dnd5e-backgrounds': ['./src/data/dnd5e/backgrounds.ts'],
          'game-dnd5e-spells': ['./src/data/dnd5e/spells.ts', './src/data/dnd5e/spells-4-9.ts'],
          'game-dnd5e-equipment': ['./src/data/dnd5e/equipment.ts'],
          'game-dnd5e-rules': ['./src/data/dnd5e/rules.ts'],
          'game-branca-races': ['./src/data/brancalonia/races.ts'],
          'game-branca-classes': ['./src/data/brancalonia/classes.ts', './src/data/brancalonia/burattinaio.ts'],
          'game-branca-backgrounds': ['./src/data/brancalonia/backgrounds.ts'],
          'game-branca-rules': ['./src/data/brancalonia/rules.ts'],
          'game-apo-races': ['./src/data/apocalisse/races.ts'],
          'game-apo-classes': ['./src/data/apocalisse/classes.ts'],
          'game-apo-backgrounds': ['./src/data/apocalisse/backgrounds.ts'],
          'game-apo-rules': ['./src/data/apocalisse/rules.ts'],
        },
      },
    },
  },
})
