# TEAM.md — Organizzazione del team RugbyTracker Community

## Struttura verticale per layer

Il team è composto da 8 persone divise per layer tecnologico.
Ogni layer ha ownership completo del proprio ambito; le modifiche cross-layer richiedono PR approvata da entrambi i layer coinvolti e dal Tech Lead.

---

## Frontend — 3 persone

Ownership: `client/`

| ID | Nome | Area di responsabilità |
|----|------|------------------------|
| **FE-1** | Sasha | Routing, pagine, layout, PWA (Workbox, manifest, offline) |
| **FE-2** | Tommaso | Componenti UI (feed live, card partita, form eventi), design system |
| **FE-3** | Alexia | Pinia stores, composables, integrazione Socket.io lato client, auth flow |

---

## Backend — 3 persone

Ownership: `server/`

| ID | Nome | Area di responsabilità |
|----|------|------------------------|
| **BE-1** | Christian | Auth (JWT, OAuth), middleware, rate limiting, sicurezza |
| **BE-2** | Daniele | Routes e controllers (partite, eventi, feed), logica PA e affidabilità |
| **BE-3** | Andrea | Socket.io server, Redis cache, S3, job asincroni |

---

## Database — 1 persona

Ownership: `database/`

| ID | Nome | Area di responsabilità |
|----|------|------------------------|
| **DB-1** | Laura | Migrazioni, seeds, ottimizzazione query, audit log, backup, phpMyAdmin |

---

## Tech Lead — 1 persona

Ruolo trasversale, non assegnato a un layer specifico.

| ID | Nome | Area di responsabilità |
|----|------|------------------------|
| **TL** | Christian | Architettura, code review finale, contratto API `/api/v1/`, decisioni cross-layer, CI/CD |

---

## Designer / Grafico — 1 persona

Ruolo trasversale, non assegnato a un layer specifico.

| ID | Nome | Area di responsabilità |
|----|------|------------------------|
| **DES** | Matteo | UI/UX design, design system, asset grafici, prototipazione |

---

## Flusso di collaborazione tra layer

```
FE  ──→  contratto API (definito con TL + BE)   ──→  BE
BE  ──→  schema e query approvati da DB-1        ──→  DB
FE  ──→  eventi Socket.io concordati con BE-3    ──→  BE-3
```

### Regole operative

- Nessuna modifica al contratto API senza PR approvata da FE + BE + TL.
- Nessuna modifica allo schema DB senza PR approvata da BE + DB-1 + TL.
- I nomi delle room Socket.io e gli eventi `match:*` sono definiti da BE-3 e documentati prima dell'implementazione FE.
- Le breaking change all'API sono vietate senza versioning (`/api/v2/`).

---

## Naming dei branch

```
layer/nome-dev/feature-da-sviluppare
```

Esempi:
- `frontend/tommaso/match-feed-card`
- `backend/christian/oauth-google`
- `database/laura/migration-match-events`
- `techlead/christian/openapi-contract-v1`

---

## Rischi e mitigazioni

| Rischio | Mitigazione |
|---------|-------------|
| FE e BE disallineati sul contratto API | OpenAPI/Swagger condiviso, aggiornato **prima** del codice |
| DB-1 diventa collo di bottiglia | BE propone le migrazioni, DB-1 le approva e ottimizza |
| Feature cross-layer difficile da coordinare | TL apre un branch condiviso e coordina la PR |
| Socket.io: eventi non documentati | BE-3 mantiene un registro eventi in `server/socket/EVENTS.md` |
