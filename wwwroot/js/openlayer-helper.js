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
 * Recupera il layer della mappa di base in base al baseMapName fornito.
 *
 * @param {string} baseMapName - Il nome della mappa di base.
 * 
 * @returns {ol.layer.Tile} Il layer Tile di OpenLayers corrispondente.
 */
function getBaseMapLayer(baseMapName) {
    const baseMapLayers = {
        'OpenStreetMap - EPSG:3857': new ol.layer.Tile({ source: new ol.source.OSM() }),
        'Google Normal - EPSG:3857': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
            })
        }),
        'Google Satellite - EPSG:3857': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
            })
        }),
        'Google Hybrid - EPSG:3857': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
            })
        }),
        'OpenTopoMap': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png'
            })
        }),
        'Sentinel-2 cloudless': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2018_3857/default/g/{z}/{y}/{x}.jpg'
            })
        }),
        'Stamen Terrain': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg'
            })
        }),
        'Stamen Toner Lite': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png'
            })
        }),
        'Stamen Watercolor': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg'
            })
        }),
        'CartoDB Positron': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                attributions: '© <a href="https://www.carto.com/">CARTO</a>',
                subdomains: ['a', 'b', 'c', 'd']
            })
        }),
        'CartoDB Dark Matter': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                attributions: '© <a href="https://www.carto.com/">CARTO</a>',
                subdomains: ['a', 'b', 'c', 'd']
            })
        }),
        'Carto Voyager': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                attributions: '© <a href="https://www.carto.com/">CARTO</a>',
                subdomains: ['a', 'b', 'c', 'd']
            })
        }),
        'Hike & Bike': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
                attributions: '© OpenStreetMap contributors'
            })
        }),
        'OSM Bright': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://{a-c}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
                attributions: '© OpenStreetMap contributors'
            })
        }),
        'Humanitarian OSM': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                attributions: '© OpenStreetMap contributors'
            })
        }),
        'National Geographic Style': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png',
                attributions: '© <a href="https://www.carto.com/">CARTO</a>',
                subdomains: ['a', 'b', 'c', 'd']
            })
        }),
        'Esri World Topographic': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
                attributions: '© Esri'
            })
        }),
        'Esri World Imagery': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attributions: '© Esri'
            })
        }),
        'Esri Ocean Basemap': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
                attributions: '© Esri'
            })
        }),
        'Thunderforest Outdoor': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=YOUR_API_KEY',
                attributions: '© Thunderforest'
            })
        }),
        'Thunderforest Landscape': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=YOUR_API_KEY',
                attributions: '© Thunderforest'
            })
        }),
        'Thunderforest Transport': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=YOUR_API_KEY',
                attributions: '© Thunderforest'
            })
        }),
        'Natural Earth II': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://{s}.naturalearthtiles.com/{z}/{x}/{y}.png',
                attributions: '© Natural Earth'
            })
        }),
        'NASAGIBS Blue Marble': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief/default/{Time}/{TileMatrixSet}/{z}/{y}/{x}.jpg',
                attributions: '© NASA'
            })
        }),
        'NASAGIBS MODIS Terra': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_SurfaceReflectance_Bands721/default/{Time}/{TileMatrixSet}/{z}/{y}/{x}.jpg',
                attributions: '© NASA'
            })
        }),
        'World Relief Map': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://tiles.maps.eox.at/wmts/1.0.0/terrain-light/default/g/{z}/{y}/{x}.png',
                attributions: '© EOX'
            })
        }),
        'ESA Land Cover': new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://tiles.maps.eox.at/wmts/1.0.0/landcover/default/g/{z}/{y}/{x}.png',
                attributions: '© ESA'
            })
        }),
        'default': new ol.layer.Tile({ source: new ol.source.OSM() })
    };

    return baseMapLayers[baseMapName] || baseMapLayers['default'];
}


/**
 * Aggiunge un listener per la richiesta GetFeatureInfo.
 *
 * @param {ol.Map} map - Mappa di OpenLayers.
 * @param {ol.layer.Tile} wmsLayer - Layer WMS.
 * @param {string} wmsUrl - URL del servizio WMS.
 */
