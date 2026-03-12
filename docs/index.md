# MultiClimact Front-End — Documentazione

## Indice

| File | Contenuto |
|------|-----------|
| [architecture.md](architecture.md) | Struttura progetto, stack tecnologico, pipeline di avvio |
| [configuration.md](configuration.md) | File di configurazione, variabili d'ambiente, secrets |
| [api.md](api.md) | Endpoint API (Controllers), parametri, risposte |
| [services.md](services.md) | Servizi HTTP client esterni, RetryHandler |
| [deployment.md](deployment.md) | Build, Docker, avvio in produzione |
| [activeRiskRunID.md](activeRiskRunID.md) | Variabile JS globale per il run di rischio attivo |
| [activeScenarioID.md](activeScenarioID.md) | Variabile JS globale per lo scenario selezionato |

## Quick Start

```bash
# Sviluppo locale (SQLite)
dotnet run

# Con watch (hot reload)
dotnet watch run

# Docker
docker compose up --build
```

**URL applicazione:** `http://localhost:5000`
**Swagger UI:** `http://localhost:5000/swagger`
