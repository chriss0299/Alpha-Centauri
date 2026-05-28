# BE-017 — Controller `updateMatchStatus` (transizioni stato)

## User Stories

### Admin / Editor
**Come** Super Admin o Editor,
**voglio** poter aggiornare lo stato di una partita tramite API,
**in modo che** il ciclo di vita della partita avanzi correttamente e il live feed si sblocchi/blocchi di conseguenza.

### Sviluppatore
**Come** sviluppatore backend,
**voglio** implementare il controller `updateMatchStatus` con le regole di transizione e l'audit log per `CERTIFICATA`,
**in modo che** solo le transizioni valide siano accettate e ogni certificazione sia tracciabile.

---

## Contesto di dominio

- Ciclo di vita: `PROGRAMMATA` → `IN_CORSO` → `TERMINATA` → `CERTIFICATA` (PRD §6.1)
- Nessuna transizione inversa o trasversale è ammessa
- `IN_CORSO`: imposta `started_at = NOW()` — sblocca la regola del minuto 1
- `TERMINATA`: congela l'inserimento di nuovi eventi
- `CERTIFICATA`: richiede audit log obbligatorio (docs/decisions.md 2026-05-12)

---

## Criteri di accettazione

- [ ] `PATCH /api/v1/matches/:matchId/status` richiede JWT valido → `401`
- [ ] Partita non trovata → `404`
- [ ] `new_status` mancante → `422`
- [ ] Transizione non valida (es. `PROGRAMMATA` → `CERTIFICATA`) → `422` con messaggio esplicito
- [ ] Stessa stato attuale → `422`
- [ ] Transizione `PROGRAMMATA → IN_CORSO`: salva `started_at = NOW()`
- [ ] Transizione `TERMINATA → CERTIFICATA`: crea record in `match_status_logs` (audit)
- [ ] Restituisce `200 OK` con la partita aggiornata

### Transizioni valide

| Da           | A            |
|-------------|-------------|
| PROGRAMMATA | IN_CORSO    |
| IN_CORSO    | TERMINATA   |
| TERMINATA   | CERTIFICATA |

### Risposta
```json
{
  "id": "uuid",
  "status": "IN_CORSO",
  "startedAt": "2026-06-01T15:00:05Z",
  "updatedBy": "user_id",
  "updatedAt": "2026-06-01T15:00:05Z"
}
```

---

## Note tecniche

- Controller: `server/controllers/matchController.js` → handler `updateMatchStatus`
- Route esistente: `PATCH /api/v1/matches/:matchId/status`
- Audit log su `match_status_logs`: `(match_id, from_status, to_status, changed_by, changed_at)`
- La tabella `match_status_logs` deve essere creata dalla migration DB (fuori scope BE-017)

---

## Out of scope (BE-017)

- Trigger automatico `PROGRAMMATA → IN_CORSO` (da dati esterni FIR)
- Notifiche push al cambio di stato
- Emissione Socket.io `match:status_changed`
