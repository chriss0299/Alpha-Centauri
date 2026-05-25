# TODO

## Sicurezza

- [ ] **Registrazione — anti user-enumeration (Opzione B)**
  Attualmente il messaggio è generico (Opzione A). Quando si implementano le email transazionali, migrare a Opzione B: mostrare sempre "Controlla la tua email" ma inviare email diverse se l'account esiste già ("qualcuno ha tentato di registrarsi con il tuo account") o è nuovo (conferma registrazione).
  File: `server/controllers/authController.js` → funzione `register`.

## Auth

- [ ] **Apple Sign-In** — pulsante rimosso dalla login page, da implementare quando disponibile.

## Password

- [ ] **Recupero password** — pagina `/recupera-password` è placeholder. Implementare flow completo con email transazionale + token one-time.
