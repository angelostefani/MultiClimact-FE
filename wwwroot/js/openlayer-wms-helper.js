/*
* Autore: Angelo Stefani [angelo.stefani@enea.it]
* Data di creazione: 02/01/2024
* Ultimo aggiornamento: 16/09/2024
* 
* Libreria JavaScript per le applicazioni GIS di ENEA.
* Framework utilizzati:
* - OpenLayers
* - Bootstrap
* - JQuery
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
            addLayerToMap(layersArray, config.layerMatrix[i][2], config.layerMatrix[i][3], config.layerMatrix[i][5]);
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
function addLayerToMap(layersArray, wmsUrl, wmsLayer, env) {
    if (wmsUrl && wmsLayer) {
        // Configura i parametri WMS, aggiungendo 'env' se valorizzato
        let params = { 'LAYERS': wmsLayer, 'TILED': true };
        if (env) {
            params.ENV = env;
        }

        if (activeRiskRunID && activeRiskRunID.trim() !== '') {
            params.risk_run_id = activeRiskRunID;
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
 * Attiva o disattiva la visibilità di un layer specifico nella mappa.
 *
 * @param {Object} configWMSMatrixMap - Configurazione della matrice di layer.
 * @param {number} layerIndex - L'indice del layer da modificare.
 * @param {Object} map - L'oggetto mappa di OpenLayers.
 */
function toggleLayer(configWMSMatrixMap, layerIndex, map) {
    configWMSMatrixMap.layerMatrix[layerIndex][1] = !configWMSMatrixMap.layerMatrix[layerIndex][1];
    updateMapLayers(configWMSMatrixMap, map);
}

/**
 * Attiva o disattiva la visibilità di un blocco di layers nella mappa.
 *
 * @param {Object} configWMSMatrixMap - Configurazione della matrice di layer.
 * @param {number} layerBlockIndex - L'indice del blocco di layers da modificare.
 * @param {Object} map - L'oggetto mappa di OpenLayers.
 * @param {number} blockSize - L'ampiezza del blocco di layers.
 */
function toggleLayerBlock(configWMSMatrixMap, layerBlockIndex, map, blockSize) {
    // Calcola gli indici di inizio e fine del blocco
    const startIndex = layerBlockIndex * blockSize;
    const endIndex = Math.min(startIndex + blockSize, configWMSMatrixMap.layerMatrix.length);

    // Determina il nuovo stato del blocco di layers
    const currentBlockState = configWMSMatrixMap.layerMatrix[startIndex][0];
    const newBlockState = !currentBlockState;

    // Applica il nuovo stato a tutti i layers nel blocco
    for (let i = startIndex; i < endIndex; i++) {
        configWMSMatrixMap.layerMatrix[i][0] = newBlockState;
    }

    // Aggiorna la mappa con le nuove impostazioni di visibilità dei layers
    updateMapLayers(configWMSMatrixMap, map);
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
}

/**
 * Attiva il layer specificato in ogni blocco e disattiva tutti gli altri.
 *
 * @param {Object} configWMSMatrixMap - Configurazione della matrice di layer.
 * @param {number} layersIndex - L'indice del layer da attivare in ogni blocco.
 * @param {Object} map - L'oggetto mappa di OpenLayers.
 * @param {number} blockSize - L'ampiezza del blocco di layers.
 */
function switchLayers(configWMSMatrixMap, layersIndex, map, blockSize) {
    // Itera su tutti i blocchi di layer
    for (let blockIndex = 0; blockIndex * blockSize < configWMSMatrixMap.layerMatrix.length; blockIndex++) {
        // Calcola gli indici di inizio e fine del blocco
        const startIndex = blockIndex * blockSize;
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
}

/**
 * Aggiorna i layer della mappa e gestisce la visibilità delle legende.
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
        let isVisible = layerConfig[0] && layerConfig[1];
        let wmsUrl = layerConfig[2];
        let wmsLayerName = layerConfig[3];
        let legendId = layerConfig[4]; // ID della legenda corrispondente
        let env = layerConfig[5]; // Parametro env che verrà aggiunto alla richiesta verso geoserver

        // Configura i parametri WMS, aggiungendo 'env' se valorizzato
        let params = { 'LAYERS': wmsLayerName, 'TILED': true };

        if (env) {
            params.ENV = env;
        }

        if (activeRiskRunID && activeRiskRunID.trim() !== '') {
            params.risk_run_id = activeRiskRunID;
        }

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

        // Gestione della visibilità della legenda
        let legendElement = document.getElementById(legendId);
        if (legendElement) {
            legendElement.style.display = isVisible ? 'block' : 'none';
        }
    });
}