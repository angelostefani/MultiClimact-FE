# MultiClimact Front-End

ASP.NET Core web interface for the **MULTICLIMACT** project.

## Prerequisites

- [.NET SDK 8.0](https://dotnet.microsoft.com/download) or later
- Access to a PostgreSQL database instance (optional if using SQLite locally)

## Building and running

1. Restore and build the solution:

   ```bash
   dotnet build
   ```

2. Apply database migrations if required:

   ```bash
   dotnet ef database update
   ```

3. Run the development server:

   ```bash
   dotnet run
   ```

The application will start on `https://localhost:5001` by default.

## Configuration

Application settings are defined in `appsettings.json`. Important options are:

- `DatabaseProvider` – set to `Sqlite` (default for dev) or `PostgreSQL`.
- `ConnectionStrings:DefaultConnection` – PostgreSQL connection string (used when `DatabaseProvider=PostgreSQL`).
- `ConnectionStrings:SqliteConnection` – SQLite connection string (used when `DatabaseProvider=Sqlite`).
- `earthquakeSimulationServiceUrl` – endpoint for submitting earthquake simulations.
- `earthquakeTodayBaseAddress` and `earthquakeTodayAPIUrl` – base address and path for obtaining earthquake data.
- `EarthquakeService:BaseUrl` – base URL for the earthquake REST service.
- `HeatwaveService:BaseUrl` – base URL for the heatwave REST service.
- `wms` – URLs and layer names for WMS geospatial services.

Environment specific files such as `appsettings.Development.json` can override these settings.

## Connectivity Checklist

- Database: verify the connection string points to a reachable PostgreSQL instance. Quick check: `dotnet ef database update` should succeed.
- Earthquake/Heatwave services: confirm the base URLs respond. Example: `curl -I http://<earthquake-base>/users/system/last_id_run` should return `200`.
- WMS endpoint: use the bare service endpoint (no query). Example check: `curl -I "http://<geoserver>/geoserver/multic/wms?service=WMS&request=GetCapabilities"`.
- App start: run `dotnet run` and open the homepage; check map layers toggle and GetFeatureInfo.

Note: In `appsettings.json`, prefer `wms:wmsurl_lay00` without query parameters (e.g., `http://<geoserver>/geoserver/multic/wms`). The app appends required `service`, `request`, etc.

## Environment Overrides

- For local tweaks without committing secrets, create a local override from the example:

  - Copy `appsettings.Local.json.example` to `appsettings.Development.json` (or use environment variables/user-secrets).
  - Set `DatabaseProvider`, `ConnectionStrings:DefaultConnection` or `ConnectionStrings:SqliteConnection`, `EarthquakeService:BaseUrl`, `HeatwaveService:BaseUrl`, and `wms:wmsurl_lay00`.

## Database Providers

- Development (default): `DatabaseProvider=Sqlite` uses a local `multiclimact.db` file and auto-creates schema with `EnsureCreated()`.
- Production (example): set `DatabaseProvider=PostgreSQL` and provide `ConnectionStrings:DefaultConnection`; apply EF Core migrations targeting PostgreSQL.

Note: Existing migrations in `Migrations/` are tailored for PostgreSQL. For SQLite local development we avoid migrations and rely on `EnsureCreated()`. If you need migrations for SQLite as well, consider a separate migrations assembly per provider.

## Panoramica dell'applicazione e gestione delle mappe WMS

L'interfaccia web è sviluppata in ASP.NET Core con pagine Razor. All'avvio vengono configurati i servizi per localizzazione, database PostgreSQL, autenticazione e client HTTP tipizzati per i servizi di terremoti e ondate di calore.

La pagina principale (`Index.cshtml`) ospita la mappa e inserisce dinamicamente, in elementi HTML nascosti, gli URL e i layer WMS recuperati dal file di configurazione. Il modello della pagina (`Index.cshtml.cs`) legge i valori dal blocco `wms` di `appsettings.json` e li espone in `ViewData` per l'uso lato client.

Il file `maps-init.js` crea gli oggetti di configurazione per ciascuna mappa specificando base map, centro, zoom e matrice dei layer WMS; le funzioni di inizializzazione e gestione dei layer sono definite in `openlayer-wms-helper.js`, mentre `openlayer-helper.js` gestisce le richieste `GetFeatureInfo` tramite il controller `WmsProxyController`.

Il pannello `_TabPanels_C.cshtml` contiene i controlli (checkbox e radio) che richiamano le funzioni JavaScript per attivare o disattivare i layer e selezionare le simulazioni.

### Aggiungere una nuova mappa o layer WMS

1. **Configurazione**  
   - Aggiungere in `appsettings.json` i nuovi campi `wmsurl_layXX` e `wmslayer_layXX`.  
   - Inserire la nuova coppia nell'array `wmsLayers` di `ConfigurationToViewDataMapping`.

2. **View e inizializzazione JS**  
   - Se l'indice supera `12`, aumentare il limite del ciclo `for` in `Index.cshtml` che genera gli elementi `<span>`.  
   - In `maps-init.js`, aggiungere il nuovo layer alla `layerMatrix` o creare un nuovo oggetto di configurazione e chiamare `initWMSMatrixMap`.  
   - Aggiornare `_TabPanels_C.cshtml` per fornire i controlli UI relativi.

3. **Gestione del proxy (opzionale)**  
   - Se il layer usa un server WMS differente, estendere `WmsProxyController` per accettare l'URL come parametro o configurare il nuovo server come base.

4. **Interazione utente**  
   - Le funzioni `toggleLayer`, `switchLayer` e `switchLayers` usano i dati della `layerMatrix` per gestire la visibilità; assicurarsi che i controlli UI richiamino le funzioni con gli indici corretti.


