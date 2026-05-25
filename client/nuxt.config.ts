// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/global.css'],
  devtools: { enabled: true },

  devServer: {
    port: 3001,
  },

  vite: {
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
    },
  },

  routeRules: {
    '/**': {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
    },
  },

  typescript: {
    strict: true,
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:3000/api/v1',
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
    },
  },

  modules: ['@pinia/nuxt', '@vite-pwa/nuxt', '@nuxt/icon'],

  pwa: {
    registerType: 'autoUpdate',

    manifest: {
      name: 'RugbyTracker Community',
      short_name: 'RugbyTracker',
      description: 'Live rugby feed per categorie B e settori giovanili',
      theme_color: '#1a1a2e',
      background_color: '#ffffff',
      lang: 'it',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },

    workbox: {
      navigateFallback: '/',
      // CacheFirst implicito per tutti gli asset statici precachati
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
      runtimeCaching: [
        {
          // NetworkFirst: API live — dati sempre freschi, fallback cache se offline
          urlPattern: /\/api\/v1\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-v1-cache',
            networkTimeoutSeconds: 5,
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60, // 1 ora
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          // StaleWhileRevalidate: profili squadre/utenti — leggera staleness accettabile
          urlPattern: /\/api\/v1\/(teams|users|championships)\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'profiles-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 5 * 60, // 5 minuti
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },

    client: {
      installPrompt: true,
    },

    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
})
