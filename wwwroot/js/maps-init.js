/**
 * This script initializes multiple WMS (Web Map Service) maps with various layers.
 * It also sets up user interface elements and manages tab interactions.
 */
document.addEventListener("DOMContentLoaded", function () {

    /**
     * Retrieve the last recorded earthquake run ID from the HTML element.
     * This value is stored in a `data-value` attribute and dynamically read.
     */
    var idRun = document.getElementById("idRunLastEarthquake").dataset.value;
    console.log("idRun:", idRun);

    /**
      * Set 'activeRiskRunID' only if it is not already defined or is empty (falsy).
      * Ensures that the most recent earthquake data is used.
      */
    if (!activeRiskRunID) {
        activeRiskRunID = idRun;
    }
        
    /**
     * Configuration for initializing the first WMS map instance (Map C1).
     * This map displays real-time earthquake data.
     */
    configWMSMatrixMapC1 = {
        targetHtmlMapId: 'mapC1',                  // Target HTML element ID
        baseMapName: 'Metacarta - EPSG:4326',      // Base map layer name
        centerLongitude: 13.0683,                  // Initial longitude
        centerLatitude: 39.700,                    // Initial latitude
        zoomValue: 6,                              // Initial zoom level
        layerMatrix: [                             // Array of WMS layers
            [true, true, document.getElementById("wmsurl_lay00").dataset.value, document.getElementById("wmslayer_lay00").dataset.value, 'Latest Earthquakes'],  //  layer
            [true, true, document.getElementById("wmsurl_lay10").dataset.value, document.getElementById("wmslayer_lay10").dataset.value, 'Shakemap']  //  layer
        ]
    };

    // Initialize the map (C1)
    mapC1 = initWMSMatrixMap(configWMSMatrixMapC1);

    /**
     * Configuration for the second WMS map instance (Map C2).
     * This map contains infrastructure-related layers.
     */
    configWMSMatrixMapC2 = {
        targetHtmlMapId: 'mapC2',                 // Target HTML element ID
        baseMapName: 'OpenStreetMap - EPSG:3857', // Base map layer name
        centerLongitude: 13.0683,                 // Initial longitude
        centerLatitude: 43.1357,                  // Initial latitude
        zoomValue: 14,                            // Initial zoom level
        layerMatrix: [                            // Array of WMS layers
            [true, true, document.getElementById("wmsurl_lay03").dataset.value, document.getElementById("wmslayer_lay03").dataset.value, 'Lay03_PD1', 'mypd:pd1'],  //  layer
            [true, false, document.getElementById("wmsurl_lay03").dataset.value, document.getElementById("wmslayer_lay03").dataset.value, 'Lay03_PD2', 'mypd:pd2'],  //  layer
            [true, false, document.getElementById("wmsurl_lay03").dataset.value, document.getElementById("wmslayer_lay03").dataset.value, 'Lay03_PD3', 'mypd:pd3'],  //  layer
            [true, false, document.getElementById("wmsurl_lay03").dataset.value, document.getElementById("wmslayer_lay03").dataset.value, 'Lay03_PD4', 'mypd:pd4'],  //  layer
            [true, false, document.getElementById("wmsurl_lay03").dataset.value, document.getElementById("wmslayer_lay03").dataset.value, 'Lay03_PD5', 'mypd:pd5'],  //  layer
            [true, true, document.getElementById("wmsurl_lay02").dataset.value, document.getElementById("wmslayer_lay02").dataset.value, 'Lay02_PD1', 'mypd:pd1'],  //  layer
            [true, false, document.getElementById("wmsurl_lay02").dataset.value, document.getElementById("wmslayer_lay02").dataset.value, 'Lay02_PD2', 'mypd:pd2'],  //  layer
            [true, false, document.getElementById("wmsurl_lay02").dataset.value, document.getElementById("wmslayer_lay02").dataset.value, 'Lay02_PD3', 'mypd:pd3'],  //  layer
            [true, false, document.getElementById("wmsurl_lay02").dataset.value, document.getElementById("wmslayer_lay02").dataset.value, 'Lay02_PD4', 'mypd:pd4'],  //  layer
            [true, false, document.getElementById("wmsurl_lay02").dataset.value, document.getElementById("wmslayer_lay02").dataset.value, 'Lay02_PD5', 'mypd:pd5'],  //  layer
            [true, true, document.getElementById("wmsurl_lay01").dataset.value, document.getElementById("wmslayer_lay01").dataset.value, 'Lay01_PD1', 'mypd:pd1'],  //  layer
            [true, false, document.getElementById("wmsurl_lay01").dataset.value, document.getElementById("wmslayer_lay01").dataset.value, 'Lay01_PD2', 'mypd:pd2'],  //  layer
            [true, false, document.getElementById("wmsurl_lay01").dataset.value, document.getElementById("wmslayer_lay01").dataset.value, 'Lay01_PD3', 'mypd:pd3'],  //  layer
            [true, false, document.getElementById("wmsurl_lay01").dataset.value, document.getElementById("wmslayer_lay01").dataset.value, 'Lay01_PD4', 'mypd:pd4'],  //  layer
            [true, false, document.getElementById("wmsurl_lay01").dataset.value, document.getElementById("wmslayer_lay01").dataset.value, 'Lay01_PD5', 'mypd:pd5'],  //  layer
            [true, true, document.getElementById("wmsurl_lay10").dataset.value, document.getElementById("wmslayer_lay10").dataset.value, 'Shakemap']  //  layer  
        ]
    };

    // Initialize the map (C2)
    mapC2 = initWMSMatrixMap(configWMSMatrixMapC2);

    /**
     * Configuration for the third WMS map instance (Map C3).
     * This map displays various utility networks like electricity and water.
     */
    configWMSMatrixMapC3 = {
        targetHtmlMapId: 'mapC3',                 // Target HTML element ID
        baseMapName: 'OpenStreetMap - EPSG:3857', // Base map layer name
        centerLongitude: 13.0683,                 // Initial longitude
        centerLatitude: 43.1357,                  // Initial latitude
        zoomValue: 14,                            // Initial zoom level
        layerMatrix: [                            // Array of WMS layers
            [true, true, document.getElementById("wmsurl_lay04").dataset.value, document.getElementById("wmslayer_lay04").dataset.value, 'Lay04_PD1', 'mypd:pd1'],  //  layer
            [true, false, document.getElementById("wmsurl_lay04").dataset.value, document.getElementById("wmslayer_lay04").dataset.value, 'Lay04_PD2', 'mypd:pd2'],  //  layer
            [true, false, document.getElementById("wmsurl_lay04").dataset.value, document.getElementById("wmslayer_lay04").dataset.value, 'Lay04_PD3', 'mypd:pd3'],  //  layer
            [true, false, document.getElementById("wmsurl_lay04").dataset.value, document.getElementById("wmslayer_lay04").dataset.value, 'Lay04_PD4', 'mypd:pd4'],  //  layer
            [true, true, document.getElementById("wmsurl_lay05").dataset.value,  document.getElementById("wmslayer_lay05").dataset.value, 'Lay05_PD1', 'mypd:pd1'],  //  layer
            [true, false, document.getElementById("wmsurl_lay05").dataset.value, document.getElementById("wmslayer_lay05").dataset.value, 'Lay05_PD2', 'mypd:pd2'],  //  layer
            [true, false, document.getElementById("wmsurl_lay05").dataset.value, document.getElementById("wmslayer_lay05").dataset.value, 'Lay05_PD3', 'mypd:pd3'],  //  layer
            [true, false, document.getElementById("wmsurl_lay05").dataset.value, document.getElementById("wmslayer_lay05").dataset.value, 'Lay05_PD4', 'mypd:pd4'],  //  layer
            [true, true, document.getElementById("wmsurl_lay06").dataset.value, document.getElementById("wmslayer_lay06").dataset.value, 'Lay06_PD1', 'mypd:pd1'],  //  layer
            [true, false, document.getElementById("wmsurl_lay06").dataset.value, document.getElementById("wmslayer_lay06").dataset.value, 'Lay06_PD2', 'mypd:pd2'],  //  layer
            [true, false, document.getElementById("wmsurl_lay06").dataset.value, document.getElementById("wmslayer_lay06").dataset.value, 'Lay06_PD3', 'mypd:pd3'],  //  layer
            [true, false, document.getElementById("wmsurl_lay06").dataset.value, document.getElementById("wmslayer_lay06").dataset.value, 'Lay06_PD4', 'mypd:pd4'],  //  layer
            [true, true, document.getElementById("wmsurl_lay07").dataset.value, document.getElementById("wmslayer_lay07").dataset.value, 'Lay07_PD1', 'mypd:pd1'],  //  layer
            [true, false, document.getElementById("wmsurl_lay07").dataset.value, document.getElementById("wmslayer_lay07").dataset.value, 'Lay07_PD2', 'mypd:pd2'],  //  layer
            [true, false, document.getElementById("wmsurl_lay07").dataset.value, document.getElementById("wmslayer_lay07").dataset.value, 'Lay07_PD3', 'mypd:pd3'],  //  layer
            [true, false, document.getElementById("wmsurl_lay07").dataset.value, document.getElementById("wmslayer_lay07").dataset.value, 'Lay07_PD4', 'mypd:pd4'],  //  layer
            [true, true, document.getElementById("wmsurl_lay10").dataset.value, document.getElementById("wmslayer_lay10").dataset.value, 'Shakemap']  //  layer
        ]
    };

    // Initialize the map (C3)
    mapC3 = initWMSMatrixMap(configWMSMatrixMapC3);

    /**
     * Configuration for the fourth WMS map instance (Map C4).
     * This map highlights risk and failure scenarios.
     */
    configWMSMatrixMapC4 = {
        targetHtmlMapId: 'mapC4',                 // Target HTML element ID
        baseMapName: 'OpenStreetMap - EPSG:3857', // Base map layer name
        centerLongitude: 13.0683,                 // Initial longitude
        centerLatitude: 43.1357,                  // Initial latitude
        zoomValue: 14,                            // Initial zoom level
        layerMatrix: [                            // Array of WMS layers
            [true, true, document.getElementById("wmsurl_lay08").dataset.value, document.getElementById("wmslayer_lay08").dataset.value, 'Failure_scenario_view'],  //  layer
            [true, true, document.getElementById("wmsurl_lay09").dataset.value, document.getElementById("wmslayer_lay09").dataset.value, 'Earth_waste_water_damage_view']  //  layer
        ]
    };

    // Initialize the map (C5)
    mapC4 = initWMSMatrixMap(configWMSMatrixMapC4);

    /**
     * Configuration for the fourth WMS map instance (Map C5).
     * This map highlights risk and failure scenarios.
     */
    configWMSMatrixMapC5 = {
        targetHtmlMapId: 'mapC5',                 // Target HTML element ID
        baseMapName: 'OpenStreetMap - EPSG:3857', // Base map layer name
        centerLongitude: 13.0683,                 // Initial longitude
        centerLatitude: 43.1357,                  // Initial latitude
        zoomValue: 9,                            // Initial zoom level
        layerMatrix: [                            // Array of WMS layers
            [true, true, document.getElementById("wmsurl_lay12").dataset.value, document.getElementById("wmslayer_lay12").dataset.value, 'Flood precipitation rate']
        ]
    };

    // Initialize the fourth map (C5)
    mapC5 = initWMSMatrixMap(configWMSMatrixMapC5);

    /**
     * Configuration for the fourth WMS map instance (Map C5).
     * This map highlights risk and failure scenarios.
     */
    configWMSMatrixMapC9 = {
        targetHtmlMapId: 'mapC9',                 // Target HTML element ID
        baseMapName: 'OpenStreetMap - EPSG:3857', // Base map layer name
        centerLongitude: 13.0683,                 // Initial longitude
        centerLatitude: 43.1357,                  // Initial latitude
        zoomValue: 9,                            // Initial zoom level
        layerMatrix: [                            // Array of WMS layers
            [true, true, document.getElementById("wmsurl_lay11").dataset.value, document.getElementById("wmslayer_lay11").dataset.value, 'Temperature above ground']
        ]
    };

    // Initialize the fourth map (C9)
    mapC9 = initWMSMatrixMap(configWMSMatrixMapC9);
        
});