# Decisioni architetturali — RugbyTracker Community

Registro delle scelte significative con motivazione. Aggiornare ad ogni nuova decisione rilevante.

---

## 2026-05-12 Real-time via Socket.io (no polling)

**Decisione:** Il live feed partita usa Socket.io con rooms per match.

**Motivazione:** Il polling genera latenza percepita alta durante eventi live (meta, cartellini) e carico inutile sul server tra un evento e l'altro. Socket.io permette push immediato a tutti i client nella room senza overhead.

**Alternative scartate:** HTTP polling ogni N secondi (latenza variabile, carico costante), Server-Sent Events (unidirezionale, non adatto a future feature bidirezionali).

**Dettaglio implementativo:** Room naming `match:<match_id>`. Events con prefisso `match:` (es. `match:event_added`, `match:status_changed`).

---

## 2026-05-12 Autenticazione JWT + OAuth Google/Apple

**Decisione:** Auth basata su JWT con supporto OAuth Google e Apple.

**Motivazione:** JWT stateless riduce dipendenza dal DB per ogni richiesta autenticata. OAuth Google/Apple abbassa barriera registrazione per utenti mobile (target primario PWA).

**Alternative scartate:** Session-based auth (richiede session store condiviso tra istanze, complica scaling), solo email/password (attrito maggiore per utenti mobile).

---

## 2026-05-12 Audit log obbligatorio per partite CERTIFICATE

**Decisione:** Ogni modifica a eventi di partite con stato `CERTIFICATA` produce un record in audit log.

**Motivazione:** I dati certificati hanno valore ufficiale e potrebbero essere contestati. Serve tracciabilità completa di chi ha modificato cosa e quando, per dispute e responsabilità legale.

**Alternative scartate:** Soft delete senza log (nessuna traccia delle modifiche), versioning della riga (più complesso, ridondante con log).

---

## 2026-05-12 PA score come meccanismo anti-spam

**Decisione:** Il Punteggio Affidabilità (PA) dell'utente controlla i privilegi di inserimento eventi.

**Motivazione:** Rate limiting puro blocca utenti legittimi in momenti intensi (fine partita). PA penalizza comportamenti scorretti nel tempo senza bloccare inserimenti legittimi. Crea anche un sistema di reputazione che incentiva contributi di qualità.

**Alternative scartate:** Rate limiting semplice (troppo rigido, cieco alla qualità), moderazione umana pre-pubblicazione (non scalabile per live feed).

---

## 2026-05-12 Regola del minuto 1

**Decisione:** Gli eventi di gioco sono inseribili solo dopo 60 secondi dall'inizio ufficiale della partita.

**Motivazione:** Evita inserimenti prematuri quando la partita non è ancora effettivamente iniziata. Riduce eventi duplicati/errati nei primi secondi quando lo stato `IN CORSO` è appena impostato.

**Alternative scartate:** Nessun limite temporale (troppi inserimenti garbage all'avvio), limite più lungo (es. 5 min — troppo restrittivo per eventi reali nei primi minuti).

---

## 2026-05-18 Docker come ambiente di sviluppo locale

**Decisione:** L'ambiente di sviluppo locale è containerizzato via Docker Compose (MySQL, Redis, phpMyAdmin, server Node.js).

**Motivazione:** Elimina il problema "funziona sul mio PC": ogni dev parte con lo stesso stack senza installare MySQL e Redis in locale. Le migrazioni vengono applicate automaticamente al primo avvio tramite `docker-entrypoint-initdb.d`. Il client Nuxt 3 è predisposto ma commentato fino all'inizializzazione dello scaffold.

**Alternative scartate:** Setup manuale per ogni dev (dipendenze di sistema, versioni divergenti), Vagrant (overhead maggiore, più lento da avviare).

**Dettaglio implementativo:** `docker-compose.yml` in root. Server usa `node --watch` per hot-reload senza dipendenze aggiuntive. `JWT_SECRET` proviene dall'`.env` dell'host via `${JWT_SECRET}` — non hardcodato nel compose.

---

## 2026-05-18 Opaque refresh token con rotazione single-use

**Decisione:** Auth usa access token JWT breve (15m) + refresh token opaco long-lived (30d) con rotazione obbligatoria ad ogni uso.

**Motivazione:** Access token da 7d era troppo lungo per essere sicuro: in caso di leak, l'attaccante avrebbe accesso per 7 giorni senza possibilità di revoca (JWT stateless). Il pattern opaque refresh token permette revoca immediata cancellando il record in DB, e la rotazione single-use rileva token reuse (segnale di compromissione).

**Alternative scartate:** JWT sliding window (ri-emette JWT valido prima della scadenza — non revocabile, nessun segnale di reuse), refresh token multi-use senza rotazione (non rileva compromissione).

**Dettaglio implementativo:** Refresh token = `crypto.randomBytes(32).toString('hex')`; in DB si salva solo lo SHA-256 (`token_hash VARCHAR(64)`) nella tabella `refresh_tokens` (FK → `users.id ON DELETE CASCADE`). `POST /api/v1/auth/refresh` cancella il vecchio record e inserisce il nuovo prima di emettere il nuovo access token. Scaduto il refresh token, il client deve ri-autenticarsi con credenziali.

---

## 2026-05-12 MySQL con phpMyAdmin

**Decisione:** Database relazionale MySQL. Interfaccia admin via phpMyAdmin.

**Motivazione:** Il dominio è altamente relazionale (partite ↔ eventi ↔ utenti ↔ squadre ↔ campionati). Le garanzie ACID sono necessarie per certificazione risultati e audit log. phpMyAdmin per accesso rapido del team senza setup tools aggiuntivi.

**Alternative scartate:** PostgreSQL (ugualmente valido ma MySQL più familiare al team), MongoDB (modello document non adatto a relazioni complesse e transazioni multi-tabella).
