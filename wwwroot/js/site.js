/*
* Author: Angelo Stefani [angelo.stefani@enea.it]
* Creation date: 02/01/2024
* Update date: 05/15/2024
* 
* JavaScript library for ENEA GIS applications.
* Frameworks used:
* - Bootstrap
* - OpenLayer
* - JQuery
*/

// Variable to track the active TAB
let activeTab = 'tabB1-tab';

// Variables to hold the OpenLayer maps for each TAB
let mapBuildings;
let mapCriticalInfrastructures;
let mapSocialResilience;
let mapEconomicResilience;
let mapOperationalResilience;

/*
* Author: Angelo Stefani [angelo.stefani@enea.it]
* Date: 02/29/2024
* This JavaScript function, named initWMSMap, is designed to initialize a map using OpenLayers, a JavaScript library for displaying interactive maps.
* The function accepts the following parameters:
* @param {string} targetHtmlMapId - The name of the HTML div where the map will be rendered.
*/
function initMap(targetHtmlMapId) {
    let centerLatitude = 43.1167;
    let centerLongitude = 13.1996;
    let zoomValue = 9;

    return initWMSMap(targetHtmlMapId, '', centerLongitude, centerLatitude, zoomValue, '', '', '');
}
/**
 * Author: Angelo Stefani [angelo.stefani@enea.it]
 * Date: 29/02/2024
 * 
 * This JavaScript function, named initWMSMap, is designed to initialize a map using OpenLayers,
 * a JavaScript library for displaying interactive maps.
 * The function accepts the following parameters:
 * @param {string} targetHtmlMapId - The name of the HTML div where the map will be rendered.
 * @param {string} baseMapName - The name of the base map to use as the background.
 * @param {number} centerLongitude - The longitude for the map center.
 * @param {number} centerLatitude - The latitude for the map center.
 * @param {number} zoomValue - The initial zoom level of the map.
 * @param {string} wmsUrl - The URL of the WMS (Web Map Service) for the WMS layer to be displayed on the map.
 * @param {string} wmsLayer - The name of the WMS layer to be displayed on the map.
 * @param {string} legendTitle - The title for the WMS layer legend.
 * 
 * The function creates a new base map layer based on the provided baseMapName using a switch-case
 * to determine which type of map to use. It then creates a new instance of ol.Map with the specified
 * target, base map layer, and WMS layer. It also sets a default view for the map.
 * Additionally, it adds a listener to track the mouse coordinates on the map and display them
 * in an HTML element with id mouseCoordinates. Finally, it uses another switch-case to assign
 * the newly created map to a global variable based on the specified map target name.
 * This function is designed to be used within a web application that needs to display interactive
 * maps with overlaid WMS layers.
 */
function initWMSMap(targetHtmlMapId, baseMapName, centerLongitude, centerLatitude, zoomValue, wmsUrl, wmsLayer, legendTitle) {
    let baseMapLayer; // Base map layer, with the selected base map.
    let localMap; // Variable to create and return the created OpenLayers map.
    let layersArray; // Array to hold the map layers.
    let wmsLayerObj;

    // Create the new base map layer, with the selected map
    baseMapLayer = getBaseMapLayer(baseMapName);
    baseMapLayer.set('name', 'baseMap'); // Assign a name to the new base layer

    layersArray = [baseMapLayer]; // Array for map layers

    // Check if wmsUrl and wmsLayer variables are set
    if (wmsUrl && wmsLayer) {
        // If both variables are set, create the Geoserver WMS layer
        wmsLayerObj = new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: wmsUrl,
                params: { 'LAYERS': wmsLayer, 'TILED': true },
                serverType: 'geoserver'
            })
        });

        layersArray.push(wmsLayerObj);
    }

    // Create the OpenLayers map with or without the Geoserver WMS layer based on the variables
    localMap = new ol.Map({
        target: targetHtmlMapId,
        layers: layersArray, // Use the created layers array
        view: new ol.View({ center: ol.proj.fromLonLat([centerLongitude, centerLatitude]), zoom: zoomValue })
    });

    // Add the legend as a control to the map
    addWMSLegendControl(localMap, wmsLayerObj, wmsUrl, wmsLayer, legendTitle);

    // Add a listener for mouse coordinates
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

/**
 * Adds a WMS legend control to the map.
 * 
 * @param {ol.Map} map - The OpenLayers map to which the legend control will be added.
 * @param {ol.layer.Tile} layer - The WMS layer for which the legend is created.
 * @param {string} wmsUrl - The URL of the WMS service.
 * @param {string} wmsLayer - The name of the WMS layer.
 * @param {string} legendTitle - The title for the legend.
 */
