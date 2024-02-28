// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

//Variabile per puntare alla mappa correntemente visualizzata
var map;

var mapBuildings;
var mapCriticalInfrastructures;
var mapSocialResilience;
var mapEconomicResilience;
var mapOperationalResilience;

function initMap(targetMap) {
    localMap = new ol.Map({
        target: targetMap,
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([13.1996, 43.1167]), // Longitudine e latitudine approssimative delle Marche
            zoom: 9 // Livello di zoom iniziale
        })
    });

    // Aggiungi un listener per le coordinate del mouse
    localMap.on('pointermove', function (event) {
        var coordinates = ol.proj.toLonLat(event.coordinate);
        var lon = coordinates[0];
        var lat = coordinates[1];
        var lonDMS = convertToDMS(lon, 'lon');
        var latDMS = convertToDMS(lat, 'lat');
        $('#mouseCoordinates').text('Lat: ' + latDMS + ' - Lon: ' + lonDMS);
    });
    
    switch (targetMap) {
        case 'mapBuildings':
            mapBuildings = localMap;
            break;
        case 'mapCriticalInfrastructures':
            mapBuildings = localMap;
            break;
        case 'mapSocialResilience':
            mapSocialResilience = localMap;
            break;
        case 'mapEconomicResilience':
            mapEconomicResilience = localMap;
            break;
        case 'mapOperationalResilience':
            mapOperationalResilience = localMap;
            break;
        default:
            mapBuildings = localMap;
            break;
    }
}

function initWMSMap(targetMap, wmsUrl, wmsLayer, mapName) {
     var baseMapLayer;
    
     // Crea il nuovo layer in base alla mappa selezionata
    switch (mapName) {
        case 'OpenStreetMap - EPSG:3857':
            baseMapLayer = new ol.layer.Tile({
                source: new ol.source.OSM()
            });
            break;
        case 'Google Normal - EPSG:3857':
            baseMapLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
                })
            });
            break;
        case 'Google Satellite - EPSG:3857':
            baseMapLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
                })
            });
            break;
        case 'Google Hybrid - EPSG:3857':
            baseMapLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
                })
            });
            break;
        case 'OpenTopoMap':
            baseMapLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png'
                })
            });
            break;
        case 'Sentinel-2 cloudless':
            baseMapLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2018_3857/default/g/{z}/{y}/{x}.jpg'
                })
            });
            break;
        case 'Metacarta - EPSG:4326':
            baseMapLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}'
                })
            });
            break;
        case 'geoSdi - EPSG:4326':
            baseMapLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}'
                })
            });
            break;
        case 'geoSdi No Map - EPSG:4326':
            baseMapLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'http://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'
                })
            });
            break;
        case 'Empty layer - EPSG:3857':
            // Inserire qui la configurazione per un layer vuoto
            break;
        default:
            baseMapLayer = new ol.layer.Tile({
                source: new ol.source.OSM()
            });
            break;
    }
        
    var localMap = new ol.Map({
        target: targetMap,
        layers: [baseMapLayer,
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: wmsUrl,
                    params: { 'LAYERS': wmsLayer, 'TILED': true },
                    serverType: 'geoserver' // Specifica il tipo di server WMS, ad esempio 'geoserver', 'mapserver', ecc.
                })
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([13.1996, 43.1167]), // Longitudine e latitudine approssimative delle Marche
            zoom: 9 // Livello di zoom iniziale
        })
    });

    // Aggiungi un listener per le coordinate del mouse
    localMap.on('pointermove', function (event) {
        var coordinates = ol.proj.toLonLat(event.coordinate);
        var lon = coordinates[0];
        var lat = coordinates[1];
        var lonDMS = convertToDMS(lon, 'lon');
        var latDMS = convertToDMS(lat, 'lat');
        $('#mouseCoordinates').text('Lat: ' + latDMS + ' - Lon: ' + lonDMS);
    });
    
    switch (targetMap) {
        case 'mapBuildings':
            mapBuildings = localMap;
            break;
        case 'mapCriticalInfrastructures':
            mapCriticalInfrastructures = localMap;
            break;
        case 'mapSocialResilience':
            mapSocialResilience = localMap;
            break;
        case 'mapEconomicResilience':
            mapEconomicResilience = localMap;
            break;
        case 'mapOperationalResilience':
            mapOperationalResilience = localMap;
            break;
        default:
            mapBuildings = localMap;
            break;
    }
}

