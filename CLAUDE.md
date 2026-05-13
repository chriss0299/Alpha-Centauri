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
├── client/              # Nuxt 3 PWA
│   ├── pages/
│   ├── components/
│   ├── composables/
│   ├── stores/          # Pinia
│   └── public/
├── server/              # Node.js + Express API
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── socket/          # Socket.io handlers
├── database/
│   ├── migrations/
│   └── seeds/
├── docs/
│   ├── decisions.md     # Decisioni architetturali con motivazione
│   ├── glossario.md     # Termini di dominio e mapping naming cross-layer
│   └── user-stories.md  # Generato da /user-stories — non editare manualmente
├── .claude/
│   ├── settings.json    # Hook caveman + PreToolUse graphify + permessi dev
│   └── commands/        # Skill del team (/user-stories)
├── prd.md
├── CLAUDE.md
└── README.md

# graphify-out/ NON esiste qui — il grafo vive in ../Alpha-Centauri-graph/graphify-out/
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

## Documentazione di riferimento

Prima di rispondere a domande sul dominio o sull'architettura, leggi:
- `docs/decisions.md` — decisioni già prese con motivazione (non rimettere in discussione senza motivo)
- `docs/glossario.md` — naming canonico tra layer (DB snake_case ↔ BE camelCase ↔ FE PascalCase)
- `docs/user-stories.md` — stories derivate dal PRD (se esiste); generabile con `/user-stories`

## Graphify — Knowledge Graph Condiviso

Questo progetto usa un **grafo condiviso tra tutti i dev e tutte le istanze Claude Code**.
Il grafo è ospitato in una repo separata: `Alpha-Centauri-graph` (stesso owner GitHub).

### Dove leggere il grafo

Il grafo è clonato localmente in `../Alpha-Centauri-graph/` (cartella sorella di questa repo).
Prima di rispondere a domande su architettura, codebase o decisioni cross-layer:
1. Leggi `../Alpha-Centauri-graph/GRAPH_REPORT.md` — god nodes, community, connessioni sorprendenti
2. Se esiste `../Alpha-Centauri-graph/wiki/index.md`, naviga quello invece dei file raw

### Regola di lettura all'avvio sessione

All'inizio di ogni sessione Claude Code:
1. Esegui `git -C ../Alpha-Centauri-graph pull origin main` per sincronizzare il grafo
2. Leggi `../Alpha-Centauri-graph/GRAPH_REPORT.md`
3. Conferma al dev: "Grafo aggiornato — [data ultimo commit graph-repo]"

### Quando aggiornare il grafo

Aggiorna il grafo **SOLO quando un dev te lo chiede esplicitamente**, dopo aver verificato che:
- Il codice funziona (nessun errore in console, test passati)
- Le modifiche sono logicamente complete (non a metà feature)

### Protocollo di aggiornamento (esegui nell'ordine esatto)

```
1. git -C ../Alpha-Centauri-graph pull origin main
   → recupera eventuali aggiornamenti di altri dev

2. Lancia graphify dalla graph-repo, puntando al progetto:
   /graphify ../Alpha-Centauri --update
   (working directory deve essere ../Alpha-Centauri-graph)
   → graphify-out/ viene scritto/aggiornato direttamente in ../Alpha-Centauri-graph/graphify-out/
   → NON creare graphify-out/ nella repo del progetto

3. git -C ../Alpha-Centauri-graph add .
   git -C ../Alpha-Centauri-graph commit -m "graph: [descrizione modifiche] — [nome dev]"
   git -C ../Alpha-Centauri-graph push origin main

4. Conferma al dev: "Grafo aggiornato e pushato. Altri dev vedranno le modifiche al prossimo pull."
```

> ⚠️ **MAI sovrascrivere senza fare pull prima.** Se il pull trova conflitti, avvisa il dev — non tentare merge automatici su graph.json.
> ⚠️ **graphify-out/ NON deve mai esistere nella repo del progetto.** Se la trovi, rimuovila con `git rm -r graphify-out/`.

### Cosa NON fare

- Non pushare il grafo senza che un dev lo abbia chiesto esplicitamente
- Non pushare se il codice ha errori non risolti
- Non modificare manualmente `graph.json` — è generato da graphify
- Non eseguire `/graphify .` (rebuild completo) a meno che il dev non lo chieda — usa sempre `--update`
