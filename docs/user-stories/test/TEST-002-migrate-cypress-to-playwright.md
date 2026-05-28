# TEST-002 — Migrazione driver E2E da Cypress a Playwright

## User Stories

### Sviluppatore
**Come** sviluppatore su Windows Enterprise,
**voglio** un driver E2E che funzioni nell'ambiente del team senza interferenze EDR / Defender,
**in modo che** possa lanciare la suite localmente senza chiedere whitelist o eccezioni di sicurezza.

### Tech Lead
**Come** tech lead,
**voglio** che la suite E2E funzioni anche in CI e localmente con lo stesso comando,
**in modo che** non si introducano divergenze tra ambiente dev e ambiente CI.

---

## Contesto / Stato attuale (TEST-001)

Cypress 15.16 / 13.17 risulta inutilizzabile sull'ambiente Windows Enterprise di alcuni dev. Sintomo:

```
Cypress.exe: bad option: --smoke-test
Cypress.exe: bad option: --ping=…
```

Il `Cypress.exe` scaricato dal pacchetto risponde come Node.js (`Cypress.exe --help` mostra l'help di Node). Probabile causa: EDR/Defender enterprise che intercetta o sostituisce gli executable Electron unpacked nelle cache user. Workaround tentati senza successo:
- Pulizia cache `%LOCALAPPDATA%\Cypress\Cache`
- Reinstall `npx cypress install --force`
- Cache custom in directory di progetto (`CYPRESS_CACHE_FOLDER`)
- Downgrade 15 → 13

Tutte le installazioni producono un Cypress.exe che si comporta come Node, suggerendo un'interferenza sistematica fuori dal nostro controllo.

---

## Decisione tecnica

**Sostituire Cypress con Playwright** (`@playwright/test`).

Motivazioni dirette:
- Microsoft mantiene Playwright + i browser portable. Su Windows Enterprise ha dimostrato di girare senza interferenze EDR sul nostro ambiente (verificato).
- API moderna: auto-wait nativi, multi-browser, parallel runs out-of-the-box.
- Tracing/trace-viewer integrati per debugging.
- `playwright.config.ts` è singolo file, niente cartella `support/` separata.

Motivazioni di team:
- Pari curva di apprendimento per chi conosceva Cypress (DSL simile).
- Maggior controllo sul lifecycle del browser (utile per future feature come worker pool dedicati).

---

## Bug collaterali emersi durante la migrazione

Tre bug nell'infrastruttura E2E sono stati scoperti e fissati come parte di questa task:

### 1. Mapping porta Nuxt errato (`docker-compose.test.yml`)
Il container Nuxt esponeva 3000 internamente ma `nuxt.config.ts` forza `devServer.port = 3001`. Il mapping `3003:3000` non riceveva traffico. **Fix:** `3003:3001`.

### 2. Mount migrations/seeds ignorato da MySQL
MySQL `docker-entrypoint-initdb.d` ignora le sottodirectory (`ignoring /docker-entrypoint-initdb.d/01-migrations`). Le tabelle non venivano create → login falliva con 500. **Fix:** mount dei file singoli con prefisso ordinante (`01_001_users.sql`, `02_001_e2e_users.sql`, …).

### 3. CORS hard-coded a localhost:3000/3001
Il server rifiutava le richieste dal client test su `:3003` (`Origin non consentita dal CORS`). **Fix:** lettura ALLOWED_ORIGINS da env var, default invariato per dev. Compose test imposta `ALLOWED_ORIGINS=http://localhost:3003`.

Questi tre fix sono prerequisito per il successo dei test E2E, indipendentemente dal driver scelto.

---

## Criteri di accettazione

- [x] Cypress rimosso da `client/package.json` (compresa cartella `cypress/`)
- [x] `@playwright/test` installato come devDependency
- [x] `npx playwright install chromium` eseguito senza errori
- [x] `client/playwright.config.ts` configurato con `baseURL=http://localhost:3003`, reporter `list`, retries CI
- [x] Test smoke riscritti in `client/e2e/smoke.spec.ts` con 4 test: home, healthcheck Redis, login UI, login API
- [x] `npm run test:e2e` lancia stack + wait + `playwright test` + tear down
- [x] `npm run test:e2e:ui` apre la UI Playwright interattiva
- [x] **Tutti i 4 test smoke passano** (4 passed, 4.7s)
- [x] `app.js`: ALLOWED_ORIGINS configurabile via env, default per dev invariato
- [x] `docker-compose.test.yml`: mount file singoli + `ALLOWED_ORIGINS=http://localhost:3003`
- [x] `.gitignore` aggiornato: `playwright-report/`, `test-results/`, `playwright/.cache/` (rimosso entry Cypress)

---

## Note tecniche

**Trick scoperti:**
- Per submit del form login: `input[type="password"].press('Enter')` funziona, `button[type="submit"].click()` non scatena l'handler `@submit.prevent` in modo affidabile nell'ambiente Nuxt dev. Da rivedere — possibile bug del template `login.vue` o timing HMR. Workaround attuale: pressione Enter dal campo password.
- Chiavi localStorage del client: `rugby_refresh_token` e `rugby_user` (l'`accessToken` resta solo in memoria nello store Pinia, non in localStorage).
- Stack già up può essere riusato: `npx playwright test` senza npm script wrapper.

**Comandi rapidi:**
```bash
cd client
npm run test:e2e          # full lifecycle: up + wait + run + down
npm run test:e2e:ui       # GUI interattiva, stack resta su
npm run e2e:down          # cleanup manuale
```

---

## Out of scope

- Test E2E completi su business logic (vedi follow-up TEST-001 → suite completa).
- CI GitHub Actions per E2E.
- Fix del bug "submit click non scatena handler" su `login.vue` (workaround Enter funziona, indaga in altra task).
- Migrazione fixture Cypress (non esistevano altre, solo smoke).