function addWMSLegendControl(map, layer, wmsUrl, wmsLayer, legendTitle) {
    // Parse the WMS URL to add the correct parameters for the legend
    let url = new URL(wmsUrl);
    url.searchParams.set('REQUEST', 'GetLegendGraphic');
    url.searchParams.set('VERSION', '1.0.0');
    url.searchParams.set('FORMAT', 'image/png');
    url.searchParams.set('WIDTH', '20'); // Reduced legend size
    url.searchParams.set('HEIGHT', '20'); // Reduced legend size
    url.searchParams.set('LAYER', wmsLayer);

    // Create an image element for the legend
    let legendImg = document.createElement('img');
    legendImg.src = url.href;
    legendImg.alt = 'Legend';

    // Create a div element to contain the legend image
    let legendDiv = document.createElement('div');
    legendDiv.className = 'ol-control legend-control';
    
    // Add the legend title as text
    let titleDiv = document.createElement('div');
    titleDiv.innerText = legendTitle;
    
    legendDiv.appendChild(titleDiv);
    legendDiv.appendChild(legendImg);
   
    // Add CSS styling for the legend
    legendDiv.style.position = 'absolute';
    legendDiv.style.bottom = '340px'; // Position at the bottom
    legendDiv.style.right = '15px'; // Position at the right
    legendDiv.style.width = '8%'; // Set width
    legendDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; // Slightly transparent background
    
    // Add the control to the map
    map.addControl(new ol.control.Control({ element: legendDiv }));
}

/**
 * Author: Angelo Stefani [angelo.stefani@enea.it]
 * Date: 29/02/2024
 * 
 * Function that returns the basemap layer based on the desired baseMapName.
 */
function getBaseMapLayer(baseMapName) {
    const baseMapLayers = {
        'OpenStreetMap - EPSG:3857': new ol.layer.Tile({ source: new ol.source.OSM() }),
        'Google Normal - EPSG:3857': new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}' }) }),
        'Google Satellite - EPSG:3857': new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}' }) }),
        'Google Hybrid - EPSG:3857': new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' }) }),
        'OpenTopoMap': new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png' }) }),
        'Sentinel-2 cloudless': new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2018_3857/default/g/{z}/{y}/{x}.jpg' }) }),
        'Metacarta - EPSG:4326': new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}' }) }),
        'geoSdi - EPSG:4326': new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}' }) }),
        'geoSdi No Map - EPSG:4326': new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'http://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}' }) }),
        'Empty layer - EPSG:3857': new ol.layer.Tile({}),
        'default': new ol.layer.Tile({ source: new ol.source.OSM() })
    };

    return baseMapLayers[baseMapName] || baseMapLayers['default'];
}

/**
 * Displays earthquake event data on a heatmap.
 * @param {ol.Map} map - The map on which to display the heatmap.
 * @param {Array<object>|string} earthquakeData - Array of objects containing earthquake event data.
 *     Each object should contain the properties 'lon', 'lat', and 'radius'.
 *     The 'radius' property is used to determine the size of the central circle.
 */
function visualizeEarthquakes_v01(map, earthquakeData) {
    if (typeof earthquakeData === 'string') {
        console.log('Received JSON string:', earthquakeData);
        try {
            earthquakeData = JSON.parse(earthquakeData);
        } catch (error) {
            console.error('Error parsing JSON string:', error);
            return;
        }
    }

    if (!Array.isArray(earthquakeData)) {
        console.error('Earthquake data is not a valid array.');
        return;
    }

    const heatMapFeatures = earthquakeData.map(earthquake => {
        if (earthquake && earthquake.lon !== undefined) {
            const point = ol.proj.fromLonLat([earthquake.lon, earthquake.lat]);
            const pointFeature = new ol.Feature(new ol.geom.Point(point));
            const circleFeature = new ol.Feature(new ol.geom.Circle(point, earthquake.radius));

            const pointStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({ color: 'red' })
                })
            });

            const circleStyle = new ol.style.Style({
                fill: new ol.style.Fill({ color: 'rgba(255, 0, 0, 0.2)' }),
                stroke: new ol.style.Stroke({ color: 'red', width: 1 })
            });

            pointFeature.setStyle(pointStyle);
            circleFeature.setStyle(circleStyle);

            const tooltip = createTooltip(map, earthquake);

            map.on('pointermove', function (evt) {
                const feature = map.forEachFeatureAtPixel(evt.pixel, feature => feature);
                if (feature === pointFeature) {
                    tooltip.setPosition(evt.coordinate);
                    $(tooltip.getElement()).show();
                } else {
                    $(tooltip.getElement()).hide();
                }
            });

            return [pointFeature, circleFeature];
        }
        return [];
    }).flat();

    const heatMapLayer = new ol.layer.Heatmap({
        source: new ol.source.Vector({ features: heatMapFeatures }),
        blur: 15,
        radius: 10,
        opacity: 0.8
    });

    map.addLayer(heatMapLayer);
}

/**
 * Creates an ol.Overlay object to display a tooltip with earthquake event data.
 * @param {ol.Map} map - The map in which the tooltip should be displayed.
 * @param {object} earthquake - The object containing earthquake event data.
 * @returns {ol.Overlay} The ol.Overlay object with the tooltip.
 */
