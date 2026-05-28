# BE-016 — Controller `getMatchEvents` (lista eventi feed)

## User Stories

### Utente (qualsiasi, non autenticato)
**Come** visitatore o utente non autenticato,
**voglio** visualizzare la lista degli eventi di una partita in ordine cronologico,
**in modo che** possa seguire il feed live senza dover effettuare il login.

### Sviluppatore
**Come** sviluppatore backend,
**voglio** implementare il controller `getMatchEvents` su `GET /api/v1/matches/:matchId/events`,
**in modo che** il client possa recuperare il feed eventi di una partita con filtri e paginazione.

---

## Contesto di dominio

- L'endpoint è pubblico: nessun JWT richiesto.
- Gli eventi sono ordinati per `minute ASC`, poi `created_at ASC` (a parità di minuto).
- Ogni evento ha un livello di affidabilità: `community`, `confermato`, `verificato`, `certificato`.
- La partita può essere in qualsiasi stato — il feed è leggibile sempre.

---

## Criteri di accettazione

- [ ] `GET /api/v1/matches/:matchId/events` senza token → `200 OK`
- [ ] Partita non trovata → `404 Not Found`
- [ ] Filtro opzionale: `?event_type=<tipo>` — filtra per tipo evento
- [ ] Filtro opzionale: `?reliability=<livello>` — filtra per affidabilità (`community`, `confermato`, `verificato`, `certificato`)
- [ ] Paginazione: `?page=1&limit=50` (default limit 50, max 200)
- [ ] Risposta include `data`, `page`, `limit`, `total`
- [ ] Ordinamento: `minute ASC`, `created_at ASC`

### Risposta
```json
{
  "data": [
    {
      "id": "uuid",
      "eventType": "meta",
      "minute": 7,
      "team": { "id": "uuid", "name": "Ruggers Torino" },
      "playerId": null,
      "description": null,
      "reliability": "community",
      "createdBy": "user_id",
      "createdAt": "2026-06-01T15:07:00Z"
    }
  ],
  "page": 1,
  "limit": 50,
  "total": 12
}
```

---

## Note tecniche

- Controller: `server/controllers/matchController.js` → handler `getMatchEvents`
- Route già registrata: `GET /api/v1/matches/:matchId/events` — nessun middleware auth

---

## Out of scope (BE-016)

- Emissione real-time via Socket.io
- Dettaglio singolo evento
- Statistiche aggregate dal feed
