# BE-001 — Middleware requireAuth (verifica JWT)

**Storia:** Come API REST, voglio verificare automaticamente il token JWT su ogni endpoint protetto, in modo che solo utenti autenticati possano accedere alle risorse riservate.

**Criteri di accettazione:**
- [ ] Estrae il token dall'header `Authorization: Bearer <token>`
- [ ] Verifica firma JWT con la chiave segreta del server
- [ ] Decodifica il payload e lo aggiunge a `req.user`
- [ ] Restituisce `401 Unauthorized` se l'header è assente o malformato
- [ ] Restituisce `401 Unauthorized` se il token è scaduto o firma non valida
- [ ] Non blocca gli endpoint pubblici (es. `GET /matches`, `GET /matches/:id`)

**Note tecniche:**
- Libreria: `jsonwebtoken` (npm)
- Secret: da env var `JWT_SECRET` (non hardcodato)
- Payload minimo atteso: `{ userId, role, iat, exp }`
- File: `server/middleware/auth.js` — esporta `{ requireAuth, requireRole }`
- `requireRole` dipende da `requireAuth` (task separato)

**Dipendenze:** nessuna
**Owner:** Christian (BE-1)
