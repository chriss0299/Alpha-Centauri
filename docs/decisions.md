# Decisioni architetturali — RugbyTracker Community

Registro delle scelte significative con motivazione. Aggiornare ad ogni nuova decisione rilevante.

---

## 2026-05-12 Real-time via Socket.io (no polling)

**Decisione:** Il live feed partita usa Socket.io con rooms per match.

**Motivazione:** Il polling genera latenza percepita alta durante eventi live (meta, cartellini) e carico inutile sul server tra un evento e l'altro. Socket.io permette push immediato a tutti i client nella room senza overhead.

**Alternative scartate:** HTTP polling ogni N secondi (latenza variabile, carico costante), Server-Sent Events (unidirezionale, non adatto a future feature bidirezionali).

**Dettaglio implementativo:** Room naming `match:<match_id>`. Events con prefisso `match:` (es. `match:event_added`, `match:status_changed`).

---

## 2026-05-12 Autenticazione JWT + OAuth Google/Apple

**Decisione:** Auth basata su JWT con supporto OAuth Google e Apple.

**Motivazione:** JWT stateless riduce dipendenza dal DB per ogni richiesta autenticata. OAuth Google/Apple abbassa barriera registrazione per utenti mobile (target primario PWA).

**Alternative scartate:** Session-based auth (richiede session store condiviso tra istanze, complica scaling), solo email/password (attrito maggiore per utenti mobile).

---

## 2026-05-12 Audit log obbligatorio per partite CERTIFICATE

**Decisione:** Ogni modifica a eventi di partite con stato `CERTIFICATA` produce un record in audit log.

**Motivazione:** I dati certificati hanno valore ufficiale e potrebbero essere contestati. Serve tracciabilità completa di chi ha modificato cosa e quando, per dispute e responsabilità legale.

**Alternative scartate:** Soft delete senza log (nessuna traccia delle modifiche), versioning della riga (più complesso, ridondante con log).

---

## 2026-05-12 PA score come meccanismo anti-spam

**Decisione:** Il Punteggio Affidabilità (PA) dell'utente controlla i privilegi di inserimento eventi.

**Motivazione:** Rate limiting puro blocca utenti legittimi in momenti intensi (fine partita). PA penalizza comportamenti scorretti nel tempo senza bloccare inserimenti legittimi. Crea anche un sistema di reputazione che incentiva contributi di qualità.

**Alternative scartate:** Rate limiting semplice (troppo rigido, cieco alla qualità), moderazione umana pre-pubblicazione (non scalabile per live feed).

---

## 2026-05-12 Regola del minuto 1

**Decisione:** Gli eventi di gioco sono inseribili solo dopo 60 secondi dall'inizio ufficiale della partita.

**Motivazione:** Evita inserimenti prematuri quando la partita non è ancora effettivamente iniziata. Riduce eventi duplicati/errati nei primi secondi quando lo stato `IN CORSO` è appena impostato.

