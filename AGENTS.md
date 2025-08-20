# Repository Guidelines

This document helps contributors work effectively on MultiClimact-FE (ASP.NET Core, .NET 8, Razor Pages).

## Project Structure & Module Organization
- `Pages/`: Razor Pages (`*.cshtml`, `*.cshtml.cs`) and partials.
- `Controllers/`: API/proxy controllers (e.g., WMS proxy).
- `Services/`: Typed HTTP clients (earthquake/heatwave) and helpers.
- `Models/`: View models and DTOs.
- `Data/`: EF Core `ApplicationDbContext` and seeding.
- `Migrations/`: EF Core migrations.
- `Resources/`: localization resources.
- `wwwroot/`: static assets (JS/CSS), map helpers in `wwwroot/js/`.
- `appsettings*.json`: configuration; environment overrides in `appsettings.Development.json`.

## Build, Test, and Development Commands
- Build: `dotnet build` — restores and compiles the solution.
- Run (dev): `dotnet watch run` — hot-reload server on file changes.
- Migrate DB: `dotnet ef database update` — applies EF migrations.
- Add migration: `dotnet ef migrations add <Name>` — create a new migration.

Ensure a valid `ConnectionStrings:DefaultConnection` (PostgreSQL). Prefer `dotnet user-secrets` or env vars for local secrets.

## Coding Style & Naming Conventions
- C# standard conventions: 4-space indent; `PascalCase` for types/properties; `camelCase` for locals/params; `Async` suffix for async methods.
- Nullability: treat nullable warnings; prefer explicit null checks and `Try*` patterns.
- Formatting/linting: use built-in analyzers; run `dotnet format` before pushing when possible.
- Razor Pages: keep UI logic in `*.cshtml.cs`; keep controllers thin and delegate to `Services/`.

## Testing Guidelines
- No dedicated test project yet. If adding tests, use xUnit in `MultiClimact.Tests/` with files named `*Tests.cs`.
- Prefer fast unit tests for services and controllers; mock external HTTP via `HttpMessageHandler`.
- Run tests: `dotnet test` (once a test project exists).

## Commit & Pull Request Guidelines
- Commits: concise, imperative subject (optionally `feat:`, `fix:`, `docs:`). Group related changes; keep diffs focused.
- PRs: include summary, motivation, and scope; link issues; add screenshots/GIFs for UI; note config/migration changes and update `README.md` when relevant.
- CI-readiness: ensure app builds, migrations apply, and `dotnet run` starts without errors.

## Security & Configuration Tips
- Never commit secrets. Use `dotnet user-secrets` in dev and environment variables in prod.
- Validate external service URLs in `appsettings*.json` (`EarthquakeService:BaseUrl`, `HeatwaveService:BaseUrl`, WMS blocks).
- Handle HTTP failures gracefully in services and avoid leaking detailed errors to clients.

