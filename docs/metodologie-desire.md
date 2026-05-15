# Metodologie di lavoro — DF-1 (Desire)

Guida pratica per data analysis e gestione finanziaria del progetto RugbyTracker Community.

---

## 1. Gestione del Budget

### Framework: Budget a tre colonne

Per ogni voce di spesa tenere traccia di tre valori:

| Voce | Budget previsto | Spesa effettiva | Delta |
|------|-----------------|-----------------|-------|
| Hosting Nuxt/Node | € X | € Y | ± € Z |
| MySQL managed | … | … | … |
| Redis | … | … | … |
| S3-compatible storage | … | … | … |
| Domini / SSL | … | … | … |
| Strumenti dev (CI/CD, etc.) | … | … | … |
| **Totale** | | | |

**Regola del 20%:** se il delta su una voce supera il 20% del previsto, segnalare immediatamente al Tech Lead prima del report mensile.

### Cadenza revisioni

| Frequenza | Azione |
|-----------|--------|
| Ogni 2 settimane | Aggiornamento spese effettive nel tracker |
| Mensile | Report scritto al Tech Lead con delta e proiezione |
| Fine fase | Consuntivo completo + stima fase successiva |

### Stima costi infrastruttura — metodo bottom-up

1. Identificare ogni servizio esterno usato dallo stack (vedi CLAUDE.md → Stack tecnologico)
2. Cercare il piano più basso adatto al carico stimato (es. 500 utenti concorrenti da PRD §14.2)
3. Calcolare costo mensile × 12 per avere la visione annuale
4. Aggiungere un buffer del 15% per picchi non previsti (sabato/domenica mattina = picco partite)

---

## 2. Analisi dei KPI

### Framework: KPI Scorecard settimanale

Ogni lunedì compilare una scorecard con lo stato di ogni metrica rispetto al target di fase:

```
Settimana: [N] | Fase: [0/1/2/...]
─────────────────────────────────────────────────
KPI                     | Valore attuale | Target | Trend
Utenti registrati       |                |        | ↑ / → / ↓
Partite con dati live   |                |        |
Commenti / partita      |                |        |
Dati certificati %      |                |        |
DAU / MAU               |                |        |
─────────────────────────────────────────────────
Note: [max 3 righe — solo anomalie e cause]
```

**Trend:** usare ↑ (in crescita), → (stabile), ↓ (in calo). Non servono grafici per il report settimanale — bastano frecce e numeri.

### Come leggere i dati

**DAU / MAU ratio** — indica la "dipendenza" degli utenti dalla piattaforma:
- < 10%: utenti passivi, aprono l'app raramente
- 15–25%: target Fase 1–2, utenti che tornano per le partite del weekend
- > 30%: utenti abituali, community attiva

**Partite con dati live %** — metrica chiave per validare il modello community-first:
- Se < 20% dopo 4 settimane dal lancio: segnalare, il team deve valutare onboarding o incentivi
- Calcolo: `(partite con ≥ 1 evento live inserito) / (partite totali in stato TERMINATA o CERTIFICATA)`

**Dati certificati %** — cresce lentamente all'inizio (target 5% a M3). Non preoccuparsi se è 0% nelle prime settimane.

### Segmentazione minima utile

Quando i dati lo permettono (≥ 100 utenti), segmentare per:
- Tipo utente dichiarato: Tifoso / Genitore / Allenatore / Dirigente
- Campionato seguito (quali categorie sono più attive)
- Dispositivo: mobile vs desktop (PWA — importante per capire se l'installazione funziona)

---

## 3. Reportistica

### Struttura del report mensile (max 1 pagina)

```
REPORT MENSILE — [Mese Anno]
Redatto da: Desire (DF-1)

## Spese
- Totale mese: € X (previsto: € Y, delta: ± € Z)
- Voci fuori target: [elenco o "nessuna"]
- Proiezione prossimo mese: € X

## KPI
- [3 bullet: cosa è andato bene, cosa no, cosa ha sorpreso]
- Metrica più a rischio rispetto al target: [nome KPI + gap]

## Azioni suggerite
- [max 2 azioni concrete, indirizzate a chi le deve prendere]
```

**Principio:** un report che richiede più di 5 minuti di lettura non viene letto. Meno è meglio.

### Escalation

Non aspettare il report mensile se:
- Una spesa imprevista supera € 50/mese
- Un KPI scende per 2 settimane consecutive
- Il DAU/MAU crolla di più del 30% settimana su settimana

---

## 4. Analisi costi per feature (prima di Fase 2)

Prima dell'attivazione di Socket.io (Fase 2), stimare l'impatto infrastrutturale:

### Checklist stima costi Socket.io

- [ ] Stimare picco di connessioni simultanee: `utenti attivi × % su live match` (es. 500 × 60% = 300 connessioni)
- [ ] Verificare se il piano hosting attuale supporta WebSocket persistenti
- [ ] Confrontare costo piano attuale vs piano con WebSocket (se diverso)
- [ ] Stimare impatto su Redis: ogni room `match:<id>` usa memoria; calcolare `N partite simultanee × eventi medi per partita × dimensione media evento`
- [ ] Produrre una stima in formato: `costo attuale → costo stimato Fase 2 → delta mensile`

---

## 5. Strumenti consigliati

| Scopo | Strumento | Note |
|-------|-----------|------|
| Tracker spese | Google Sheets | Condividi con Christian (TL) in sola lettura |
| KPI scorecard | Google Sheets o Notion | Una tab per settimana |
| Analytics utenti | Plausible (privacy-first) o Google Analytics 4 | Da decidere con FE-1 (Sasha) per l'integrazione su Nuxt |
| Report mensile | Google Docs o Notion | Inviare link al Tech Lead, non allegati |
| Confronto prezzi hosting | Foglio di benchmark | Salvare snapshot dei prezzi con data — i prezzi cambiano |

---

## 6. Coordinamento con il team

| Con chi | Quando | Perché |
|---------|--------|--------|
| **Christian (TL / BE-1)** | Fine ogni sprint | Approvazione budget, ricezione report |
| **Andrea (BE-3)** | Prima della stima costi Socket.io | Dati tecnici su connessioni Redis/WS |
| **Sasha (FE-1)** | Setup analytics | Integrazione tracker su Nuxt |
| **Laura (DB-1)** | Se servono query aggregate | Dati grezzi per analisi KPI lato DB |

Tutti i file di Desire vivono fuori dal repo (Google Drive / Notion). Se un'analisi diventa documentazione permanente del progetto, Christian decide se includerla in `docs/`.
