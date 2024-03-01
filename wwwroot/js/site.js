// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

/*
* Autore: Angelo Stefani [angelo.stefani@enea.it]
* Data creazione: 01/02/2024
* Data aggiornamento: 01/03/2024
* 
* Libreria Javascript per applicativi GIS ENEA.
* Framework utilizzati:
* - Bootstrap
* - OpenLayer 
*/

//Variabile per tenere traccia della TAB attiva
let activeTab = 'buildings';

//Variabili per contenere le mappe OpenLayer di ciascuna TAB
let mapBuildings;
let mapCriticalInfrastructures;
let mapSocialResilience;
let mapEconomicResilience;
let mapOperationalResilience;

/*
* Autore: Angelo Stefani [angelo.stefani@enea.it]
* Data: 29/02/2024
* Questa funzione JavaScript, denominata initWMSMap, è progettata per inizializzare una mappa utilizzando OpenLayers, una libreria JavaScript per la visualizzazione di mappe interattive.
* La funzione accetta quattro parametri:
* @param {string} targetHtmlMapId - Il nome del div HTML in cui verrà renderizzata la mappa.
* 
*/
function initMap(targetHtmlMapId) {
    let centerLatitude = 13.1996
    let centerLongitude = 43.1167
    let zoomValue = 9

    return initWMSMap(targetHtmlMapId, '', centerLatitude, centerLongitude, zoomValue, '', '');
}

/*
* Autore: Angelo Stefani [angelo.stefani@enea.it]
* Data: 29/02/2024
* 
* Questa funzione JavaScript, denominata initWMSMap, è progettata per inizializzare una mappa utilizzando OpenLayers, una libreria JavaScript per la visualizzazione di mappe interattive.
* La funzione accetta quattro parametri:
* @param {string} targetHtmlMapId - Il nome del div HTML in cui verrà renderizzata la mappa.
* @param {string} baseMapName - Il nome della mappa di base da utilizzare come sfondo.
* @param {string} wmsUrl - L'URL del servizio WMS (Web Map Service) per il layer WMS da visualizzare sulla mappa.
* @param {string} wmsLayer - Il nome del layer WMS da visualizzare sulla mappa.
*  
* La funzione crea un nuovo layer di mappa di base in base al baseMapName fornito utilizzando uno switch-case per determinare quale tipo di mappa di base deve essere utilizzato. Quindi crea una nuova istanza di ol.Map con il target specificato, i layer di mappa di base e il layer WMS specificato. Imposta anche una vista predefinita per la mappa.
* Inoltre, aggiunge un listener per seguire le coordinate del mouse sulla mappa e visualizzarle in un elemento HTML con id mouseCoordinates.
* Infine, utilizza un altro switch-case per assegnare la mappa appena creata a una variabile globale in base al nome del target della mappa specificato.
* Questa funzione è progettata per essere utilizzata all'interno di un'applicazione web che necessita di visualizzare mappe interattive con layer WMS sovrapposti.
*/
function initWMSMap(targetHtmlMapId, baseMapName, centerLatitude, centerLongitude, zoomValue, wmsUrl, wmsLayer) {
    let baseMapLayer; //basemap layer, con la basemap selezionata.
    let localMap; //variabile per creare e restituire in output la mappa OpenLayer creata.
    let layersArray; //array per contenere i layer della mappa.

    baseMapLayer = getBaseMapLayer(baseMapName); // Crea il nuovo base map layer, con la mappa selezionata
    baseMapLayer.set('name', 'baseMap'); // Assegna un nome al nuovo layer di base

    layersArray = [baseMapLayer]; // Array per i layer della mappa

    // Verifica se le variabili wmsUrl e wmsLayer sono valorizzate
    if (wmsUrl && wmsLayer) {
        // Se entrambe le variabili sono valorizzate, crea il layer WMS Geoserver
        layersArray.push(new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: wmsUrl,
                params: { 'LAYERS': wmsLayer, 'TILED': true },
                serverType: 'geoserver'
            })
        }));
    }

    // Crea la mappa OpenLayers con o senza il layer WMS Geoserver in base alle variabili
    localMap = new ol.Map({
        target: targetHtmlMapId,
        layers: layersArray, // Utilizza l'array dei layer creati
        view: new ol.View({ center: ol.proj.fromLonLat([centerLatitude, centerLongitude]), zoom: zoomValue })
    });
    
    // Aggiungi un listener per le coordinate del mouse
    localMap.on('pointermove', function (event) {
        let coordinates = ol.proj.toLonLat(event.coordinate);
        let lon = coordinates[0];
        let lat = coordinates[1];
        let lonDMS = convertToDMS(lon, 'lon');
        let latDMS = convertToDMS(lat, 'lat');
        $('#mouseCoordinates').text('Lat: ' + latDMS + ' - Lon: ' + lonDMS);
    });

    return localMap;
}

