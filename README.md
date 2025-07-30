# MultiClimact Front-End

ASP.NET Core web interface for the **MULTICLIMACT** project.

## Prerequisites

- [.NET SDK 8.0](https://dotnet.microsoft.com/download) or later
- Access to a PostgreSQL database instance

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

- `ConnectionStrings:DefaultConnection` – PostgreSQL connection string.
- `earthquakeSimulationServiceUrl` – endpoint for submitting earthquake simulations.
- `earthquakeTodayBaseAddress` and `earthquakeTodayAPIUrl` – base address and path for obtaining earthquake data.
- `EarthquakeService:BaseUrl` – base URL for the earthquake REST service.
- `HeatwaveService:BaseUrl` – base URL for the heatwave REST service.
- `wms` – URLs and layer names for WMS geospatial services.

Environment specific files such as `appsettings.Development.json` can override these settings.

