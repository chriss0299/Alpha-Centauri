# ROADMAP.md — RugbyTracker Community

**Target di lancio:** Ottobre 2026 — Inizio stagione FIR 2026/27
**Versione documento:** 1.0 | Maggio 2026
**Status:** Attivo

---

## Indice

1. [Panoramica](#panoramica)
2. [Fase 0 — Fondamenta](#fase-0--fondamenta-giugno-2026)
3. [Fase 1 — MVP Live](#fase-1--mvp-live-luglio-2026)
4. [Fase 2 — Real-time e Social](#fase-2--real-time-e-social-agosto-2026)
5. [Fase 3 — Stabilizzazione e Lancio](#fase-3--stabilizzazione-e-lancio-settembre--ottobre-2026)
6. [Milestone di Progetto](#milestone-di-progetto)
7. [Rischi e Mitigazioni](#rischi-e-mitigazioni)
8. [Fuori Scope v1](#fuori-scope-v1)

---

## Panoramica

| Fase | Periodo | Obiettivo |
|------|---------|-----------|
| **Fase 0** | Giugno 2026 | Auth funzionante, profilo squadra visibile |
| **Fase 1** | Luglio 2026 | Inserimento eventi live, classifiche funzionanti |
| **Fase 2** | Agosto 2026 | Live feed WebSocket, commenti, notifiche push |
| **Fase 3** | Settembre–Ottobre 2026 | Beta chiusa → lancio pubblico |

---

## Fase 0 — Fondamenta (Giugno 2026)

### Design — Matteo (DES)

- [ ] Design system: palette, tipografia, componenti base
- [ ] Wireframe schermate core: home, profilo squadra, scheda partita
- [ ] Prototipo navigazione su Figma

### Database — Laura (DB-1)

- [ ] Schema ER v1: entità `users`, `teams`, `leagues`, `seasons`
- [ ] Migrazioni iniziali con seed dati di test
- [ ] Setup phpMyAdmin + documentazione schema

### Backend — Christian (BE-1) · Daniele (BE-2)

- [ ] Setup progetto Node.js + Express + struttura cartelle
- [ ] Auth: registrazione e login con email + JWT
- [ ] OAuth Google (BE-1)
- [ ] Middleware sicurezza: helmet, cors, rate limiting (BE-1)
- [ ] CRUD `/api/v1/users` (BE-1)
- [ ] CRUD `/api/v1/teams` (BE-2)
- [ ] CRUD `/api/v1/leagues` e `/api/v1/seasons` (BE-2)
- [ ] Definizione contratto OpenAPI `/api/v1/` con TL

### Frontend — Sasha (FE-1) · Tommaso (FE-2) · Alexia (FE-3)

- [ ] Setup Nuxt + PWA module + Workbox (FE-1)
- [ ] Routing base: `/`, `/squadra/:id`, `/campionato/:id` (FE-1)
- [ ] Layout shell: header, nav, footer (FE-1)
- [ ] Componenti: `TeamCard`, `LeagueCard`, form di ricerca (FE-2)
- [ ] Auth flow: pagine login/registrazione + Pinia store `useAuthStore` (FE-3)
- [ ] Integrazione API auth con backend (FE-3)

### 🎯 Milestone M0
> **Auth funzionante end-to-end. Pagina profilo squadra visibile e navigabile.**

---

## Fase 1 — MVP Live (Luglio 2026)

### Database — Laura (DB-1)

- [ ] Schema v2: entità `matches`, `match_events` (meta, trasformazione, calcio, drop, cartellino)
- [ ] Logica bonus point FIR nella tabella `standings` (trigger o view)
- [ ] Migrazioni + seed partite di test

### Backend — Daniele (BE-2) · Christian (BE-1)

- [ ] Endpoints `GET/POST /api/v1/matches` (BE-2)
- [ ] Endpoints `POST /api/v1/matches/:id/events` (BE-2)
- [ ] **Logica punteggio rugby:** calcolo automatico score da eventi (BE-2)
- [ ] **Logica bonus point FIR:** vittoria con 4+ mete, sconfitta di misura (BE-2)
- [ ] Calcolo e aggiornamento classifiche automatico (BE-2)
- [ ] Rate limiting endpoint scrittura eventi (BE-1)
- [ ] Validazione server-side eventi (BE-1)

### Frontend — Sasha (FE-1) · Tommaso (FE-2) · Alexia (FE-3)

- [ ] Pagina `/partita/:id` con feed eventi (refresh manuale ogni 30s) (FE-1)
- [ ] Componenti: `MatchFeed`, `EventCard`, `ScoreBoard` (FE-2)
- [ ] Form inserimento eventi live (meta, trasformazione, cartellino...) (FE-2)
- [ ] Pagina classifica campionato con bonus point (FE-1)
- [ ] Pinia store `useMatchStore` + composable `useMatchEvents` (FE-3)
- [ ] Integrazione API partite ed eventi (FE-3)

### 🎯 Milestone M1
> **Un utente può seguire una partita, vedere il punteggio aggiornato e inserire eventi. La classifica si aggiorna automaticamente con il sistema bonus point FIR.**

> ⚠️ **Nota critica:** La logica bonus point è la parte più delicata — testare separatamente con unit test prima dell'integrazione frontend.

---

## Fase 2 — Real-time e Social (Agosto 2026)

> ⚠️ **Mese a rischio** per dispersione estiva del team. Pianificare una disponibilità minima concordata con tutti i membri prima di luglio.

### Database — Laura (DB-1)

- [ ] Schema v3: tabelle `comments`, `follows`, `user_reliability_scores`
- [ ] Tabelle statistiche aggregate: `player_stats`, `team_stats`
- [ ] Audit log partite certificate (immutabile)

### Backend — Andrea (BE-3) · Daniele (BE-2) · Christian (BE-1)

- [ ] Setup Socket.io server (BE-3)
- [ ] Room `match:{id}` — broadcast eventi in tempo reale (BE-3)
- [ ] Documentazione eventi Socket.io in `server/socket/EVENTS.md` (BE-3)
- [ ] Setup Redis: cache sessioni + dati hot (classifiche, partite live) (BE-3)
- [ ] Setup S3-compatible per upload loghi e avatar (BE-3)
- [ ] Job asincrono: calcolo PA score utente (BE-3)
- [ ] Meccanismo consensus/conflitti sugli eventi (BE-2)
- [ ] CRUD commenti `/api/v1/matches/:id/comments` (BE-2)
- [ ] Sistema follow squadre/campionati (BE-2)

### Frontend — Sasha (FE-1) · Tommaso (FE-2) · Alexia (FE-3)

- [ ] Integrazione Socket.io client — aggiornamenti live senza refresh (FE-3)
- [ ] Notifiche push via FCM + service worker (FE-1)
- [ ] Sezione commenti nella scheda partita (FE-2)
- [ ] Profilo giocatore con statistiche aggregate (FE-2)
- [ ] Sistema follow — feed personalizzato (FE-1)
- [ ] Pinia store `useNotificationStore` (FE-3)

### 🎯 Milestone M2
> **Feed live aggiornato in tempo reale via WebSocket. Commenti, follow squadre e notifiche push funzionanti.**

---

## Fase 3 — Stabilizzazione e Lancio (Settembre–Ottobre 2026)

### Settembre — Beta chiusa con club pilota

**Tutto il team:**

- [ ] Identificare e contattare 1–3 club pilota (target: Serie B o C regionale Veneto/Lombardia)
- [ ] Caricare manualmente i dati campionati FIR 2026/27 (calendari, squadre, gironi)
- [ ] Bug fixing da feedback beta
- [ ] Test su dispositivi reali (Android + iOS + desktop)
- [ ] Ottimizzazione PWA: icone, splash screen, manifest per tutti i device
- [ ] Test offline graceful (service worker + background sync)
- [ ] Review finale sicurezza: GDPR minori (§4.5 PRD), audit log

**Data & Finanza — Désirée (DF-1):**

- [ ] Coordinamento inserimento dati campionati
- [ ] Monitoraggio spese infrastruttura
- [ ] Report utilizzo beta (utenti, partite inserite, errori)

### 🎯 Milestone M3
> **Beta chiusa attiva con almeno un club reale. Dati stagione 2026/27 caricati. Zero bug critici aperti.**

### Ottobre — Lancio Pubblico 🏉

- [ ] Deploy produzione su Railway/Vercel
- [ ] Configurazione dominio definitivo
- [ ] Apertura registrazione pubblica
- [ ] Comunicazione sui canali social rugby italiani
- [ ] Monitoraggio errori (Sentry o equivalente)

### 🎯 Milestone LANCIO
> **RugbyTracker Community è live per la stagione FIR 2026/27.**

---

## Milestone di Progetto

| ID | Nome | Data target | Criterio di successo |
|----|------|-------------|----------------------|
| **M0** | Fondamenta | Fine Giugno | Auth end-to-end funzionante, profilo squadra navigabile |
| **M1** | MVP Live | Fine Luglio | Inserimento eventi live + classifiche con bonus point |
| **M2** | Real-time | Fine Agosto | WebSocket live, commenti, notifiche push |
| **M3** | Beta chiusa | Fine Settembre | Club pilota attivo, dati 2026/27 caricati |
| **🏉 LANCIO** | Lancio pubblico | Ottobre 2026 | App pubblica, stagione FIR in corso |

---

## Rischi e Mitigazioni

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Team disperso ad agosto (Fase 2) | Alta | Alto | Concordare disponibilità minima entro luglio; anticipare task critici a luglio |
| Logica bonus point FIR errata | Media | Alto | Unit test isolati BE-2 prima dell'integrazione FE |
| Dati campionati non disponibili a settembre | Media | Alto | Assegnare a DF-1 il coordinamento dati da agosto; fonte: sito FIR ufficiale |
| Socket.io non regge il carico (500 utenti concorrenti) | Bassa | Alto | Upgrade Railway Starter (~€5/mese) se necessario; load test in agosto |
| GDPR minori non implementato correttamente | Bassa | Critico | Review dedicata BE-1 + TL prima della beta; ref. PRD §4.5 e §14.3 |
| Contratto API FE/BE desallineato | Media | Medio | OpenAPI/Swagger aggiornato prima del codice — regola operativa obbligatoria |

---

## Fuori Scope v1

Le seguenti funzionalità sono **escluse** dalla versione di lancio:

- ❌ Streaming video / highlights video
- ❌ Betting / pronostici
- ❌ Chat diretta tra utenti (DM)
- ❌ Gestione arbitrale ufficiale
- ❌ Integrazione con piattaforme di allenamento (GPS, dati fisici)
- ❌ E-commerce (merchandising, biglietti)
- ❌ Gestione rosa avanzata (contratti, trasferimenti)
- ❌ Supporto categorie femminili *(priorità v2)*
- ❌ Rugby a 7 / Beach Rugby *(valutazione v2)*
- ❌ API pubblica per terze parti *(Fase 4, post-lancio)*

---

## Note operative

- Ogni feature va sviluppata su branch dedicato con naming `layer/nome-dev/feature` (vedi `TEAM.md`)
- Nessuna modifica al contratto API senza PR approvata da FE + BE + TL
- Il merge su `main` è esclusiva del Tech Lead (Christian)
- Per breaking change all'API: versioning obbligatorio `/api/v2/`

---

*Documento mantenuto dal Tech Lead — aggiornare dopo ogni milestone completata.*
*Prossima revisione: al completamento di M0.*
