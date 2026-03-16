# Variabile `activeScenarioID`

## Definizione

```js
// graph-helper.js:3
let activeScenarioID = '';
```

Variabile globale JavaScript che contiene l'**ID dello scenario (`id_conf`) attualmente selezionato** dall'utente nella tabella scenario (bottom bar grafico). Non viene usata come filtro CQL nei layer WMS.

---

## Variabili Correlate

| Variabile | File | Descrizione |
|-----------|------|-------------|
| `selectedGraphIdConf` | `graph-helper.js:1` | Stesso valore di `activeScenarioID`; usata internamente da `paginateGraphTable` per ripristinare la selezione visiva tra le pagine |
| `selectedGraphRowIndex` | `graph-helper.js:2` | Indice della riga selezionata nella tabella; usato per il ripristino visivo in paginazione |

---

## Flusso di Aggiornamento

```
Pagina caricata (DOMContentLoaded)
  └─► activeScenarioID = ''   (valore iniziale)

Click su riga tabella scenario (populateGraphTable → click handler)
  └─► activeScenarioID = normalized.idConf?.toString() ?? ''   [graph-helper.js:72]
        selectedGraphIdConf = stesso valore                     [graph-helper.js:71]
        localStorage ← lastSelectedGraphIdConf, lastSelectedGraphRowIndex

Nuova ricerca (fetchGraphData → submit form)
  └─► activeScenarioID = ''   (reset prima di populateGraphTable) [graph-helper.js:148]
```

---

## Comportamento

| Evento | `activeScenarioID` |
|--------|-------------------|
| Pagina caricata | `''` |
| Submit ricerca (nuovi dati) | `''` (reset) |
| Click su riga scenario | `id_conf` della riga selezionata (stringa) |
| Click su riga diversa | `id_conf` della nuova riga |

---

## Differenze rispetto a `activeRiskRunID`

| Aspetto | `activeRiskRunID` | `activeScenarioID` |
|---------|-------------------|--------------------|
| File | `earthquake-helper.js` | `graph-helper.js` |
| Dominio | Hazard (earthquake, heatwave, extremeprecipitation) | Scenario (graph/configurazione) |
| Usata come CQL_FILTER WMS | **Sì** (`id_run=<valore>`) | **No** |
| Struttura per tipo | `activeRiskRunIdByHazard` (un ID per hazard) | singola variabile |
| Sincronizzazione tab | `syncActiveRiskRunIdFromTab()` | non applicabile |

---

## Tabella e UI di Riferimento

- **Partial view:** `Pages/Shared/_BottomBarGraph.cshtml`
- **Tabella:** `id="graphTableBody"`, righe con classe `graph-row`
- **Chiave primaria mostrata:** colonna `id_conf` (seconda colonna)
- **Toggle bottom bar:** `id="graphBottomToggle"` in `_NavigationTabs.cshtml`

---

## Utilizzo

`activeScenarioID` è accessibile globalmente da qualunque script caricato dopo `graph-helper.js`. Esempio di utilizzo:

```js
// Leggere lo scenario selezionato
if (activeScenarioID) {
    console.log('Scenario selezionato:', activeScenarioID);
}
```
