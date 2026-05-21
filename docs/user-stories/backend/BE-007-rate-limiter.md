# BE-007 — Middleware rateLimiter

**Storia:** Come sistema, voglio limitare la frequenza delle richieste agli endpoint di scrittura per prevenire abusi, brute-force e DDoS applicativi.

**Criteri di accettazione:**
- [ ] `rateLimiter.auth` — applicato a tutti gli endpoint auth (`/register`, `/login`, `/refresh`, `/google`): max **10 richieste per IP** in una finestra di **15 minuti**
- [ ] `rateLimiter.write` — applicato agli endpoint di scrittura generali (eventi live, conferme): max **30 richieste per IP** per **minuto**
- [ ] Risposta `429 Too Many Requests` con body `{ error: "Troppe richieste, riprova tra poco" }` al superamento del limite
- [ ] Header `RateLimit-*` standard presenti nella risposta (`standardHeaders: true`, `legacyHeaders: false`)

**Note tecniche:**
- File da modificare: `server/middleware/rateLimiter.js`, `server/routes/auth.js`
- Gli endpoint `matches.js` continuano a usare `rateLimiter.write` (invariato)
- I test unitari verificano la configurazione (windowMs, max) mockkando `express-rate-limit`

**Dipendenze:** BE-003, BE-004, BE-005, BE-006 — completati
**Owner:** Christian (BE-7)
