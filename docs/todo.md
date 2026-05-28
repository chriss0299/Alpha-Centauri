# TODO

## Sicurezza

- [ ] **Registrazione — anti user-enumeration (Opzione B)**
  Attualmente il messaggio è generico (Opzione A). Quando si implementano le email transazionali, migrare a Opzione B: mostrare sempre "Controlla la tua email" ma inviare email diverse se l'account esiste già ("qualcuno ha tentato di registrarsi con il tuo account") o è nuovo (conferma registrazione).
  File: `server/controllers/authController.js` → funzione `register`.

## Auth

- [ ] **Apple Sign-In** — pulsante rimosso dalla login page, da implementare quando disponibile.

## Password

- [ ] **Recupero password** — pagina `/recupera-password` è placeholder. Implementare flow completo con email transazionale + token one-time.

## Redis (follow-up BE-014)

- [ ] **Rate limiter su Redis store** — quando si passerà a multi-istanza del backend, sostituire memory store di `express-rate-limit` con `rate-limit-redis`.
- [ ] **Socket.io Redis adapter** — necessario per scaling multi-istanza del live feed (room `match:<id>` condivise tra processi).
- [ ] **Cache hot data** — valutare cache di letture frequenti (lista campionati, statistiche aggregate squadra) con TTL 60–300s.
