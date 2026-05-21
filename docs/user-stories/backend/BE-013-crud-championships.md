# BE-013 — CRUD `GET/POST /api/v1/championships`

## User Stories

### Utente (qualsiasi, non autenticato)
**Come** visitatore o utente non autenticato,
**voglio** consultare la lista dei campionati disponibili sulla piattaforma,
**in modo che** possa trovare il campionato che mi interessa senza dover effettuare il login.

### Utente (Admin / Editor)
**Come** Super Admin o Editor della piattaforma,
**voglio** poter creare un nuovo campionato nel sistema tramite API,
**in modo che** le squadre possano essere associate e le partite programmate al suo interno.

### Sviluppatore
**Come** sviluppatore backend,
**voglio** implementare i controller `getChampionships` e `createChampionship` sugli endpoint `GET/POST /api/v1/championships`,
**in modo che** la lista campionati sia pubblica e la creazione sia riservata agli admin autorizzati.

---

## Contesto di dominio

- `GET /api/v1/championships` è pubblico (PRD §5.1).
- `POST /api/v1/championships` richiede ruolo `super_admin` o `editor` (PRD §4.6).
- Un campionato ha una categoria (es. Under 14, Serie B) e una stagione (es. 2025/2026).
- Le squadre vengono associate al campionato tramite `league_teams` (task separato).

---

## Criteri di accettazione

### GET /api/v1/championships
- [ ] Restituisce `200 OK` con lista paginata
- [ ] Filtri opzionali: `?season=<stringa>`, `?category=<stringa>`
- [ ] Paginazione: `?page=1&limit=20` (default: page 1, limit 20, max 100)
- [ ] Risposta include `data`, `page`, `limit`, `total`
- [ ] Nessun JWT richiesto

### POST /api/v1/championships
- [ ] Restituisce `401 Unauthorized` se JWT assente o non valido
- [ ] Restituisce `403 Forbidden` se ruolo non è `super_admin` o `editor`
- [ ] Campi obbligatori: `name`, `season`, `category`
- [ ] Campi opzionali: `region`, `description`
- [ ] Restituisce `422 Unprocessable Entity` se campi obbligatori mancanti
- [ ] Restituisce `409 Conflict` se esiste già un campionato con stesso `name` e `season`
- [ ] Restituisce `201 Created` con il body del campionato creato

### Risposta GET
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Campionato Under 14 Piemonte",
      "season": "2025/2026",
      "category": "Under 14",
      "region": "Piemonte",
      "description": null
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 8
}
```

### Risposta POST
```json
{
  "id": "uuid",
  "name": "Campionato Under 14 Piemonte",
  "season": "2025/2026",
  "category": "Under 14",
  "region": "Piemonte",
  "description": null,
  "createdBy": "user_id",
  "createdAt": "2026-05-19T10:00:00Z"
}
```

---

## Note tecniche

- Controller: `server/controllers/championshipController.js`
- Route: `server/routes/championships.js`
- Middleware `POST`: `requireRole(['super_admin', 'editor'])`
- Rate limiting su `POST`

---

## Out of scope (BE-013)

- `GET /api/v1/championships/:id` — dettaglio singolo campionato
- Associazione squadre al campionato (`league_teams`)
- Aggiornamento o eliminazione campionato
