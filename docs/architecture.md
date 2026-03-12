# Architettura del Progetto

## Stack Tecnologico

| Layer | Tecnologia |
|-------|------------|
| Runtime | .NET 8.0 |
| Framework Web | ASP.NET Core (Razor Pages + Controllers) |
| ORM | Entity Framework Core |
| Database (dev) | SQLite |
| Database (prod) | PostgreSQL |
| Autenticazione | ASP.NET Core Identity |
| Mappe | OpenLayers (WMS) |
| Serializzazione | Newtonsoft.Json |
| HTTP Client | HttpClient + RetryHandler |

## Struttura Cartelle

```
MultiClimact-FE/
├── Controllers/            # Proxy API verso servizi esterni
│   ├── EarthquakeProxyController.cs
│   ├── HeatwaveProxyController.cs
│   ├── ExtremeprecipitationProxyController.cs
│   ├── GraphProxyController.cs
│   ├── WmsProxyController.cs
│   └── ConfigVulnProxyController.cs
├── Services/               # Typed HttpClient per servizi esterni
│   ├── EarthquakeServiceClient.cs
│   ├── HeatwaveServiceClient.cs
│   ├── ExtremeprecipitationServiceClient.cs
│   ├── GraphServiceClient.cs
│   └── RetryHandler.cs
├── Models/                 # DTO e Response models
├── Pages/                  # Razor Pages (UI)
│   ├── Index.cshtml        # Pagina principale con mappe
│   ├── VulnerabilityForm.cshtml
│   ├── Lang.cshtml
│   └── Shared/             # Layout e partial views
│       ├── _Layout.cshtml
│       ├── _NavigationTabs.cshtml
│       ├── _BottomBar.cshtml
│       ├── _BottomBarGraph.cshtml
│       └── VulnerabilitySettings.cshtml
├── Data/
│   └── ApplicationDbContext.cs
├── Resources/              # File di localizzazione (it, en)
├── wwwroot/
│   ├── js/                 # Script client
│   │   ├── maps-init.js
│   │   ├── openlayer-helper.js
│   │   ├── earthquake-helper.js
│   │   ├── graph-helper.js
│   │   ├── scenario-setup.js
│   │   └── ...
│   ├── css/
│   └── lib/                # Librerie (OpenLayers, jQuery, ...)
├── Migrations/             # EF Core migrations (PostgreSQL)
├── Program.cs              # Entry point e DI container
├── appsettings.json
├── appsettings.Development.json
├── Dockerfile
└── docker-compose.yml
```

## Flusso Richiesta

```
Browser
  │
  ▼
ASP.NET Core Middleware Pipeline
  │  RequestLocalization → StaticFiles → Routing
  │  → Authentication → Authorization → Session
  │
  ├─► Razor Pages (Index, VulnerabilityForm, ...)
  │
  └─► API Controllers (/api/*)
        │
        ▼
      TypedHttpClient (con RetryHandler)
        │
        ▼
      Servizi Backend (192.168.155.112:8000)
      WMS GeoServer (192.168.154.23:8180)
```

## Inizializzazione in Program.cs

1. Localization (en, it)
2. Razor Pages + DataAnnotations localization
3. Controllers + Swagger
4. DbContext (SQLite o PostgreSQL da config)
5. ASP.NET Identity
6. HttpClient typed services + RetryHandler
7. Session (30 min timeout)
8. Middleware pipeline
9. `EnsureCreated()` per SQLite in development

## Localizzazione

- Lingue supportate: **italiano (`it`)**, **inglese (`en`)**
- File risorse in `Resources/` (suffisso, es. `Index.it.resx`)
- Lingua selezionabile dall'utente tramite `Lang.cshtml`, persistita con cookie