function createTooltip(map, earthquake) {
    const tooltip = new ol.Overlay({
        element: document.createElement('div'),
        positioning: 'bottom-center',
        offset: [0, -10]
    });

    const content = `<div>ID: ${earthquake.idEarthquake}<br>Magnitude: ${earthquake.magnitude}<br>Depth: ${earthquake.depth}</div>`;
    tooltip.getElement().innerHTML = content;

    map.addOverlay(tooltip);

    return tooltip;
}

/**
 * Author: Angelo Stefani [angelo.stefani@enea.it]
 * Date: 29/02/2024
 * 
 * Function to convert longitude and latitude coordinates to DMS (degrees, minutes, seconds) format.
 * @param {number} coord - The coordinate to be converted.
 * @param {string} coordType - The type of coordinate ('lon' for longitude, 'lat' for latitude).
 * @returns {string} The coordinate in DMS format.
 */
function convertToDMS(coord, coordType) {
    const absCoord = Math.abs(coord);
    const degrees = Math.floor(absCoord);
    const minutes = Math.floor((absCoord - degrees) * 60);
    const seconds = ((absCoord - degrees - minutes / 60) * 3600).toFixed(1);
    const direction = coordType === 'lon' ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');

    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

/**
 * Author: Angelo Stefani [angelo.stefani@enea.it]
 * Date: 29/02/2024
 * 
 * Function to change the basemap layer.
 */
function changeMap(baseMapName, activeTab) {
    const baseMapLayer = getBaseMapLayer(baseMapName);
    baseMapLayer.set('name', 'baseMap'); // Assign a name to the new basemap layer

    const map = getMapFromActiveTab(activeTab);

    if (map) {
        // Remove the current basemap layer and replace it with the new one
        map.getLayers().forEach((layer, index) => {
            if (layer.get('name') === 'baseMap') {
                map.getLayers().setAt(index, baseMapLayer);
            }
        });
    }
}

/**
 * Author: Angelo Stefani [angelo.stefani@enea.it]
 * Date: 29/02/2024
 * 
 * Function that returns the OpenLayers map associated with the active tab.
 */
function getMapFromActiveTab(activeTab) {
    const mapTabs = {
        'tabA1-tab': mapA1,
        'tabA2-tab': mapA2,
        'tabA3-tab': mapA3,
        'tabA4-tab': mapA4,
        'tabA5-tab': mapA5,
        'tabA6-tab': mapA6,
        'tabA7-tab': mapA7,
        'tabA8-tab': mapA8,
        'tabA9-tab': mapA9,
        'tabA10-tab': mapA10,
        'tabB1-tab': mapB1,
        'tabB2-tab': mapB2,
        'tabB3-tab': mapB3,
        'tabB4-tab': mapB4,
        'tabB5-tab': mapB5,
        'tabB6-tab': mapB6,
        'tabB7-tab': mapB7,
        'tabB8-tab': mapB8,
        'tabB9-tab': mapB9,
        'tabB10-tab': mapB10,
        'tabC1-tab': mapC1,
        'tabC2-tab': mapC2,
        'tabC3-tab': mapC3,
        'tabC4-tab': mapC4,
        'tabC5-tab': mapC5,
        'tabC6-tab': mapC6,
        'tabC7-tab': mapC7,
        'tabC8-tab': mapC8,
        'tabC9-tab': mapC9,
        'tabC10-tab': mapC10,
        'tabC11-tab': mapC11,
        'tabC12-tab': mapC12,
        'tabD1-tab': mapD1,
        'tabD2-tab': mapD2,
        'tabD3-tab': mapD3,
        'tabD4-tab': mapD4,
        'tabD5-tab': mapD5,
        'tabD6-tab': mapD6,
        'tabD7-tab': mapD7,
        'tabD8-tab': mapD8,
        'tabD9-tab': mapD9,
        'tabD10-tab': mapD10,
        'tabD11-tab': mapD11,
        'tabD12-tab': mapD12,
        'tabD13-tab': mapD13,
        'tabD14-tab': mapD14,
        'tabD15-tab': mapD15,
        'tabD16-tab': mapD16,
        'tabD17-tab': mapD17,
        'tabE1-tab': mapE1,
        'tabE2-tab': mapE2,
        'tabE3-tab': mapE3,
        'tabE4-tab': mapE4,
        'tabE5-tab': mapE5,
        'tabE6-tab': mapE6,
        'tabE7-tab': mapE7,
        'tabE8-tab': mapE8,
        'tabE9-tab': mapE9,
        'tabE10-tab': mapE10,
        'tabE11-tab': mapE11,
        'tabE12-tab': mapE12,
        'tabF1-tab': mapF1,
        'tabF2-tab': mapF2,
        'tabF3-tab': mapF3,
        'tabF4-tab': mapF4,
        'tabF5-tab': mapF5,
        'tabF6-tab': mapF6,
        'tabF7-tab': mapF7,
        'tabF8-tab': mapF8,
        'tabF9-tab': mapF9,
        'tabF10-tab': mapF10,
        'tabG1-tab': mapG1,
        'tabG2-tab': mapG2,
        'tabG3-tab': mapG3,
        'tabG4-tab': mapG4,
        'tabG5-tab': mapG5,
        'tabG6-tab': mapG6,
        'tabG7-tab': mapG7,
        'tabG8-tab': mapG8,
        'tabG9-tab': mapG9,
        'tabG10-tab': mapG10,
    };

    return mapTabs[activeTab] || mapA1;
}

/**
 * Author: Angelo Stefani [angelo.stefani@enea.it]
 * Date: 29/02/2024
 * Function to update breadcrumb and show corresponding tabs
 */
function updateBreadcrumb(section, subSection) {
    // Update the breadcrumb with the given section and subSection
    const breadcrumbHtml = `
        <li class="breadcrumb-item"><a href="#">Home</a></li>
        <li class="breadcrumb-item"><a href="#">${section}</a></li>
        <li class="breadcrumb-item active" aria-current="page">${subSection}</li>
    `;
    $('#breadcrumb').html(breadcrumbHtml);

    // Show corresponding tabs based on the selected subsection if the section is "Risk Analysis"
    if (section === 'Risk Analysis') {
        const tabSelector = `#myTab a[href="#${subSection.toLowerCase()}"]`;
        $(tabSelector).tab('show');
    }
}

/**
 * Author: Angelo Stefani [angelo.stefani@enea.it]
 * Date: 29/02/2024
 * Function to initialize the tabs
 */

/**
 * This function is used to initialize the tabs of the application. It hides all the tabs
 * and sets the default active tab.
 */
function initTabs() {
    // Array of all tab IDs
    const tabIds = [
        '#tabA1-tab', '#tabA2-tab', '#tabA3-tab', '#tabA4-tab', '#tabA5-tab', '#tabA6-tab', '#tabA7-tab', '#tabA8-tab', 
        '#tabB1-tab', '#tabB2-tab', '#tabB3-tab', '#tabB4-tab', '#tabB5-tab', '#tabB6-tab','#tabB7-tab', '#tabB8-tab',
        '#tabC1-tab', '#tabC2-tab', '#tabC3-tab', '#tabC4-tab', '#tabC5-tab', '#tabC6-tab','#tabC7-tab', '#tabC8-tab', '#tabC9-tab', '#tabC10-tab',
        '#tabC11-tab', '#tabC12-tab',
        '#tabD1-tab', '#tabD2-tab', '#tabD3-tab', '#tabD4-tab', '#tabD5-tab', '#tabD6-tab', '#tabD7-tab', '#tabD8-tab','#tabD9-tab', '#tabD10-tab',
        '#tabD11-tab', '#tabD12-tab', '#tabD13-tab', '#tabD14-tab', '#tabD15-tab', '#tabD16-tab', '#tabD17-tab',
        '#tabE1-tab', '#tabE2-tab', '#tabE3-tab', '#tabE4-tab', '#tabE5-tab', '#tabE6-tab', '#tabE7-tab', '#tabE8-tab', '#tabE9-tab', '#tabE10-tab',
        '#tabE11-tab', '#tabE12-tab',
        '#tabF1-tab', '#tabF2-tab', '#tabF3-tab', '#tabF4-tab', '#tabF5-tab', '#tabF6-tab', '#tabF7-tab', '#tabF8-tab', '#tabF9-tab', '#tabF10-tab',
        '#tabG1-tab', '#tabG2-tab', '#tabG3-tab', '#tabG4-tab', '#tabG5-tab', '#tabG6-tab', '#tabG7-tab', '#tabG8-tab', '#tabG9-tab', '#tabG10-tab'         
    ];

    // Hide all tabs and remove 'show active' classes
    tabIds.forEach(id => {
        $(id).removeClass('show active').addClass('visually-hidden');
    });

    // Set the default active tab
    activeTab = 'tabB1-tab';
}


/**
 * Autore: Angelo Stefani [angelo.stefani@enea.it]
 * Data: 29/02/2024
 * Funzione per inizializzare gli elementi dell'interfaccia utente
 */
/**
 * This function is used to initialize the layout elements of the application. It sets the display
 * property of the "mouseCoordinates" and "addressInput" elements to "block". This means that
 * these elements will be visible in the application.
 */
function initLayoutElements() {
    // Sets the display property of the "mouseCoordinates" element to "block"
    // This means that the element will be visible in the application
    document.getElementById("mouseCoordinates").style.display = "block";
    // Sets the display property of the "addressInput" element to "block"
    // This means that the element will be visible in the application
    document.getElementById("addressInput").style.display = "block";    
}



/**
 * Author: Angelo Stefani [angelo.stefani@enea.it]
 * Date: 29/02/2024
 * Function to manage interaction with UI tabs
 */

/**
 * This function is used to manage the interaction with the tabs of the user interface.
 * It sets the activeTab variable based on the clicked tab.
 */
function tabManager() {
    // Define an array of tab IDs for iteration
    const tabIds = [
        '#tabA1-tab', '#tabA2-tab', '#tabA3-tab', '#tabA4-tab', '#tabA5-tab', '#tabA6-tab', '#tabA7-tab', '#tabA8-tab', 
        '#tabB1-tab', '#tabB2-tab', '#tabB3-tab', '#tabB4-tab', '#tabB5-tab', '#tabB6-tab','#tabB7-tab', '#tabB8-tab',
        '#tabC1-tab', '#tabC2-tab', '#tabC3-tab', '#tabC4-tab', '#tabC5-tab', '#tabC6-tab','#tabC7-tab', '#tabC8-tab', '#tabC9-tab', '#tabC10-tab',
        '#tabC11-tab', '#tabC12-tab',
        '#tabD1-tab', '#tabD2-tab', '#tabD3-tab', '#tabD4-tab', '#tabD5-tab', '#tabD6-tab', '#tabD7-tab', '#tabD8-tab','#tabD9-tab', '#tabD10-tab',
        '#tabD11-tab', '#tabD12-tab', '#tabD13-tab', '#tabD14-tab', '#tabD15-tab', '#tabD16-tab', '#tabD17-tab',
        '#tabE1-tab', '#tabE2-tab', '#tabE3-tab', '#tabE4-tab', '#tabE5-tab', '#tabE6-tab', '#tabE7-tab', '#tabE8-tab', '#tabE9-tab', '#tabE10-tab',
        '#tabE11-tab', '#tabE12-tab',
        '#tabF1-tab', '#tabF2-tab', '#tabF3-tab', '#tabF4-tab', '#tabF5-tab', '#tabF6-tab', '#tabF7-tab', '#tabF8-tab', '#tabF9-tab', '#tabF10-tab',
        '#tabG1-tab', '#tabG2-tab', '#tabG3-tab', '#tabG4-tab', '#tabG5-tab', '#tabG6-tab', '#tabG7-tab', '#tabG8-tab', '#tabG9-tab', '#tabG10-tab'         
    ];

    // Loop through each tab ID
    tabIds.forEach(tabId => {
        // Add click event listener to each tab
        $(`#${tabId}`).on('click', function () {
            // Set activeTab variable to the clicked tab ID
            activeTab = tabId;
            // Call selectTab function to update UI based on the selected tab
            selectTab(activeTab);
        });
    });
}


/*
* Autore: Angelo Stefani [angelo.stefani@enea.it]
* Data: 29/02/2024
* Function to update tabs based on selected dropdown item
*/
function selectTab(selectedItem) {
    // Nascondi tutte le schede
    $('#myTabContent').children('.tab-pane').removeClass('show active');
    $('#myTabContent').children('.tab-pane').addClass('fade');
    
    initTabs();
    initLayoutElements();

    // Mostra le schede corrispondenti in base all'elemento selezionato nel menu a tendina
    if (selectedItem === 'tabA1-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabA1-tab').removeClass('visually-hidden');
               
        // attiva la scheda e il pannello
        $('#tabA1-tab').addClass('show active');
        $('#panelA1').addClass('show active');

        disableVerticalScrollBar();
        activeTab = 'tabA1-tab';    
    } else if (selectedItem === 'tabA2-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabA2-tab').removeClass('visually-hidden');
        $('#tabA3-tab').removeClass('visually-hidden');
               
        // attiva la scheda e il pannello
        $('#tabA2-tab').addClass('show active');
        $('#panelA2').addClass('show active');        
                
        disableVerticalScrollBar();
        activeTab = 'tabA2-tab';    
    } else if (selectedItem === 'tabA3-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabA2-tab').removeClass('visually-hidden');
        $('#tabA3-tab').removeClass('visually-hidden');
               
        // attiva la scheda e il pannello
        $('#tabA3-tab').addClass('show active');
        $('#panelA3').addClass('show active');        
                
        disableVerticalScrollBar();
        activeTab = 'tabA3-tab';    
    } else if (selectedItem === 'tabA4-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabA4-tab').removeClass('visually-hidden');
             
        // attiva la scheda e il pannello
        $('#tabA4-tab').addClass('show active');
        $('#panelA4').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabA4-tab';    
    }else if (selectedItem === 'tabB1-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabB1-tab').removeClass('visually-hidden');
        $('#tabB2-tab').removeClass('visually-hidden');
                            
        // attiva la scheda e il pannello
        $('#tabB1-tab').addClass('show active');
        $('#panelB1').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabB1-tab';    
         
    }
    else if (selectedItem === 'tabB2-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabB1-tab').removeClass('visually-hidden');
        $('#tabB2-tab').removeClass('visually-hidden');
                    
        // attiva la scheda e il pannello
        $('#tabB2-tab').addClass('show active');
        $('#panelB2').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabB2-tab';       
       
    }else if (selectedItem === 'tabB3-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabB3-tab').removeClass('visually-hidden');
        $('#tabB4-tab').removeClass('visually-hidden');
        $('#tabB5-tab').removeClass('visually-hidden');
                    
        // attiva la scheda e il pannello
        $('#tabB3-tab').addClass('show active');
        $('#panelB3').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabB3-tab';       
        
    }else if (selectedItem === 'tabB4-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabB3-tab').removeClass('visually-hidden');
        $('#tabB4-tab').removeClass('visually-hidden');
        $('#tabB5-tab').removeClass('visually-hidden');
                    
        // attiva la scheda e il pannello
        $('#tabB4-tab').addClass('show active');
        $('#panelB4').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabB4-tab';       
       
    }else if (selectedItem === 'tabB5-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabB3-tab').removeClass('visually-hidden');
        $('#tabB4-tab').removeClass('visually-hidden');
        $('#tabB5-tab').removeClass('visually-hidden');

        // attiva la scheda e il pannello
        $('#tabB5-tab').addClass('show active');
        $('#panelB5').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabB5-tab';       
        
    }else if (selectedItem === 'tabB6-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabB6-tab').removeClass('visually-hidden');
       

        // attiva la scheda e il pannello
        $('#tabB6-tab').addClass('show active');
        $('#panelB6').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabB6-tab';    

    }else if (selectedItem === 'tabB7-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabB7-tab').removeClass('visually-hidden');
        $('#tabB8-tab').removeClass('visually-hidden');

        // attiva la scheda e il pannello
        $('#tabB7-tab').addClass('show active');
        $('#panelB7').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabB7-tab';   
    
    }else if (selectedItem === 'tabB8-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabB7-tab').removeClass('visually-hidden');
        $('#tabB8-tab').removeClass('visually-hidden');
                           
        // attiva la scheda e il pannello
        $('#tabB8-tab').addClass('show active');
        $('#panelB8').addClass('show active');
        
        disableVerticalScrollBar();
        activeTab = 'tabB8-tab';
    
    }else if (selectedItem === 'tabC1-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabC1-tab').removeClass('visually-hidden');
        $('#tabC2-tab').removeClass('visually-hidden');
        $('#tabC3-tab').removeClass('visually-hidden');
        $('#tabC4-tab').removeClass('visually-hidden');
        $('#tabC5-tab').removeClass('visually-hidden');
             
        // attiva la scheda e il pannello
        $('#tabC1-tab').addClass('show active');
        $('#panelC1').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabC1-tab';       
        
    }else if (selectedItem === 'tabC2-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabC1-tab').removeClass('visually-hidden');
        $('#tabC2-tab').removeClass('visually-hidden');
        $('#tabC3-tab').removeClass('visually-hidden');
        $('#tabC4-tab').removeClass('visually-hidden');
        $('#tabC5-tab').removeClass('visually-hidden');
             
        // attiva la scheda e il pannello
        $('#tabC2-tab').addClass('show active');
        $('#panelC2').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabC2-tab';       
       
    }else if (selectedItem === 'tabC3-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabC1-tab').removeClass('visually-hidden');
        $('#tabC2-tab').removeClass('visually-hidden');
        $('#tabC3-tab').removeClass('visually-hidden');
        $('#tabC4-tab').removeClass('visually-hidden');
        $('#tabC5-tab').removeClass('visually-hidden');
             
        // attiva la scheda e il pannello
        $('#tabC3-tab').addClass('show active');
        $('#panelC3').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabC3-tab';       
        
    }else if (selectedItem === 'tabC4-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabC1-tab').removeClass('visually-hidden');
        $('#tabC2-tab').removeClass('visually-hidden');
        $('#tabC3-tab').removeClass('visually-hidden');
        $('#tabC4-tab').removeClass('visually-hidden');
        $('#tabC5-tab').removeClass('visually-hidden');
             
        // attiva la scheda e il pannello
        $('#tabC4-tab').addClass('show active');
        $('#panelC4').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabC4-tab';       
       
    }else if (selectedItem === 'tabC5-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabC1-tab').removeClass('visually-hidden');
        $('#tabC2-tab').removeClass('visually-hidden');
        $('#tabC3-tab').removeClass('visually-hidden');
        $('#tabC4-tab').removeClass('visually-hidden');
        $('#tabC5-tab').removeClass('visually-hidden');
            
        // attiva la scheda e il pannello
        $('#tabC5-tab').addClass('show active');
        $('#panelC5').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabC5-tab';       
        
    }else if (selectedItem === 'tabC6-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabC6-tab').removeClass('visually-hidden');
        $('#tabC7-tab').removeClass('visually-hidden');
        $('#tabC8-tab').removeClass('visually-hidden');
        $('#tabC9-tab').removeClass('visually-hidden');
       
        // attiva la scheda e il pannello
        $('#tabC6-tab').addClass('show active');
        $('#panelC6').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabC6-tab';       
       
    }else if (selectedItem === 'tabC7-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabC6-tab').removeClass('visually-hidden');
        $('#tabC7-tab').removeClass('visually-hidden');
        $('#tabC8-tab').removeClass('visually-hidden');
        $('#tabC9-tab').removeClass('visually-hidden');
       
        // attiva la scheda e il pannello
        $('#tabC7-tab').addClass('show active');
        $('#panelC7').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabC7-tab';       
       
    }else if (selectedItem === 'tabC8-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabC6-tab').removeClass('visually-hidden');
        $('#tabC7-tab').removeClass('visually-hidden');
        $('#tabC8-tab').removeClass('visually-hidden');
        $('#tabC9-tab').removeClass('visually-hidden');
       
        // attiva la scheda e il pannello
        $('#tabC8-tab').addClass('show active');
        $('#panelC8').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabC8-tab';       
        
    }else if (selectedItem === 'tabC9-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabC6-tab').removeClass('visually-hidden');
        $('#tabC7-tab').removeClass('visually-hidden');
        $('#tabC8-tab').removeClass('visually-hidden');
        $('#tabC9-tab').removeClass('visually-hidden');
       
        // attiva la scheda e il pannello
        $('#tabC9-tab').addClass('show active');
        $('#panelC9').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabC9-tab';       
       
    }else if (selectedItem === 'tabC10-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabC10-tab').removeClass('visually-hidden');
        $('#tabC11-tab').removeClass('visually-hidden');
        $('#tabC12-tab').removeClass('visually-hidden');
        $('#tabC13-tab').removeClass('visually-hidden');
       
        // attiva la scheda e il pannello
        $('#tabC10-tab').addClass('show active');
        $('#panelC10').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabC10-tab';       
       
    }else if (selectedItem === 'tabC11-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabC10-tab').removeClass('visually-hidden');
        $('#tabC11-tab').removeClass('visually-hidden');
        $('#tabC12-tab').removeClass('visually-hidden');
        $('#tabC13-tab').removeClass('visually-hidden');
       
        // attiva la scheda e il pannello
        $('#tabC11-tab').addClass('show active');
        $('#panelC11').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabC11-tab';       
       
    }else if (selectedItem === 'tabC12-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabC10-tab').removeClass('visually-hidden');
        $('#tabC11-tab').removeClass('visually-hidden');
        $('#tabC12-tab').removeClass('visually-hidden');
        $('#tabC13-tab').removeClass('visually-hidden');
       
        // attiva la scheda e il pannello
        $('#tabC12-tab').addClass('show active');
        $('#panelC12').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabC12-tab';       
       
    }else if (selectedItem === 'tabC13-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabC10-tab').removeClass('visually-hidden');
        $('#tabC11-tab').removeClass('visually-hidden');
        $('#tabC12-tab').removeClass('visually-hidden');
        $('#tabC13-tab').removeClass('visually-hidden');
       
        // attiva la scheda e il pannello
        $('#tabC13-tab').addClass('show active');
        $('#panelC13').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabC13-tab';       
        
    }else if (selectedItem === 'tabD1-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabD1-tab').removeClass('visually-hidden');
        $('#tabD2-tab').removeClass('visually-hidden');
        $('#tabD3-tab').removeClass('visually-hidden');
        $('#tabD4-tab').removeClass('visually-hidden');
        $('#tabD5-tab').removeClass('visually-hidden');

        // attiva la scheda e il pannello
        $('#tabD1-tab').addClass('show active');
        $('#panelD1').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabD1-tab';       
      
    }else if (selectedItem === 'tabD2-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabD1-tab').removeClass('visually-hidden');
        $('#tabD2-tab').removeClass('visually-hidden');
        $('#tabD3-tab').removeClass('visually-hidden');
        $('#tabD4-tab').removeClass('visually-hidden');
        $('#tabD5-tab').removeClass('visually-hidden');

        // attiva la scheda e il pannello
        $('#tabD2-tab').addClass('show active');
        $('#panelD2').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabD2-tab';       
      
    }else if (selectedItem === 'tabD3-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabD1-tab').removeClass('visually-hidden');
        $('#tabD2-tab').removeClass('visually-hidden');
        $('#tabD3-tab').removeClass('visually-hidden');
        $('#tabD4-tab').removeClass('visually-hidden');
        $('#tabD5-tab').removeClass('visually-hidden');

        // attiva la scheda e il pannello
        $('#tabD3-tab').addClass('show active');
        $('#panelD3').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabD3-tab';       
      
    }else if (selectedItem === 'tabD4-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabD1-tab').removeClass('visually-hidden');
        $('#tabD2-tab').removeClass('visually-hidden');
        $('#tabD3-tab').removeClass('visually-hidden');
        $('#tabD4-tab').removeClass('visually-hidden');
        $('#tabD5-tab').removeClass('visually-hidden');

        // attiva la scheda e il pannello
        $('#tabD4-tab').addClass('show active');
        $('#panelD4').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabD4-tab';       
       
    }else if (selectedItem === 'tabD5-tab') {
        // visualizza le schede relative al menu selezionato
        $('#tabD1-tab').removeClass('visually-hidden');
        $('#tabD2-tab').removeClass('visually-hidden');
        $('#tabD3-tab').removeClass('visually-hidden');
        $('#tabD4-tab').removeClass('visually-hidden');
        $('#tabD5-tab').removeClass('visually-hidden');

        // attiva la scheda e il pannello
        $('#tabD5-tab').addClass('show active');
        $('#panelD5').addClass('show active');
        
        disableVerticalScrollBar();      
        activeTab = 'tabD5-tab';       
    }    
}


