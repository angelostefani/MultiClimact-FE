/*
* Autore: Angelo Stefani [angelo.stefani@enea.it]
* Data di creazione: 02/01/2024
* Ultimo aggiornamento: 16/09/2024
* 
* Libreria JavaScript per le applicazioni GIS di ENEA.
* Framework utilizzati:
* - OpenLayers
* - JQuery

Panoramica:
- Fornisce funzioni per inizializzare mappe OpenLayers con layer WMS singoli o multipli.
- Integra una “matrice” di configurazione per gestire visibilità, gruppi di layer e legende.
- Supporta parametri extra nei request WMS come ENV e un eventuale risk_run_id globale.

Funzioni Chiave:
- initWMSMap(config): crea una mappa con basemap + un layer WMS opzionale.
    - Parametri principali: targetHtmlMapId, baseMapName, centerLongitude, centerLatitude, zoomValue, wmsUrl, wmsLayer, env.
    - Chiama getBaseMapLayer(...) e, se presente, aggiunge il WMS con addLayerToMap(...).
    - Registra il click sulla mappa con addMapClickListener(...) per le GetFeatureInfo (definita in openlayer-helper.js).
- initWMSMatrixMap(config): crea una mappa con una matrice di layer WMS.
    - Parametri principali: come sopra + layerMatrix (vedi sezione Matrice).
    - Aggiunge i layer WMS previsti dalla matrice e registra il click per GetFeatureInfo.
- addLayerToMap(layersArray, wmsUrl, wmsLayer, env): istanzia un ol.layer.Tile WMS e lo aggiunge ai layers.
    - Imposta params WMS: LAYERS, TILED=true, opzionale ENV, opzionale risk_run_id se definito globalmente in activeRiskRunID.
- toggleLayer(configWMSMatrixMap, layerIndex, map): attiva/disattiva la visibilità del singolo layer indicizzato nella matrice e aggiorna la mappa.
- toggleLayerBlock(configWMSMatrixMap, layerBlockIndex, map, blockSize): attiva/disattiva interi blocchi di layer (per gruppi logici) e aggiorna.
- switchLayer(configWMSMatrixMap, layerIndex, map): rende visibile solo un layer (tutti gli altri off) e aggiorna.
- switchLayers(configWMSMatrixMap, layersIndex, map, blockSize): per ogni blocco, rende visibile solo il layer con offset layersIndex e aggiorna.
- updateMapLayers(configWMSMatrixMap, map): ricostruisce i layer della mappa:
    - Svuota la mappa, aggiunge la basemap OSM.
    - Per ogni riga visibile della matrice, crea e aggiunge il corrispondente TileWMS con serverType='geoserver' e params (inclusi ENV e risk_run_id se presenti).
    - Mostra/nasconde la relativa legenda HTML in base all’id (campo legendId).

Matrice dei Layer:
Ogni riga di layerMatrix è un array con struttura:

- [0] enabled: abilita/disabilita il layer a livello di gruppo/blocco.
- [1] visible: visibilità puntuale del layer.
- [2] wmsUrl: URL del servizio WMS (GeoServer).
- [3] wmsLayerName: nome del layer WMS.
- [4] legendId: id dell’elemento HTML della legenda da mostrare/nascondere.
- [5] env: stringa opzionale da passare come ENV` al WMS.

Un layer viene renderizzato se e solo se enabled && visible è vero.

Dipendenze:
- Basemap e GetFeatureInfo: usa getBaseMapLayer(...) e addMapClickListener(...) definite in wwwroot/js/openlayer-helper.js.
- GetFeatureInfo: il click invia richieste a /api/WmsProxy/GetFeatureInfo tramite proxy server-side (Controllers/WmsProxyController.cs). Nota: il proxy richiede anche il parametro layer; assicurati che addMapClickListener(...) lo
- Variabile globale opzionale: activeRiskRunID se definita, viene aggiunta ai parametri WMS come risk_run_id.

Flusso Operativo:
- Inizializzazione: crea la mappa con la basemap, aggiunge uno o più WMS (diretto o da matrice).
- Interazione: click su mappa → GetFeatureInfo via proxy → popup con attributi (implementato in openlayer-helper.js).
- Gestione layer: funzioni toggle/switch aggiornano flags nella matrice → updateMapLayers(...) ricrea i layer e sincronizza legende.
*/

