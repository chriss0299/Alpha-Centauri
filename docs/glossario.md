# Glossario — RugbyTracker Community

Termini di dominio con definizione e mapping naming tra layer.
Fonte: `prd.md`. Aggiornare quando si introduce nuova terminologia.

---

## Naming cross-layer

| Dominio | DB (snake_case) | BE (camelCase) | FE (PascalCase) |
|---------|-----------------|----------------|-----------------|
| Partita | `matches` | `match` | `Match` |
| Evento di gioco | `match_events` | `matchEvent` | `MatchEvent` |
| Utente | `users` | `user` | `User` |
| Squadra | `teams` | `team` | `Team` |
| Campionato | `championships` | `championship` | `Championship` |
| Punteggio affidabilità | `reliability_score` | `reliabilityScore` / `paScore` | `ReliabilityScore` |
| Profilo giocatore | `player_profiles` | `playerProfile` | `PlayerProfile` |

---

## Termini di dominio

### PA (Punteggio Affidabilità)
Metrica numerica per utente. Sale con contributi corretti e confermati, scende con inserimenti contestati o rifiutati. Controlla soglie anti-spam e privilegi di inserimento. Non è il livello utente.

### Livello utente
Classificazione 0–4 dell'utente normale: Spettatore (0), Tifoso (1), Cronista (2), Redattore (3), Verificatore (4). Distinto dal PA: il livello è uno status, il PA è una metrica continua.

### Certificazione
Processo che porta una partita da `TERMINATA` a `CERTIFICATA`. Richiede conferma da entrambi gli Admin Squadra o fonte ufficiale. Blocca ulteriori modifiche agli eventi senza audit log.

### Minuto 1 (Regola del minuto 1)
Vincolo: eventi di gioco inseribili solo dopo 60 secondi dall'inizio ufficiale della partita. Vedi `docs/decisions.md`.

### Affidabilità evento
Livello di affidabilità di un singolo evento nel feed:
- 🟡 **Community** — inserito da utente, non verificato
- 🔵 **Confermato** — consensus ≥ 3 utenti indipendenti
- 🟣 **Verificato** — inserito/confermato da utente premium (Giocatore, Squadra, Arbitro)
- ✅ **Certificato** — fonte ufficiale o Admin Squadra di entrambe le squadre

### Match lifecycle
Sequenza stati di una partita: `PROGRAMMATA` → `IN CORSO` → `TERMINATA` → `CERTIFICATA`. Ogni transizione ha regole e attori autorizzati.

### Room Socket
Canale Socket.io dedicato a una partita. Naming: `match:<match_id>`. Tutti i client che seguono quella partita sono iscritti alla room. Gli eventi emessi dal server hanno prefisso `match:`.

### Utente premium
Categoria che include Giocatore, Squadra, Arbitro. Hanno verifiche aggiuntive, peso maggiore nella certificazione dati, accesso a funzionalità esclusive.

### parental_consent
Flag booleano su profilo utente. Se `false` e l'utente è minorenne (< 18 anni), nome e cognome completi non vengono esposti. Obbligatorio per GDPR.

### Evento di gara
Azione registrata durante una partita: meta, trasformazione, drop goal, calcio di punizione, cartellino giallo, cartellino rosso, sostituzione, inizio/fine tempo. Ogni evento ha timestamp, autore, posizione campo opzionale, livello affidabilità.

### Admin Squadra
Ruolo premium assegnato a chi gestisce la pagina ufficiale di una squadra. Può confermare risultati e contribuire alla certificazione partita. Distinto da Admin di sistema (Super Admin, Moderatore, Editor).

### Audit log
Registro immutabile di ogni modifica a eventi di partite `CERTIFICATE`. Contiene: chi ha modificato, cosa, quando, valore precedente e nuovo. Obbligatorio per tracciabilità ufficiale.

### Stack E2E
Ambiente Docker dedicato ai test end-to-end full-stack, isolato da quello di sviluppo. Composto da `mysql-test` (porta 3309), `redis-test` (6380), `server-test` (3002), `client-test` (3003). Orchestrazione via `docker-compose.test.yml`. Lanciato da `npm run test:e2e` (in `client/`). DB pulito ad ogni run grazie a `docker compose down -v`.

### Cypress
Driver per i test E2E, installato come devDependency in `client/`. Lavora contro lo Stack E2E: visita pagine Nuxt sul port 3003 e chiama l'API sul 3002. Custom command `cy.loginByApi()` esegue login via API e popola `localStorage` saltando la UI (utile per test che hanno bisogno di un utente autenticato come precondizione).

### Client Redis (singleton)
Istanza condivisa del client `redis` (node-redis v4) esposta da `server/redis.js`. Tutti i moduli che usano Redis (futuro: cache, rate limiter cross-istanza, adapter Socket.io) la importano da qui anziché crearne una nuova. Stato: `client.isReady` indica connessione attiva. Healthcheck: `GET /api/v1/health/redis`.

### Sliding window log (rate limiting)
Algoritmo di rate limiting che registra ogni richiesta come timestamp in un sorted set (ZSET) per identità. Ad ogni nuova richiesta si rimuovono i timestamp fuori finestra (`ZREMRANGEBYSCORE`) e si conta il resto (`ZCARD`): se il count supera `max`, la richiesta viene rifiutata. A differenza del fixed window non ha "cliff" al boundary della finestra. Implementato in `server/middleware/rateLimitRedis.js` per gli endpoint di scrittura.

### Fail-open (rate limiter)
Comportamento del rate limiter quando il backend Redis non risponde o non è pronto: la richiesta viene **lasciata passare** anziché rifiutata. Scelta deliberata: un Redis down non deve diventare un DoS interno sul traffico scrittura. Vedi `docs/decisions.md` (BE-021).