/*
* Author: Angelo Stefani [angelo.stefani@enea.it]
* Date: 29/02/2024
* Function to add a pointer icon on the map
*/
function addPointer(lon, lat, activeTab) {
    // Create a new feature for the pointer with the given coordinates
    let pointer = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
    });

    // Set the style for the pointer icon
    pointer.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: 'https://openlayers.org/en/latest/examples/data/icon.png'
        })
    }));

    // Create a vector source and add the pointer feature
    let vectorSource = new ol.source.Vector({
        features: [pointer]
    });

    // Create a vector layer using the vector source
    let vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });

    // Get the map associated with the active tab and add the vector layer
    let map = getMapFromActiveTab(activeTab);
    map.addLayer(vectorLayer);
}

/*
* Function to load GeoJSON data from an input file
*/
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

/*
* Function to enable the vertical scroll bar
*/
function enableVerticalScrollBar() {
    // Enable vertical scroll bar by setting overflow-y to 'scroll'
    document.body.style.overflowY = 'scroll';

    // Hide specific elements when the vertical scroll bar is enabled
    document.getElementById("mouseCoordinates").style.display = "none";
    document.getElementById("addressInput").style.display = "none";
}

/*
* Function to disable the vertical scroll bar
*/
function disableVerticalScrollBar() {
    // Disable vertical scroll bar by setting overflow-y to 'hidden'
    document.body.style.overflowY = 'hidden';
}

