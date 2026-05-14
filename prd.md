# PRD — RugbyTracker Community

**Product Requirements Document**
Versione 1.0 | Maggio 2026
Status: **Bozza**

---

## Indice

1. [Panoramica del Prodotto](#1-panoramica-del-prodotto)
2. [Obiettivi e Metriche di Successo](#2-obiettivi-e-metriche-di-successo)
3. [Utenti Target e Profili](#3-utenti-target-e-profili)
4. [Architettura dei Profili](#4-architettura-dei-profili) _(incl. §4.5 GDPR minori)_
5. [Campionati e Calendari](#5-campionati-e-calendari)
6. [Gestione Partite](#6-gestione-partite)
7. [Live Match Feed — Inserimento Dati in Tempo Reale](#7-live-match-feed--inserimento-dati-in-tempo-reale)
8. [Statistiche e Dati](#8-statistiche-e-dati)
9. [Sezione Commenti](#9-sezione-commenti)
10. [Sistema di Certificazione dei Dati](#10-sistema-di-certificazione-dei-dati)
11. [Moderazione e Qualità dei Dati](#11-moderazione-e-qualità-dei-dati)
12. [Funzionalità Social](#12-funzionalità-social)
13. [Notifiche](#13-notifiche)
14. [Architettura Tecnica — Linee Guida](#14-architettura-tecnica--linee-guida)
15. [Roadmap](#15-roadmap)
16. [Fuori Scope (v1)](#16-fuori-scope-v1)
17. [Glossario](#17-glossario)

---

## 1. Panoramica del Prodotto

### 1.1 Descrizione

**RugbyTracker Community** è una **Progressive Web App (PWA)** mobile-first dedicata al rugby di categoria B e settori giovanili (Under 6–Under 18, Serie B, Serie C, tornei regionali e provinciali). Installabile da browser su qualsiasi dispositivo senza passare dagli store, funziona anche in condizioni di connettività ridotta grazie al service worker. Colma il vuoto informativo lasciato dai media e dalle federazioni per le categorie minori, dove le informazioni ufficiali sono scarse, ritardate o assenti.

Il prodotto funziona come un **pseudo-social network verticale sul rugby**: i tifosi, i genitori, gli allenatori e i giocatori stessi alimentano la piattaforma in tempo reale durante le partite, inserendo eventi di gioco (mete, trasformazioni, cartellini, calci di punizione, ecc.). I dati certificabili vengono marcati con una fonte ufficiale; tutto il resto rimane visibile ma contrassegnato come "dato community".

### 1.2 Proposta di Valore

| Per chi             | Problema attuale                                                          | Soluzione                             |
| ------------------- | ------------------------------------------------------------------------- | ------------------------------------- |
| Tifosi / Genitori   | Nessuna informazione in tempo reale sulle partite dei figli/squadre amate | Live feed aggiornato dalla community  |
| Giocatori           | Nessuna statistica personale accessibile al di sotto della Serie A        | Profilo giocatore con storico partite |
| Allenatori / Staff  | Nessuno strumento gratuito di raccolta dati per le categorie minori       | Dashboard statistiche per squadra     |
| Dirigenti / Società | Bassa visibilità online per club minori                                   | Profilo squadra ufficiale verificato  |

### 1.3 Principio Fondante: Community-First, Official-When-Possible

> _"Ogni dato inserito dalla community è utile. Ogni dato certificato da fonte ufficiale è oro."_

I dati possono avere quattro stati:

- 🟡 **Community** — inserito da utenti, non verificato
- 🔵 **Confermato** — validato da più utenti (meccanismo di consensus)
- 🟣 **Verificato** — confermato da un utente premium (atleta, squadra o moderatore)
- ✅ **Certificato** — proveniente da fonte ufficiale (FIR, sito federazione, arbitro registrato)

---

## 2. Obiettivi e Metriche di Successo

### 2.1 Obiettivi di Business (12 mesi)

- Raggiungere **50 campionati attivi** mappati sulla piattaforma
- Acquisire **5.000 utenti registrati** nei primi 6 mesi
- Avere almeno **70% delle partite programmate** con almeno un evento live inserito
- Raggiungere un **NPS ≥ 40** tra gli utenti attivi

### 2.2 KPI Operativi

| KPI                             | Target M3 | Target M6 | Target M12 |
| ------------------------------- | --------- | --------- | ---------- |
| Utenti registrati               | 500       | 5.000     | 20.000     |
| Partite con dati live           | 30%       | 70%       | 85%        |
| Commenti per partita (media)    | 3         | 8         | 15         |
| Dati certificati (% sul totale) | 5%        | 20%       | 40%        |
| DAU / MAU ratio                 | 15%       | 25%       | 35%        |

---

## 3. Utenti Target e Profili

### 3.1 Personas

**🏉 Il Genitore Presente**
Marco, 42 anni. Suo figlio gioca nell'Under 14 locale. Va a ogni partita ma quando non può essere presente non ha modo di seguire il risultato in tempo reale. Vuole aggiornamenti veloci, semplici, senza dover installare app complicate.

**📊 Il Tifoso Statistico**
Giulia, 28 anni. Segue la squadra locale in Serie C da anni. Compila già a mano le statistiche delle partite su un foglio Excel. Vuole uno strumento che faccia questo per lei e permetta di confrontare i dati nel tempo.

**🏋️ Il Giocatore Emergente**
Luca, 17 anni. Gioca nell'Under 18 provinciale. Vuole un profilo personale dove raccogliere le sue mete segnate, i minuti giocati, la sua progressione. Non esiste nulla di simile per la sua categoria.

**👔 Il Dirigente del Club**
Roberto, 55 anni. Gestisce un club con 4 squadre (seniores + 3 giovanili). Vuole che il club abbia visibilità online e che i risultati delle proprie squadre siano facilmente trovabili. Non ha budget per soluzioni enterprise.

---

## 4. Architettura dei Profili

La piattaforma distingue quattro tipi di profilo:

| Tipo profilo              | Rappresenta                                       | Accesso speciale                                   |
| ------------------------- | ------------------------------------------------- | -------------------------------------------------- |
| **Utente normale**        | Persona fisica registrata                         | Lettura, contributi, follow                        |
| **Utente amministratore** | Staff della piattaforma                           | Moderazione globale, gestione utenti               |
| **Giocatore**             | Atleta (entità dati + profilo utente collegabile) | Verifica dati propri, stato premium                |
| **Squadra**               | Società sportiva o sezione                        | Gestione pagina, conferma risultati, stato premium |
| **Arbitro**               | Arbitro registrato (FIR o federazione)            | Convalida eventi di gara, stato premium            |

Gli utenti di tipo **Giocatore**, **Squadra** e **Arbitro** sono considerati utenti **premium** ai fini della validazione dei dati (vedi §1.3).

### 4.1 Profilo Utente

Rappresenta una **persona fisica** registrata sulla piattaforma.

**Dati del profilo:**

- Nome utente (pubblico) + nome reale (opzionale)
- Avatar / foto profilo
- Ruolo dichiarato: `Tifoso | Genitore | Giocatore | Allenatore | Dirigente | Media`
- Squadre seguite (follow)
- Campionati seguiti (follow)
- Giocatori seguiti (follow)
- Storico contributi (eventi inseriti, commenti, validazioni)
- **Punteggio Affidabilità** (vedi §11)
- Badge guadagnati

**Livelli utente:**

| Livello | Nome         | Requisito                     | Privilegi aggiuntivi               |
| ------- | ------------ | ----------------------------- | ---------------------------------- |
| 0       | Spettatore   | Registrazione                 | Solo lettura + commenti            |
| 1       | Tifoso       | 5 contributi approvati        | Inserimento eventi live            |
| 2       | Cronista     | 50 contributi + 80% accuracy  | Inserimento senza delay            |
| 3       | Redattore    | 200 contributi + 90% accuracy | Moderazione leggera                |
| 4       | Verificatore | Nomina da admin               | Conferma dati, gestione campionati |

**Caso speciale — Giocatore Verificato:**
Un utente può richiedere di collegare il proprio profilo utente a un **profilo giocatore** (entità separata nel database). La verifica avviene tramite approvazione del dirigente della squadra di appartenenza, moderatori o tramite documento (tesserino FIR).

### 4.2 Profilo Squadra

Rappresenta una **società sportiva** o una sua sezione.

**Dati del profilo:**

- Nome ufficiale + denominazione breve
- Logo / colori sociali
- Città / provincia / regione
- Categoria principale + eventuali squadre satellite (es. Seniores, Under 18, Under 16…)
- Campo di gioco (nome + indirizzo + coordinate)
- Contatti ufficiali (sito web, social)
- Responsabile/i della pagina (ruolo: `Admin Squadra`)
- Elenco giocatori collegati (con ruolo e numero di maglia)
- Storico partite e statistiche aggregate

**Gestione della pagina squadra:**

- La pagina è creabile da chiunque per squadre non ancora presenti (stato: _non rivendicata_)
- Un dirigente o allenatore può **rivendicare** la pagina inviando documentazione (tesserino FIR / affiliazione)
- Le pagine rivendicate e verificate ricevono il badge ✅ **Squadra Verificata**
- Gli Admin Squadra possono: aggiungere/rimuovere giocatori, modificare i dati, confermare i risultati ufficiali delle partite

### 4.3 Profilo Giocatore (entità dati)

Entità separata dal profilo utente, aggregatrice di statistiche.

**Dati:**

- Nome, cognome, data di nascita (opzionale / privacy)
- Ruolo/i in campo (`Pilone | Tallonatore | … | Estremo`)
- Numero di maglia preferenziale
- Squadra/e di appartenenza (con date)
- Statistiche aggregate: mete, cartellini, minuti giocati, presenze
- Storico partite con dettaglio eventi

Un profilo giocatore può essere:

- **Creato dalla community** (dati base, non verificato)
- **Collegato a un utente** (il giocatore stesso si collega al suo profilo)
- **Verificato dalla squadra** (Admin Squadra conferma l'associazione)

### 4.4 Profilo Arbitro (utente premium)

Rappresenta un **arbitro registrato** presso la FIR o una federazione riconosciuta.

**Dati del profilo:**

- Nome utente (pubblico) + nome reale (opzionale)
- Avatar / foto profilo
- Numero di tessera arbitrale (FIR o federazione di appartenenza)
- Categoria arbitrale (es. `Nazionale | Regionale | Provinciale`)
- Storico partite arbitrate (collegato ai match della piattaforma)
- Badge 🟣 **Arbitro Verificato**

**Verifica e privilegi:**

- La verifica avviene tramite caricamento del tesserino arbitrale FIR o documento equivalente
- Una volta verificato, il profilo riceve lo stato premium e può convalidare eventi di gara con peso 🟣 **Verificato** (vedi §1.3)
- Può confermare o correggere eventi inseriti dalla community per le partite a cui ha partecipato come arbitro

### 4.5 Profilo Giocatore Minorenne — Gestione da Tutore (GDPR)

I profili giocatore riferiti a **soggetti minorenni (< 18 anni)** sono soggetti a vincoli GDPR specifici che impattano la loro creazione e gestione.

#### Regola fondamentale

> Un profilo giocatore minorenne **non può essere creato autonomamente dal minore**. Deve essere creato e gestito esclusivamente tramite il profilo di un **utente adulto tutore** registrato sulla piattaforma.

#### Flusso di creazione

1. Un utente adulto (≥ 18 anni) accede alla sezione "Gestisci profili tutelati"
2. Dichiara il rapporto di tutela (genitore / tutore legale / delegato della società sportiva)
3. Crea il profilo giocatore inserendo i dati del minore
4. Il profilo viene associato all'account tutore come profilo dipendente (`guardian_managed: true`)
5. Tutte le azioni sul profilo del minore (modifica dati, collegamento a partite, verifica) richiedono autenticazione del tutore

#### Oscuramento dati sensibili (GDPR Art. 8)

I dati personali dei giocatori minorenni sono soggetti a **oscuramento selettivo** in base al consenso:

| Dato                          | Visibilità default (senza consenso esplicito) | Con consenso tutore |
| ----------------------------- | --------------------------------------------- | ------------------- |
| Nome e cognome per intero     | ❌ Oscurato → mostra solo nome + iniziale cognome (es. "Luca R.") | ✅ Visibile |
| Data di nascita               | ❌ Oscurata → mostra solo anno (es. "2011")   | ✅ Visibile |
| Foto profilo                  | ❌ Non caricabile / avatar generico           | ✅ Caricabile dal tutore |
| Statistiche di gioco          | ✅ Sempre visibili (dati non identificativi)  | ✅ Visibili |
| Squadra di appartenenza       | ✅ Sempre visibile                            | ✅ Visibile |
| Numero maglia                 | ✅ Sempre visibile                            | ✅ Visibile |

Il consenso è revocabile in qualsiasi momento dal tutore; la revoca ripristina l'oscuramento entro 24 ore.

#### Vincoli operativi

- Il minore **non può registrarsi autonomamente** come utente se risulta già presente come profilo giocatore con `guardian_managed: true`
- Se un minore completa i 18 anni, il sistema notifica il tutore e offre il trasferimento del profilo all'utente diretto (che deve accettare)
- L'Admin Squadra può aggiungere un giocatore minorenne alla rosa solo se esiste un profilo tutore collegato o tramite importazione massiva con conferma del dirigente
- I log di audit su profili minorenni sono conservati per il periodo minimo previsto dal GDPR e non accessibili a utenti non amministratori

### 4.6 Profilo Utente Amministratore

Rappresenta un membro dello **staff interno della piattaforma**.

**Dati del profilo:**

- Nome utente interno
- Ruolo amministrativo: `Super Admin | Moderatore | Editor`
- Log delle azioni effettuate (audit trail)

**Privilegi per ruolo:**

| Ruolo       | Azioni consentite                                                                |
| ----------- | -------------------------------------------------------------------------------- |
| Super Admin | Accesso completo: utenti, dati, configurazione piattaforma                       |
| Moderatore  | Gestione segnalazioni, ban utenti, modifica/rimozione contenuti                  |
| Editor      | Inserimento e modifica dati certificati (campionati, squadre ufficiali, arbitri) |

Gli amministratori non sono utenti premium ai fini del consensus sui dati, ma hanno facoltà di assegnare lo stato ✅ **Certificato** ai dati verificati da fonti ufficiali.

---

## 5. Campionati e Calendari

### 5.1 Struttura Gerarchica

```
Federazione (es. FIR / Comitato Regionale)
  └── Campionato (es. "Serie C Lombardia 2025-26")
        └── Girone (es. "Girone A")
              └── Partita
```

### 5.2 Importazione del Calendario

Il calendario di ogni campionato viene inserito **prima dell'inizio della stagione** e costituisce lo scheletro su cui si appoggia tutta la creazione automatica delle partite.

**Flussi di importazione:**

1. **Import manuale strutturato** — Un utente con ruolo Verificatore o Admin Squadra inserisce le giornate, le squadre coinvolte, date e orari tramite interfaccia dedicata o upload CSV/JSON con template predefinito.

2. **Import da fonte ufficiale** (dove disponibile) — Integrazione con API o scraping supervisionato di siti federali (FIR, Comitati Regionali). I calendari così importati ricevono il badge ✅ Certificato.

3. **Aggiornamento infraseason** — Rinvii, recuperi e variazioni di orario possono essere segnalati da qualsiasi utente Livello ≥ 1 e confermati da Admin Squadra o Verificatore.

**Regola:** Una partita inserita da calendario è immediatamente visibile sulla piattaforma nello stato `PROGRAMMATA`. Non è possibile inserire eventi di gioco prima dell'orario ufficiale di inizio.

---

## 6. Gestione Partite

### 6.1 Ciclo di Vita di una Partita

```
PROGRAMMATA → IN CORSO → TERMINATA → [CERTIFICATA]
                  ↑
           (dopo 1 minuto dall'inizio)
           prime modifiche abilitate
```

**PROGRAMMATA**

- Visibile a tutti
- Mostra: data, ora, luogo, squadre, giornata di campionato
- Nessun inserimento dati di gioco possibile
- Commenti: abilitati dall'inizio della partita

**IN CORSO**

- Trigger: automatico (basato sui dati presi dai siti del crv)
- **Sblocco modifiche:** trascorso **1 minuto dall'inizio**, gli utenti Livello ≥ 1 possono inserire eventi di gioco
- Il ritardo di 1 minuto serve a evitare inserimenti accidentali prima del fischio
- Il live feed si aggiorna in tempo reale per tutti gli utenti sulla pagina

**TERMINATA**

- Trigger: un utente Livello ≥ 1 segna la partita come terminata (con conferma)
- Il risultato finale viene "congelato" dopo 30 minuti dalla fine (salvo contestazioni)
- Rimangono aperti: commenti (solo peer un determinato periodo dopo), correzioni segnalate, certificazione

**CERTIFICATA**

- Il risultato e gli eventi principali sono stati confermati da fonte ufficiale o da Admin Squadra di entrambe le squadre
- I dati certificati alimentano le classifiche e le statistiche aggregate

### 6.2 Visualizzazione della Partita

La pagina di una singola partita è strutturata come segue:

```
┌─────────────────────────────────────────────┐
│  [Stemma A]  Squadra A  XX – YY  Squadra B  [Stemma B] │
│             Giornata 5 | Serie C | 14:30     │
├─────────────────────────────────────────────┤
│  LIVE FEED (timeline cronologica degli eventi)          │
│  3'  🟨 Cartellino giallo — Rossi M. (A)    │
│  7'  🏉 Meta — Bianchi L. (B)               │
│  12' ⚽ Trasformazione — Bianchi L. (B)     │
│  …                                           │
├─────────────────────────────────────────────┤
│  [+ Aggiungi evento]   (utenti Livello ≥ 1) │
├─────────────────────────────────────────────┤
│  STATISTICHE PARZIALI (tab)                 │
├─────────────────────────────────────────────┤
│  COMMENTI (sezione scrollabile in basso)    │
└─────────────────────────────────────────────┘
```

---

## 7. Live Match Feed — Inserimento Dati in Tempo Reale

### 7.1 Tipi di Evento Inseribili

| Categoria        | Evento                    | Punti assegnati | Note                            |
| ---------------- | ------------------------- | --------------- | ------------------------------- |
| **Punteggio**    | Meta                      | +5              | Richiede giocatore + squadra    |
|                  | Trasformazione            | +2              | Collegata a una meta precedente |
|                  | Calcio di punizione       | +3              |                                 |
|                  | Drop goal                 | +3              |                                 |
|                  | Meta di punizione         | +5              | Senza giocatore specifico       |
| **Disciplinare** | Cartellino giallo         | —               | Richiede giocatore + minuto     |
|                  | Cartellino rosso          | —               | Richiede giocatore + minuto     |
|                  | Penalty concesso          | —               | Opzionale                       |
| **Gioco**        | Inizio primo tempo        | —               | Con orario                      |
|                  | Fine primo tempo          | —               | Con punteggio parziale          |
|                  | Inizio secondo tempo      | —               |                                 |
|                  | Fine partita              | —               | Con punteggio finale            |
|                  | Sostituzione              | —               | Giocatore uscente + entrante    |
|                  | Infortunio (segnalazione) | —               | Solo a scopo informativo        |

### 7.2 Interfaccia di Inserimento Evento

L'inserimento è progettato per essere **rapido e mobile-first**: massimo 3 tap per registrare un evento standard.

**Flusso inserimento meta (esempio):**

1. Tap su **[+ Aggiungi evento]**
2. Seleziona categoria: `Punteggio`
3. Seleziona tipo: `Meta`
4. Seleziona squadra: `[A] / [B]`
5. Seleziona/cerca giocatore (opzionale — si può inserire "Giocatore non identificato")
6. Minuto di gioco (pre-compilato con il minuto corrente, modificabile)
7. **[Conferma]** → l'evento appare nel feed

### 7.3 Gestione dei Conflitti

Quando due utenti inseriscono eventi contraddittori (es. meta assegnata a giocatori diversi), il sistema:

1. Mostra entrambe le versioni nel feed con stato `⚠️ In verifica`
2. Gli altri utenti presenti sulla pagina possono **votare** quale versione è corretta
3. Dopo 3 voti concordanti, la versione vincente diventa `🔵 Confermata`
4. L'Admin Squadra o un Verificatore può risolvere manualmente il conflitto in qualsiasi momento

### 7.4 Regola del Minuto 1

- Lo stato `IN CORSO` si attiva al momento dell'avvio automatico della partita
- Il pulsante **[+ Aggiungi evento]** rimane **disabilitato** per i primi **60 secondi**
- Dopo 60 secondi, il pulsante si sblocca con una micro-animazione (feedback visivo)
- Scopo: evitare inserimenti prematuri per errore, dare tempo all'utente di rendersi conto che la partita è effettivamente iniziata

---

## 8. Statistiche e Dati

### 8.1 Statistiche per Partita

- Punteggio per tempo
- Marcatori (mete, trasformazioni, calci)
- Cartellini (gialli/rossi per squadra)
- Numero di sostituzioni
- Mappa eventi (timeline)

### 8.2 Statistiche per Giocatore

- Presenze totali per stagione / campionato
- Mete segnate, trasformazioni, calci segnati
- Cartellini (gialli / rossi)
- Minuti giocati (se inseriti tramite sostituzioni)
- Partite come capitano (se segnalato)

### 8.3 Statistiche per Squadra

- Classifica nel campionato (calcolata automaticamente dai risultati certificati)
- W/L/D per stagione
- Punti fatti / subiti aggregati
- Marcatori più prolifici
- Giocatori più "disciplinati" (cartellini)
- Trend risultati (ultime N partite)

### 8.4 Statistiche per Campionato

- Classifica marcatori assoluta
- Squadra più prolifica in attacco / più solida in difesa
- Numero di partite completate / in attesa di certificazione
- Top 3 mete della stagione (votate dalla community)

### 8.5 Livello di Affidabilità dei Dati

Ogni statistica mostra un indicatore visivo del livello di affidabilità:

- 🟡 Solo dati community non verificati
- 🔵 Dati confermati da consensus (≥ 3 utenti concordanti)
- ✅ Dati certificati da fonte ufficiale o Admin Squadra

---

## 9. Sezione Commenti

Ogni pagina partita include una sezione commenti **separata dal live feed degli eventi**.

### 9.1 Caratteristiche

- **Visibilità:** pubblica, leggibile senza registrazione
- **Scrittura:** richiede account Livello ≥ 0 (Spettatore)
- **Lunghezza:** massimo 500 caratteri per commento
- **Formattazione:** testo semplice + emoji
- **Thread:** risposta a un commento esistente (max 1 livello di nesting)
- **Menzioni:** `@nomeutente` per notificare un altro utente
- **Reazioni:** 👍 🏉 🔥 😮 (4 reazioni predefinite, senza dislike)
- **Ordinamento:** cronologico (default), con opzione "più apprezzati"

### 9.2 Sezioni Temporali dei Commenti

I commenti sono organizzati in tre fasi automatiche:

- **Durante** — commenti inseriti mentre la partita è IN CORSO (marcati con il minuto corrente del match)
- **Post-partita** — dopo il fischio finale

### 9.3 Moderazione dei Commenti

- I commenti possono essere **segnalati** da qualsiasi utente registrato
- Dopo 3 segnalazioni, il commento viene nascosto automaticamente e messo in coda di moderazione
- I Moderatori (Livello ≥ 3) possono eliminare, ripristinare o silenziare l'autore
- **Linguaggio offensivo:** filtro automatico di primo livello (lista nera aggiornabile)
- **Spam / flooding:** max 5 commenti per utente per partita nelle prime 2 ore

---

## 10. Sistema di Certificazione dei Dati

### 10.1 Fonti di Certificazione Accettate

| Fonte                            | Tipo                 | Metodo                           |
| -------------------------------- | -------------------- | -------------------------------- |
| FIR (Federazione Italiana Rugby) | Ufficiale nazionale  | API / scraping supervisionato    |
| Comitati Regionali FIR           | Ufficiale regionale  | Import CSV / link ufficiale      |
| Arbitro registrato               | Ufficiale di partita | Profilo verificato con tesserino |
| Admin Squadra (entrambe)         | Semi-ufficiale       | Conferma doppia (A + B)          |
| Consensus community (≥ 5 voti)   | Community            | Meccanismo interno               |

### 10.2 Flusso di Certificazione Post-Partita

1. La partita termina → stato `TERMINATA`
2. Admin Squadra di entrambe le squadre ricevono notifica per conferma risultato
3. Se entrambi confermano → stato `CERTIFICATA` (badge doppia conferma)
4. Se solo uno conferma → stato `PARZIALMENTE CERTIFICATA`
5. Se nessuno conferma entro 7 giorni → rimane `TERMINATA` (dati community)
6. Un Verificatore può certificare d'ufficio allegando fonte documentale

### 10.3 Impatto sui Dati

Solo le partite in stato `CERTIFICATA` alimentano:

- Le classifiche ufficiali di campionato
- Le statistiche aggregate "certificate" dei giocatori
- I record storici della piattaforma

---

## 11. Moderazione e Qualità dei Dati

### 11.1 Punteggio Affidabilità Utente

Ogni utente accumula un **Punteggio Affidabilità** (PA) basato sulla qualità storica dei suoi contributi.

**Aumenta quando:**

- Un evento inserito viene confermato dalla community (+2)
- Un evento inserito viene certificato ufficialmente (+5)
- Una segnalazione di errore viene accettata (+3)
- Un commento riceve molte reazioni positive (+1 ogni 10 reazioni)

**Diminuisce quando:**

- Un evento inserito viene contestato e rimosso (-3)
- Un commento viene eliminato per violazione (-5)
- Un tentativo di inserimento duplicato viene rilevato (-1)

### 11.2 Limiti Anti-Abuso

- Max **10 eventi per partita** per utente Livello 0–1 (anti-flooding)
- Impossibile inserire eventi in partite di squadre a cui non si è mai stati associati se il PA è < 20 (anti-spam per campionati lontani)
- IP ban temporaneo dopo 3 violazioni in 24 ore

### 11.3 Ruolo dei Moderatori

I Moderatori (Livello 3–4) hanno accesso a:

- Coda di moderazione commenti
- Log eventi controversi
- Tool di merge profili duplicati (giocatori / squadre)
- Segnalazione di campionati con dati inconsistenti agli admin

---

## 12. Funzionalità Social

### 12.1 Follow

- Utente può seguire: squadre, campionati, altri utenti, giocatori
- Il feed personale mostra aggiornamenti delle entità seguite
- Notifiche configurabili per ogni tipo di entità seguita

### 12.2 Condivisione

- Ogni evento di gioco, ogni partita, ogni profilo ha un URL pubblico condivisibile
- Card di condivisione ottimizzate per WhatsApp, Telegram, Twitter/X
- Snippet "risultato live" embeddabile (iframe o widget)

### 12.3 Attività e Contributi

- Ogni utente ha una pagina pubblica con la propria "activity feed" (eventi inseriti, commenti, validazioni)
- La trasparenza dei contributi aumenta la fiducia nella piattaforma

### 12.4 Badge e Gamification

| Badge         | Criterio                                     |
| ------------- | -------------------------------------------- |
| 🏉 Prima Meta | Primo evento live inserito                   |
| 📅 Habitué    | 10 partite seguite in live                   |
| 🎯 Cecchino   | 50 eventi inseriti con accuracy > 90%        |
| 🏆 Campione   | Seguire un campionato per un'intera stagione |
| 🛡️ Guardiano  | 20 moderazioni effettuate                    |
| ⭐ Fondatore  | Tra i primi 500 iscritti                     |

---

## 13. Notifiche

### 13.1 Tipologie

| Trigger                                       | Canale        | Default            |
| --------------------------------------------- | ------------- | ------------------ |
| Partita di squadra seguita inizia             | Push + In-app | ON                 |
| Meta / evento importante in live              | Push          | ON (configurabile) |
| Risultato finale disponibile                  | Push          | ON                 |
| Risposta a un proprio commento                | Push + In-app | ON                 |
| Menzione in un commento                       | Push + In-app | ON                 |
| Evento inserito confermato/rifiutato          | In-app        | ON                 |
| Nuovo giocatore aggiunto alla propria squadra | In-app        | OFF                |
| Digest settimanale risultati                  | Email         | OFF                |

### 13.2 Controllo Utente

- Ogni tipo di notifica è attivabile/disattivabile individualmente
- Modalità "silenziosa": nessuna push, solo in-app
- Do Not Disturb configurabile per fasce orarie

---

## 14. Architettura Tecnica — Linee Guida

> Questa sezione definisce le direzioni architetturali. Il dettaglio tecnico è demandato al documento di architettura separato (TDD).

### 14.1 Stack Consigliato

| Componente          | Tecnologia suggerita        | Motivazione                                        |
| ------------------- | --------------------------- | -------------------------------------------------- |
| PWA                 | Nuxt (Vue.js) + PWA module  | SSR/SSG, SEO, installabile, offline via SW         |
| Backend             | Node.js + Express           | Ecosistema, flessibilità, velocità                 |
| Database principale | MySQL + phpMyAdmin          | Relazionale, diffuso, gestione visuale             |
| Real-time           | Socket.io                   | Aggiornamenti live del feed                        |
| Cache               | Redis                       | Sessioni, rate limiting, dati hot                  |
| Storage media       | S3-compatible               | Loghi, avatar, documenti di verifica               |
| Auth                | JWT + OAuth (Google, Apple) | UX semplificata                                    |
| Service Worker      | Workbox (via Nuxt PWA)      | Caching offline, background sync, push nativi      |

### 14.2 Requisiti Non Funzionali

- **Latenza live feed:** < 2 secondi dalla pubblicazione di un evento alla visualizzazione di tutti gli utenti connessi
- **Disponibilità:** 99,5% uptime (tenendo conto che i picchi sono il sabato/domenica mattina)
- **Scalabilità:** architettura in grado di gestire 500 utenti concorrenti su una singola partita popolare
- **Privacy:** GDPR compliant (Art. 8); i profili giocatori minorenni (< 18 anni) sono creati e gestiti esclusivamente dall'account di un adulto tutore — il minore non può creare né gestire autonomamente il proprio profilo. I dati sensibili (nome completo, data di nascita, foto) sono oscurati di default e visibili solo con consenso esplicito del tutore, revocabile in qualsiasi momento (vedi §4.5)
- **Offline graceful (PWA):** il service worker mantiene in cache l'ultima versione dei dati; se la connessione cade durante una partita live l'utente vede comunque gli eventi già scaricati e gli inserimenti in coda vengono sincronizzati al ripristino della connessione

### 14.3 Sicurezza

- Rate limiting su tutti gli endpoint di scrittura
- Validazione server-side di tutti i dati inseriti dalla community
- Audit log immutabile di tutte le modifiche a eventi di partita certificata
- Nessun dato personale sensibile nei profili giocatori minorenni senza consenso del tutore registrato
- I profili minorenni sono flag `guardian_managed: true` nel DB; ogni operazione di scrittura verifica che il richiedente sia il tutore associato
- Il trasferimento del profilo al compimento dei 18 anni richiede accettazione attiva dell'utente diretto

---

## 15. Roadmap

### Fase 0 — Fondamenta (Mesi 1–2)

- [ ] Autenticazione utenti (email + Google)
- [ ] CRUD profili Utente e Squadra
- [ ] Struttura campionati e import calendario manuale
- [ ] Visualizzazione partite programmate

### Fase 1 — MVP Live (Mesi 3–4)

- [ ] Live feed eventi partita (senza real-time: refresh manuale)
- [ ] Inserimento eventi con regola del minuto 1
- [ ] Sezione commenti base
- [ ] Statistiche partita semplici
- [ ] Sistema follow squadre

### Fase 2 — Social e Qualità (Mesi 5–6)

- [ ] Real-time aggiornamenti (WebSocket / Socket.io)
- [ ] Punteggio Affidabilità utente
- [ ] Sistema di consensus e conflitti
- [ ] Profili giocatore con statistiche aggregate
- [ ] Notifiche push
- [ ] Classifiche campionato automatiche

### Fase 3 — Certificazione e Crescita (Mesi 7–9)

- [ ] Flusso di certificazione Admin Squadra
- [ ] Import calendari da fonti ufficiali (FIR dove disponibile)
- [ ] Badge e gamification
- [ ] Condivisione social ottimizzata
- [ ] Widget embeddabile risultati

### Fase 4 — Espansione (Mesi 10–12)

- [ ] Ottimizzazione PWA: installazione guidata, splash screen, icone per tutti i device
- [ ] Moderazione avanzata
- [ ] Dashboard analytics per Admin Squadra
- [ ] API pubblica (lettura) per terze parti
- [ ] Supporto internazionalizzazione (almeno EN)

---

## 16. Fuori Scope (v1)

Le seguenti funzionalità sono esplicitamente escluse dalla versione 1 per mantenere il focus:

- ❌ Streaming video / highlights video
- ❌ Betting / pronostici
- ❌ Chat diretta tra utenti (DM)
- ❌ Gestione arbitrale ufficiale
- ❌ App dedicata per arbitri (schede partita ufficiali FIR)
- ❌ Integrazione con piattaforme di allenamento (GPS, dati fisici)
- ❌ E-commerce (merchandising, biglietti)
- ❌ Gestione rosa avanzata (contratti, trasferimenti)
- ❌ Supporto categorie femminili (sarà v2 prioritaria)
- ❌ Rugby a 7 / Beach Rugby (sarà valutato in v2)

---

## 17. Glossario

| Termine               | Definizione                                                                     |
| --------------------- | ------------------------------------------------------------------------------- |
| **Meta**              | Azione che vale 5 punti nel rugby union (touchdown in zona di meta)             |
| **Trasformazione**    | Calcio successivo alla meta che vale 2 punti aggiuntivi                         |
| **Drop goal**         | Calcio al volo durante il gioco che vale 3 punti                                |
| **FIR**               | Federazione Italiana Rugby                                                      |
| **Categoria B**       | Nel contesto italiano: campionati di Serie B, Serie C, competizioni regionali   |
| **Settore Giovanile** | Campionati Under 6 fino a Under 18                                              |
| **Admin Squadra**     | Utente verificato con diritti di gestione su una specifica pagina squadra       |
| **Verificatore**      | Utente di livello 4, nominato dagli admin di piattaforma                        |
| **PA**                | Punteggio Affidabilità — metrica interna di qualità dei contributi di un utente |
| **Live Feed**         | Flusso cronologico degli eventi di gioco inseriti durante una partita           |
| **Consensus**         | Meccanismo di validazione basato su voti multipli della community               |
| **Dato Certificato**  | Dato proveniente o confermato da fonte ufficiale verificata                     |

---

_Documento redatto per uso interno del team di prodotto._
_Versione 1.0 — da revisionare dopo la fase di discovery con utenti pilota._
_Prossima revisione pianificata: 30 giorni dopo il lancio della Fase 1._
