# Graph Report - .  (2026-05-12)

## Corpus Check
- Corpus is ~7,104 words - fits in a single context window. You may not need a graph.

## Summary
- 82 nodes · 89 edges · 15 communities detected
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.86)
- Token cost: 8,500 input · 3,200 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Tech Stack|Tech Stack]]
- [[_COMMUNITY_API & Auth|API & Auth]]
- [[_COMMUNITY_Product Features|Product Features]]
- [[_COMMUNITY_Data Reliability Levels|Data Reliability Levels]]
- [[_COMMUNITY_Match Lifecycle & Audit|Match Lifecycle & Audit]]
- [[_COMMUNITY_Live Feed Rules|Live Feed Rules]]
- [[_COMMUNITY_Reputation & Moderation|Reputation & Moderation]]
- [[_COMMUNITY_Premium User Types|Premium User Types]]
- [[_COMMUNITY_GDPR & Minors|GDPR & Minors]]
- [[_COMMUNITY_User Levels|User Levels]]
- [[_COMMUNITY_Admin Roles|Admin Roles]]
- [[_COMMUNITY_Frontend State|Frontend State]]
- [[_COMMUNITY_Design|Design]]
- [[_COMMUNITY_Git Workflow|Git Workflow]]
- [[_COMMUNITY_Gamification|Gamification]]

## God Nodes (most connected - your core abstractions)
1. `PRD â€” RugbyTracker Community v1.0` - 10 edges
2. `RugbyTracker Community` - 9 edges
3. `Sistema di Certificazione Dati` - 6 edges
4. `Socket.io` - 5 edges
5. `Punteggio AffidabilitÃ  (PA)` - 5 edges
6. `Andrea (BE-3)` - 5 edges
7. `Frontend Layer (client/)` - 5 edges
8. `Backend Layer (server/)` - 5 edges
9. `Progressive Web App (PWA)` - 4 edges
10. `JWT + OAuth (Google, Apple)` - 4 edges

## Surprising Connections (you probably didn't know these)
- `AffidabilitÃ  Community (non verificato)` --semantically_similar_to--> `Meccanismo di Consensus (â‰¥3 voti)`  [INFERRED] [semantically similar]
  CLAUDE.md → prd.md
- `Punteggio AffidabilitÃ  (PA)` --semantically_similar_to--> `Glossario: PA (Punteggio AffidabilitÃ )`  [INFERRED] [semantically similar]
  CLAUDE.md → docs/glossario.md
- `Progressive Web App (PWA)` --semantically_similar_to--> `Offline Graceful PWA (Service Worker cache)`  [INFERRED] [semantically similar]
  CLAUDE.md → prd.md
- `Ciclo di Vita Partita (PROGRAMMATAâ†’IN CORSOâ†’TERMINATAâ†’CERTIFICATA)` --semantically_similar_to--> `Glossario: Match Lifecycle`  [INFERRED] [semantically similar]
  CLAUDE.md → docs/glossario.md
- `API Contract /api/v1/` --semantically_similar_to--> `API REST /api/v1/`  [INFERRED] [semantically similar]
  TEAM.md → CLAUDE.md

## Hyperedges (group relationships)
- **Data Trust Pipeline: Community â†’ Consensus â†’ Verified â†’ Certified** — claude_affidabilita_community, claude_affidabilita_confermato, claude_affidabilita_verificato, claude_affidabilita_certificato, prd_consensus, prd_certification_system [EXTRACTED 0.95]
- **Match Event Real-time Flow: Live Feed + Socket.io + Redis** — prd_live_feed, claude_socketio, claude_socket_room, claude_redis, prd_match_event [INFERRED 0.90]
- **Cross-Layer API Governance: FE + BE + TL + DB** — team_frontend_layer, team_backend_layer, team_db_layer, team_tech_lead, team_api_contract [EXTRACTED 0.95]

## Communities

### Community 0 - "Tech Stack"
Cohesion: 0.15
Nodes (17): MySQL, Node.js + Express, Nuxt 3 (Vue.js), Progressive Web App (PWA), Redis, RugbyTracker Community, S3-compatible Storage, Socket.io Room (match:<match_id>) (+9 more)

### Community 1 - "API & Auth"
Cohesion: 0.18
Nodes (13): API REST /api/v1/, JWT + OAuth (Google, Apple), Rationale: JWT + OAuth vs Session Auth, Alexia (FE-3), API Contract /api/v1/, Backend Layer (server/), Christian (BE-1 / TL), Daniele (BE-2) (+5 more)

