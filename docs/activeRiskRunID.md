# Variabile `activeRiskRunID`

## Definizione

```js
// earthquake-helper.js:13
let activeRiskRunID = '';
```

Variabile globale JavaScript che contiene l'**ID del run di rischio attualmente selezionato** dall'utente.
Viene usata come filtro (`id_run`) nei parametri WMS per aggiornare i layer delle mappe con i dati del run scelto.

---

## Variabili Correlate

| Variabile | File | Descrizione |
|-----------|------|-------------|
| `lastAppliedRiskRunID` | `earthquake-helper.js:14` | Ultimo ID effettivamente applicato alle mappe; evita aggiornamenti ridondanti |
| `activeRiskRunIdByHazard` | `earthquake-helper.js:24` | Dizionario `{ earthquake, heatwave, extremeprecipitation }` — mantiene l'ID per ogni tipo di hazard |
| `selectedRowIndexByHazard` | `earthquake-helper.js:18` | Indice della riga selezionata nella tabella per ogni hazard |

---

## Flusso di Aggiornamento

```
Inizializzazione pagina (DOMContentLoaded)
  │
  ├─► maps-init.js: legge idRunLastEarthquake dal DOM
  │     └─► se activeRiskRunID è vuoto → activeRiskRunID = idRun  [maps-init.js:19-21]
  │
  └─► earthquake-helper.js: popola activeRiskRunIdByHazard dai dati lato server
        └─► syncActiveRiskRunId(hazard) → activeRiskRunID = activeRiskRunIdByHazard[hazard]
              └─► refreshMapsForActiveRiskRunId()

Click su riga tabella hazard
  └─► activeRiskRunIdByHazard[hazardKey] = idValue  [earthquake-helper.js:241]
        activeRiskRunID = idValue                   [earthquake-helper.js:242]
        └─► refreshMapsForActiveRiskRunId()

Cambio hazard (select dropdown)
  └─► syncActiveRiskRunId(hazard)                   [earthquake-helper.js:494]
        activeRiskRunID = activeRiskRunIdByHazard[hazard]
        └─► refreshMapsForActiveRiskRunId()

Cambio tab (C1, C2, ..., D5, ...)
  └─► syncActiveRiskRunIdFromTab(tabId)             [earthquake-helper.js:63]
        hazard = hazardByTab[tabId]
        activeRiskRunID = activeRiskRunIdByHazard[hazard]
        └─► refreshMapsForActiveRiskRunId()

Reload tabella hazard (fetchHazardData)
  └─► se activeRiskRunIdByHazard[hazardType] presente → activeRiskRunID = valore
        altrimenti → activeRiskRunID = ''            [earthquake-helper.js:340-343]
```

---

## Utilizzo nei Layer WMS

`activeRiskRunID` viene letto in `openlayer-wms-helper.js` per aggiungere un filtro CQL ai layer WMS che richiedono la selezione del run.

### In `createWMSLayer` (openlayer-wms-helper.js:226)

```js
if (shouldApplyRiskRunFilter && activeRiskRunID && activeRiskRunID.trim() !== '') {
    const runFilter = `id_run=${activeRiskRunID}`;
    // aggiunto a CQL_FILTER del layer WMS
}
```

### In `updateMapLayers` (openlayer-wms-helper.js:419)

```js
if (shouldApplyRiskRunFilter && activeRiskRunID && activeRiskRunID.trim() !== '') {
    const runFilter = `id_run=${activeRiskRunID}`;
    // aggiornamento params layer esistente
}
```

Il flag `applyRiskRunFilter` (indice `[7]` della config layer in `maps-init.js`) controlla se il filtro viene applicato per ogni singolo layer.

---

## Funzioni Chiave

### `refreshMapsForActiveRiskRunId()` — `earthquake-helper.js:82`

Aggiorna tutti i layer delle mappe con il nuovo `activeRiskRunID`.
Ottimizzazione: se `activeRiskRunID === lastAppliedRiskRunID` non fa nulla.
Itera su tutte le mappe attive (C1–C5, C9, C12, D5, HomeDashboard1–4).

### `syncActiveRiskRunIdFromTab(tabId)` — `earthquake-helper.js:63`

Esposta su `window` per essere chiamata da `menu-helper.js` al cambio tab.
Legge il tipo di hazard associato al tab dalla mappa `hazardByTab` e aggiorna `activeRiskRunID`.

### `syncActiveRiskRunId(hazard)` — `earthquake-helper.js:492`

Chiamata al cambio del select hazard (`DOMContentLoaded` e `change` event).

---

## Tab → Hazard Mapping (`hazardByTab`)

| Tab | Hazard |
|-----|--------|
| `tabC1` .. `tabC4`, `tabD1` .. `tabD4` | `earthquake` |
| `tabC9` .. `tabC11`, `tabD9` .. `tabD11` | `heatwave` |
| `tabC12`, `tabC13`, `tabD5` .. `tabD8` | `extremeprecipitation` |