//Funzione per convertire le coordinate longitudine e latitudine
function convertToDMS(coord, coordType) {
    var absCoord = Math.abs(coord);
    var degrees = Math.floor(absCoord);
    var minutes = Math.floor((absCoord - degrees) * 60);
    var seconds = ((absCoord - degrees - minutes / 60) * 3600).toFixed(1);
    var direction = '';

    if (coordType == 'lon') {
        direction = coord >= 0 ? 'N' : 'S';
    } else {
        direction = coord >= 0 ? 'E' : 'W';
    }

    return degrees + '° ' + minutes + '\' ' + seconds + '" ' + direction;
}

// Cambia la mappa di base
function changeMap(mapName, activeTab) {
    var newBaseLayer;

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

    // Rimuove il layer corrente
    map.getLayers().forEach(function (layer) {
        if (layer instanceof ol.layer.Tile) {
            map.removeLayer(layer);
        }
    });

    // Crea il nuovo layer in base alla mappa selezionata
    switch (mapName) {
        case 'OpenStreetMap - EPSG:3857':
            newBaseLayer = new ol.layer.Tile({
                source: new ol.source.OSM()
            });
            break;
        case 'Google Normal - EPSG:3857':
            newBaseLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
                })
            });
            break;
        case 'Google Satellite - EPSG:3857':
            newBaseLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
                })
            });
            break;
        case 'Google Hybrid - EPSG:3857':
            newBaseLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
                })
            });
            break;
        case 'OpenTopoMap':
            newBaseLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png'
                })
            });
            break;
        case 'Sentinel-2 cloudless':
            newBaseLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2018_3857/default/g/{z}/{y}/{x}.jpg'
                })
            });
            break;
        case 'Metacarta - EPSG:4326':
            newBaseLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}'
                })
            });
            break;
        case 'geoSdi - EPSG:4326':
            newBaseLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}'
                })
            });
            break;
        case 'geoSdi No Map - EPSG:4326':
            newBaseLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'http://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'
                })
            });
            break;
        case 'Empty layer - EPSG:3857':
            // Inserire qui la configurazione per un layer vuoto
            break;
        default:
            console.error('Mappa non supportata:', mapName);
            return; // Esce dalla funzione se la mappa non è supportata
    }

    // Aggiunge il nuovo layer alla mappa
    map.addLayer(newBaseLayer);


}

// Function to update breadcrumb and show corresponding tabs
function updateBreadcrumb(section, subSection) {
    $('#breadcrumb').html('<li class="breadcrumb-item"><a href="#">Home</a></li><li class="breadcrumb-item"><a href="#">' + section + '</a></li><li class="breadcrumb-item active" aria-current="page">' + subSection + '</li>');

    // Show corresponding tabs based on the selected subsection
    if (section === 'Risk Analysis') {
        $('#myTab a[href="#' + subSection.toLowerCase() + '"]').tab('show');
    }
}

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
}

// Function to update tabs based on selected dropdown item
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
        map = mapBuildings;

        $('#infrastructures-tab').removeClass('visually-hidden');       

    } else if (selectedItem === 'Resilience') {
        $('#social-tab').removeClass('visually-hidden');
        $('#social-tab').addClass('show active');
        $('#social').addClass('show active');
        map = mapSocialResilience;

        $('#economic-tab').removeClass('visually-hidden');
        $('#operational-tab').removeClass('visually-hidden');
    }
}

// Funzione per aggiungere un'icona puntatore sulla mappa
function addPointer(lon, lat) {
    var pointer = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
    });

    pointer.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: 'https://openlayers.org/en/latest/examples/data/icon.png'
        })
    }));

    var vectorSource = new ol.source.Vector({
        features: [pointer]
    });

    var vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });

    map.addLayer(vectorLayer);
}

function loadGeoJSON() {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];

    if (file) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var geojsonObject = JSON.parse(event.target.result);
            var features = new ol.format.GeoJSON().readFeatures(geojsonObject);
            vectorSource.clear();
            vectorSource.addFeatures(features);
        };
        reader.readAsText(file);
    }
}

