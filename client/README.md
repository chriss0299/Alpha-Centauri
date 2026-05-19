# RugbyTracker Community — Client

Frontend PWA del progetto RugbyTracker Community. Costruito con Nuxt 4 + TypeScript strict + @vite-pwa/nuxt.

## Stack

- **Nuxt 4** (Vue 3) — framework frontend con SSR
- **TypeScript** — strict mode abilitato
- **@vite-pwa/nuxt** — manifest PWA + Service Worker via Workbox
- **Pinia** — state management globale
- **Socket.io client** — aggiornamenti live del feed partita

## Avvio

```bash
npm install
npm run dev       # http://localhost:3000
```

## Comandi

```bash
npm run dev       # server di sviluppo
npm run build     # build produzione
npm run preview   # anteprima build produzione
```

## Variabili d'ambiente

Crea `client/.env` (non committare):

```env
NUXT_PUBLIC_API_BASE=http://localhost:4000/api/v1
NUXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

## Struttura

```
client/
├── pages/           # Route automatiche (Nuxt file-based routing)
├── components/      # Componenti Vue (PascalCase)
├── composables/     # Logica riutilizzabile (prefisso use*)
├── stores/          # Pinia store (stato globale)
├── public/
│   └── icons/       # Icone PWA — 192×192 e 512×512 PNG obbligatori
└── nuxt.config.ts   # Config Nuxt + PWA + Workbox
```

## Strategia cache offline (Workbox)

| Pattern URL | Strategia | Motivo |
|---|---|---|
| `/api/v1/*` | NetworkFirst | Live feed deve essere sempre fresco |
| `/api/v1/(teams\|users\|championships)/*` | StaleWhileRevalidate | Profili semi-statici, leggera staleness accettabile |
| Asset statici (JS, CSS, font) | CacheFirst (precache) | Cambiano solo a deploy, caricamento istantaneo |

## Icone PWA

Prima del primo deploy aggiungere in `public/icons/`:
- `icon-192x192.png`
- `icon-512x512.png` (usata anche come maskable)

Generazione: [maskable.app](https://maskable.app) per maskable, [squoosh.app](https://squoosh.app) per ridimensionamento.

## Convenzioni

- Componenti: `PascalCase` (`MatchFeedCard.vue`)
- Composables: `camelCase` con prefisso `use` (`useMatchFeed.ts`)
- Stato globale: Pinia store, non `provide/inject`
- Live feed: Socket.io, non polling
- Room naming Socket: `match:<match_id>`