function setupAddressSearch(inputSelector, suggestionsSelector) {
    var lastInputTime = 0;
    var delay = 2000; // Delay di 2 secondi

    // Funzione per cercare gli indirizzi e visualizzare i suggerimenti
    $(inputSelector).on('input', function () {
        var currentTime = new Date().getTime();
        if (currentTime - lastInputTime > delay) {
            lastInputTime = currentTime;
            var address = $(this).val();

            // Richiesta AJAX per cercare gli indirizzi
            var url = 'https://nominatim.openstreetmap.org/search?q=' + address + '&format=json&addressdetails=1&limit=5';

            $.getJSON(url, function (data) {
                // Visualizzo dei suggerimenti
                $(suggestionsSelector).empty();
                if (data && data.length > 0) {
                    $(suggestionsSelector).show();
                    // Creazione dei suggerimenti
                    $.each(data, function (i, item) {
                        $(suggestionsSelector).append('<a href="#" class="list-group-item list-group-item-action" data-type="' + item.type + '" data-lon="' + item.lon + '" data-lat="' + item.lat + '">' + item.display_name + '</a>');
                    });
                } else {
                    $(suggestionsSelector).hide();
                }
            });
        }        
    });
}

function setupAddressZoom(suggestionsSelector, getMapFromActiveTab, addPointer, activeTab) {
    // Funzione per zoomare sulla posizione selezionata dall'utente
    $(suggestionsSelector).on('click', 'a', function (e) {
        e.preventDefault();
        var address = $(this).text();
        var type = $(this).data('type');
        var url = 'https://nominatim.openstreetmap.org/search?q=' + address + '&format=json&addressdetails=1&limit=1';

        $.getJSON(url, function (data) {
            if (data && data.length > 0) {
                var lon = parseFloat(data[0].lon);
                var lat = parseFloat(data[0].lat);

                let map;

                map = getMapFromActiveTab(activeTab, map);
                map.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
                map.getView().setZoom(15);

                addPointer(lon, lat, activeTab);

                $(suggestionsSelector).hide();
            }
        });
    });
}

function setupDropdownMenuHandler(dropdownItemSelector, dropdownMenuSelector) {
    // Funzione per gestire la selezione della mappa quando si fa clic su una delle voci del menu a discesa
    $(dropdownItemSelector).on('click', function () {
        $(dropdownMenuSelector).removeClass('show');
    });
}