
            // Funzione per gestire la selezione della mappa quando si fa clic su una delle voci del menu a discesa
    $('.dropdown-item').on('click', function () {
        $('.dropdown-menu').removeClass('show');
            });

    var map;
    var currentBaseLayer;
    var currentWmsLayer;

    function initMap() {
        map = new ol.Map({
            target: 'map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                }),
                new ol.layer.Tile({
                    source: new ol.source.TileWMS({
                        url: '@ViewData["wmsurl1"]&',
                        params: { 'LAYERS': '@ViewData["wmslayer1"]', 'TILED': true },
                        serverType: 'geoserver' // Specifica il tipo di server WMS, ad esempio 'geoserver', 'mapserver', ecc.
                    })
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([13.1996, 43.1167]), // Longitudine e latitudine approssimative delle Marche
                zoom: 9 // Livello di zoom iniziale
            })
        });

    // Memorizza il layer corrente (OSM) in modo da poterlo rimuovere quando si cambia la mappa di base
    currentBaseLayer = map.getLayers().getArray()[0];

    // Memorizza il WMS layer corrente (OSM) in modo da poterlo rimuovere quando si cambia la mappa di base
    currentWmsLayer = map.getLayers().getArray()[1];

    // Aggiungi un listener per le coordinate del mouse
    map.on('pointermove', function (event) {
                    var coordinates = ol.proj.toLonLat(event.coordinate);
    var lon = coordinates[0];
    var lat = coordinates[1];
    var lonDMS = convertToDMS(lon, 'lon');
    var latDMS = convertToDMS(lat, 'lat');
    $('#mouseCoordinates').text('Lat: ' + latDMS + ' - Lon: ' + lonDMS);
                });
            }

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
    function changeMap(mapName) {
                var newBaseLayer;
    var newWmsLayer;

    // Rimuove il layer corrente
    map.removeLayer(currentBaseLayer);

    // Rimuove il layer corrente
    map.removeLayer(currentWmsLayer);

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

    newWmsLayer = new ol.layer.Tile({
        source: new ol.source.TileWMS({
        url: '@ViewData["wmsurl1"]&',
    params: {'LAYERS': '@ViewData["wmslayer1"]', 'TILED': true },
    serverType: 'geoserver' // Specifica il tipo di server WMS, ad esempio 'geoserver', 'mapserver', ecc.
                    })
                })

    // Aggiunge il nuovo layer alla mappa
    map.addLayer(newBaseLayer);

    // Aggiunge il nuovo WMS layer alla mappa
    map.addLayer(newWmsLayer);

    // Aggiorna il riferimento al layer corrente
    currentBaseLayer = newBaseLayer;

    // Aggiorna il riferimento al layer corrente
    currentWmsLayer = newWmsLayer;
            }

    $(document).ready(function () {
        initMap();
            });

    // Funzione per cercare gli indirizzi e visualizzare i suggerimenti
    $('#addressInput').on('input', function () {
                var address = $(this).val();
    setTimeout(function () {
                    var url = 'https://nominatim.openstreetmap.org/search?q=' + address + '&format=json&addressdetails=1&limit=5';

    $.getJSON(url, function (data) {
        $('#suggestions').empty();
                        if (data && data.length > 0) {
        $('#suggestions').show();
    $.each(data, function (i, item) {
        $('#suggestions').append('<a href="#" class="list-group-item list-group-item-action">' + item.display_name + '</a>');
                            });
                        } else {
        $('#suggestions').hide();
                        }
                    });
                }, 2000); // 2000 milliseconds delay
            });

    // Funzione per zoomare sulla posizione selezionata dall'utente
    $('#suggestions').on('click', 'a', function (e) {
        e.preventDefault();
    var address = $(this).text();
    var url = 'https://nominatim.openstreetmap.org/search?q=' + address + '&format=json&addressdetails=1&limit=1';

    $.getJSON(url, function (data) {
                    if (data && data.length > 0) {
                        var lon = parseFloat(data[0].lon);
    var lat = parseFloat(data[0].lat);
    map.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
    map.getView().setZoom(15);
    $('#suggestions').hide();
                    }
                });
            });


    // Funzione per pulire l'input di ricerca
    $('#clearSearch').click(function () {
        $('#addressInput').val('');
    $('#suggestions').empty().hide();
            });
 