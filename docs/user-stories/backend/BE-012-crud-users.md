# BE-012 — CRUD `GET/PATCH /api/v1/users/:id`

## User Stories

### Utente (qualsiasi, non autenticato)
**Come** visitatore,
**voglio** visualizzare il profilo pubblico di un utente tramite il suo ID,
**in modo che** possa vedere il suo username, livello e ruolo sulla piattaforma.

### Utente (autenticato — proprietario del profilo)
**Come** utente autenticato,
**voglio** poter aggiornare il mio profilo (username, email),
**in modo che** i miei dati rimangano aggiornati sulla piattaforma.

### Sviluppatore
**Come** sviluppatore backend,
**voglio** implementare i controller `getUserById` e `updateUser` sugli endpoint `GET/PATCH /api/v1/users/:id`,
**in modo che** i profili siano consultabili pubblicamente e modificabili solo dal diretto interessato o da un admin.

---

## Contesto di dominio

- `GET /api/v1/users/:id` è pubblico per i dati base (username, level, role).
- I dati sensibili (email) sono visibili solo all'utente stesso o agli admin.
- **GDPR §4.5**: se l'utente è minorenne (`date_of_birth` < 18 anni) e `parental_consent = false`, nome e cognome non vengono esposti.
- `PATCH /api/v1/users/:id` richiede autenticazione. Solo il proprietario (`req.user.id === id`) o un admin può modificare.
- `role` e `level` non sono modificabili da questo endpoint.

---

## Criteri di accettazione

### GET /api/v1/users/:id
- [ ] Restituisce `200 OK` con profilo pubblico (username, level, role, createdAt)
- [ ] Restituisce `404 Not Found` se utente non esiste
- [ ] Se richiedente è il proprietario o admin: include anche `email`
- [ ] Se utente minorenne con `parental_consent = false`: `fullName` non esposto

### PATCH /api/v1/users/:id
- [ ] Restituisce `401 Unauthorized` se JWT assente o non valido
- [ ] Restituisce `403 Forbidden` se il richiedente non è il proprietario né un admin
- [ ] Restituisce `404 Not Found` se utente non esiste
- [ ] Campi aggiornabili: `username`, `email`
- [ ] `username` già in uso da altro utente → `409 Conflict`
- [ ] `email` già in uso da altro utente → `409 Conflict`
- [ ] Almeno un campo deve essere presente → altrimenti `422 Unprocessable Entity`
- [ ] Restituisce `200 OK` con profilo aggiornato

### Risposta GET (profilo pubblico)
```json
{
  "id": 1,
  "username": "tifoso_rosso",
  "role": "user",
  "level": 2,
  "createdAt": "2026-01-15T10:00:00Z"
}
```

### Risposta GET (proprietario o admin)
```json
{
  "id": 1,
  "username": "tifoso_rosso",
  "email": "tifoso@example.com",
  "role": "user",
  "level": 2,
  "createdAt": "2026-01-15T10:00:00Z"
}
```

---

## Note tecniche

- Controller: `server/controllers/userController.js`
- Route: `server/routes/users.js`
- `GET`: nessun middleware obbligatorio (auth opzionale per dati extra)
- `PATCH`: `requireAuth`
- `role` e `level` non modificabili da questo endpoint (admin-only, task separato)

---

## Out of scope (BE-012)

- Lista utenti `GET /api/v1/users`
- Eliminazione account
- Gestione `parental_consent` e profili tutelati (PRD §4.5 — task separato)
- Upload avatar