### Community 2 - "Product Features"
Cohesion: 0.25
Nodes (9): Campionati e Calendari, Sezione Commenti, Sistema Notifiche, PRD â€” RugbyTracker Community v1.0, FunzionalitÃ  Social (follow, condivisione, badge), Statistiche e Dati, Graphify Knowledge Graph Tool, Roadmap (Fasi 0-4) (+1 more)

### Community 3 - "Data Reliability Levels"
Cohesion: 0.25
Nodes (8): AffidabilitÃ  Certificato (fonte ufficiale), AffidabilitÃ  Community (non verificato), AffidabilitÃ  Confermato (consensus â‰¥3), AffidabilitÃ  Verificato (utente premium), Glossario: AffidabilitÃ  Evento (4 livelli), Glossario: Certificazione, Sistema di Certificazione Dati, FIR (Federazione Italiana Rugby)

### Community 4 - "Match Lifecycle & Audit"
Cohesion: 0.29
Nodes (7): Audit Log, Ciclo di Vita Partita (PROGRAMMATAâ†’IN CORSOâ†’TERMINATAâ†’CERTIFICATA), Rationale: Audit Log per partite CERTIFICATE, Glossario: Audit Log, Glossario: Match Lifecycle, Database Layer (database/), Laura (DB-1)

### Community 5 - "Live Feed Rules"
Cohesion: 0.33
Nodes (7): Regola del Minuto 1, Rationale: Regola del Minuto 1, Glossario: Evento di Gara, Glossario: Minuto 1, Meccanismo di Consensus (â‰¥3 voti), Live Match Feed, Evento di Gara (match event)

### Community 6 - "Reputation & Moderation"
Cohesion: 0.33
Nodes (6): Punteggio AffidabilitÃ  (PA), Utente Normale (livelli 0-4), Rationale: PA Score vs Rate Limiting semplice, Glossario: PA (Punteggio AffidabilitÃ ), Moderazione e QualitÃ  Dati, Rate Limiting (scrittura endpoint)

### Community 7 - "Premium User Types"
Cohesion: 0.4
Nodes (5): Arbitro (premium), Giocatore (premium), Squadra (premium), Glossario: Admin Squadra, Glossario: Utente Premium

### Community 8 - "GDPR & Minors"
Cohesion: 0.67
Nodes (3): parental_consent (GDPR minori), Glossario: parental_consent, GDPR Compliance (profili minori)

### Community 9 - "User Levels"
Cohesion: 1.0
Nodes (2): Glossario: Livello Utente, Livelli Utente (0-4: Spettatoreâ†’Verificatore)

### Community 10 - "Admin Roles"
Cohesion: 1.0
Nodes (1): Amministratore

### Community 11 - "Frontend State"
Cohesion: 1.0
Nodes (1): Pinia Store

### Community 12 - "Design"
Cohesion: 1.0
Nodes (1): Matteo (DES)

### Community 13 - "Git Workflow"
Cohesion: 1.0
Nodes (1): Branch Naming Convention (layer/nome-dev/feature)

### Community 14 - "Gamification"
Cohesion: 1.0
Nodes (1): Gamification (badge, PA)

## Knowledge Gaps
- **37 isolated node(s):** `Utente Normale (livelli 0-4)`, `Giocatore (premium)`, `Arbitro (premium)`, `Amministratore`, `AffidabilitÃ  Confermato (consensus â‰¥3)` (+32 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `User Levels`** (2 nodes): `Glossario: Livello Utente`, `Livelli Utente (0-4: Spettatoreâ†’Verificatore)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Admin Roles`** (1 nodes): `Amministratore`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend State`** (1 nodes): `Pinia Store`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Design`** (1 nodes): `Matteo (DES)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Git Workflow`** (1 nodes): `Branch Naming Convention (layer/nome-dev/feature)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Gamification`** (1 nodes): `Gamification (badge, PA)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PRD â€” RugbyTracker Community v1.0` connect `Product Features` to `Tech Stack`, `Data Reliability Levels`, `Live Feed Rules`, `Reputation & Moderation`?**
  _High betweenness centrality (0.350) - this node is a cross-community bridge._
- **Why does `RugbyTracker Community` connect `Tech Stack` to `API & Auth`, `Product Features`?**
  _High betweenness centrality (0.330) - this node is a cross-community bridge._
- **Why does `Sistema di Certificazione Dati` connect `Data Reliability Levels` to `Product Features`, `Match Lifecycle & Audit`, `Reputation & Moderation`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **What connects `Utente Normale (livelli 0-4)`, `Giocatore (premium)`, `Arbitro (premium)` to the rest of the system?**
  _37 weakly-connected nodes found - possible documentation gaps or missing edges._