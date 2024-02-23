// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

var map;
var currentBaseLayer;

function initMap() {
    map = new ol.Map({
        target: 'map',
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
    map.on('pointermove', function (event) {
        var coordinates = ol.proj.toLonLat(event.coordinate);
        var lon = coordinates[0];
        var lat = coordinates[1];
        var lonDMS = convertToDMS(lon, 'lon');
        var latDMS = convertToDMS(lat, 'lat');
        $('#mouseCoordinates').text('Lat: ' + latDMS + ' - Lon: ' + lonDMS);
    });

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

    // Funzione per gestire la selezione della mappa quando si fa clic su una delle voci del menu a discesa
    $('.dropdown-item').on('click', function () {
        $('.dropdown-menu').removeClass('show');
    });
}

// Cambia la mappa di base
function changeMap(mapName) {
    var newBaseLayer;
    var newWmsLayer;

    // Rimuove il layer corrente
    map.removeLayer(currentBaseLayer);

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

    // Aggiorna il riferimento al layer corrente
    currentBaseLayer = newBaseLayer;

}