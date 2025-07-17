/*
* Author: Angelo Stefani [angelo.stefani@enea.it]
* Creation date: 02/01/2024
* Last update: 05/15/2024
*
* JavaScript library for ENEA GIS applications.
* Frameworks used:
* - Bootstrap
* - JQuery
*/

/**
 * Toggles the left sidebar's visibility by changing its width.
 * If the sidebar is open, it will collapse; otherwise, it will expand.
 */
function toggleSidebarLeft() {
    let sidebar = document.getElementById("mySidebarLeft");
    if (sidebar.style.width === "25vw") {
        sidebar.style.width = "0";
    } else {
        sidebar.style.width = "25vw";
    }
}

/**
 * Toggles the visibility of the bottom bar by changing its height and content display.
 * If the bottom bar is open, it will collapse and hide its content; otherwise, it will expand and show its content.
 */
function toggleBottomBar() {
    let bottomBar = document.getElementById("myBottomBar");
    let content = document.querySelector(".bottom-bar-content");
    if (bottomBar.style.height === "75%") {
        bottomBar.style.height = "0";
        content.style.display = "none";
    } else {
        bottomBar.style.height = "75%";
        content.style.display = "block";
    }
}

/**
 * Autore: Angelo Stefani [angelo.stefani@enea.it]
 * Data: 29/02/2024
 * 
 * Funzione per convertire le coordinate di longitudine e latitudine in formato DMS (gradi, minuti, secondi).
 * @param {number} coord - La coordinata da convertire.
 * @param {string} coordType - Il tipo di coordinata ('lon' per longitudine, 'lat' per latitudine).
 * @returns {string} La coordinata in formato DMS.
 */
function convertToDMS(coord, coordType) {
    const absCoord = Math.abs(coord);
    const degrees = Math.floor(absCoord);
    const minutes = Math.floor((absCoord - degrees) * 60);
    const seconds = ((absCoord - degrees - minutes / 60) * 3600).toFixed(1);
    const direction = coordType === 'lat' ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');

    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

/**
 * Aggiunge un listener per mostrare le coordinate del mouse sulla mappa.
 *
 * @param {ol.Map} map - La mappa OpenLayers su cui aggiungere il listener.
 */
function addMouseCoordinateListener(map) {
    map.on('pointermove', function (event) {
        let coordinates = ol.proj.toLonLat(event.coordinate);
        let lonDMS = convertToDMS(coordinates[0], 'lon');
        let latDMS = convertToDMS(coordinates[1], 'lat');
        $('#mouseCoordinates').text('Lat: ' + latDMS + ' - Lon: ' + lonDMS);
    });
}
