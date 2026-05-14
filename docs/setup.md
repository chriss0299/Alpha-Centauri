# Setup — Alpha-Centauri

## Prerequisiti

- Node.js 20+
- Python 3.10+
- MySQL 8+
- Redis

## Installazione

```bash
git clone <repo-url>
cd Alpha-Centauri

# dipendenze client
cd client && npm install && cd ..

# dipendenze server
cd server && npm install && cd ..

# variabili d'ambiente
cp .env.example .env
# compila .env con i valori del team
```

## graphify (knowledge graph del progetto)

Setup e protocollo completo: [`../CLAUDE.md`](../CLAUDE.md).

## Documentazione

| File | Contenuto |
|------|-----------|
| `prd.md` | Product Requirements Document |
| `docs/decisions.md` | Decisioni architetturali con motivazione |
| `docs/glossario.md` | Naming canonico cross-layer |
| `docs/user-stories.md` | User stories (generato da `/user-stories`) |
| `../Alpha-Centauri-graph/graphify-out/GRAPH_REPORT.md` | God nodes, community, connessioni sorprendenti |
