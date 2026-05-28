# TEST-001 — Ambiente E2E full-stack con Cypress

## User Stories

### Sviluppatore
**Come** sviluppatore del team,
**voglio** poter lanciare la suite E2E full-stack con un singolo comando,
**in modo che** possa validare il flusso completo (Nuxt → API → MySQL → Redis) prima di aprire una PR senza setup manuale.

### Tech Lead
**Come** tech lead,
**voglio** che i test E2E girino su uno stack isolato dal dev environment,
**in modo che** nessun dev veda i suoi dati locali sporcati e i test siano deterministici (DB resettabile, niente race con altri sviluppatori).

### QA / Reviewer
**Come** reviewer di una PR,
**voglio** che la CI possa eseguire la stessa suite E2E in modo riproducibile,
**in modo che** ogni cambiamento sia validato anche oltre i test unitari.

---

## Contesto / Stato attuale

- Test unit BE: `server/__tests__/*` con Jest + supertest + mock MySQL.
- Test FE: nessuno.
- Test E2E: nessuno.
- Stack di sviluppo: `docker-compose.yml` con MySQL (3308), Redis (6379), server Express (3000), phpMyAdmin (8080). Nuxt parte in locale (3001).
- Manca un livello di test che valida insieme: form login → POST `/auth/login` → JWT in localStorage → redirect → API protetta.

---

## Decisione tecnica

**Driver:** Cypress (scelto in luogo di Playwright per DX visiva su flow auth complessi e maturità sull'ecosistema Vue/Nuxt).

**Isolamento:** stack dedicato `docker-compose.test.yml` con porte distinte:

| Servizio | Porta dev | Porta test |
|---|---|---|
| MySQL | 3308 | **3309** |
| Redis | 6379 | **6380** |
| Server Express | 3000 | **3002** |
| Nuxt client | 3001 | **3003** |

Schema DB: stesse migrazioni `database/migrations/*.sql` montate via `docker-entrypoint-initdb.d`. Seed di test in `database/seeds/test/*.sql` con utente di prova e dati minimi.

**Lifecycle:**
1. `docker compose -f docker-compose.test.yml up -d --build` → stack test up
2. `npx wait-on http://localhost:3002/api/v1/health/redis http://localhost:3003` → attende readiness
3. `cypress run` → esegue suite
4. `docker compose -f docker-compose.test.yml down -v` → tira giù e rimuove volumi (DB pulito al prossimo run)

Tutto orchestrato da `npm run test:e2e` in `client/package.json` (Cypress è cliente-driven).

**Determinismo:** ogni run parte da DB pulito (volume rimosso). Il seed test crea sempre lo stesso utente (`e2e@test.local` / `E2EPass123!`).

---

## Criteri di accettazione

### Infrastruttura
- [ ] `docker-compose.test.yml` in root, isolato dal compose dev (porte e nomi container distinti).
- [ ] Schema DB applicato automaticamente al primo boot via migrations.
- [ ] Seed test (`database/seeds/test/001_e2e_users.sql`) crea l'utente di prova.
- [ ] `JWT_SECRET` per test è hard-coded nel compose test (non sensibile, solo locale).
- [ ] Healthcheck MySQL test passa entro 30s.

### Cypress
- [ ] Cypress installato in `client/` come devDependency.
- [ ] `client/cypress.config.ts` punta a `baseUrl: http://localhost:3003`.
- [ ] Variabile `Cypress.env('apiBaseUrl')` punta a `http://localhost:3002/api/v1`.
- [ ] Almeno 1 test smoke che:
  - apre `/`
  - apre `/login`
  - effettua login con utente di prova
  - verifica redirect a `/` e presenza del token JWT in localStorage

### NPM scripts (in `client/package.json`)
- [ ] `test:e2e` → up stack test + wait + cypress run + down
- [ ] `test:e2e:open` → up stack test + wait + cypress open (modalità interattiva, no auto-down)
- [ ] `test:e2e:down` → solo `docker compose -f ../docker-compose.test.yml down -v`

### Documentazione
- [ ] `docs/setup.md`: sezione "Test E2E" con comando per lanciarli e prerequisiti.
- [ ] `docs/decisions.md`: voce dated "Ambiente E2E full-stack con Cypress (TEST-001)".
- [ ] `docs/glossario.md`: voce "Stack E2E".
- [ ] `docs/todo.md`: follow-up CI (GitHub Actions per E2E automatico su PR).

---

## Out of scope

- **CI GitHub Actions:** workflow per esecuzione E2E su ogni PR. Va aggiunto in task separata (richiede setup secret/cache).
- **Test E2E completi su business logic:** solo smoke test in questa task. La copertura completa (creazione partita, inserimento evento, regola minuto 1, certificazione) si costruisce incrementalmente.
- **Test E2E mobile/touch:** Cypress focus desktop in questa task; viewport mobile via `cy.viewport()` aggiunti se servono.
- **Visual regression:** `cy.matchImageSnapshot` o Percy fuori scope.
- **Migrazione test unit BE a hit DB reale:** i test esistenti restano con mock. Solo l'E2E hit il DB reale.

---

## Note tecniche

- **File toccati:**
  - **Root:** `docker-compose.test.yml` (nuovo), `docs/decisions.md`, `docs/glossario.md`, `docs/setup.md`, `docs/todo.md`
  - **Database:** `database/seeds/test/001_e2e_users.sql` (nuovo)
  - **Client:** `client/package.json` (scripts + devDep), `client/cypress.config.ts` (nuovo), `client/cypress/e2e/smoke.cy.ts` (nuovo), `client/cypress/support/*` (nuovo)
  - **Server:** nessuno (riusa stesso codice; comportamento controllato via env)
- **Comando rapido:** `cd client && npm run test:e2e`
- **Per debug:** `cd client && npm run test:e2e:open` apre Cypress GUI contro lo stack già up.