/**
 * Inizializza una mappa basata su WMS utilizzando OpenLayers.
 *
 * @param {Object} config - Oggetto di configurazione contenente le opzioni della mappa.
 * @param {string} config.targetHtmlMapId - ID del div HTML per il rendering della mappa.
 * @param {string} [config.baseMapName='default'] - Nome del layer della mappa di base.
 * @param {number} config.centerLongitude - Longitudine del centro della mappa.
 * @param {number} config.centerLatitude - Latitudine del centro della mappa.
 * @param {number} [config.zoomValue=9] - Livello di zoom iniziale della mappa.
 * @param {string} [config.wmsUrl] - URL del servizio WMS per i layer sovrapposti.
 * @param {string} [config.wmsLayer] - Nome del layer WMS.
 * @param {string} [config.legendTitle] - Titolo per la leggenda WMS.
 * @param {string} [config.popupContext] - Contesto opzionale per personalizzare il popup GetFeatureInfo.
 * 
 * @returns {ol.Map} L'oggetto mappa di OpenLayers inizializzato.
 */
function initWMSMap(config) {
    let baseMapLayer = getBaseMapLayer(config.baseMapName || 'default');
    baseMapLayer.set('name', 'baseMap');
    let layersArray = [baseMapLayer];

    // Aggiungi il layer WMS se fornito
    let wmsLayerObj = addLayerToMap(layersArray, config.wmsUrl, config.wmsLayer, config.env);

    // Crea la mappa OpenLayers
    let localMap = new ol.Map({
        target: config.targetHtmlMapId,
        layers: layersArray,
        view: new ol.View({
            center: ol.proj.fromLonLat([config.centerLongitude, config.centerLatitude]),
            zoom: config.zoomValue || 9
        })
    });

    // Tagga la mappa con un contesto opzionale per i popup
    if (config.popupContext) {
        localMap.set('popupContext', config.popupContext);
    }

    // Aggiungi il listener per il click sulla mappa
    addMapClickListener(localMap, wmsLayerObj, config.wmsUrl);

    //// Aggiungi la leggenda WMS se necessario
    //if (wmsLayerObj) {
    //    //addWMSLegendControl(localMap, config.wmsUrl, config.wmsLayer, config.legendTitle);
    //}

    // Aggiungi un listener per le coordinate del mouse
    // addMouseCoordinateListener(localMap);

    return localMap;
}

/**
 * Inizializza una mappa con una matrice di layer WMS utilizzando OpenLayers.
 *
 * @param {Object} config - Oggetto di configurazione contenente le opzioni della mappa.
 * @param {string} config.targetHtmlMapId - ID del div HTML per il rendering della mappa.
 * @param {string} [config.baseMapName='default'] - Nome del layer della mappa di base.
 * @param {number} config.centerLongitude - Longitudine del centro della mappa.
 * @param {number} config.centerLatitude - Latitudine del centro della mappa.
 * @param {number} [config.zoomValue=9] - Livello di zoom iniziale della mappa.
 * @param {Array} config.layerMatrix - Matrice che definisce i layer WMS da aggiungere.
 * @param {string} [config.popupContext] - Contesto opzionale per personalizzare il popup GetFeatureInfo.
 * 
 * @returns {ol.Map} L'oggetto mappa di OpenLayers inizializzato.
 */
function initWMSMatrixMap(config) {
    let baseMapLayer = getBaseMapLayer(config.baseMapName || 'default');
    baseMapLayer.set('name', 'baseMap');
    let layersArray = [baseMapLayer];

    // Aggiungi i layer WMS all'array layersArray
    for (let i = 0; i < config.layerMatrix.length; i++) {
        let addLayer = config.layerMatrix[i][0] && config.layerMatrix[i][1]; // TRUE se entrambi sono TRUE
        if (addLayer) {
            addLayerToMap(
                layersArray,
                config.layerMatrix[i][2],
                config.layerMatrix[i][3],
                config.layerMatrix[i][5],
                config.layerMatrix[i][6]
            );
        }
    }

    // Inizializza la mappa OpenLayers
    let localMap = new ol.Map({
        target: config.targetHtmlMapId,
        layers: layersArray,
        view: new ol.View({
            center: ol.proj.fromLonLat([config.centerLongitude, config.centerLatitude]),
            zoom: config.zoomValue || 9
        })
    });
    
    // Tagga la mappa con un contesto opzionale per i popup
    if (config.popupContext) {
        localMap.set('popupContext', config.popupContext);
    }

    // Aggiungi il listener per le coordinate del mouse
    //addMouseCoordinateListener(localMap);

    // Aggiungi il listener per il click sulla mappa
    addMapClickListener(localMap, null, config.wmsUrl);

    return localMap;
}

/**
 * Aggiunge un layer WMS alla mappa e restituisce l'oggetto del layer.
 *
 * @param {Array} layersArray - Array per memorizzare i layer della mappa.
 * @param {string} wmsUrl - URL del servizio WMS.
 * @param {string} wmsLayer - Nome del layer WMS.
 * @param {string} wmsLegend - Nome della legenda.
 * @param {string} [env] - Parametro opzionale per specificare l'ambiente WMS.
 * 
 * @returns {ol.layer.Tile|null} L'oggetto del layer WMS, o null se non aggiunto.
 */
