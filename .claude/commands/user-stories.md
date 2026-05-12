# Skill: /user-stories

Genera o rigenera `docs/user-stories.md` derivando user stories dal codice e dalla documentazione esistente.

## Istruzioni

1. Leggi `prd.md` intero.
2. Leggi `CLAUDE.md` per contesto dominio e convenzioni.
3. Esplora il codice esistente se presente:
   - `database/migrations/` → entità e relazioni (livello DB)
   - `server/models/` e `server/routes/` → endpoint e bisogni (livello BE)
   - `client/pages/` e `client/components/` → pagine e obiettivi (livello FE)
4. Deriva le user stories — **MAI inventare**. Solo ciò che è ricavabile dai file letti.
5. Scrivi/sovrascrivi `docs/user-stories.md` con il risultato.

## Regole

- Formato obbligatorio: `Come [attore], voglio [azione], così che [beneficio].`
- Raggruppare per **attore** poi per **livello** (DB → BE → FE).
- Se un livello non ha ancora codice implementato, derivare le stories dal PRD indicando `(da PRD)` accanto alla story.
- Se un livello ha codice, derivare dall'implementazione reale e indicare `(da codice)`.
- Non duplicare stories già presenti se il file esiste — confrontare e aggiungere solo le nuove.

## Attori

- Utente normale (livelli 0–4: Spettatore, Tifoso, Cronista, Redattore, Verificatore)
- Giocatore (premium)
- Squadra (premium)
- Arbitro (premium)
- Admin (Super Admin, Moderatore, Editor)

## Formato output

```markdown
# User Stories — RugbyTracker Community

> Ultimo aggiornamento: [data]
> Fonte: PRD + codice esistente

---

## Attore: Utente normale

### Livello DB
- Come utente normale, voglio che i miei dati di profilo siano persistiti, così che possa accedere alla mia storia contributiva. (da PRD)

### Livello BE
- Come utente normale, voglio registrarmi con email o OAuth Google/Apple, così che possa accedere alla piattaforma senza creare nuove credenziali. (da PRD)

### Livello FE
- Come utente normale, voglio vedere il live feed di una partita in tempo reale, così che possa seguire l'andamento senza essere allo stadio. (da PRD)

---

## Attore: Giocatore
...
```

## Note

- Aree principali da coprire: autenticazione/profilo, live feed partita, calendario/programmazione, certificazione risultati, sistema PA, notifiche, moderazione.
- Rispettare la regola del minuto 1: eventi inseribili solo dopo 60s dall'inizio partita.
- Non esporre storie che richiedano dati personali di minorenni senza `parental_consent`.
