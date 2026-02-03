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
     * Home dashboard maps split into four tiles.
     * - Tile 1: Hydraulic bulletins
     * - Tile 2: Hydrogeological bulletins
     * - Tile 3: Thunderstorms bulletins
     * - Tile 4: Overview (all bulletins)
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
                [true, true, wmsBaseUrl, document.getElementById("wmslayer_dpc_bulletins_hydraulic_view").dataset.value, 'DPC hydraulic bulletins']
            ]
        },
        {
            ...dashboardBaseConfig,
            targetHtmlMapId: 'mapHomeDashboard2',
            layerMatrix: [
                [true, true, wmsBaseUrl, document.getElementById("wmslayer_dpc_bulletins_hydrogeological_view").dataset.value, 'DPC hydrogeological bulletins']
            ]
        },
        {
            ...dashboardBaseConfig,
            targetHtmlMapId: 'mapHomeDashboard3',
            layerMatrix: [
                [true, true, wmsBaseUrl, document.getElementById("wmslayer_dpc_bulletins_thunderstorms_view").dataset.value, 'DPC thunderstorms bulletins']
            ]
        },
        {
            ...dashboardBaseConfig,
            targetHtmlMapId: 'mapHomeDashboard4',
            layerMatrix: [
                [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_real_view").dataset.value, 'Latest Earthquakes']
            ]
        }
    ];

    [mapHomeDashboard1, mapHomeDashboard2, mapHomeDashboard3, mapHomeDashboard4] = dashboardConfigs.map(cfg => initWMSMatrixMap(cfg));
        
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
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_shakemap").dataset.value, 'Shakemap'],  //  layer
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_real_view").dataset.value, 'Latest Earthquakes']  //  layer //invertiti
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
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_building").dataset.value, 'Buildings of Camerino earthquake'],  //  layer
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_building_vuln_view").dataset.value, 'Lay02_PD1', 'mypd:pd1'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_vuln_view").dataset.value, 'Lay02_PD2', 'mypd:pd2'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_vuln_view").dataset.value, 'Lay02_PD3', 'mypd:pd3'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_vuln_view").dataset.value, 'Lay02_PD4', 'mypd:pd4'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_vuln_view").dataset.value, 'Lay02_PD5', 'mypd:pd5'],  //  layer
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_vuln_view").dataset.value, 'Lay34_PD1', 'mypd:pd1'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_vuln_view").dataset.value, 'Lay34_PD2', 'mypd:pd2'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_vuln_view").dataset.value, 'Lay34_PD3', 'mypd:pd3'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_vuln_view").dataset.value, 'Lay34_PD4', 'mypd:pd4'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_vuln_view").dataset.value, 'Lay34_PD5', 'mypd:pd5'],  //  layer
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_building_damage_view").dataset.value, 'Lay31_PD1', 'mypd:pd1'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_damage_view").dataset.value, 'Lay31_PD2', 'mypd:pd2'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_damage_view").dataset.value, 'Lay31_PD3', 'mypd:pd3'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_damage_view").dataset.value, 'Lay31_PD4', 'mypd:pd4'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_building_damage_view").dataset.value, 'Lay31_PD5', 'mypd:pd5'],
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_shakemap_view").dataset.value, 'Lay32_PD1', 'mypd:pd1'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_shakemap_view").dataset.value, 'Lay32_PD2', 'mypd:pd2'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_shakemap_view").dataset.value, 'Lay32_PD3', 'mypd:pd3'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_shakemap_view").dataset.value, 'Lay32_PD4', 'mypd:pd4'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_shakemap_view").dataset.value, 'Lay32_PD5', 'mypd:pd5'],
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_damage_view").dataset.value, 'Lay33_PD1', 'mypd:pd1'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_damage_view").dataset.value, 'Lay33_PD2', 'mypd:pd2'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_damage_view").dataset.value, 'Lay33_PD3', 'mypd:pd3'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_damage_view").dataset.value, 'Lay33_PD4', 'mypd:pd4'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_damage_view").dataset.value, 'Lay33_PD5', 'mypd:pd5'],
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_view").dataset.value, 'Lay35_PD1', 'mypd:pd1'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_view").dataset.value, 'Lay35_PD2', 'mypd:pd2'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_view").dataset.value, 'Lay35_PD3', 'mypd:pd3'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_view").dataset.value, 'Lay35_PD4', 'mypd:pd4'],  //  layer
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_poibui_view").dataset.value, 'Lay35_PD5', 'mypd:pd5']
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
                       
            [true, true, wmsBaseUrl,  document.getElementById("wmslayer_earth_water_tower_view").dataset.value, 'Lay05_PD1', 'mypd:pd1',null,false],  //  layer input 
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_view").dataset.value, 'Lay05_PD2', 'mypd:pd2',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_view").dataset.value, 'Lay05_PD3', 'mypd:pd3',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_view").dataset.value, 'Lay05_PD4', 'mypd:pd4',null,false],  //  layer input
            
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_view").dataset.value, 'Lay06_PD1', 'mypd:pd1',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_view").dataset.value, 'Lay06_PD2', 'mypd:pd2',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_view").dataset.value, 'Lay06_PD3', 'mypd:pd3',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_view").dataset.value, 'Lay06_PD4', 'mypd:pd4',null,false],  //  layer input
            
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_view").dataset.value, 'Lay07_PD1', 'mypd:pd1',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_view").dataset.value, 'Lay07_PD2', 'mypd:pd2',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_view").dataset.value, 'Lay07_PD3', 'mypd:pd3',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_view").dataset.value, 'Lay07_PD4', 'mypd:pd4',null,false],  //  layer input
            
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_view").dataset.value, 'Lay04_PD1', 'mypd:pd1',null,false],  //  layer  input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_view").dataset.value, 'Lay04_PD2', 'mypd:pd2',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_view").dataset.value, 'Lay04_PD3', 'mypd:pd3',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_view").dataset.value, 'Lay04_PD4', 'mypd:pd4',null,false],  //  layer input

            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_vuln_view").dataset.value, 'Lay36_PD1', 'mypd:pd1',null,false],  //  layer  output
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_vuln_view").dataset.value, 'Lay36_PD2', 'mypd:pd2',null,false],  //  layer output
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_vuln_view").dataset.value, 'Lay36_PD3', 'mypd:pd3',null,false],  //  layer output
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_vuln_view").dataset.value, 'Lay36_PD4', 'mypd:pd4',null,false],  //  layer output
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_damage_view").dataset.value, 'Lay37_PD1', 'mypd:pd1',null,false],  //  layer  output
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_damage_view").dataset.value, 'Lay37_PD2', 'mypd:pd2',null,false],  //  layer output
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_damage_view").dataset.value, 'Lay37_PD3', 'mypd:pd3',null,false],  //  layer output
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_tower_damage_view").dataset.value, 'Lay37_PD4', 'mypd:pd4',null,false],  //  layer output

            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_vuln_view").dataset.value, 'earth_water_well_vuln_PD1', 'mypd:pd1',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_vuln_view").dataset.value, 'earth_water_well_vuln_PD2', 'mypd:pd2',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_vuln_view").dataset.value, 'earth_water_well_vuln_PD3', 'mypd:pd3',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_vuln_view").dataset.value, 'earth_water_well_vuln_PD4', 'mypd:pd4',null,false],  //  layer input
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_damage_view").dataset.value, 'earth_water_well_damage_PD1', 'mypd:pd1',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_damage_view").dataset.value, 'earth_water_well_damage_PD2', 'mypd:pd2',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_damage_view").dataset.value, 'earth_water_well_damage_PD3', 'mypd:pd3',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_water_well_damage_view").dataset.value, 'earth_water_well_damage_PD4', 'mypd:pd4',null,false],  //  layer input
 
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_vuln_view").dataset.value, 'earth_waste_water_vuln_PD1', 'mypd:pd1',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_vuln_view").dataset.value, 'earth_waste_water_vuln_PD2', 'mypd:pd2',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_vuln_view").dataset.value, 'earth_waste_water_vuln_PD3', 'mypd:pd3',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_vuln_view").dataset.value, 'earth_waste_water_vuln_PD4', 'mypd:pd4',null,false],  //  layer input
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_damage_view").dataset.value, 'earth_waste_water_damage_PD1', 'mypd:pd1',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_damage_view").dataset.value, 'earth_waste_water_damage_PD2', 'mypd:pd2',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_damage_view").dataset.value, 'earth_waste_water_damage_PD3', 'mypd:pd3',null,false],  //  layer input
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_waste_water_damage_view").dataset.value, 'earth_waste_water_damage_PD4', 'mypd:pd4',null,false],  //  layer input
 
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_vuln_view").dataset.value, 'Lay38_PD1', 'mypd:pd1',null,false],  //  layer  output
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_vuln_view").dataset.value, 'Lay38_PD2', 'mypd:pd2',null,false],  //  layer output
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_vuln_view").dataset.value, 'Lay38_PD3', 'mypd:pd3',null,false],  //  layer output
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_vuln_view").dataset.value, 'Lay38_PD4', 'mypd:pd4',null,false],  //  layer output
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_damage_view").dataset.value, 'Lay39_PD1', 'mypd:pd1',null,false],  //  layer  output
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_damage_view").dataset.value, 'Lay39_PD2', 'mypd:pd2',null,false],  //  layer output
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_damage_view").dataset.value, 'Lay39_PD3', 'mypd:pd3',null,false],  //  layer output
            [true, false, wmsBaseUrl, document.getElementById("wmslayer_earth_substation_damage_view").dataset.value, 'Lay39_PD4', 'mypd:pd4',null,false],  //  layer output

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
     */
    configWMSMatrixMapC5 = {
        targetHtmlMapId: 'mapC5',                 // Target HTML element ID
        baseMapName: 'Metacarta - EPSG:4326', // Base map layer name
        centerLongitude: 13.0683,                 // Initial longitude
        centerLatitude: 43.1357,                  // Initial latitude
        zoomValue: 9,                            // Initial zoom level
        layerMatrix: [                            // Array of WMS layers
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt10'],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt20'],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt30'],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt40'],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt50'],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt75'],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt100'],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt200'],
           [true, true, wmsBaseUrl, document.getElementById("wmslayer_riverflood_housenew_view").dataset.value,'Residentials buildings','myed_rt:ed_rt500']
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
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_heatwave_real_view").dataset.value, 'Heatwave real view'],
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_heatwave_roadway_view").dataset.value, 'Heatwave roadway view'],
            [true, true, wmsBaseUrl, document.getElementById("wmslayer_heatwave_roadway_damage_view").dataset.value, 'Heatwave roadway damage view']
        ]
    };

    // Initialize the fourth map (C9)
    mapC9 = initWMSMatrixMap(configWMSMatrixMapC9);

   
       
   

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


   

});