function addLayerToMap(layersArray, wmsUrl, wmsLayer, env, styles) {
    if (wmsUrl && wmsLayer) {
        // Configura i parametri WMS, aggiungendo 'env' se valorizzato
        let params = { 'LAYERS': wmsLayer, 'TILED': true };
        if (styles) {
            params.STYLES = styles;
        }
        if (styles) {
            params.STYLES = styles;
        }
        if (env) {
            params.ENV = env;
        }

        // Aggiungi filtro CQL id_run se definito globalmente
        if (activeRiskRunID && activeRiskRunID.trim() !== '') {
            const runFilter = `id_run=${activeRiskRunID}`;
            params.CQL_FILTER = params.CQL_FILTER
                ? `${params.CQL_FILTER} AND ${runFilter}`
                : runFilter;
        }

        // Crea il layer WMS
        let wmsLayerObj = new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: wmsUrl,
                params: params,
                serverType: 'geoserver'
            })
        });
        layersArray.push(wmsLayerObj);
        return wmsLayerObj;
    }
    return null;
}

/**
 * Attiva/disattiva la visibilità del singolo layer indicizzato nella matrice e aggiorna la mappa.
 *
 * @param {Object} configWMSMatrixMap - Configurazione della matrice di layer.
 * @param {number} layerIndex - L'indice del layer da modificare.
 * @param {Object} map - L'oggetto mappa di OpenLayers.
 */
function toggleLayer(configWMSMatrixMap, layerIndex, map, desiredState) {
    if (typeof desiredState === 'boolean') {
        configWMSMatrixMap.layerMatrix[layerIndex][1] = desiredState;
    } else {
        configWMSMatrixMap.layerMatrix[layerIndex][1] = !configWMSMatrixMap.layerMatrix[layerIndex][1];
    }
    updateMapLayers(configWMSMatrixMap, map);
    if (typeof refreshLegendsIfOpen === 'function') {
        refreshLegendsIfOpen();
    }
}

/**
 * Attiva/disattiva interi blocchi di layer (per gruppi logici) e aggiorna.
 *
 * @param {Object} configWMSMatrixMap - Configurazione della matrice di layer.
 * @param {number} layerBlockIndex - L'indice del blocco di layers da modificare.
 * @param {Object} map - L'oggetto mappa di OpenLayers.
 * @param {number} blockSize - L'ampiezza del blocco di layers.
 */
function toggleLayerBlock(configWMSMatrixMap, layerBlockIndex, map, blockSize, blockStartIndex, desiredState) {
    const startOffset = Number.isInteger(blockStartIndex) ? blockStartIndex : 0;

    // Calcola gli indici di inizio e fine del blocco
    const startIndex = startOffset + (layerBlockIndex * blockSize);
    const endIndex = Math.min(startIndex + blockSize, configWMSMatrixMap.layerMatrix.length);
    if (startIndex >= configWMSMatrixMap.layerMatrix.length) {
        return;
    }

    // Determina il nuovo stato del blocco di layers
    const currentBlockState = configWMSMatrixMap.layerMatrix[startIndex][0];
    const newBlockState = typeof desiredState === 'boolean' ? desiredState : !currentBlockState;

    // Applica il nuovo stato a tutti i layers nel blocco
    for (let i = startIndex; i < endIndex; i++) {
        configWMSMatrixMap.layerMatrix[i][0] = newBlockState;
    }

    // Aggiorna la mappa con le nuove impostazioni di visibilità dei layers
    updateMapLayers(configWMSMatrixMap, map);
    if (typeof refreshLegendsIfOpen === 'function') {
        refreshLegendsIfOpen();
    }
}

/**
 * Attiva il layer specificato e disattiva tutti gli altri.
 *
 * @param {Object} configWMSMatrixMap - Configurazione della matrice di layer.
 * @param {number} layerIndex - L'indice del layer da attivare.
 * @param {Object} map - L'oggetto mappa di OpenLayers.
 */
function switchLayer(configWMSMatrixMap, layerIndex, map) {
    // Itera su tutti i layer e imposta la visibilità
    for (let i = 0; i < configWMSMatrixMap.layerMatrix.length; i++) {
        if (i === layerIndex) {
            // Attiva il layer selezionato
            configWMSMatrixMap.layerMatrix[i][1] = true;
        } else {
            // Disattiva gli altri layer
            configWMSMatrixMap.layerMatrix[i][1] = false;
        }
    }

    // Aggiorna i layer nella mappa e le legende
    updateMapLayers(configWMSMatrixMap, map);
    if (typeof refreshLegendsIfOpen === 'function') {
        refreshLegendsIfOpen();
    }
}

