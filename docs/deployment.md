# Build e Deployment

## Sviluppo Locale

### Prerequisiti

- .NET 8.0 SDK
- (Opzionale) PostgreSQL se `DatabaseProvider=PostgreSQL`

### Avvio

```bash
# Avvio standard
dotnet run

# Con hot reload
dotnet watch run
```

Il database SQLite (`multiclimact.db`) viene creato automaticamente al primo avvio
tramite `EnsureCreated()`.

### URL locali

- Applicazione: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger`

---

## Docker

### Build immagine singola

```bash
docker build -t multiclimact-fe .
```

### Avvio container

```bash
docker run --rm -it -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e DatabaseProvider=PostgreSQL \
  -e "ConnectionStrings__DefaultConnection=Host=...;Username=...;Password=...;Database=..." \
  -e "GraphService__BaseUrl=http://192.168.155.112:8000" \
  multiclimact-fe
```

### Docker Compose

```bash
docker compose up --build
```

Il volume `/data` persiste il file `multiclimact.db` tra i riavvii del container.

---

## Configurazione Produzione

Per produzione impostare le seguenti variabili d'ambiente (o usare `appsettings.json`):

```bash
ASPNETCORE_ENVIRONMENT=Production
DatabaseProvider=PostgreSQL
ConnectionStrings__DefaultConnection=<pg_connection_string>
EarthquakeService__BaseUrl=http://192.168.155.112:8000
HeatwaveService__BaseUrl=http://192.168.155.112:8000
ExtremeprecipitationService__BaseUrl=http://192.168.155.112:8000
GraphService__BaseUrl=http://192.168.155.112:8000
ConfigVulnService__BaseUrl=http://192.168.154.23:8000
```

## Migrations PostgreSQL

```bash
# Crea nuova migration
dotnet ef migrations add <NomeMigration>

# Applica migrations al database
dotnet ef database update
```