/*
* Autore: Angelo Stefani [angelo.stefani@enea.it]
* Data: 29/02/2024
* Funzione che restituisce il layer basemap in funzione del nome baseMapName desiderato.
*/
function getBaseMapLayer(baseMapName) {
    let baseMapLayer;

    switch (baseMapName) {
        case 'OpenStreetMap - EPSG:3857':
            baseMapLayer = new ol.layer.Tile({ source: new ol.source.OSM() });
            break;
        case 'Google Normal - EPSG:3857':
            baseMapLayer = new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}' }) });
            break;
        case 'Google Satellite - EPSG:3857':
            baseMapLayer = new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}' }) });
            break;
        case 'Google Hybrid - EPSG:3857':
            baseMapLayer = new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' }) });
            break;
        case 'OpenTopoMap':
            baseMapLayer = new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png' }) });
            break;
        case 'Sentinel-2 cloudless':
            baseMapLayer = new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2018_3857/default/g/{z}/{y}/{x}.jpg' }) });
            break;
        case 'Metacarta - EPSG:4326':
            baseMapLayer = new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}' }) });
            break;
        case 'geoSdi - EPSG:4326':
            baseMapLayer = new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}' }) });
            break;
        case 'geoSdi No Map - EPSG:4326':
            baseMapLayer = new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'http://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}' }) });
            break;
        case 'Empty layer - EPSG:3857':
            // Inserire qui la configurazione per un layer vuoto
            break;
        default:
            baseMapLayer = new ol.layer.Tile({ source: new ol.source.OSM() });
            break;
    }
    return baseMapLayer;
}

/*
* Autore: Angelo Stefani [angelo.stefani@enea.it]
* Data: 29/02/2024
* Funzione per convertire le coordinate longitudine e latitudine
*/
function convertToDMS(coord, coordType) {
    let absCoord = Math.abs(coord);
    let degrees = Math.floor(absCoord);
    let minutes = Math.floor((absCoord - degrees) * 60);
    let seconds = ((absCoord - degrees - minutes / 60) * 3600).toFixed(1);
    let direction = '';

    if (coordType == 'lon') {
        direction = coord >= 0 ? 'N' : 'S';
    } else {
        direction = coord >= 0 ? 'E' : 'W';
    }

    return degrees + '° ' + minutes + '\' ' + seconds + '" ' + direction;
}

/*
* Autore: Angelo Stefani [angelo.stefani@enea.it]
* Data: 29/02/2024
* Funzione cambiare la mappa di base
*/
function changeMap(baseMapName, activeTab) {
    let baseMapLayer = getBaseMapLayer(baseMapName);
    baseMapLayer.set('name', 'baseMap'); // Assegna un nome al nuovo layer di base

    let map;

    map = getMapFromActiveTab(activeTab, map);

    if (map) {
        // Rimuovi il layer di base corrente dalla mappa
        map.getLayers().forEach(function (layer, index) {
            // Verifica se il layer è un layer di base e sostituiscilo con il nuovo layer di base
            if (layer.get('name') === 'baseMap') {
                map.getLayers().setAt(index, baseMapLayer);
            }
        });
    }
}

