# BE-015 — Controller `addMatchEvent` (regola minuto 1)

## User Stories

### Utente (autenticato, livello ≥ 1)
**Come** utente autenticato presente a una partita,
**voglio** inserire un evento di gioco (meta, cartellino, sostituzione, ecc.) durante la partita,
**in modo che** il live feed si aggiorni in tempo reale per tutti gli utenti che seguono la partita.

### Sviluppatore
**Come** sviluppatore backend,
**voglio** implementare il controller `addMatchEvent` su `POST /api/v1/matches/:matchId/events`,
**in modo che** gli eventi vengano accettati solo su partite `IN_CORSO` e solo dopo il minuto 1 dall'inizio.

---

## Contesto di dominio

- Solo partite in stato `IN_CORSO` accettano eventi di gioco (PRD §6.1, §7.4).
- **Regola del minuto 1:** l'evento è accettato solo se `NOW() >= started_at + 60 secondi` (PRD §7.4).
- Scopo del ritardo: evitare inserimenti accidentali al cambio di stato.
- L'evento viene salvato con stato `community` (🟡 non verificato).
- Il campo `created_by` registra l'`user_id` dell'inseritore (audit trail).
- Socket.io non ancora implementato: nessun emit in questa fase.

---

## Tipi di evento validi (PRD §7.1)

| Categoria    | event_type                                                                                 |
|-------------|--------------------------------------------------------------------------------------------|
| Punteggio   | `meta`, `trasformazione`, `calcio_punizione`, `drop_goal`, `meta_punizione`                |
| Disciplinare | `cartellino_giallo`, `cartellino_rosso`, `penalty_concesso`                               |
| Gioco       | `inizio_primo_tempo`, `fine_primo_tempo`, `inizio_secondo_tempo`, `fine_partita`, `sostituzione`, `infortunio` |

---

## Criteri di accettazione

- [ ] `POST /api/v1/matches/:matchId/events` richiede JWT valido → `401` se assente
- [ ] Partita non trovata → `404`
- [ ] Partita non in stato `IN_CORSO` → `422` con messaggio esplicito
- [ ] Richiesta entro i primi 60 secondi dall'inizio → `422` con messaggio "regola del minuto 1"
- [ ] Campi obbligatori: `event_type`, `minute`, `team_id`
- [ ] `event_type` non valido → `422`
- [ ] `minute` deve essere ≥ 1 e intero → `422` se non valido
- [ ] Campi opzionali: `player_id`, `description`
- [ ] Evento persistito con `reliability = 'community'`
- [ ] Restituisce `201 Created` con il body dell'evento

### Risposta
```json
{
  "id": "uuid",
  "matchId": "uuid",
  "eventType": "meta",
  "minute": 12,
  "teamId": "uuid",
  "playerId": null,
  "description": null,
  "reliability": "community",
  "createdBy": "user_id",
  "createdAt": "2026-06-01T15:12:00Z"
}
```

---

## Note tecniche

- Controller: `server/controllers/matchController.js` → handler `addMatchEvent`
- Route già registrata: `POST /api/v1/matches/:matchId/events` con `requireAuth` + `rateLimiter.write`
- La partita deve avere colonna `started_at DATETIME NULL` — settata dal controller `updateMatchStatus` quando lo stato passa a `IN_CORSO`
- Socket.io emit (`match:event_added`) → fuori scope, task separato

---

## Out of scope (BE-015)

- Consensus e conferma evento (BE-016)
- Calcolo PA score per l'inseritore
- Emissione evento Socket.io real-time
- Verifica livello utente (Level ≥ 1) — gestita in task separato PA/livelli