**Alternative scartate:** Nessun limite temporale (troppi inserimenti garbage all'avvio), limite più lungo (es. 5 min — troppo restrittivo per eventi reali nei primi minuti).

---

## 2026-05-18 Docker come ambiente di sviluppo locale

**Decisione:** L'ambiente di sviluppo locale è containerizzato via Docker Compose (MySQL, Redis, phpMyAdmin, server Node.js).

**Motivazione:** Elimina il problema "funziona sul mio PC": ogni dev parte con lo stesso stack senza installare MySQL e Redis in locale. Le migrazioni vengono applicate automaticamente al primo avvio tramite `docker-entrypoint-initdb.d`. Il client Nuxt 3 è predisposto ma commentato fino all'inizializzazione dello scaffold.

**Alternative scartate:** Setup manuale per ogni dev (dipendenze di sistema, versioni divergenti), Vagrant (overhead maggiore, più lento da avviare).

**Dettaglio implementativo:** `docker-compose.yml` in root. Server usa `node --watch` per hot-reload senza dipendenze aggiuntive. `JWT_SECRET` proviene dall'`.env` dell'host via `${JWT_SECRET}` — non hardcodato nel compose.

---

## 2026-05-18 Due livelli di rate limiting: auth e write

**Decisione:** Il rate limiter espone due configurazioni distinte: `auth` (10 req / 15 min) per gli endpoint di autenticazione e `write` (30 req / min) per le operazioni di scrittura generali.

**Motivazione:** Un singolo limite flat non distingue tra operazioni a rischio diverso. Gli endpoint auth (login, register, google, refresh) sono vettore di brute-force e credential stuffing — richiedono un limite più stretto e una finestra più lunga. Gli endpoint di scrittura live (eventi partita, conferme) hanno un pattern d'uso legittimo ad alta frequenza (inserimento rapido di eventi) e un limite al minuto è più appropriato.

**Alternative scartate:** Limite unico per tutto (troppo permissivo per auth o troppo restrittivo per il live feed), rate limiting per utente autenticato invece che per IP (gli attacchi arrivano prima dell'autenticazione).

**Dettaglio implementativo:** `rateLimiter.auth` → 10/15min; `rateLimiter.write` → 30/min. `server/routes/auth.js` usa `auth`; `server/routes/matches.js` usa `write`. `standardHeaders: true` per conformità RFC 6585.

---

## 2026-05-18 OAuth Google via ID token verification (lato server)

**Decisione:** Il flow OAuth Google per la PWA usa la verifica lato server dell'ID token (`POST /api/v1/auth/google`) anziché il redirect server-side.

**Motivazione:** La PWA mobile-first gestisce il sign-in Google nativamente nel client (Google Identity Services SDK). Il client ottiene l'ID token e lo invia al backend per la verifica tramite `google-auth-library`. Questo elimina la necessità di gestire redirect OAuth, sessioni temporanee e callback URL — più semplice e robusto per una PWA/mobile.

**Alternative scartate:** Server-side redirect con Passport.js (richiede sessioni, redirect URL, state parameter — overhead non necessario per una PWA che gestisce il login nativa mente nel client).

**Dettaglio implementativo:** `POST /api/v1/auth/google` → `OAuth2Client.verifyIdToken` → trova o crea utente (lookup per `google_id`, fallback per email, link account se `google_id` è null). Risposta: `{ accessToken, refreshToken, isNewUser }`. `google_id` salvato in `users.google_id VARCHAR(255) NULL UNIQUE` (migrazione 003).

---

## 2026-05-18 Opaque refresh token con rotazione single-use

**Decisione:** Auth usa access token JWT breve (15m) + refresh token opaco long-lived (30d) con rotazione obbligatoria ad ogni uso.

**Motivazione:** Access token da 7d era troppo lungo per essere sicuro: in caso di leak, l'attaccante avrebbe accesso per 7 giorni senza possibilità di revoca (JWT stateless). Il pattern opaque refresh token permette revoca immediata cancellando il record in DB, e la rotazione single-use rileva token reuse (segnale di compromissione).

**Alternative scartate:** JWT sliding window (ri-emette JWT valido prima della scadenza — non revocabile, nessun segnale di reuse), refresh token multi-use senza rotazione (non rileva compromissione).

**Dettaglio implementativo:** Refresh token = `crypto.randomBytes(32).toString('hex')`; in DB si salva solo lo SHA-256 (`token_hash VARCHAR(64)`) nella tabella `refresh_tokens` (FK → `users.id ON DELETE CASCADE`). `POST /api/v1/auth/refresh` cancella il vecchio record e inserisce il nuovo prima di emettere il nuovo access token. Scaduto il refresh token, il client deve ri-autenticarsi con credenziali.

---

## 2026-05-23 Dataset CSV squadre italiane come riferimento seed

**Decisione:** Il dataset delle squadre italiane per la stagione 2025/26 è mantenuto come CSV in `database/dati csv/squadre_rugby_italia_2025_26.csv` (176 righe), affiancato da documentazione in MD.

**Motivazione:** Avere un CSV versionato permette di popolare la tabella `teams` in modo riproducibile in ogni ambiente (dev, staging, prod) senza dipendere da scraping live o input manuale. Il file MD documenta struttura, copertura e lacune note (Serie C parziale per mancanza dati FIR regionali) così ogni dev conosce i limiti del dataset.

**Struttura colonne:** `livello`, `campionato`, `gruppo`, `girone`, `squadra`, `citta`, `note`.

**Copertura:** Serie A Elite (10 sq.), Serie A (40 sq.), Serie B (50 sq.), Serie C (~74 sq., parziale — mancano Toscana, Sardegna, Sud Italia).

**Alternative scartate:** Alimentare `teams` solo via API utente (nessun dato di base all'avvio), scraping runtime da FIR (fragile, dipendenza esterna, lentezza).

**Note operative:** Quando si scrive lo script di seed `database/seeds/`, importare da questo CSV. Non modificare il CSV senza aggiornare anche la documentazione MD.

---

## 2026-05-12 MySQL con phpMyAdmin

**Decisione:** Database relazionale MySQL. Interfaccia admin via phpMyAdmin.

**Motivazione:** Il dominio è altamente relazionale (partite ↔ eventi ↔ utenti ↔ squadre ↔ campionati). Le garanzie ACID sono necessarie per certificazione risultati e audit log. phpMyAdmin per accesso rapido del team senza setup tools aggiuntivi.

**Alternative scartate:** PostgreSQL (ugualmente valido ma MySQL più familiare al team), MongoDB (modello document non adatto a relazioni complesse e transazioni multi-tabella).

---

## 2026-05-19 Nuxt 4 + @vite-pwa/nuxt + TypeScript strict (FE-001)

**Decisione:** Client scaffoldato con Nuxt 4 (minimal template), PWA via `@vite-pwa/nuxt`, TypeScript strict mode abilitato.

**Motivazione:** Nuxt 4 è la versione corrente stabile. `@vite-pwa/nuxt` è il modulo PWA ufficiale per Nuxt 3/4 (il vecchio `@nuxtjs/pwa` è deprecato). TS strict riduce bug su tipi complessi di dominio (stati partita, livelli affidabilità, GDPR flag).

**Workbox — strategia mista:**
- `NetworkFirst` per `/api/v1/*`: live feed sempre fresco, fallback cache se offline (timeout 5s)
- `StaleWhileRevalidate` per `/api/v1/(teams|users|championships)/*`: profili semi-statici, staleness 5 min accettabile
- `CacheFirst` implicito per asset statici precachati (JS, CSS, font, immagini)

**Alternative scartate:** `@nuxtjs/pwa` (solo Nuxt 2), `StaleWhileRevalidate` per tutto (API live restituirebbero dati obsoleti durante partita), JavaScript puro (dominio complesso con troppi tipi impliciti).

---

## 2026-05-28 Ambiente E2E full-stack con Cypress su Docker isolato (TEST-001)

**Decisione:** I test E2E girano su uno stack Docker dedicato (`docker-compose.test.yml`) parallelo al dev, con porte distinte (MySQL 3309, Redis 6380, server 3002, Nuxt 3003). Il driver è Cypress, installato come devDependency del client.

**Motivazione:** I test unit BE (con mock MySQL) e i test FE assenti non coprono il flusso reale Nuxt → API → DB → Redis. Senza E2E, regressioni cross-layer (es. CORS, JWT, rate limiter, regola minuto 1) emergono solo in manuale. Stack isolato evita di sporcare il DB di sviluppo e rende i test deterministici (DB ricreato da migrations + seed ad ogni run). Cypress scelto per DX visiva (debug interattivo via `cy:open`) e maturità sull'ecosistema Vue/Nuxt — Playwright sarebbe stato alternativa valida ma il team conosce meglio Cypress.

**Alternative scartate:** Test E2E solo API senza browser (perderebbe la copertura dei flussi UI come auth, redirect, localStorage); schema test sullo stesso MySQL dev (rischio inquinamento e race con dev attivi); SQLite in-memory (diverge da MySQL prod su regole come ENUM, ON UPDATE TIMESTAMP, collation utf8mb4).

**Dettaglio implementativo:** `docker-compose.test.yml` monta `database/migrations` + `database/seeds/test` come `docker-entrypoint-initdb.d`. Seed `001_e2e_users.sql` crea due utenti (`e2e@test.local` user, `admin@test.local` superadmin) con password `E2EPass123!` (bcrypt cost 12). `npm run test:e2e` in `client/` orchestra il ciclo: up stack → `wait-on` healthcheck `/api/v1/health/redis` + Nuxt 3003 → `cypress run` → down con `-v` (rimuove volumi). Cypress config: `baseUrl: http://localhost:3003`, `Cypress.env('apiBaseUrl')` per chiamate API dirette. Custom command `cy.loginByApi()` salta la UI per setup veloce di test che richiedono utente autenticato.

**Comportamento su fallimento:** lo script `test:e2e` usa `&&` lineare — se Cypress fallisce, `e2e:down` non parte e lo stack resta su. Comportamento desiderato per debugging (i container restano per ispezione). Cleanup manuale: `npm run e2e:down`.

---

## 2026-05-28 Client Redis condiviso con connessione graceful (BE-014)

**Decisione:** Il backend espone un'unica istanza singleton del client `redis` (node-redis v4) tramite `server/redis.js`. La connessione viene tentata al boot prima di `app.listen` ma un fallimento iniziale non impedisce l'avvio del server.

**Motivazione:** Redis è una dipendenza utile (cache, rate limit cross-istanza, futuro adapter Socket.io) ma non bloccante per il funzionamento base dell'API. Un singleton evita di moltiplicare connessioni TCP. La connessione "graceful" permette al server di partire anche se Redis è momentaneamente irraggiungibile, lasciando ai consumer la responsabilità di verificare `client.isReady` prima di usarlo. L'healthcheck dedicato `GET /api/v1/health/redis` rende lo stato visibile a monitoring e dev.

**Alternative scartate:** `ioredis` (più feature ma API meno aderente alla doc ufficiale Socket.io e meno comunità node-redis v4+); connessione lazy a primo uso (rende meno prevedibili i tempi di risposta della prima richiesta); fallimento bloccante al boot (un Redis flaky farebbe crashare il server in cascata, mentre l'API può operare degradata).

**Dettaglio implementativo:** `server/redis.js` esporta `{ client, connect, disconnect }`. Reconnect strategy esponenziale con cap a 30s. `app.js` chiama `redis.connect()` in `require.main === module`, registra handler `SIGTERM`/`SIGINT` per `client.quit()` graceful. Healthcheck: `503 { status: 'down' }` se `!isReady` o `PING != PONG`, `200 { status: 'ok' }` altrimenti.

---

## 2026-05-21 Layout base: `@nuxt/icon` + `useState` per auth temporaneo (FE-002)

**Decisione:** Icone via `@nuxt/icon` (Iconify). Stato auth in `useState('auth-user')` — da migrare a Pinia in FE-003.

**Motivazione:** `@nuxt/icon` è il modulo icone ufficiale Nuxt 4, zero configurazione, 200k+ icone Iconify disponibili. `useState` Nuxt nativo evita di installare Pinia con uno store auth incompleto — la migrazione a FE-003 è 5 righe.

**Alternative scartate:** SVG inline (manutenzione onerosa), `@heroicons/vue` diretto (meno integrato con Nuxt), Pinia subito (store auth a metà fino a FE-003 — debt peggiore di `useState` esplicito).

**Dettaglio implementativo:** `client/app/composables/useAuthState.ts` espone `user` (useState) e `isAuthenticated` (computed). `AppBottomNav` è auth-aware: voce Profilo → `/profilo` se autenticato, → `/login` se no. Bottom nav visibile solo `< 768px`; footer solo `≥ 768px`.
