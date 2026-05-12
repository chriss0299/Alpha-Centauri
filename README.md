# RugbyTracker Community

PWA mobile-first per il rugby di categoria B e settori giovanili. Permette a tifosi, genitori e atleti di seguire le partite in tempo reale, inserire eventi di gioco e consultare statistiche per campionati, squadre e giocatori che le federazioni non coprono.

## Stack

- **Frontend** — Nuxt 3 (Vue.js), PWA + Workbox
- **Backend** — Node.js + Express
- **Database** — MySQL, gestione via phpMyAdmin
- **Real-time** — Socket.io
- **Cache** — Redis
- **Auth** — JWT + OAuth (Google, Apple)

## Struttura del repository

```
Alpha-Centauri/
├── client/       # Nuxt 3 PWA
├── server/       # Express API
├── database/     # Migrations e seeds MySQL
├── prd.md        # Product Requirements Document
├── CLAUDE.md     # Contesto per Claude Code
└── README.md
```

## Setup Claude Code (una volta per dev)

Questo repo usa [graphify](https://github.com/graphifyy/graphifyy) per mantenere un knowledge graph della codebase condiviso tra tutti i dev e tutte le istanze Claude Code.

Il grafo è già committato in `graphify-out/` — **Claude Code lo legge automaticamente** dal primo clone. `graphify-out/graph.html` è apribile in browser per una visualizzazione interattiva.

**Obbligatorio prima di iniziare a sviluppare:** installa graphify per tenere il grafo aggiornato ad ogni commit.

### 1. Installa graphify

```bash
uv tool install graphifyy
# oppure: pipx install graphifyy
```

### 2. Installa la skill e configura Claude Code

**Mac / Linux:**
```bash
graphify install
graphify claude install
graphify hook install
```

**Windows:**
```bash
graphify install --platform windows
graphify claude install
graphify hook install
```

`graphify hook install` installa due cose:
- **Post-commit hook** — ricostruisce il grafo automaticamente dopo ogni commit (solo AST, zero costo API)
- **Git merge driver** — unisce automaticamente i grafi di branch diversi al merge, senza conflict markers

> Il grafo in `graphify-out/` è già presente — non serve eseguire `graphify .`. I comandi sopra sono sufficienti.

---

## Prerequisiti

- Node.js 20+
- MySQL 8+
- Redis 7+
- phpMyAdmin (opzionale, per gestione DB in sviluppo)

## Avvio in sviluppo

### Backend

```bash
cd server
npm install
cp .env.example .env   # configura DB, JWT_SECRET, Redis
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

L'app sarà disponibile su `http://localhost:3000`.

### Database

```bash
cd database
npm run migrate        # applica le migrations
npm run seed           # dati di test
```

## Variabili d'ambiente

### server/.env

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rugbytracker
DB_USER=root
DB_PASSWORD=
JWT_SECRET=
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=
```

### client/.env

```env
NUXT_PUBLIC_API_BASE=http://localhost:4000/api/v1
NUXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

## Roadmap sintetica

| Fase | Periodo   | Focus                                          |
| ---- | --------- | ---------------------------------------------- |
| 0    | Mesi 1–2  | Auth, profili utente/squadra, calendari        |
| 1    | Mesi 3–4  | Live feed MVP, commenti, statistiche base      |
| 2    | Mesi 5–6  | Real-time Socket.io, consensus, notifiche push |
| 3    | Mesi 7–9  | Certificazione dati, gamification, widget      |
| 4    | Mesi 10–12| PWA ottimizzata, dashboard, API pubblica       |

Per i dettagli completi vedere [prd.md](./prd.md).

## Contribuire

1. Crea un branch da `main` con naming `feat/<descrizione>` o `fix/<descrizione>`
2. Apri una Pull Request verso `main` con descrizione delle modifiche
3. Ogni PR deve passare lint e test prima del merge
