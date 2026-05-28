# Setup — Alpha-Centauri

## Prerequisiti

- Node.js 20+
- Docker Desktop 4+

## Installazione (prima volta)

```bash
git clone <repo-url>
cd Alpha-Centauri

# dipendenze client
cd client && npm install && cd ..

# dipendenze server
cd server && npm install && cd ..
```

I file `.env` (root e `client/.env`) sono già presenti nel repo — non serve `cp .env.example .env`.

## Avvio (metodo corrente)

**1. Backend + servizi infrastruttura (Docker):**
```bash
docker compose up -d --build
```

| Servizio | URL |
|---|---|
| Express API | http://localhost:3000 |
| phpMyAdmin | http://localhost:8080 |
| MySQL 8 | localhost:3308 |
| Redis 7 | localhost:6379 |

**2. Frontend Nuxt (manuale):**
```bash
cd client
npm run dev
# → http://localhost:3001
```

> Nuxt va su porta 3001 perché 3000 è occupata dal backend.

**Verifica:** `docker compose ps` mostra 4 container in stato healthy.

**Healthcheck Redis:**
```bash
curl http://localhost:3000/api/v1/health/redis
# → 200 { "status": "ok" } se Redis è raggiungibile
# → 503 { "status": "down" } altrimenti
```

## Stop

```bash
docker compose down   # ferma backend + DB + Redis
# Ctrl+C nel terminale Nuxt per il frontend
```

## File .env

| File | Usato da |
|---|---|
| `.env` (root) | Server Docker — JWT_SECRET, DB_*, REDIS_URL, GOOGLE_CLIENT_ID |
| `client/.env` | Nuxt — NUXT_PUBLIC_API_BASE, NUXT_PUBLIC_GOOGLE_CLIENT_ID |

## graphify (knowledge graph del progetto)

Setup e protocollo completo: [`../CLAUDE.md`](../CLAUDE.md).

## Documentazione

| File | Contenuto |
|------|-----------|
| `prd.md` | Product Requirements Document |
| `docs/decisions.md` | Decisioni architetturali con motivazione |
| `docs/glossario.md` | Naming canonico cross-layer |
| `docs/user-stories.md` | User stories (generato da `/user-stories`) |
| `../Alpha-Centauri-graph/graphify-out/GRAPH_REPORT.md` | God nodes, community, connessioni sorprendenti |
