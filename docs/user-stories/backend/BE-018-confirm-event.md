# BE-018 — Controller `confirmEvent` (contribuisce al consensus)

## User Stories

### Utente (autenticato)
**Come** utente autenticato presente a una partita,
**voglio** poter confermare un evento inserito da un altro utente,
**in modo che** il sistema accumuli consenso e promuova l'evento a stato "confermato" dopo 3 voti concordanti.

### Sviluppatore
**Come** sviluppatore backend,
**voglio** implementare il controller `confirmEvent` su `POST /api/v1/matches/:matchId/events/:eventId/confirm`,
**in modo che** i voti vengano tracciati per utente e la reliability dell'evento venga aggiornata automaticamente al raggiungimento del consensus.

---

## Contesto di dominio

- Threshold consensus: **≥ 3 conferme** da utenti distinti → evento promosso a `confermato` (PRD §7.3).
- Un utente non può confermare lo stesso evento due volte.
- Un utente non può confermare un evento che ha inserito lui stesso.
- La conferma è possibile solo su partite in stato `IN_CORSO` o `TERMINATA`.
- Le conferme vengono tracciate in `event_confirmations (event_id, user_id, confirmed_at)`.

---

## Criteri di accettazione

- [ ] `POST /api/v1/matches/:matchId/events/:eventId/confirm` richiede JWT → `401` se assente
- [ ] Partita non trovata → `404`
- [ ] Evento non trovato o non appartiene alla partita → `404`
- [ ] Partita in stato `PROGRAMMATA` o `CERTIFICATA` → `422`
- [ ] Utente ha già confermato questo evento → `409 Conflict`
- [ ] Utente è l'autore dell'evento → `403 Forbidden`
- [ ] Conferma registrata in `event_confirmations`
- [ ] Se conferme totali ≥ 3 → aggiorna `match_events.reliability = 'confermato'`
- [ ] Restituisce `200 OK` con il conteggio aggiornato

### Risposta
```json
{
  "eventId": "uuid",
  "confirmations": 3,
  "reliability": "confermato"
}
```

---

## Note tecniche

- Controller: `server/controllers/matchController.js` → handler `confirmEvent`
- Route esistente: `POST /api/v1/matches/:matchId/events/:eventId/confirm` con `requireAuth` + `rateLimiter.write`
- Tabella `event_confirmations (event_id, user_id, confirmed_at)` — migration fuori scope
- La promozione a `confermato` avviene atomicamente nella stessa transazione

---

## Out of scope (BE-018)

- Risoluzione manuale conflitti da Admin Squadra / Verificatore
- Downvote / contestazione evento
- Notifiche push al raggiungimento del consensus
- Calcolo PA score per chi ha confermato correttamente
