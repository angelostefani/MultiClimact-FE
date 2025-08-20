# Contributing

Thanks for your interest in improving MultiClimact-FE. This guide covers the essentials; see AGENTS.md for detailed, repo-specific guidelines.

## Quick Start
- Prerequisites: .NET SDK 8+, PostgreSQL access.
- Setup: `dotnet build` then `dotnet ef database update`.
- Run: `dotnet watch run` (hot reload).

## How We Work
- Read AGENTS.md for structure, coding style, and config details.
- Keep PRs focused and small; link related issues.
- Use the PR template (auto-applied in GitHub) to include a summary, screenshots for UI, testing steps, and notes on migrations/config.

## Branches & Commits
- Branch naming: `feature/<slug>`, `fix/<slug>`, `docs/<slug>`.
- Commits: imperative and concise (e.g., `feat: add heatwave client`).

## Code Quality
- Formatting: adhere to `.editorconfig`. Prefer `dotnet format` before pushing.
- Nullability: handle warnings; prefer explicit checks and `Try*` patterns.
- Keep controllers thin; move logic to `Services/`.

## Configuration & Secrets
- Do not commit secrets. Use `dotnet user-secrets` (dev) or environment variables (prod).
- Verify `ConnectionStrings:DefaultConnection` and external service URLs (`EarthquakeService:BaseUrl`, `HeatwaveService:BaseUrl`, WMS settings) before running.

## Tests
- No test project yet. If adding one, use xUnit (`MultiClimact.Tests`) and `dotnet test`.

Questions or proposals? Open an issue or start a draft PR.

