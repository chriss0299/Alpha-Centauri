# TODO

## Sicurezza

- [ ] **Registrazione — anti user-enumeration (Opzione B)**
  Attualmente il messaggio è generico (Opzione A). Quando si implementano le email transazionali, migrare a Opzione B: mostrare sempre "Controlla la tua email" ma inviare email diverse se l'account esiste già ("qualcuno ha tentato di registrarsi con il tuo account") o è nuovo (conferma registrazione).
  File: `server/controllers/authController.js` → funzione `register`.

## Auth

- [ ] **Apple Sign-In** — pulsante rimosso dalla login page, da implementare quando disponibile.

## Password

- [ ] **Recupero password** — pagina `/recupera-password` è placeholder. Implementare flow completo con email transazionale + token one-time.

## Test E2E (follow-up TEST-001)

- [ ] **CI GitHub Actions per E2E** — workflow che lancia `npm run test:e2e` su ogni PR. Caching node_modules e immagini Docker. Upload screenshots/video di failure come artifacts.
- [ ] **Suite E2E completa** — coprire incrementalmente: registrazione utente, creazione partita, regola minuto 1, inserimento evento, certificazione.
- [ ] **Test E2E mobile viewport** — `cy.viewport('iphone-x')` per validare bottom nav e layout PWA mobile.
- [ ] **Visual regression** — valutare Percy o `cypress-image-snapshot` per la home, scheda partita, pagina classifica.

## Redis (follow-up BE-014)

- [ ] **Rate limiter su Redis store** — quando si passerà a multi-istanza del backend, sostituire memory store di `express-rate-limit` con `rate-limit-redis`.
- [ ] **Socket.io Redis adapter** — necessario per scaling multi-istanza del live feed (room `match:<id>` condivise tra processi).
- [ ] **Cache hot data** — valutare cache di letture frequenti (lista campionati, statistiche aggregate squadra) con TTL 60–300s.