function addMapClickListener(map, wmsLayer, wmsUrl) {
    let popupElement = document.createElement('div');
    popupElement.id = 'popup';
    popupElement.style.position = 'absolute';
    popupElement.style.background = 'white';
    popupElement.style.padding = '5px';
    popupElement.style.border = '1px solid black';
    popupElement.style.display = 'none';
    document.body.appendChild(popupElement);

    let popupOverlay = new ol.Overlay({
        element: popupElement,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10]
    });
    map.addOverlay(popupOverlay);

    map.on('singleclick', async function (evt) {
        // Determine the target WMS layer name to query
        let layerName = null;
        try {
            if (wmsLayer && typeof wmsLayer.getSource === 'function') {
                const src = wmsLayer.getSource();
                const params = src && typeof src.getParams === 'function' ? src.getParams() : null;
                if (params && params.LAYERS) {
                    layerName = (params.LAYERS + '').split(',')[0].trim();
                }
            }
            if (!layerName && map && typeof map.getLayers === 'function') {
                const layers = map.getLayers().getArray ? map.getLayers().getArray() : [];
                for (let i = layers.length - 1; i >= 0; i--) {
                    const lyr = layers[i];
                    const visible = typeof lyr.getVisible === 'function' ? lyr.getVisible() : true;
                    if (!visible) continue;
                    const src = lyr && typeof lyr.getSource === 'function' ? lyr.getSource() : null;
                    // Accept TileWMS sources only
                    const isTileWMS = src && (
                        (typeof ol !== 'undefined' && ol.source && src instanceof ol.source.TileWMS) ||
                        (typeof src.getParams === 'function' && typeof src.getUrls === 'function')
                    );
                    if (!isTileWMS) continue;
                    const params = typeof src.getParams === 'function' ? src.getParams() : null;
                    if (params && params.LAYERS) {
                        layerName = (params.LAYERS + '').split(',')[0].trim();
                        break;
                    }
                }
            }
        } catch (e) {
            console.warn('Impossibile determinare il layer WMS per GetFeatureInfo:', e);
        }

        // Early-exit: se non è stato determinato alcun layer WMS visibile, evita la fetch
        if (!layerName) {
            console.warn('Nessun layer WMS visibile selezionabile per GetFeatureInfo. Interrompo la richiesta.');
            popupElement.style.display = 'none';
            return;
        }
        let bbox = map.getView().calculateExtent();
        const mapSize = map.getSize();
        const width = mapSize[0];
        const height = mapSize[1];
        let x = Math.round(evt.pixel[0]);
        let y = Math.round(evt.pixel[1]);

        if (x >= 0 && x <= width && y >= 0 && y <= height) {
            let url = `/api/WmsProxy/GetFeatureInfo?bbox=${bbox}&x=${x}&y=${y}&width=${width}&height=${height}`;
            url += `&layer=${encodeURIComponent(layerName)}`;

            const ts = new Date().toISOString();
            console.info(`[${ts}] GetFeatureInfo request -> layer: ${layerName}, x: ${x}, y: ${y}, size: ${width}x${height}, bbox: ${bbox}`);

            //---------------------------------------------------------------------------------------
            fetch(url)
                .then(response => {
                    if (response.status === 404) {
                        // Nessuna feature trovata sotto al click: silenzioso, niente errori in console
                        return null;
                    }
                    if (!response.ok) {
                        throw new Error("Errore nella richiesta al WMS: " + response.statusText);
                    }
                    // alert(response.json());
                    return response.json();
                })
                .then(data => {
                    if (!data) {
                        // Caso 404 gestito sopra: nessun popup
                        popupElement.style.display = 'none';
                        return;
                    }

                    // Costruzione contenuto popup: se presenti campi noti, mostriamoli; in ogni caso, aggiungiamo un riepilogo generico
                    const lines = [];
                    lines.push('<strong>Informazioni:</strong>');
                    const known = [
                        ['Latitudine', data.lat],
                        ['Longitudine', data.lon],
                        ['Abitanti', data.residents],
                        ['Seismic V', data.seismic_v],
                        ['Vs30', data.vs30],
                        ['Regione', data.region],
                        ['Città', data.town]
                    ];
                    known.forEach(([label, val]) => {
                        if (val !== undefined && val !== null && String(val).trim() !== '') {
                            lines.push(`${label}: ${val}`);
                        }
                    });

                    // Riepilogo generico da data.properties (se presente)
                    if (data.properties && typeof data.properties === 'object') {
                        const keys = Object.keys(data.properties);
                        if (keys.length > 0) {
                            lines.push('<hr style="margin:4px 0;">');
                            lines.push('<strong>Dettagli:</strong>');
                            lines.push('<table style="font-size: 12px; border-collapse: collapse;">');
                            keys.forEach(k => {
                                const v = data.properties[k];
                                if (v !== undefined && v !== null && String(v).trim() !== '') {
                                    const escK = String(k).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                    const escV = String(v).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                    lines.push(`<tr><td style="padding-right:6px; vertical-align: top;"><em>${escK}</em></td><td>${escV}</td></tr>`);
                                }
                            });
                            lines.push('</table>');
                        }
                    }

                    popupElement.innerHTML = lines.join('<br>');
                    popupElement.style.display = 'block';
                    popupOverlay.setPosition(evt.coordinate);
                })
                .catch(error => {
                    console.error('Errore nella GetFeatureInfo:', error);
                    popupElement.style.display = 'none';
                });
        } else {
            console.error("Le coordinate del punto cliccato sono fuori dal range accettabile.");
        }
    });
}
