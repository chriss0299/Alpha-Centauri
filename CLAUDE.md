# CLAUDE.md — RugbyTracker Community

## Panoramica del progetto

**RugbyTracker Community** è una PWA (Progressive Web App) mobile-first per il rugby di categoria B e settori giovanili (Under 6–Under 18, Serie B, Serie C, tornei regionali). Funziona come un social network verticale: gli utenti inseriscono eventi di partita in tempo reale durante le gare, alimentando un live feed condiviso.

Il PRD completo è in `prd.md`.

## Stack tecnologico

| Layer           | Tecnologia                  |
| --------------- | --------------------------- |
| Frontend (PWA)  | Nuxt 3 (Vue.js) + PWA module / Workbox |
| Backend API     | Node.js + Express           |
| Database        | MySQL + phpMyAdmin          |
| Real-time       | Socket.io                   |
| Cache           | Redis                       |
| Auth            | JWT + OAuth (Google, Apple) |
| Storage media   | S3-compatible               |

## Struttura del repository

```
Alpha-Centauri/
├── client/          # Nuxt 3 PWA
│   ├── pages/
│   ├── components/
│   ├── composables/
│   ├── stores/      # Pinia
│   └── public/
├── server/          # Node.js + Express API
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── socket/      # Socket.io handlers
├── database/
│   ├── migrations/
│   └── seeds/
├── prd.md
├── CLAUDE.md
└── README.md
```

## Dominio — concetti chiave

### Tipi di utente
- **Utente normale** (livelli 0–4): Spettatore → Tifoso → Cronista → Redattore → Verificatore
- **Giocatore** (premium): entità dati separata dall'utente, collegabile tramite verifica
- **Squadra** (premium): gestisce la propria pagina e conferma risultati
- **Arbitro** (premium): può convalidare eventi di gara con peso ufficiale
- **Amministratore**: Super Admin / Moderatore / Editor (staff interno)

### Stati di una partita
`PROGRAMMATA` → `IN CORSO` → `TERMINATA` → `CERTIFICATA`

La regola del **minuto 1**: gli eventi di gioco sono inseribili solo dopo 60 secondi dall'inizio.

### Livelli di affidabilità dei dati
- 🟡 Community — non verificato
- 🔵 Confermato — consensus ≥ 3 utenti
- 🟣 Verificato — utente premium
- ✅ Certificato — fonte ufficiale / Admin Squadra di entrambe le squadre

### Punteggio Affidabilità (PA)
Metrica per utente che sale con contributi corretti e scende con inserimenti contestati. Controlla i privilegi anti-spam.

## Convenzioni di sviluppo

### API REST (Express)
- Prefisso: `/api/v1/`
- Autenticazione: header `Authorization: Bearer <jwt>`
- Rate limiting su tutti gli endpoint di scrittura
- Validazione server-side obbligatoria su ogni dato in ingresso dalla community

### Database (MySQL)
- Nomi tabelle in snake_case, plurali (`match_events`, `user_profiles`)
- Ogni modifica a eventi di partite `CERTIFICATA` deve produrre un record nell'audit log
- Non esporre dati personali di giocatori minorenni (< 18 anni) senza flag `parental_consent = true`

### Frontend (Nuxt)
- Componenti in PascalCase (`MatchFeedCard.vue`)
- Composables in camelCase con prefisso `use` (`useMatchFeed.ts`)
- Lo stato globale va in Pinia store, non in `provide/inject`
- Il live feed va aggiornato via Socket.io, non polling

### Real-time (Socket.io)
- Room naming: `match:<match_id>`
- Gli eventi emessi dal server hanno prefisso `match:` (es. `match:event_added`, `match:status_changed`)

## Sicurezza — attenzioni

- Mai esporre password o token nei log
- Tutti gli input della community vanno sanificati prima di persistere nel DB
- Il ban IP è temporaneo: non usare blocchi permanenti lato applicativo
- GDPR: i profili dei minori Under 18 non mostrano nome e cognome per intero senza `parental_consent`

## Advisor — quando chiamarlo

Chiama `advisor` PRIMA di scrivere o modificare:
- Logica di transizione stati partita (`TERMINATA` → `CERTIFICATA`) o scrittura audit log
- Calcolo PA score, soglie anti-spam, effetti su permessi utente
- Qualsiasi codice che legge/scrive dati di utenti minorenni (GDPR, `parental_consent`)
- Auth: JWT scopes, OAuth flow, assegnazione ruoli premium
- Schema DB: foreign keys, indici, strutture con vincoli di integrità non ovvi

NON chiamare per: CRUD semplici, componenti UI, query read-only, config files, bug fix isolati in un layer, rinomina/refactor.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- Il grafo si aggiorna automaticamente dopo ogni commit tramite post-commit hook
