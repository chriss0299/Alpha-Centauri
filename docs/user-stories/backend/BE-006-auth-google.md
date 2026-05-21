# BE-006 — OAuth Google: verifica ID token e generazione JWT

**Storia:** Come utente mobile, voglio poter accedere con il mio account Google senza inserire email e password, in modo da registrarmi o loggarmi in un solo tap.

**Criteri di accettazione:**
- [ ] Endpoint pubblico `POST /api/v1/auth/google` — nessun middleware auth
- [ ] Accetta `{ idToken }` nel body; restituisce `400` se mancante
- [ ] Verifica l'ID token con Google tramite `google-auth-library` (`OAuth2Client.verifyIdToken`)
- [ ] Restituisce `401` se il token Google è invalido o scaduto
- [ ] Cerca l'utente per `google_id`; se non trovato, cerca per `email`
- [ ] Se l'utente non esiste: lo crea con `role='user'`, `level=0`, `pa_score=0`, username generato automaticamente
- [ ] Se l'utente esiste: aggiorna `google_id` se non ancora linkato
- [ ] Restituisce `200 OK` con `accessToken` (15m), `refreshToken` (30d) e `isNewUser: true/false`
- [ ] `password_hash` non compare mai nella risposta
- [ ] Rate limiting applicato

**Payload richiesta:**
```json
{ "idToken": "<google_id_token_dal_client>" }
```

**Payload risposta (200):**
```json
{
  "accessToken": "<jwt_15m>",
  "refreshToken": "<opaque_30d>",
  "isNewUser": false,
  "user": { "id": 1, "username": "mario_r1234", "email": "mario@gmail.com", "role": "user", "level": 0 }
}
```

**Note tecniche:**
- Variabile d'ambiente: `GOOGLE_CLIENT_ID` (aggiunta in `.env.example`)
- Dipendenza: `google-auth-library` (installata)
- Username generato: `given_name` o prefisso email, lowercase, solo `[a-z0-9_]`, max 26 char + 4 cifre random
- Migrazione necessaria: `003_add_google_id_to_users.sql` — aggiunge colonna `google_id VARCHAR(255) NULL UNIQUE`
- Il payload JWT rimane `{ userId, role }` — nessun scope aggiuntivo in questa fase
- Il refresh token segue lo stesso pattern di BE-005 (SHA-256 hash in `refresh_tokens`)

**Dipendenze:** BE-005 (refresh token) — completato
**Owner:** Christian (BE-6)
