# BE-011 — CRUD `GET/POST /api/v1/teams`

## User Stories

### Utente (qualsiasi, non autenticato)
**Come** visitatore o utente non autenticato,
**voglio** consultare la lista delle squadre presenti sulla piattaforma,
**in modo che** possa cercare la squadra che mi interessa senza dover effettuare il login.

### Utente (autenticato)
**Come** utente registrato,
**voglio** poter creare una nuova squadra non ancora presente sulla piattaforma,
**in modo che** la community possa iniziare a seguire e inserire dati su quella squadra.

### Sviluppatore
**Come** sviluppatore backend,
**voglio** implementare i controller `getTeams` e `createTeam` sugli endpoint `GET/POST /api/v1/teams`,
**in modo che** la lista squadre sia pubblica e la creazione sia riservata agli utenti autenticati.

---

## Contesto di dominio

- `GET /api/v1/teams` è pubblico (PRD §4.2).
- `POST /api/v1/teams` richiede autenticazione — qualsiasi utente registrato può creare una squadra (PRD §4.2: "creabile da chiunque per squadre non ancora presenti").
- Una squadra creata dalla community ha stato `non_rivendicata` (non verificata).
- Il campo `created_by` registra l'`user_id` del creatore (audit trail).

---

## Criteri di accettazione

### GET /api/v1/teams
- [ ] Restituisce `200 OK` con lista paginata di squadre
- [ ] Filtri opzionali: `?league_id=<id>`, `?city=<stringa>`, `?name=<stringa>` (ricerca parziale)
- [ ] Paginazione: `?page=1&limit=20` (default: page 1, limit 20, max 100)
- [ ] Risposta include `data`, `page`, `limit`, `total`
- [ ] Nessun JWT richiesto

### POST /api/v1/teams
- [ ] Restituisce `401 Unauthorized` se JWT assente o non valido
- [ ] Campi obbligatori: `name`, `city`
- [ ] Campi opzionali: `league_id`, `short_name`, `website`
- [ ] Restituisce `422 Unprocessable Entity` se campi obbligatori mancanti
- [ ] Restituisce `409 Conflict` se esiste già una squadra con lo stesso `name` e `city`
- [ ] Restituisce `201 Created` con il body della squadra creata

### Risposta GET
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Ruggers Torino",
      "shortName": "RT",
      "city": "Torino",
      "league": { "id": "...", "name": "..." },
      "verified": false
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 15
}
```

### Risposta POST
```json
{
  "id": "uuid",
  "name": "Ruggers Torino",
  "shortName": "RT",
  "city": "Torino",
  "website": null,
  "league": null,
  "verified": false,
  "createdBy": "user_id",
  "createdAt": "2026-05-18T10:00:00Z"
}
```

---

## Note tecniche

- Controller: `server/controllers/teamController.js`
- Route: `server/routes/teams.js`
- Middleware `POST`: `requireAuth`
- Rate limiting su `POST` (scrittura)

---

## Out of scope (BE-011)

- `GET /api/v1/teams/:teamId` — dettaglio singola squadra
- Rivendicazione pagina squadra (verifica Admin Squadra)
- Upload logo / colori sociali
