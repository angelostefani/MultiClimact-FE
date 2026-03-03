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
    const wmsBaseUrl = document.getElementById("wmsurl_baseurl").dataset.value;

    /**
      * Set 'activeRiskRunID' only if it is not already defined or is empty (falsy).
      * Ensures that the most recent earthquake data is used.
      */
    if (!activeRiskRunID) {
        activeRiskRunID = idRun;
    }

    /**
     * Home "dashboard" maps split into four tiles.
     * - Tile 1: Hydraulic bulletins
     * - Tile 2: Hydrogeological bulletins
     * - Tile 3: Thunderstorms bulletins
     * - Tile 4: Latest Earthquakes
     */
    const dashboardBaseConfig = {
        baseMapName: 'OpenStreetMap - EPSG:3857',
        centerLongitude: 12.5,
        centerLatitude: 42.5,
        zoomValue: 6
    };

    const dashboardConfigs = [
        {
            ...dashboardBaseConfig,
            targetHtmlMapId: 'mapHomeDashboard1',
            layerMatrix: [
                [true, true, wmsBaseUrl, document.getElementById("wmslayer_dpc_bulletins_hydraulic_view").dataset.value, 'DPC hydraulic bulletins', null, null, false] // Layer NO CQL_FILTER
            ]
        },
        {
            ...dashboardBaseConfig,
            targetHtmlMapId: 'mapHomeDashboard2',
            layerMatrix: [
                [true, true, wmsBaseUrl, document.getElementById("wmslayer_dpc_bulletins_hydrogeological_view").dataset.value, 'DPC hydrogeological bulletins', null, null, false] // Layer NO CQL_FILTER
            ]
        },
        {
            ...dashboardBaseConfig,
            targetHtmlMapId: 'mapHomeDashboard3',
            layerMatrix: [
                [true, true, wmsBaseUrl, document.getElementById("wmslayer_dpc_bulletins_thunderstorms_view").dataset.value, 'DPC thunderstorms bulletins', null, null, false] // Layer NO CQL_FILTER
            ]
        },
        {
            ...dashboardBaseConfig,
            targetHtmlMapId: 'mapHomeDashboard4',
            layerMatrix: [
                [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_real_view").dataset.value, 'Latest Earthquakes', null, null, false] // Layer NO CQL_FILTER
            ]
        }
    ];

    [mapHomeDashboard1, mapHomeDashboard2, mapHomeDashboard3, mapHomeDashboard4] = dashboardConfigs.map(cfg => initWMSMatrixMap(cfg));
        
    /**
     * Configuration for initializing the first WMS map instance (Map C1).
     * This map displays real-time earthquake data.
     * "Risk Analysis -> Earthquakes -> Latest Earthquakes"
     */
    configWMSMatrixMapC1 = {
        targetHtmlMapId: 'mapC1',                  // Target HTML element ID
        baseMapName: 'Metacarta - EPSG:4326',      // Base map layer name
        centerLongitude: 13.0683,                  // Initial longitude
        centerLatitude: 39.700,                    // Initial latitude
        zoomValue: 6,                              // Initial zoom level
        layerMatrix: [                             // Array of WMS layers
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_real_view").dataset.value, 'Latest Earthquakes', null, null, false]  //  layer NO CQL_FILTER 
        ]
    };

    // Initialize the map (C1)
    mapC1 = initWMSMatrixMap(configWMSMatrixMapC1);


    /**
     * Configuration for the second WMS map instance (Map C2).
     * This map contains infrastructure-related layers.
     * "Risk Analysis -> Earthquakes -> Building Damage Risk"
     */
    configWMSMatrixMapC2 = {
        targetHtmlMapId: 'mapC2',                 // Target HTML element ID
        baseMapName: 'OpenStreetMap - EPSG:3857', // Base map layer name
        centerLongitude: 13.0683,                 // Initial longitude
        centerLatitude: 43.1357,                  // Initial latitude
        zoomValue: 14,                            // Initial zoom level
        layerMatrix: [                            // Array of WMS layers
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_building").dataset.value, 'Buildings of Camerino earthquake', null, null, false],  //  layer No CQL_FILTER

            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_building_vuln_view").dataset.value, 'earth_building_vuln_PD1', 'mypd:pd1', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_vuln_view").dataset.value, 'earth_building_vuln_PD2', 'mypd:pd2', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_vuln_view").dataset.value, 'earth_building_vuln_PD3', 'mypd:pd3', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_vuln_view").dataset.value, 'earth_building_vuln_PD4', 'mypd:pd4', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_vuln_view").dataset.value, 'earth_building_vuln_PD5', 'mypd:pd5', null, true],  //  layer Sì CQL_FILTER

            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_vuln_view").dataset.value, 'earth_poibui_vuln_PD1', 'mypd:pd1', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_vuln_view").dataset.value, 'earth_poibui_vuln_PD2', 'mypd:pd2', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_vuln_view").dataset.value, 'earth_poibui_vuln_PD3', 'mypd:pd3', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_vuln_view").dataset.value, 'earth_poibui_vuln_PD4', 'mypd:pd4', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_vuln_view").dataset.value, 'earth_poibui_vuln_PD5', 'mypd:pd5', null, true],  //  layer Sì CQL_FILTER

            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_building_damage_view").dataset.value, 'earth_building_damage_PD1', 'mypd:pd1', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_damage_view").dataset.value, 'earth_building_damage_PD2', 'mypd:pd2', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_damage_view").dataset.value, 'earth_building_damage_PD3', 'mypd:pd3', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_damage_view").dataset.value, 'earth_building_damage_PD4', 'mypd:pd4', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_damage_view").dataset.value, 'earth_building_damage_PD5', 'mypd:pd5', null, true],  //  layer Sì CQL_FILTER

            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_shakemap_view").dataset.value, 'earth_shakemap_PD1', 'mypd:pd1', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_shakemap_view").dataset.value, 'earth_shakemap_PD2', 'mypd:pd2', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_shakemap_view").dataset.value, 'earth_shakemap_PD3', 'mypd:pd3', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_shakemap_view").dataset.value, 'earth_shakemap_PD4', 'mypd:pd4', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_shakemap_view").dataset.value, 'earth_shakemap_PD5', 'mypd:pd5', null, true], //  layer Sì CQL_FILTER

            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_damage_view").dataset.value, 'earth_poibui_damage_PD1', 'mypd:pd1', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_damage_view").dataset.value, 'earth_poibui_damage_PD2', 'mypd:pd2', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_damage_view").dataset.value, 'earth_poibui_damage_PD3', 'mypd:pd3', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_damage_view").dataset.value, 'earth_poibui_damage_PD4', 'mypd:pd4', null, true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_damage_view").dataset.value, 'earth_poibui_damage_PD5', 'mypd:pd5', null, true], //  layer Sì CQL_FILTER

            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_view").dataset.value, 'earth_poibui_PD1', 'mypd:pd1', null,false],  //  layer NO CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_view").dataset.value, 'earth_poibui_PD2', 'mypd:pd2', null, false],  //  layer NO CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_view").dataset.value, 'earth_poibui_PD3', 'mypd:pd3', null, false],  //  layer NO CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_view").dataset.value, 'earth_poibui_PD4', 'mypd:pd4', null, false],  //  layer NO CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_view").dataset.value, 'earth_poibui_PD5', 'mypd:pd5', null, false]  //  layer NO CQL_FILTER
        ]
    };

    // Initialize the map (C2)
    mapC2 = initWMSMatrixMap(configWMSMatrixMapC2);


    /**
     * Configuration for the third WMS map instance (Map C3).
     * This map displays various utility networks like electricity and water.
     * "Risk Analysis -> Earthquakes -> Infrastructure Damage Risk"
     */
    configWMSMatrixMapC3 = {
        targetHtmlMapId: 'mapC3',                 // Target HTML element ID
        baseMapName: 'OpenStreetMap - EPSG:3857', // Base map layer name
        centerLongitude: 13.0683,                 // Initial longitude
        centerLatitude: 43.1357,                  // Initial latitude
        zoomValue: 14,                            // Initial zoom level
        layerMatrix: [                            // Array of WMS layers
                       
            [true, true, wmsBaseUrl,  document.getElementById("wmslayer_earth_water_tower_view").dataset.value, 'earth_water_tower_PD1', 'mypd:pd1',null,false],  //  layer NO CQL_FILTER 
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_view").dataset.value, 'earth_water_tower_PD2', 'mypd:pd2',null,false],  //  layer NO CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_view").dataset.value, 'earth_water_tower_PD3', 'mypd:pd3',null,false],  //  layer NO CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_view").dataset.value, 'earth_water_tower_PD4', 'mypd:pd4',null,false],  //  layer NO CQL_FILTER
            
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_view").dataset.value, 'earth_water_well_PD1', 'mypd:pd1',null,false],  //  layer NO CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_view").dataset.value, 'earth_water_well_PD2', 'mypd:pd2',null,false],  //  layer NO CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_view").dataset.value, 'earth_water_well_PD3', 'mypd:pd3',null,false],  //  layer NO CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_view").dataset.value, 'earth_water_well_PD4', 'mypd:pd4',null,false],  //  layer NO CQL_FILTER
            
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_view").dataset.value, 'earth_waste_water_PD1', 'mypd:pd1',null,false],  // layer NO CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_view").dataset.value, 'earth_waste_water_PD2', 'mypd:pd2',null,false],  //  layer NO CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_view").dataset.value, 'earth_waste_water_PD3', 'mypd:pd3',null,false],  //  layer NO CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_view").dataset.value, 'earth_waste_water_PD4', 'mypd:pd4',null,false],  //  layer NO CQL_FILTER
            
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_view").dataset.value, 'earth_substation_PD1', 'mypd:pd1',null,false],  //  layer NO CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_view").dataset.value, 'earth_substation_PD2', 'mypd:pd2',null,false],  //  layer NO CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_view").dataset.value, 'earth_substation_PD3', 'mypd:pd3',null,false],  //  layer NO CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_view").dataset.value, 'earth_substation_PD4', 'mypd:pd4',null,false],  //  layer NO CQL_FILTER

            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_vuln_view").dataset.value, 'earth_water_tower_vuln_PD1', 'mypd:pd1',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_vuln_view").dataset.value, 'earth_water_tower_vuln_PD2', 'mypd:pd2',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_vuln_view").dataset.value, 'earth_water_tower_vuln_PD3', 'mypd:pd3',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_vuln_view").dataset.value, 'earth_water_tower_vuln_PD4', 'mypd:pd4',null,true],  //  layer Sì CQL_FILTER

            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_damage_view").dataset.value, 'earth_water_tower_damage_PD1', 'mypd:pd1',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_damage_view").dataset.value, 'earth_water_tower_damage_PD2', 'mypd:pd2',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_damage_view").dataset.value, 'earth_water_tower_damage_PD3', 'mypd:pd3',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_damage_view").dataset.value, 'earth_water_tower_damage_PD4', 'mypd:pd4',null,true],  //  layer Sì CQL_FILTER

            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_vuln_view").dataset.value, 'earth_water_well_vuln_PD1', 'mypd:pd1',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_vuln_view").dataset.value, 'earth_water_well_vuln_PD2', 'mypd:pd2',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_vuln_view").dataset.value, 'earth_water_well_vuln_PD3', 'mypd:pd3',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_vuln_view").dataset.value, 'earth_water_well_vuln_PD4', 'mypd:pd4',null,true],  //  layer Sì CQL_FILTER

            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_damage_view").dataset.value, 'earth_water_well_damage_PD1', 'mypd:pd1',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_damage_view").dataset.value, 'earth_water_well_damage_PD2', 'mypd:pd2',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_damage_view").dataset.value, 'earth_water_well_damage_PD3', 'mypd:pd3',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_damage_view").dataset.value, 'earth_water_well_damage_PD4', 'mypd:pd4',null,true],  //  layer Sì CQL_FILTER
 
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_vuln_view").dataset.value, 'earth_waste_water_vuln_PD1', 'mypd:pd1',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_vuln_view").dataset.value, 'earth_waste_water_vuln_PD2', 'mypd:pd2',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_vuln_view").dataset.value, 'earth_waste_water_vuln_PD3', 'mypd:pd3',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_vuln_view").dataset.value, 'earth_waste_water_vuln_PD4', 'mypd:pd4',null,true],  //  layer Sì CQL_FILTER

            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_damage_view").dataset.value, 'earth_waste_water_damage_PD1', 'mypd:pd1',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_damage_view").dataset.value, 'earth_waste_water_damage_PD2', 'mypd:pd2',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_damage_view").dataset.value, 'earth_waste_water_damage_PD3', 'mypd:pd3',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_damage_view").dataset.value, 'earth_waste_water_damage_PD4', 'mypd:pd4',null,true],  //  layer Sì CQL_FILTER
 
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_vuln_view").dataset.value, 'earth_substation_vuln_PD1', 'mypd:pd1',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_vuln_view").dataset.value, 'earth_substation_vuln_PD2', 'mypd:pd2',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_vuln_view").dataset.value, 'earth_substation_vuln_PD3', 'mypd:pd3',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_vuln_view").dataset.value, 'earth_substation_vuln_PD4', 'mypd:pd4',null,true],  //  layer Sì CQL_FILTER

            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_damage_view").dataset.value, 'earth_substation_damage_PD1', 'mypd:pd1',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_damage_view").dataset.value, 'earth_substation_damage_PD2', 'mypd:pd2',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_damage_view").dataset.value, 'earth_substation_damage_PD3', 'mypd:pd3',null,true],  //  layer Sì CQL_FILTER
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_damage_view").dataset.value, 'earth_substation_damage_PD4', 'mypd:pd4',null,true],  //  layer Sì CQL_FILTER

            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_shakemap_view").dataset.value, 'Shakemap']  //  layer
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
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_failure_scenario_view").dataset.value, 'Failure_scenario_view'],  //  layer
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_damage_view").dataset.value, 'Earth_waste_water_damage_view']  //  layer
        ]
    };

    // Initialize the map (C4)
    mapC4 = initWMSMatrixMap(configWMSMatrixMapC4);

    /**
     * Configuration for the fourth WMS map instance (Map C5).
     * This map highlights risk and failure scenarios.
     * "Risk Analysis -> River floods -> Buildings and infrastructures Damage Risk"
     */
    configWMSMatrixMapC5 = {
        targetHtmlMapId: 'mapC5',                 // Target HTML element ID
        baseMapName: 'Metacarta - EPSG:4326', // Base map layer name
        centerLongitude: 13.0683,                 // Initial longitude
        centerLatitude: 43.1357,                  // Initial latitude
        zoomValue: 9,                            // Initial zoom level
        layerMatrix: [                            // Array of WMS layers
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt10',null,false],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt20',null,false],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt30',null,false],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt40',null,false],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt50',null,false],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt75',null,false],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt100',null,false],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt200',null,false],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt500',null,false]
        ]
    };

    // Initialize the fourth map (C5)
    mapC5 = initWMSMatrixMap(configWMSMatrixMapC5);

    /**
     * Configuration for the fourth WMS map instance (Map C9).
     * This map highlights risk and failure scenarios.
     * "Risk Analysis -> Heat Waves -> Latest Temperatures"
     */
    configWMSMatrixMapC9 = {
        targetHtmlMapId: 'mapC9',                 // Target HTML element ID
        baseMapName: 'OpenStreetMap - EPSG:3857', // Base map layer name
        centerLongitude: 13.0683,                 // Initial longitude
        centerLatitude: 43.1357,                  // Initial latitude
        zoomValue: 9,                            // Initial zoom level
        layerMatrix: [                            // Array of WMS layers
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_heatwave_real_view").dataset.value, 'Max Air Temperature',null,null,true],
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_roadway").dataset.value, 'Roadway (crossing)',null,null,false],
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_railway").dataset.value, 'Railway stations',null,null,false],
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_heatwave_roadway_vuln_view").dataset.value, ' Roadway vulnerability (Performance grade)',null,null,false],
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_heatwave_roadway_damage_view").dataset.value, 'Pavement Temperature (t_pav)',null,null,false],
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_heatwave_roadway_threshold_view").dataset.value, 'Temperature Exceedance',null,null,false],
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_heatwave_railway_vuln_view").dataset.value, 'Railway vulnerability',null,null,false],
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_heatwave_railway_damage_view").dataset.value, 'Buckling Probability',null,null,false]
        ]
    };

    // Initialize the fourth map (C9)
    mapC9 = initWMSMatrixMap(configWMSMatrixMapC9);   


    /**
     * Configuration for the fourth WMS map instance (Map C12).
     * This map highlights xxx.
     * "Risk Analysis -> Extreme Precipitations -> Buildings Vulnerability Analisys"
     */
    configWMSMatrixMapC12 = {
        targetHtmlMapId: 'mapC12',                 // Target HTML element ID
        baseMapName: 'OpenStreetMap - EPSG:3857', // Base map layer name
        centerLongitude: 13.0683,                 // Initial longitude
        centerLatitude: 43.1357,                  // Initial latitude
        zoomValue: 9,                            // Initial zoom level
        popupContext: 'extreme-risk',
        layerMatrix: [
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_poi_prec").dataset.value, 'Buildings of Marche region Extreme Precipitation', null, null, false],
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_building").dataset.value, 'Buildings of Camerino Extreme Precipitation', null, null,false],
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_extprec_6_classes_view").dataset.value, 'Hazard index 6 classes'],
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_extprec_3_classes_view").dataset.value, 'Hazard index 3 classes'],
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_extprec_poi_vuln_view").dataset.value, 'POI Vulnerability'],
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_extprec_poi_risk_view").dataset.value, 'POI Risk'],
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_extprec_building_vuln_view").dataset.value, 'Camerino Buildings vulnerability'],
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_extprec_building_risk_view").dataset.value, 'Camerino Buildings risk']
    ] 
    };

    mapC12 = initWMSMatrixMap(configWMSMatrixMapC12);

    configWMSMatrixMapD5 = {
        targetHtmlMapId: 'mapD5',                 // Target HTML element ID
        baseMapName: 'OpenStreetMap - EPSG:3857', // Base map layer name
        centerLongitude: 13.0683,                 // Initial longitude
        centerLatitude: 43.1357,                  // Initial latitude
        zoomValue: 9,                            // Initial zoom level
        popupContext: 'extreme-sim',
        layerMatrix: [
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_poi_prec_sim_view").dataset.value, 'Buildings of Marche region Extreme Precipitation', null, null, false],
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_building_sim").dataset.value, 'Buildings of Camerino Extreme Precipitation', null, null,false],
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_extprec_6_classes_view").dataset.value, 'Hazard index 6 classes'],
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_extprec_3_classes_view").dataset.value, 'Hazard index 3 classes'],
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_extprec_poi_vuln_view").dataset.value, 'POI Vulnerability'],
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_extprec_poi_risk_view").dataset.value, 'POI Risk'],
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_extprec_building_vuln_view").dataset.value, 'Camerino Buildings vulnerability'],
        [true, true, wmsBaseUrl, document.getElementById("wmslayer_extprec_building_risk_view").dataset.value, 'Camerino Buildings risk']
    ] 
    };

    mapD5 = initWMSMatrixMap(configWMSMatrixMapD5);   

    configWMSMapD13 = {
        targetHtmlMapId: 'mapD13',
        baseMapName: 'OpenStreetMap - EPSG:3857',
        centerLongitude: 12.5,
        centerLatitude: 42.5,
        zoomValue: 6
    };

    mapD13 = initWMSMap(configWMSMapD13);

    configWMSMapD14 = {
        targetHtmlMapId: 'mapD14',
        baseMapName: 'OpenStreetMap - EPSG:3857',
        centerLongitude: 12.5,
        centerLatitude: 42.5,
        zoomValue: 6
    };

    mapD14 = initWMSMap(configWMSMapD14);

    configWMSMapD16 = {
        targetHtmlMapId: 'mapD16',
        baseMapName: 'OpenStreetMap - EPSG:3857',
        centerLongitude: 12.5,
        centerLatitude: 42.5,
        zoomValue: 6
    };

    mapD16 = initWMSMap(configWMSMapD16);

    configWMSMatrixMapD15 = {
        targetHtmlMapId: 'mapD15',
        baseMapName: 'OpenStreetMap - EPSG:3857',
        centerLongitude: 12.5,
        centerLatitude: 42.5,
        zoomValue: 6,
        layerMatrix: [
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_failure_scenario_view").dataset.value, 'Failure scenario']
        ]
    };

    mapD15 = initWMSMatrixMap(configWMSMatrixMapD15);

});

