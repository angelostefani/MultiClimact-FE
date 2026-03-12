# Servizi HTTP Client

## Panoramica

Ogni servizio esterno ha un **Typed HttpClient** dedicato registrato in `Program.cs`.
Tutti condividono:
- Timeout: **30 secondi**
- Decoratore: **RetryHandler** (retry automatico su errori transitori)

## Client Configurati

| Client | BaseUrl (da appsettings.json) |
|--------|-------------------------------|
| `EarthquakeServiceClient` | `http://192.168.155.112:8000` |
| `HeatwaveServiceClient` | `http://192.168.155.112:8000` |
| `ExtremeprecipitationServiceClient` | `http://192.168.155.112:8000` |
| `GraphServiceClient` | `http://192.168.155.112:8000` |
| `ConfigVulnServiceClient` | `http://192.168.154.23:8000` |
| Default (named `"Default"`) | — (client generico) |

## RetryHandler

File: `Services/RetryHandler.cs`

### Comportamento

- **Max tentativi:** 3 (+ quello originale = 4 totali)
- **Retry su:**
  - `408 Request Timeout`
  - `429 Too Many Requests`
  - `5xx Server Error`
- **Backoff esponenziale con jitter:**

| Tentativo | Delay base | Jitter | Totale max |
|-----------|-----------|--------|------------|
| 1° retry | 200 ms | ±100 ms | ~300 ms |
| 2° retry | 400 ms | ±100 ms | ~500 ms |
| 3° retry | 800 ms | ±100 ms | ~900 ms |

### Gestione eccezioni

- `HttpRequestException` su tentativi < MaxRetries → log warning + retry
- `TaskCanceledException` (timeout 30s) → **non viene catturata dal RetryHandler**
  e risale al controller chiamante

> **Attenzione:** i controller attualmente catturano solo `HttpRequestException`.
> Un timeout produce una `TaskCanceledException` non gestita. Aggiungere il catch
> nei controller per restituire un `504 Gateway Timeout` appropriato.

## Diagnostica Connettività

Verifica che i servizi backend siano raggiungibili:

```bash
# Servizi hazard e graph (porta 8000)
curl -I http://192.168.155.112:8000/users/system/last_id_run

# ConfigVuln (porta 8000 su host diverso)
curl -I http://192.168.154.23:8000

# WMS GeoServer
curl -I "http://192.168.154.23:8180/geoserver/multic/wms?service=WMS&request=GetCapabilities"
```
