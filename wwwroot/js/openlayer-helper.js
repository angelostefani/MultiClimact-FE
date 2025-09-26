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
        let valo = "";
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
                for (let i = layers.length - 1; i > 0; i--) {
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
                        if (i > 1)
                            valo = valo + params.LAYERS + ",";
                        else
                            valo = valo + params.LAYERS;
                        //break;
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
        layerName = valo;
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
                    //alert(response.json());
                    return response.text();
                })
                .then(html => {
                    if (!html) {
                        // Caso 404 gestito sopra: nessun popup
                        popupElement.style.display = 'none';
                        return;
                    }

                    /** 
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
                  
                      console.log("stampa di properties di data", data.properties.category);
  
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
                     **/
                    //popupElement.innerHTML = lines.join('<br>');
                    //let unito = lines.join();
                    //unito = unito.replaceAll(",", " ");
                    //  popupElement.innerHTML = unito;


                    /**
                       * logica popup per le extreme precepitation
                       * 1) attraverso il parsing dell html di risposta di geoserver
                       * prendo i campi 'category' e 'layer', cosi attraverso un blocco
                       * if-else sono sicuro che il bottone sul getFeatureInfo() è solo ed esclusivo per la extreme precipitation.
                       * 2) mi tengo questi riferimenti a questi campi che mi saranno utili in un altro file js. 
                       * 3) implemento le domande sul sul file js che descrivera la logica del popup.
                       * @author Jacopo Orru'
                       */

                    const doc = new DOMParser().parseFromString(html, 'text/html');

                    // 2) Prendi la (prima) tabella featureInfo
                    const table = doc.querySelector('table.featureInfo');

                    if (!table) {
                        console.warn('Nessuna table.featureInfo trovata nel GetFeatureInfo');
                        popupElement.style.display = 'none';
                        return;
                    }
                    const styleHtml = doc.querySelector('style')?.outerHTML || `
                    <style>
                    table.featureInfo, table.featureInfo td, table.featureInfo th {
                    border:1px solid #ddd; border-collapse:collapse; margin:0; padding:.2em .1em; font-size:90%;
                    }
                    table.featureInfo th { font-weight:bold; background:#eee; padding:.2em .2em; }
                    table.featureInfo td { background:#fff; }
                    table.featureInfo tr.odd td { background:#eee; }
                    table.featureInfo caption { text-align:left; font-size:100%; font-weight:bold; padding:.2em .2em; }
                    </style>`;

                    //prendo il nome del layer 
                    const fromCaption = table.querySelector('caption')?.textContent?.trim();
                    let layer = fromCaption;
                    console.log("nome del layer preso dal parsing", layer);

                    // header & righe
                    const headerTr = [...table.querySelectorAll('tr')].find(tr => tr.querySelectorAll('th').length) || null;
                    const headers = headerTr ? [...headerTr.querySelectorAll('th')].map(th => th.textContent.trim()) : [];
                    const rows = [...table.querySelectorAll('tr')].filter(tr => tr.querySelectorAll('td').length);

                    // trova la colonna ID (fid/id/poi_id/...)
                    const lowerHeaders = headers.map(h => h.toLowerCase());
                    const idCandidates = ['id'];
                    let idIdx = -1;
                    for (const n of idCandidates) { idIdx = lowerHeaders.indexOf(n); if (idIdx !== -1) break; }
                    const getRowId = (tr) => {
                        const tds = [...tr.querySelectorAll('td')];
                        const idx = idIdx >= 0 ? idIdx : 0; // fallback: prima cella
                        return (tds[idx]?.textContent || '').trim();
                    };

                    // aggiungi colonna "Azioni" una sola volta
                    const ensureActionsHeader = () => {
                        if (!headerTr) return; // se non c'è header, la aggiungeremo solo come <td>
                        const exists = [...headerTr.querySelectorAll('th')]
                            .some(th => th.textContent.trim().toLowerCase() === 'actions');
                        if (!exists) {
                            const th = doc.createElement('th');
                            th.textContent = 'actions';
                            headerTr.appendChild(th);
                        }
                    };

                    // mappa per i click (id -> true), serve solo per validare l'id
                    const idSet = new Set();


                    if (layer != null && layer.trim().toLowerCase() === "riverflood_rb_view") {
                        ensureActionsHeader();
                        rows.forEach((tr) => {
                            const id = getRowId(tr);
                            idSet.add(id);

                            const td = doc.createElement('td');
                            const btn = doc.createElement('button');
                            btn.type = 'button';
                            btn.textContent = 'Vulnerability';
                            btn.setAttribute('data-id', id);
                            btn.setAttribute('data-popup-type', 'building');
                            btn.style.cssText = 'padding:6px 10px; font-size:90%; border:1px solid #ccc; background:#f7f7f7; border-radius:6px; cursor:pointer;';
                            td.appendChild(btn);
                            tr.appendChild(td);
                        });
                        popupElement.innerHTML = table.outerHTML + styleHtml;  // <-- QUI dentro al ramo
                        popupElement.style.display = 'block';
                        popupOverlay.setPosition(evt.coordinate);

                    } else if (layer != null && layer.trim().toLowerCase() === "earth_real_view") {
                        ensureActionsHeader();
                        rows.forEach((tr) => {
                            const id = getRowId(tr);
                            idSet.add(id);

                            const td = doc.createElement('td');
                            const btn = doc.createElement('button');
                            btn.type = 'button';
                            btn.textContent = 'Vulnerability';
                            btn.setAttribute('data-id', id);
                            btn.setAttribute('data-popup-type', 'infrastructure');
                            btn.style.cssText = 'padding:6px 10px; font-size:90%; border:1px solid #ccc; background:#f7f7f7; border-radius:6px; cursor:pointer;';
                            td.appendChild(btn);
                            tr.appendChild(td);
                        });
                        popupElement.innerHTML = styleHtml + table.outerHTML;  // <-- QUI dentro al ramo
                        popupElement.style.display = 'block';
                        popupOverlay.setPosition(evt.coordinate);
                    } else {
                        // Costruzione contenuto popup: se presenti campi noti, mostriamoli; in ogni caso, aggiungiamo un riepilogo generico
                        popupElement.innerHTML = html;
                        popupElement.style.display = 'block';
                        popupOverlay.setPosition(evt.coordinate);
                    }

                    if (popupElement.__btnHandler__) {
                        popupElement.removeEventListener('click', popupElement.__btnHandler__);
                    }
                    popupElement.__btnHandler__ = function (e) {
                        const btn = e.target.closest('button[data-id]');
                        if (!btn) return;

                        const id = btn.getAttribute('data-id');
                        if (!id) return;

                        // category = "building" | "infrastructure" (o "building" di default)
                        const category = (btn.getAttribute('data-popup-type') || 'building').toLowerCase();

                        // Apri la pagina passando id e category
                        const url = `/VulnerabilityForm?id=${encodeURIComponent(id)}&category=${encodeURIComponent(category)}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                    };
                    popupElement.addEventListener('click', popupElement.__btnHandler__);

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
