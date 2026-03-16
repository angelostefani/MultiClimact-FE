# Endpoint API

Tutti gli endpoint sono prefissati con `/api/[controller]`.
La documentazione interattiva è disponibile in sviluppo su `/swagger`.

---

## EarthquakeProxy — `/api/EarthquakeProxy`

### GET `/GetEarthquakes`

Recupera la lista dei run terremoto con filtri.

| Parametro | Tipo | Obbligatorio | Descrizione |
|-----------|------|:---:|-------------|
| `user_id` | string | No | ID utente (default: `system`) |
| `start_date` | string | No | Data inizio (formato ISO) |
| `end_date` | string | No | Data fine (formato ISO) |
| `simulated` | string | No | Filtra simulati |
| `id_run` | int | No | ID specifico del run |
| `status_id` | int | No | Filtra per status |

**Risposte:**
- `200 OK` — JSON con lista terremoti
- `404` → restituisce `{"success":true,"data":[]}`
- `500` — Errore interno / servizio non raggiungibile

### GET `/GetLastEarthquake`

Ritorna l'ID dell'ultimo run terremoto completato.

**Risposta:** `{ "id_run": "..." }`

---

## HeatwaveProxy — `/api/HeatwaveProxy`

### GET `/GetHeatwaves`

Recupera la lista delle ondate di calore (`haztype_id=2`).

| Parametro | Tipo | Obbligatorio | Descrizione |
|-----------|------|:---:|-------------|
| `user_id` | string | No | ID utente (default: `system`) |
| `start_date` | string | No | Data inizio |
| `end_date` | string | No | Data fine |
| `simulated` | string | No | Filtra simulati |
| `id_run` | int | No | ID specifico del run |
| `status_id` | int | No | Filtra per status |

### GET `/GetLastHeatwave`

Ritorna l'ID dell'ultimo run ondata di calore.

---

## ExtremeprecipitationProxy — `/api/ExtremeprecipitationProxy`

### GET `/GetExtremeprecipitations`

Recupera la lista delle precipitazioni estreme (`haztype_id=4`).

Stessi parametri di `GetHeatwaves`.

### GET `/GetLastExtremeprecipitation`

Ritorna l'ID dell'ultimo run precipitazione estrema.

---

## GraphProxy — `/api/GraphProxy`

### GET `/GetGraphs`

Recupera i grafici configurati.

| Parametro | Tipo | Obbligatorio | Descrizione |
|-----------|------|:---:|-------------|
| `user_id` | string | No | ID utente (default: `system`) |
| `start_time` | string | No | Data inizio |
| `end_time` | string | No | Data fine |
| `name` | string | No | Nome grafico |
| `id_conf` | int | No | ID configurazione (> 0) |

**URL upstream:** `GET {GraphService:BaseUrl}/users/{user_id}/graphs?...`

**Risposte:**
- `200 OK` — JSON con lista grafici
- `404` → restituisce `{"success":true,"data":[]}`
- `500` / `TaskCanceledException` — timeout o errore servizio

### POST `/CreateGraph`

Crea un nuovo grafico con configurazione JSON.

| Parametro | Posizione | Descrizione |
|-----------|-----------|-------------|
| `user_id` | query | ID utente (default: `system`) |
| body | body (JSON) | Configurazione grafico |

**URL upstream:** `POST {GraphService:BaseUrl}/users/{user_id}/graph/default_graph`

### POST `/LogScenarioSetup`

Logga il JSON di setup scenario (solo audit, nessuna chiamata upstream).

---

## WmsProxy — `/api/WmsProxy`

### GET `/GetFeatureInfo`

Esegue una richiesta `GetFeatureInfo` verso GeoServer WMS e restituisce le proprietà della feature.

| Parametro | Tipo | Obbligatorio | Descrizione |
|-----------|------|:---:|-------------|
| `bbox` | string | Sì | Bounding box (EPSG:3857) |
| `x` | string | Sì | Coordinata X pixel |
| `y` | string | Sì | Coordinata Y pixel |
| `width` | string | Sì | Larghezza viewport |
| `height` | string | Sì | Altezza viewport |
| `layer` | string | Sì | Nome layer WMS |
| `cqlFilter` | string | No | Filtro CQL opzionale |

**URL upstream:** `{wms:wmsurl_baseurl}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&...`

Parsing risposta XML con estrazione proprietà feature; fallback a risposta raw se non XML.

---

## ConfigVulnProxy — `/api/ConfigVulnProxy`

> Richiede autenticazione (`[Authorize]`).

### GET `/ws9`

Recupera le configurazioni di vulnerabilità per l'utente autenticato.

User ID estratto da Claims: `NameIdentifier` → `sub` → `oid`.

### PUT `/ws10`

Aggiorna le configurazioni di vulnerabilità default.

| Parametro | Posizione | Descrizione |
|-----------|-----------|-------------|
| body | body (JSON) | Configurazioni da aggiornare |
