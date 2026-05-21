# BE-002 — Middleware requireRole (verifica ruolo)

**Storia:** Come API REST, voglio verificare che l'utente autenticato abbia uno dei ruoli richiesti prima di accedere a un endpoint protetto, in modo che le risorse sensibili siano accessibili solo ai ruoli autorizzati.

**Criteri di accettazione:**
- [x] Accetta uno o più ruoli come argomento (es. `requireRole(['admin', 'moderator'])`)
- [x] Esegue `requireAuth` internamente prima di controllare il ruolo (nessuna duplicazione nei router)
- [x] Legge `req.user.role` popolato da `requireAuth`
- [x] Restituisce `403 Forbidden` con messaggio `Permessi insufficienti` se il ruolo non è nella lista
- [x] Lascia passare la richiesta (`next()`) se il ruolo è nella lista
- [x] Test unitari coprono: ruolo autorizzato, ruolo non autorizzato, `req.user` assente (caso degenerato)

**Ruoli di dominio validi:**

| Valore `role` nel JWT | Tipo utente          |
| --------------------- | -------------------- |
| `user`                | Utente normale (0–4) |
| `player`              | Giocatore premium    |
| `team`                | Squadra premium      |
| `referee`             | Arbitro premium      |
| `editor`              | Admin Editor         |
| `moderator`           | Admin Moderatore     |
| `superadmin`          | Super Admin          |

**Note tecniche:**
- File: `server/middleware/auth.js` — stub già presente, completare l'implementazione
- Lo stub in `auth.js` usa `roles.includes(req.user.role)`: estendere/raffinare se necessario
- Non aggiungere logica di livello (0–4 Spettatore→Verificatore) qui: quella va nel PA score (task separato)
- Usare `requireRole` nei router come array middleware: `router.post('/...', ...requireRole(['moderator']), controller)`

**Dipendenze:** BE-001 (requireAuth — completato)
**Owner:** Christian (BE-2)
