# BE-021 — Rate limiting per scrittura su Redis (sliding window)

## User Stories

### Sviluppatore backend
**Come** sviluppatore backend,
**voglio** che il rate limiting sugli endpoint di scrittura usi Redis come store con algoritmo sliding window,
**in modo che** il limite resti coerente quando il backend gira in più istanze e non venga "ricaricato" ad ogni boundary di finestra fissa.

### Operatore / DevOps
**Come** operatore,
**voglio** poter scalare orizzontalmente il backend senza che ogni replica abbia un counter locale indipendente,
**in modo che** un attaccante non possa moltiplicare la propria quota distribuendo le richieste tra le repliche.

### Utente normale
**Come** utente che inserisce eventi durante una partita,
**voglio** un limite percepito uniforme nel tempo (non un cliff alla scadenza della finestra fissa),
**in modo che** non venga improvvisamente bloccato a metà di una raffica legittima di eventi.

---

## Contesto / Stato attuale

- `server/middleware/rateLimiter.js` usa `express-rate-limit` con **memory store** di default.
- 4 endpoint scrittura usano `rateLimiter.write` (30 req/min): `POST /matches/:id/events`, `POST /matches/:id/events/:eid/confirm`, `POST /teams`, `POST /championships`.
- Memory store: counter per-istanza, perso al restart, non condiviso tra repliche.
- Fixed window: utente che fa 30 richieste al sec 59 e altre 30 al sec 60 ottiene 60 in ~1 sec.

Il client Redis condiviso è già disponibile da BE-014 (`server/redis.js`).

---

## Decisione tecnica

**Algoritmo:** sliding window log con Redis ZSET.

Per ogni chiave `rl:write:<identity>`:
1. `ZREMRANGEBYSCORE key 0 (now - windowMs)` — rimuove timestamp fuori finestra.
2. `ZCARD key` — conta richieste correnti in finestra.
3. Se `count >= max` → **429**.
4. Altrimenti `ZADD key now <unique-member>` + `PEXPIRE key windowMs` → ammette la richiesta.

Operazioni atomiche via `MULTI/EXEC` (o script Lua se servono garanzie più forti — fuori scope per ora).

**Identità del richiedente:**
- Se `req.user?.id` esiste → usa userId (auth-aware).
- Fallback → IP normalizzato (`req.ip`).
- La chiave include il prefisso route gruppo (`write`) per non collidere con futuri limiter (`auth`, `live`).

**Comportamento in degraded mode (Redis down):**
- Se `client.isReady === false` o l'operazione Redis fallisce → log warning, **fail-open** (richiesta passa).
- Motivazione: un Redis down non deve portare a un DoS interno bloccando tutto il traffico scrittura.

---

## Criteri di accettazione

### Middleware
- [ ] Nuovo modulo `server/middleware/rateLimitRedis.js` esporta una factory `createSlidingWindowLimiter({ keyPrefix, windowMs, max })` che ritorna un middleware Express.
- [ ] La factory accetta opzione `getIdentity(req)` con default `req.user?.id ?? req.ip`.
- [ ] Header standard inclusi nella response: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` (RFC draft 9 standard).
- [ ] In caso di limite superato: status `429` + body `{ error: "Troppe richieste, riprova tra poco" }` (coerente con il limiter esistente).
- [ ] Su Redis non disponibile: fail-open con `console.warn`, **mai 5xx** verso il client.

### Integrazione
- [ ] `server/middleware/rateLimiter.js` esporta `write` come istanza del nuovo limiter Redis (window 60s, max 30) mantenendo lo stesso nome esportato — gli usage esistenti non vanno toccati.
- [ ] `auth` resta su memory store **in questa task** (può migrare in una task futura — vedi out of scope).
- [ ] Gli endpoint write esistenti continuano a funzionare senza modifiche al file route.

### Test
- [ ] Test unitario `__tests__/rateLimitRedis.test.js`:
  - mocka `server/redis.js`
  - verifica che 30 richieste passino e la 31a ritorni 429 entro la stessa finestra
  - verifica che dopo `windowMs + 1` la quota si ripristini (mock di `Date.now`)
  - verifica fail-open quando `client.isReady === false`
  - verifica gli header `RateLimit-*` presenti
- [ ] Test esistenti (suite completa) restano verdi (escluso `auth.register` già rotto in altra task).

### Documentazione
- [ ] `docs/decisions.md`: nuova voce dated 2026-05-28 — "Rate limit scrittura su Redis sliding window (BE-021)".
- [ ] `docs/glossario.md`: voce "Sliding window log".
- [ ] `docs/todo.md`: spunta "Rate limiter su Redis store" (era follow-up di BE-014); aggiunge follow-up "Migrazione `auth` su Redis".

---

## Out of scope (BE-021)

- Migrazione del limiter `auth` a Redis (utile ma indipendente, brute-force protection è già 10/15min e una singola istanza non scala il problema così rapidamente).
- Rate limiting per partita / per match (anti-flooding eventi su singola partita — diverso meccanismo, lavorabile insieme alla PA score).
- Distributed lock o leaky bucket — sliding window log copre già la regola FIR per inserimento eventi rapidi.
- Implementazione Lua atomica — il MULTI/EXEC è sufficiente per ora; Lua si valuterà se emergono race condition reali sotto carico.

---

## Note tecniche

- File toccati:
  - **Nuovo:** `server/middleware/rateLimitRedis.js`
  - **Modificato:** `server/middleware/rateLimiter.js`
  - **Nuovo test:** `server/__tests__/rateLimitRedis.test.js`
- Il client Redis è importato come `const { client } = require('../redis')`.
- ZSET member deve essere univoco per timestamp duplicati nella stessa finestra: usare `${now}-${crypto.randomUUID()}` o `${now}-${counter}`.
- Espirazione chiave: `PEXPIRE key windowMs` ad ogni write — auto-cleanup quando l'utente smette di chiamare.
- Test usano `jest.useFakeTimers()` + mock del client con backend in-memory (Map<key, sortedSet>) per simulare ZSET senza Redis reale.