/**
 * Per ogni blocco logico di layers, attiva il layer specificato (rende visibile solo il layer con offset layersIndex) e disattiva tutti gli altri. 
 *
 * @param {Object} configWMSMatrixMap - Configurazione della matrice di layer.
 * @param {number} layersIndex - L'indice del layer da attivare in ogni blocco.
 * @param {Object} map - L'oggetto mappa di OpenLayers.
 * @param {number} blockSize - L'ampiezza del blocco di layers.
 */
function switchLayers(configWMSMatrixMap, layersIndex, map, blockSize, blockStartIndex) {
    const startOffset = Number.isInteger(blockStartIndex) ? blockStartIndex : 0;

    // Itera su tutti i blocchi di layer
    for (let blockIndex = 0; startOffset + (blockIndex * blockSize) < configWMSMatrixMap.layerMatrix.length; blockIndex++) {
        // Calcola gli indici di inizio e fine del blocco
        const startIndex = startOffset + (blockIndex * blockSize);
        const endIndex = Math.min(startIndex + blockSize, configWMSMatrixMap.layerMatrix.length);

        // Attiva solo il layer specificato nel blocco e disattiva tutti gli altri
        for (let i = startIndex; i < endIndex; i++) {
            if (i === startIndex + layersIndex && layersIndex < blockSize) {
                configWMSMatrixMap.layerMatrix[i][1] = true;
            } else {
                configWMSMatrixMap.layerMatrix[i][1] = false;
            }
        }
    }

    // Aggiorna la mappa con le nuove impostazioni di visibilità dei layers
    updateMapLayers(configWMSMatrixMap, map);
    if (typeof refreshLegendsIfOpen === 'function') {
        refreshLegendsIfOpen();
    }
}

/**
 * Aggiorna i layer della mappa e gestisce la visibilità delle legende.
 *  - Svuota la mappa, aggiunge la basemap OSM.
    - Per ogni riga visibile della matrice, crea e aggiunge il corrispondente TileWMS con serverType='geoserver' e params (inclusi ENV e risk_run_id se presenti).
    - Mostra/nasconde la relativa legenda HTML in base all’id (campo legendId).
 *
 * @param {Object} configWMSMatrixMap - Configurazione della matrice di layer.
 * @param {Object} map - L'oggetto mappa di OpenLayers.
 */
function updateMapLayers(configWMSMatrixMap, map) {
    // Rimuovi tutti i layer esistenti dalla mappa
    map.getLayers().clear();

    // Aggiungi i layer di base
    let baseLayer = new ol.layer.Tile({
        source: new ol.source.OSM()
    });
    map.addLayer(baseLayer);

    // Cicla attraverso la layerMatrix e aggiungi i layer visibili
    configWMSMatrixMap.layerMatrix.forEach(function (layerConfig, index) {
        let isVisible = layerConfig[0] && layerConfig[1]; // TRUE se entrambi sono TRUE:
        //[0] enabled: abilita/disabilita il layer a livello di gruppo/blocco.
        //[1] visible: visibilità puntuale del layer.
        let wmsUrl = layerConfig[2]; // URL del servizio WMS (GeoServer).
        let wmsLayerName = layerConfig[3]; // Nome del layer WMS
        let legendId = layerConfig[4]; // ID della legenda corrispondente
        let env = layerConfig[5]; // Parametro env che verrà aggiunto alla richiesta verso geoserver
        let styles = layerConfig[6]; // Parametro STYLES WMS

        // Configura i parametri WMS, aggiungendo 'env' se valorizzato
        let params = { 'LAYERS': wmsLayerName, 'TILED': true };

        if (styles) {
            params.STYLES = styles;
        }
        if (env) {
            params.ENV = env;
        }

        // Aggiungi filtro CQL id_run se definito globalmente
        if (activeRiskRunID && activeRiskRunID.trim() !== '') {
            const runFilter = `id_run=${activeRiskRunID}`;
            params.CQL_FILTER = params.CQL_FILTER
                ? `${params.CQL_FILTER} AND ${runFilter}`
                : runFilter;
        }

        // Aggiungi il layer WMS se è visibile
        if (isVisible) {
            let wmsLayer = new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: wmsUrl,
                    params: params,
                    serverType: 'geoserver'
                })
            });
            map.addLayer(wmsLayer);
        }

        // Gestisci la visibilità della legenda corrispondente
        let legendElement = document.getElementById(legendId);
        if (legendElement) {
            legendElement.style.display = isVisible ? 'block' : 'none';
        }
    });
}

