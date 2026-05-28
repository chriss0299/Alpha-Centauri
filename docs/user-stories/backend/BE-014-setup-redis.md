# BE-014 — Setup Redis: connessione e client condiviso

## User Stories

### Sviluppatore backend
**Come** sviluppatore backend,
**voglio** disporre di un client Redis condiviso e già connesso al boot del server,
**in modo che** moduli come rate limiter, cache hot data, sessioni e (futuro) pub/sub Socket.io possano importarlo senza duplicare logica di connessione.

### Operatore / DevOps
**Come** operatore della piattaforma,
**voglio** che il server logghi errori di connessione Redis e tenti il reconnect automatico,
**in modo che** un riavvio di Redis non richieda redeploy del backend e i problemi siano visibili sui log.

### Tech Lead
**Come** tech lead,
**voglio** un singleton del client per tutto il processo,
**in modo che** il numero di connessioni TCP verso Redis resti basso e prevedibile.

---

## Contesto di dominio

- Redis è incluso nello stack ufficiale (PRD §14.1) per: cache di dati hot, rate limiting persistente cross-istanza, sessioni, adapter Socket.io.
- L'ambiente locale e Docker sono già pronti: variabile `REDIS_URL` in `.env.example`, servizio Redis dichiarato in `docker-compose.yml`.
- Nessun consumer di Redis è ancora attivo nel codice: questa task abilita lo strato infrastrutturale, non implementa feature funzionali.

---

## Criteri di accettazione

### Client
- [ ] Modulo `server/redis.js` esporta un'istanza singleton del client `redis` (node-redis v4+).
- [ ] Il client legge `process.env.REDIS_URL`; in assenza, default `redis://localhost:6379`.
- [ ] Il client gestisce eventi `error` loggando su `console.error` senza far crashare il processo.
- [ ] Strategia di reconnect attiva: retry esponenziale con cap massimo (es. 30s).

### Lifecycle
- [ ] Al boot del server (`require.main === module`), prima di `app.listen`, il client esegue `await client.connect()`.
- [ ] Se la connessione iniziale fallisce, l'errore viene loggato ma il server avvia comunque (Redis è considerato dipendenza graceful — i consumer devono gestire `client.isReady`).
- [ ] Su `SIGTERM` / `SIGINT` il client esegue `await client.quit()` prima dello shutdown.

### Healthcheck
- [ ] Endpoint `GET /api/v1/health/redis` restituisce `{ status: 'ok' }` con 200 se `PING` risponde, oppure `{ status: 'down' }` con 503 se il client non è connesso.

### Test
- [ ] Test unitario sul modulo `server/redis.js` verifica che esporti un client con `connect`, `quit`, `ping`, `isReady`.
- [ ] Test integrazione healthcheck con mock del client (`isReady = false` → 503; `ping = 'PONG'` → 200).

---

## Note tecniche

- Libreria: `redis` ufficiale (node-redis), non `ioredis`. Motivazione: API allineata a TypeScript first-party, già usata in molti esempi della doc Socket.io.
- Path file: `server/redis.js` (parallelo a `server/testdb/db.js` per coerenza).
- L'`app.js` resta importabile in test senza connettersi: la chiamata `connect()` avviene solo nel blocco `if (require.main === module)`.

---

## Out of scope (BE-014)

- Adapter Socket.io basato su Redis pub/sub (task separato quando si introdurranno multi-istanza del server).
- Migrazione del rate limiter da memory store a Redis store (verrà fatta quando si scalerà oltre la singola istanza).
- Caching di query MySQL specifiche.
- Sessioni utente in Redis (l'auth attuale è stateless via JWT).
