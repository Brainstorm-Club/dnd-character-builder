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
        // WSG 3.3: il precache si scarica tutto al primo avvio, anche cio' che
        // nessuno chiedera' mai. Qui restano fuori i file che il browser non
        // richiede in nessun percorso dell'app:
        // - le due facce corsive (Atkinson e Courier Prime): style.css le
        //   dichiara, ma nessun componente usa italic/<em>, quindi il browser
        //   non le scarica mai da solo (~24 KB risparmiati);
        // - vite.svg: residuo dello scaffold, non referenziato da nulla;
        // - og-image.svg: serve solo ai crawler social, che leggono l'URL
        //   assoluto e non passano mai dal service worker;
        // - assets/favicon-*.svg: il marchio del design system, emesso solo
        //   perche' tokens.css dichiara --bsc-favicon-svg, variabile che
        //   nessuna regola CSS consuma (~6 KB).
        // Non e' una rimozione: se un giorno servissero, la rete li serve
        // comunque; qui evitiamo solo di pagarli in anticipo a ogni visitatore.
        // - i due chunk del testo italiano degli incantesimi: 625 KB non
        //   compressi che servono solo a chi gioca in italiano e solo nel
        //   passo incantesimi. Nel precache li avrebbe pagati ogni visitatore,
        //   inglese compreso, al primo avvio — l'esatto contrario del motivo
        //   per cui il testo e' stato messo in un chunk a parte. Qui sotto
        //   entrano in runtimeCaching: chi li apre li scarica una volta e poi
        //   ce li ha anche offline.
        globIgnores: [
          '**/node_modules/**/*',
          '**/*-italic-*.woff2',
          'vite.svg',
          'og-image.svg',
          'assets/favicon-*.svg',
          'assets/game-dnd5e-spells-it-*.js',
          'assets/game-dnd24-spells-it-*.js',
        ],
        runtimeCaching: [
          {
            urlPattern: /\.(?:pdf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pdf-templates',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // Il nome del file porta l'hash del build: una voce per edizione
            // per build, e maxEntries tiene solo le ultime quattro invece di
            // accumulare una copia per ogni versione mai visitata.
            urlPattern: /\/assets\/game-dnd(?:5e|24)-spells-it-[^/]+\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'spell-text-it',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 30 },
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
          // Il testo italiano integrale sta in un chunk suo, uno per edizione:
          // sono ~300 KB di prosa ciascuno e li scarica solo chi gioca in
          // italiano, solo nel passo incantesimi, solo per la sua variante.
          'game-dnd5e-spells-it': ['./src/data/dnd5e/spells-it.ts'],
          'game-dnd24-spells-it': ['./src/data/dnd2024/spells-it.ts'],
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
