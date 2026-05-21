# BE-004 — Route POST /api/v1/auth/login

**Storia:** Come utente registrato, voglio poter fare login con email e password, in modo da ricevere un token JWT per accedere alle funzionalità autenticate.

**Criteri di accettazione:**
- [ ] Endpoint pubblico `POST /api/v1/auth/login` — nessun middleware auth
- [ ] Valida i campi obbligatori: `email` (formato valido), `password` (non vuota)
- [ ] Restituisce `400 Bad Request` con lista errori se la validazione fallisce
- [ ] Restituisce `401 Unauthorized` con messaggio generico sia se l'email non esiste sia se la password è errata (non distinguere i due casi — timing attack / user enumeration)
- [ ] Usa `bcrypt.compare` per verificare la password contro `password_hash`
- [ ] Restituisce `200 OK` con JWT firmato + dati pubblici utente (`id`, `username`, `email`, `role`, `level`)
- [ ] Password e hash non compaiono mai nella risposta né nei log
- [ ] Rate limiting applicato (brute force su login)

**Payload richiesta:**
```json
{ "email": "user@example.com", "password": "SecurePass1!" }
```

**Payload risposta (200):**
```json
{
  "token": "<jwt>",
  "user": { "id": 1, "username": "chriss99", "email": "user@example.com", "role": "user", "level": 0 }
}
```

**Note tecniche:**
- Payload JWT: `{ userId, role, iat, exp }` — coerente con BE-001/002/003
- JWT expiry: `7d`
- Messaggio 401: `"Credenziali non valide"` — identico per email inesistente e password errata
- File da modificare:
  - `server/routes/auth.js` — aggiunge route `/login`
  - `server/controllers/authController.js` — aggiunge funzione `login`
- File da creare:
  - `server/__tests__/auth.login.test.js`

**Dipendenze:** BE-003 (register) — completato
**Owner:** Christian (BE-4)
