# BE-005 — Route POST /api/v1/auth/refresh

**Storia:** Come utente autenticato con access token scaduto, voglio poter ottenere un nuovo access token tramite il mio refresh token, senza dover reinserire le credenziali.

**Criteri di accettazione:**
- [ ] Endpoint pubblico `POST /api/v1/auth/refresh` — nessun middleware auth
- [ ] Accetta `{ refreshToken }` nel body; restituisce `400` se mancante
- [ ] Hasha il refresh token ricevuto (SHA-256) e cerca il record in `refresh_tokens`
- [ ] Restituisce `401 Unauthorized` se il token non esiste o è scaduto
- [ ] **Rotazione obbligatoria**: cancella il vecchio record e inserisce un nuovo refresh token ad ogni uso (single-use)
- [ ] Restituisce `200 OK` con nuovo `accessToken` (15m) e nuovo `refreshToken` (30d)
- [ ] Rate limiting applicato

**Impatto su endpoint esistenti:**
- `POST /api/v1/auth/login` — cambia risposta: `token` → `accessToken` (15m) + `refreshToken` (30d opaco)
- `POST /api/v1/auth/register` — idem

**Payload richiesta:**
```json
{ "refreshToken": "<opaque_token>" }
```

**Payload risposta (200):**
```json
{
  "accessToken": "<jwt_15m>",
  "refreshToken": "<nuovo_opaque_token_30d>"
}
```

**Note tecniche:**
- Refresh token: `crypto.randomBytes(32).toString('hex')` — 64 char hex
- Storage: hash SHA-256 del token in `refresh_tokens.token_hash` — mai il plain token
- Access token expiry: `15m` (cambia da `7d`)
- Refresh token expiry: 30 giorni (`expires_at` calcolato lato server)
- File da creare: `database/migrations/002_create_refresh_tokens_table.sql`
- File da modificare: `server/controllers/authController.js`, `server/routes/auth.js`
- File da aggiornare: `server/__tests__/auth.login.test.js`, `server/__tests__/auth.register.test.js`
- File da creare: `server/__tests__/auth.refresh.test.js`

**Schema tabella `refresh_tokens`:**
| Colonna | Tipo | Note |
|---|---|---|
| `id` | INT PK AUTO_INCREMENT | |
| `user_id` | INT NOT NULL | FK → users.id ON DELETE CASCADE |
| `token_hash` | VARCHAR(64) UNIQUE NOT NULL | SHA-256 del token opaco |
| `expires_at` | DATETIME NOT NULL | NOW() + 30 giorni |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Dipendenze:** BE-004 (login) — completato
**Owner:** Christian (BE-5)
