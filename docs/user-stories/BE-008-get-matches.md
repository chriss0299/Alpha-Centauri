# BE-008 — Controller `getMatches` (lista partite pubblica)

## User Stories

### Utente (qualsiasi, non autenticato)
**Come** visitatore o utente non autenticato,
**voglio** consultare la lista delle partite programmate e in corso,
**in modo che** possa seguire il calendario e trovare la partita che mi interessa senza dover effettuare il login.

### Sviluppatore
**Come** sviluppatore backend,
**voglio** implementare il controller `getMatches` sull'endpoint pubblico `GET /api/v1/matches`,
**in modo che** qualsiasi client possa recuperare le partite con filtri e paginazione senza autenticazione.

---

## Contesto di dominio

- L'endpoint è pubblico: nessun JWT richiesto (PRD §6).
- Restituisce partite in qualsiasi stato: `PROGRAMMATA`, `IN_CORSO`, `TERMINATA`, `CERTIFICATA`.
- I dati esposti non includono informazioni personali sensibili.
- Nessun dato di giocatori minorenni viene esposto qui (la lista partite non contiene dati personali giocatori).

---

## Criteri di accettazione

### Risposta base
- [ ] `GET /api/v1/matches` senza parametri restituisce `200 OK` con lista paginata di partite
- [ ] Ogni partita include: `id`, `status`, `homeTeam`, `awayTeam`, `league`, `scheduledAt`, `venue`

### Filtri (query string)
- [ ] `?status=IN_CORSO` filtra per stato (valori: `PROGRAMMATA`, `IN_CORSO`, `TERMINATA`, `CERTIFICATA`)
- [ ] `?league_id=<id>` filtra per campionato
- [ ] `?date=YYYY-MM-DD` filtra le partite con `scheduled_at` nella data indicata
- [ ] Filtri combinabili tra loro
- [ ] Parametro `status` non valido → `422 Unprocessable Entity`

### Paginazione
- [ ] Parametri: `?page=1&limit=20` (default: page 1, limit 20, max limit 100)
- [ ] La risposta include: `data`, `page`, `limit`, `total`

### Risposta
```json
{
  "data": [
    {
      "id": "uuid",
      "status": "PROGRAMMATA",
      "homeTeam": { "id": "...", "name": "..." },
      "awayTeam": { "id": "...", "name": "..." },
      "league": { "id": "...", "name": "..." },
      "scheduledAt": "2026-06-01T15:00:00Z",
      "venue": "Campo Comunale"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 42
}
```

---

## Note tecniche

- Controller: `server/controllers/matchController.js` → handler `getMatches`
- Route: `GET /api/v1/matches` — nessun middleware di autenticazione
- Ordinamento default: `scheduled_at ASC`
- Nessun Socket.io: endpoint read-only

---

## Out of scope (BE-008)

- Dettaglio singola partita (BE-009)
- Evento live nella risposta
- Statistiche aggregate per partita
