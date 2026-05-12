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

## 2026-05-12 MySQL con phpMyAdmin

**Decisione:** Database relazionale MySQL. Interfaccia admin via phpMyAdmin.

**Motivazione:** Il dominio è altamente relazionale (partite ↔ eventi ↔ utenti ↔ squadre ↔ campionati). Le garanzie ACID sono necessarie per certificazione risultati e audit log. phpMyAdmin per accesso rapido del team senza setup tools aggiuntivi.

**Alternative scartate:** PostgreSQL (ugualmente valido ma MySQL più familiare al team), MongoDB (modello document non adatto a relazioni complesse e transazioni multi-tabella).
