# BE-010 — Controller `createMatch` (solo Admin / Editor)

## User Stories

### Utente (Admin / Editor)
**Come** Super Admin o Editor della piattaforma,
**voglio** poter creare una nuova partita nel sistema tramite API,
**in modo che** il calendario campionato sia popolato con le partite programmate, visibili a tutti gli utenti fin da subito nello stato `PROGRAMMATA`.

### Sviluppatore
**Come** sviluppatore backend,
**voglio** implementare il controller `createMatch` con catena middleware `authenticateJWT → requireRole → validateCreateMatch → createMatch`,
**in modo che** la creazione sia autenticata, autorizzata, validata e persistita in un unico flusso coerente senza logica dispersa nella route.

---

## Contesto di dominio

- Solo i ruoli `Super Admin` e `Editor` possono creare partite (PRD §4.6).
- Una partita appena creata entra nello stato `PROGRAMMATA` (PRD §6.1).
- Deve essere associata a un campionato/girone esistente (PRD §5.1).
- Non è possibile inserire eventi di gioco su una partita `PROGRAMMATA`.

---

## Criteri di accettazione

### Autenticazione e autorizzazione
- [ ] La route `POST /api/v1/matches` richiede JWT valido (`Authorization: Bearer <token>`)
- [ ] Restituisce `403 Forbidden` se il ruolo del richiedente non è `super_admin` o `editor`
- [ ] Restituisce `401 Unauthorized` se il token è assente o non valido

### Payload e validazione
- [ ] Campi obbligatori: `home_team_id`, `away_team_id`, `league_id`, `scheduled_at` (ISO 8601), `venue` (opzionale)
- [ ] `home_team_id !== away_team_id` — stessa squadra su entrambi i lati non è ammessa
- [ ] `scheduled_at` deve essere nel futuro al momento della creazione
- [ ] Entrambe le squadre devono appartenere al campionato (`league_id`) specificato
- [ ] Restituisce `422 Unprocessable Entity` con dettaglio errori di validazione se qualche regola è violata

### Creazione
- [ ] La partita viene persistita con stato `PROGRAMMATA`
- [ ] Il campo `created_by` registra l'`user_id` del richiedente (audit trail)
- [ ] Restituisce `201 Created` con il body della partita creata (incluso `id`)

### Risposta
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

- Controller: `server/controllers/matchController.js` → handler `createMatch`
- Route: `POST /api/v1/matches`
- Middleware da applicare in sequenza: `authenticateJWT` → `requireRole(['super_admin', 'editor'])` → `validateCreateMatch` → `createMatch`
- Validazione server-side obbligatoria (CLAUDE.md — Convenzioni API)
- Non triggerare Socket.io: la partita è `PROGRAMMATA`, nessun room attiva
- Vedere `docs/decisions.md` per le decisioni su audit log e stati partita

---

## Out of scope (BE-010)

- Avvio automatico della partita (trigger `IN CORSO`) — storia separata
- Import massivo da CSV/JSON (PRD §5.2, flusso 1)
- Integrazione con API federali (PRD §5.2, flusso 2)