/*
* Autore: Angelo Stefani [angelo.stefani@enea.it]
* Data: 29/02/2024
* Funzione che restituisce la mappa OpenLayer associata alla TAB
*/
function getMapFromActiveTab(activeTab, map) {
    switch (activeTab) {
        case 'buildings':
            map = mapBuildings;
            break;
        case 'infrastructures':
            map = mapCriticalInfrastructures;
            break;
        case 'social':
            map = mapSocialResilience;
            break;
        case 'economic':
            map = mapEconomicResilience;
            break;
        case 'operational':
            map = mapOperationalResilience;
            break;
        default:
            map = mapBuildings;
            break;
    }
    return map;
}

/*
* Autore: Angelo Stefani [angelo.stefani@enea.it]
* Data: 29/02/2024
* Function to update breadcrumb and show corresponding tabs
*/
function updateBreadcrumb(section, subSection) {
    $('#breadcrumb').html('<li class="breadcrumb-item"><a href="#">Home</a></li><li class="breadcrumb-item"><a href="#">' + section + '</a></li><li class="breadcrumb-item active" aria-current="page">' + subSection + '</li>');

    // Show corresponding tabs based on the selected subsection
    if (section === 'Risk Analysis') {
        $('#myTab a[href="#' + subSection.toLowerCase() + '"]').tab('show');
    }
}

/*
* Autore: Angelo Stefani [angelo.stefani@enea.it]
* Data: 29/02/2024
* Funzione per inizializzare i tabs
*/
function initTabs() {
    $('#buildings-tab').removeClass('show active');
    $('#infrastructures-tab').removeClass('show active');
    $('#social-tab').removeClass('show active');
    $('#economic-tab').removeClass('show active');
    $('#operational-tab').removeClass('show active');

    $('#buildings-tab').addClass('visually-hidden');
    $('#infrastructures-tab').addClass('visually-hidden');
    $('#social-tab').addClass('visually-hidden');
    $('#economic-tab').addClass('visually-hidden');
    $('#operational-tab').addClass('visually-hidden');

    activeTab = 'buildings';
}

/*
* Autore: Angelo Stefani [angelo.stefani@enea.it]
* Data: 29/02/2024
* Function to update tabs based on selected dropdown item
*/
function updateTabs(selectedItem) {
    // Hide all tabs
    $('#myTabContent').children('.tab-pane').removeClass('show active');
    $('#myTabContent').children('.tab-pane').addClass('fade');

    initTabs();

    // Show corresponding tabs based on selected dropdown item
    if (selectedItem === 'Damages') {
        $('#buildings-tab').removeClass('visually-hidden');
        $('#buildings-tab').addClass('show active');
        $('#buildings').addClass('show active');

        $('#infrastructures-tab').removeClass('visually-hidden');

        activeTab = 'buildings';

    } else if (selectedItem === 'Resilience') {
        $('#social-tab').removeClass('visually-hidden');
        $('#social-tab').addClass('show active');
        $('#social').addClass('show active');

        $('#economic-tab').removeClass('visually-hidden');
        $('#operational-tab').removeClass('visually-hidden');

        activeTab = 'social';
    }
}

/*
* Autore: Angelo Stefani [angelo.stefani@enea.it]
* Data: 29/02/2024
* Funzione per aggiungere un'icona puntatore sulla mappa
*/
function addPointer(lon, lat, activeTab) {
    let pointer = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
    });

    pointer.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: 'https://openlayers.org/en/latest/examples/data/icon.png'
        })
    }));

    let vectorSource = new ol.source.Vector({
        features: [pointer]
    });

    let vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });

    let map ;
    map = getMapFromActiveTab(activeTab, map);
    map.addLayer(vectorLayer);
}

function loadGeoJSON() {
    let fileInput = document.getElementById('fileInput');
    let file = fileInput.files[0];

    if (file) {
        let reader = new FileReader();
        reader.onload = function (event) {
            let geojsonObject = JSON.parse(event.target.result);
            let features = new ol.format.GeoJSON().readFeatures(geojsonObject);
            vectorSource.clear();
            vectorSource.addFeatures(features);
        };
        reader.readAsText(file);
    }
}