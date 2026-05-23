# Documentazione CSV — Squadre Rugby Italia 2025/26

**File:** `squadre_rugby_italia_2025_26.csv`
**Stagione:** 2025/2026
**Righe totali:** 176 (esclusa intestazione)

---

## Struttura delle colonne

| Colonna | Descrizione |
|---|---|
| `livello` | Livello nella piramide (1 = massima serie) |
| `campionato` | Nome ufficiale del campionato |
| `gruppo` | Raggruppamento interno (es. Gruppo 1, Girone 2) |
| `girone` | Descrizione estesa del girone |
| `squadra` | Nome completo della squadra |
| `citta` | Città di appartenenza |
| `note` | Informazioni aggiuntive (cadetta, neo promossa, ecc.) |

> Le colonne `gruppo` e `girone` sono vuote per la Serie A Elite (girone unico) e parzialmente vuote per la Serie C (struttura regionale non omogenea).

---

## Copertura dei dati

| Campionato | Livello | Squadre | Stato |
|---|---|---|---|
| Serie A Elite | 1 | 10 | ✅ Completo |
| Serie A | 2 | 40 | ✅ Completo |
| Serie B | 3 | 50 | ✅ Completo |
| Serie C | 4 | ~74 | 🟡 Parziale |

---

## Serie C — Cosa manca e perché

La Serie C è gestita in autonomia da ogni **Comitato Regionale FIR**. Non esiste un elenco centralizzato pubblicato dalla federazione nazionale.

I dati presenti coprono le regioni **Veneto, FVG, Lazio, Emilia-Romagna, Lombardia e Piemonte/Liguria**, con livelli di completezza variabili.

Le seguenti aree **non sono coperte** per mancanza di dati pubblicati online:

- Toscana / Sardegna
- Campania / Puglia / Sicilia
- Marche / Umbria
- Abruzzo (solo parziale)
- Calabria / Basilicata / Molise / Valle d'Aosta

Per integrare i dati mancanti è necessario consultare direttamente i siti dei comitati regionali FIR (`[regione].federugby.it`).

---

## Dati non presenti per nessuna squadra

Il CSV non include: stadio, anno di fondazione, colori sociali, sito web, numero di tesserati, risultati e classifiche.
