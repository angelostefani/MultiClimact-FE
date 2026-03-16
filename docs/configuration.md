# Configurazione

## File di Configurazione

ASP.NET Core applica i file in ordine (il successivo sovrascrive il precedente):

1. `appsettings.json` — configurazione base / produzione
2. `appsettings.Development.json` — overrides per sviluppo locale
3. `appsettings.Local.json` — overrides personali (non versionato, usa `.example` come template)
4. Variabili d'ambiente (con `__` come separatore di sezione)
5. `dotnet user-secrets` (solo development)

## appsettings.json (Configurazione Base)

### Database

```json
"DatabaseProvider": "Sqlite",
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5433;Database=multiclimact_fe;Username=postgres;Password=postgres",
  "SqliteConnection": "Data Source=multiclimact.db"
}
```

- Se `DatabaseProvider=Sqlite` → usa `SqliteConnection` (default per sviluppo)
- Se `DatabaseProvider=PostgreSQL` → usa `DefaultConnection`

### Servizi Backend

```json
"EarthquakeService":          { "BaseUrl": "http://192.168.155.112:8000" },
"HeatwaveService":            { "BaseUrl": "http://192.168.155.112:8000" },
"ExtremeprecipitationService":{ "BaseUrl": "http://192.168.155.112:8000" },
"GraphService":               { "BaseUrl": "http://192.168.155.112:8000" },
"ConfigVulnService":          { "BaseUrl": "http://192.168.154.23:8000"  }
```

### WMS GeoServer

```json
"wms": {
  "wmsurl_baseurl": "http://192.168.154.23:8180/geoserver/multic/wms",
  "wmslayer_earth_real_view":   "multic:earth_real_view",
  "wmslayer_shakemap":          "multic:shakemap",
  ...
}
```

> Sono definiti oltre 30 layer WMS per terremoti, ondate di calore e precipitazioni estreme.

## appsettings.Development.json

Contiene solo override minimali per lo sviluppo:

```json
{
  "DetailedErrors": true,
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

> **Nota:** la sezione `GraphService` (e gli altri servizi) **non** è presente qui —
> viene quindi ereditata da `appsettings.json`. Per usare un URL diverso in sviluppo,
> aggiungere la sezione desiderata in questo file.

## Variabili d'Ambiente (Docker / Produzione)

Il separatore `__` (doppio underscore) sostituisce `:` per le sezioni annidate:

```bash
ASPNETCORE_ENVIRONMENT=Production
DatabaseProvider=PostgreSQL
ConnectionStrings__DefaultConnection="Host=...;Username=...;Password=...;Database=..."
GraphService__BaseUrl=http://192.168.155.112:8000
```

## Secrets in Sviluppo

Per non committare credenziali, usare `dotnet user-secrets`:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=...;..."
dotnet user-secrets set "GraphService:BaseUrl" "http://..."
```
