# BE-009 — Controller `getMatchById` (dettaglio partita)

## User Stories

### Utente (qualsiasi, non autenticato)
**Come** visitatore o utente non autenticato,
**voglio** visualizzare il dettaglio di una singola partita tramite il suo ID,
**in modo che** possa vedere tutte le informazioni disponibili su quella partita senza dover effettuare il login.

### Sviluppatore
**Come** sviluppatore backend,
**voglio** implementare il controller `getMatchById` sull'endpoint pubblico `GET /api/v1/matches/:matchId`,
**in modo che** qualsiasi client possa recuperare il dettaglio completo di una partita tramite ID.

---

## Contesto di dominio

- L'endpoint è pubblico: nessun JWT richiesto.
- Restituisce una singola partita in qualsiasi stato: `PROGRAMMATA`, `IN_CORSO`, `TERMINATA`, `CERTIFICATA`.
- Nessun dato personale sensibile esposto (nessun profilo giocatore minorenne).

---

## Criteri di accettazione

### Risposta base
- [ ] `GET /api/v1/matches/:matchId` restituisce `200 OK` con il dettaglio della partita
- [ ] Restituisce `404 Not Found` se la partita non esiste

### Payload risposta
```json
{
  "id": "uuid",
  "status": "PROGRAMMATA",
  "homeTeam": { "id": "...", "name": "..." },
  "awayTeam": { "id": "...", "name": "..." },
  "league": { "id": "...", "name": "..." },
  "scheduledAt": "2026-06-01T15:00:00Z",
  "venue": "Campo Comunale",
  "createdBy": "user_id",
  "createdAt": "2026-05-18T10:00:00Z"
}
```

---

## Note tecniche

- Controller: `server/controllers/matchController.js` → handler `getMatchById`
- Route: `GET /api/v1/matches/:matchId` — nessun middleware di autenticazione
- Parametro: `matchId` dalla URL

---

## Out of scope (BE-009)

- Lista eventi live della partita
- Statistiche aggregate
- Aggiornamento stato partita
