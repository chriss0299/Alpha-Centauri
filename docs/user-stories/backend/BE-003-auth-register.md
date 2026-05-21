# BE-003 — Route POST /api/v1/auth/register

**Storia:** Come utente non registrato, voglio poter creare un account fornendo username, email e password, in modo da accedere alla piattaforma come Spettatore (livello 0).

**Criteri di accettazione:**
- [ ] Endpoint pubblico `POST /api/v1/auth/register` — nessun middleware auth
- [ ] Valida i campi obbligatori: `username` (3–30 char, alfanumerico + underscore), `email` (formato valido), `password` (min 8 char)
- [ ] Restituisce `400 Bad Request` con lista errori se la validazione fallisce
- [ ] Restituisce `409 Conflict` se email o username già esistenti
- [ ] Hash della password con bcrypt (salt rounds: 12) — mai persistere plain text
- [ ] Inserisce il record in `users` con: `role = 'user'`, `level = 0`, `pa_score = 0`
- [ ] Restituisce `201 Created` con JWT firmato + dati pubblici utente (`id`, `username`, `email`, `role`, `level`)
- [ ] Password e hash non compaiono mai nella risposta né nei log

**Payload richiesta:**
```json
{ "username": "chriss99", "email": "user@example.com", "password": "SecurePass1!" }
```

**Payload risposta (201):**
```json
{
  "token": "<jwt>",
  "user": { "id": 1, "username": "chriss99", "email": "user@example.com", "role": "user", "level": 0 }
}
```

**Note tecniche:**
- Nuove dipendenze da installare: `bcryptjs`, `express-validator`, `mysql2`
- File nuovi da creare:
  - `server/routes/auth.js`
  - `server/controllers/authController.js`
  - `database/migrations/001_create_users_table.sql`
- Payload JWT minimo: `{ userId, role, iat, exp }` — coerente con BE-001/002
- JWT expiry: `7d`
- Rate limiting: applicare su questo endpoint (DDoS / brute force su registrazione)
- Tabella `users`: snake_case, plurale — vedi `docs/glossario.md`
- Campi `parental_consent` e `guardian_managed` presenti in migrazione (default `false`) ma non gestiti in questo task (task GDPR separato)

**Schema minimo tabella `users`:**
| Colonna | Tipo | Note |
|---|---|---|
| `id` | INT PK AUTO_INCREMENT | |
| `username` | VARCHAR(30) UNIQUE NOT NULL | |
| `email` | VARCHAR(255) UNIQUE NOT NULL | |
| `password_hash` | VARCHAR(255) NOT NULL | |
| `role` | ENUM('user','player','team','referee','editor','moderator','superadmin') | default 'user' |
| `level` | TINYINT | default 0 |
| `pa_score` | INT | default 0 |
| `parental_consent` | BOOLEAN | default false |
| `guardian_managed` | BOOLEAN | default false |
| `created_at` | TIMESTAMP | default CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | on update CURRENT_TIMESTAMP |

**Dipendenze:** BE-001 (requireAuth), BE-002 (requireRole) — completati
**Owner:** Christian (BE-3)
