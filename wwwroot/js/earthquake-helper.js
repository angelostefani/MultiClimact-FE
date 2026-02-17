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

// Variabile per tracciare la scheda attiva
let activeRiskRunID = '';
let lastAppliedRiskRunID = null;
// Flag di debug per log mirati
const DEBUG_HAZARD = true;
// Stati per indice selezionato per hazard
const selectedRowIndexByHazard = {
    earthquake: null,
    heatwave: null,
    extremeprecipitation: null
};
// Stati per risk run id per hazard
const activeRiskRunIdByHazard = {
    earthquake: '',
    heatwave: '',
    extremeprecipitation: ''
};

// Mappa tab -> hazard di pertinenza per sincronizzare activeRiskRunID al cambio pagina
const hazardByTab = {
    // Earthquake (Risk Analysis + Scenario simulation)
    'tabC1-tab': 'earthquake',
    'tabC2-tab': 'earthquake',
    'tabC3-tab': 'earthquake',
    'tabC4-tab': 'earthquake',
    'tabD1-tab': 'earthquake',
    'tabD2-tab': 'earthquake',
    'tabD3-tab': 'earthquake',
    'tabD4-tab': 'earthquake',

    // Heatwave (Risk Analysis + Scenario simulation)
    'tabC9-tab': 'heatwave',
    'tabC10-tab': 'heatwave',
    'tabC11-tab': 'heatwave',
    'tabD9-tab': 'heatwave',
    'tabD10-tab': 'heatwave',
    'tabD11-tab': 'heatwave',

    // Extreme precipitation (Risk Analysis + Scenario simulation)
    'tabC12-tab': 'extremeprecipitation',
    'tabC13-tab': 'extremeprecipitation',
    'tabD5-tab': 'extremeprecipitation',
    'tabD6-tab': 'extremeprecipitation',
    'tabD7-tab': 'extremeprecipitation',
    'tabD8-tab': 'extremeprecipitation'
};

function getHazardFromTab(tabId) {
    return hazardByTab[tabId] || null;
}

function syncActiveRiskRunIdFromTab(tabId) {
    const hazard = getHazardFromTab(tabId);
    if (!hazard) {
        return;
    }

    activeRiskRunID = activeRiskRunIdByHazard[hazard] || '';
    if (DEBUG_HAZARD) {
        console.log('[hazard tab sync]', { tabId, hazard, activeRiskRunID, activeRiskRunIdByHazard });
    }
    refreshMapsForActiveRiskRunId();
}

// Espone la funzione per il cambio tab gestito in menu-helper.js
if (typeof window !== 'undefined') {
    window.syncActiveRiskRunIdFromTab = syncActiveRiskRunIdFromTab;
}

// Richiama l'aggiornamento dei layer WMS per riflettere il nuovo activeRiskRunID
function refreshMapsForActiveRiskRunId() {
    if (typeof updateMapLayers !== 'function') {
        return;
    }

    if (activeRiskRunID === lastAppliedRiskRunID) {
        return;
    }

    const mapPairs = [
        { config: typeof configWMSMatrixMapC1 !== 'undefined' ? configWMSMatrixMapC1 : null, map: typeof mapC1 !== 'undefined' ? mapC1 : null },
        { config: typeof configWMSMatrixMapC2 !== 'undefined' ? configWMSMatrixMapC2 : null, map: typeof mapC2 !== 'undefined' ? mapC2 : null },
        { config: typeof configWMSMatrixMapC3 !== 'undefined' ? configWMSMatrixMapC3 : null, map: typeof mapC3 !== 'undefined' ? mapC3 : null },
        { config: typeof configWMSMatrixMapC4 !== 'undefined' ? configWMSMatrixMapC4 : null, map: typeof mapC4 !== 'undefined' ? mapC4 : null },
        { config: typeof configWMSMatrixMapC5 !== 'undefined' ? configWMSMatrixMapC5 : null, map: typeof mapC5 !== 'undefined' ? mapC5 : null },
        { config: typeof configWMSMatrixMapC9 !== 'undefined' ? configWMSMatrixMapC9 : null, map: typeof mapC9 !== 'undefined' ? mapC9 : null },
        { config: typeof configWMSMatrixMapC12 !== 'undefined' ? configWMSMatrixMapC12 : null, map: typeof mapC12 !== 'undefined' ? mapC12 : null },
        { config: typeof configWMSMatrixMapD5 !== 'undefined' ? configWMSMatrixMapD5 : null, map: typeof mapD5 !== 'undefined' ? mapD5 : null },
        { config: typeof configWMSMatrixMapHomeDashboard1 !== 'undefined' ? configWMSMatrixMapHomeDashboard1 : null, map: typeof mapHomeDashboard1 !== 'undefined' ? mapHomeDashboard1 : null },
        { config: typeof configWMSMatrixMapHomeDashboard2 !== 'undefined' ? configWMSMatrixMapHomeDashboard2 : null, map: typeof mapHomeDashboard2 !== 'undefined' ? mapHomeDashboard2 : null },
        { config: typeof configWMSMatrixMapHomeDashboard3 !== 'undefined' ? configWMSMatrixMapHomeDashboard3 : null, map: typeof mapHomeDashboard3 !== 'undefined' ? mapHomeDashboard3 : null },
        { config: typeof configWMSMatrixMapHomeDashboard4 !== 'undefined' ? configWMSMatrixMapHomeDashboard4 : null, map: typeof mapHomeDashboard4 !== 'undefined' ? mapHomeDashboard4 : null },
    ];

    mapPairs.forEach(pair => {
        if (pair.config && pair.map) {
            updateMapLayers(pair.config, pair.map);
        }
    });

    lastAppliedRiskRunID = activeRiskRunID;
}

const hazardConfig = {
    earthquake: {
        endpoint: '/api/EarthquakeProxy/GetEarthquakes',
        extraParams: {
            min_magnitude: '0',
            max_magnitude: '10'
        }
    },
    heatwave: {
        endpoint: '/api/HeatwaveProxy/GetHeatwaves',
    },
    extremeprecipitation: {
        endpoint: '/api/ExtremeprecipitationProxy/GetExtremeprecipitations'
    }
};

function formatHazardLabel(hazardKey) {
    switch (hazardKey) {
        case 'heatwave':
            return 'Heatwave';
        case 'extremeprecipitation':
            return 'Extreme precipitation';
        default:
            return 'Earthquake';
    }
}

function normalizeHazardItem(raw) {
    const getFirstDefined = (...values) => values.find(v => v !== undefined && v !== null && v !== '');

    const eventDateRaw = getFirstDefined(
        raw.eventDate,
        raw.event_date,
        raw.EventDate,
        raw.event_date_time,
        raw.acq_date,
        raw.occurrence_time,
        raw.occurrence_time_local,
        raw.time
    );

    const description = getFirstDefined(
        raw.description,
        raw.Description,
        raw.desc,
        raw.name,
        raw.title,
        raw.hazard_str,
        raw.status_str,
        raw.impact_conf,
        raw.damage_conf,
        'N/A'
    );

    const idRun = getFirstDefined(
        raw.idRun,
        raw.id_run,
        raw.IdRun,
        raw.run_id,
        raw.id,
        ''
    );

    const formatDate = (value) => {
        if (!value) return 'N/A';
        const parseNumberDate = (num) => {
            if (num <= 0) return null;
            // Heuristic: seconds vs milliseconds
            return num < 1e12 ? new Date(num * 1000) : new Date(num);
        };

        let parsed;
        if (typeof value === 'number') {
            parsed = parseNumberDate(value);
        } else if (typeof value === 'string' && /^\d+$/.test(value)) {
            parsed = parseNumberDate(Number(value));
        } else {
            parsed = new Date(value);
        }

        if (isNaN(parsed)) {
            return typeof value === 'string' ? value : 'N/A';
        }
        return parsed.toISOString().replace('T', ' ').substring(0, 19);
    };

    return {
        eventDate: formatDate(eventDateRaw),
        description,
        idRun
    };
}

function populateHazardTable(data, config, hazardKey) {
    const tableBody = document.getElementById('hazardTableBody');
    tableBody.innerHTML = '';

    if (Array.isArray(data)) {
        data.forEach((item, index) => {
            const normalized = normalizeHazardItem(item);
            const row = document.createElement('tr');
            row.className = 'hazard-row';

            row.addEventListener('click', () => {
                document.querySelectorAll('.hazard-row').forEach(r => {
                    const selectCell = r.querySelector('.select-cell');
                    if (selectCell) {
                        selectCell.textContent = '';
                    }
                });
                row.querySelector('.select-cell').textContent = 'V';
                selectedRowIndexByHazard[hazardKey] = index;
                const hiddenField = row.querySelector('.hidden-risk-run-id');
                if (hiddenField) {
                    const idValue = hiddenField.value;
                    activeRiskRunIdByHazard[hazardKey] = idValue;
                    activeRiskRunID = idValue;
                    localStorage.setItem('lastSelectedRowIndex_' + hazardKey, index);
                    if (DEBUG_HAZARD) {
                        console.log('[hazard click]', { hazardKey, index, selectedRowIndexByHazard, activeRiskRunIdByHazard, activeRiskRunID });
                        console.log('[hazard click - paginated]', { hazardType: hazardKey, index, selectedRowIndexByHazard, activeRiskRunIdByHazard, activeRiskRunID });
                    }
                    refreshMapsForActiveRiskRunId();
                }
            });

            const selectCell = document.createElement('td');
            selectCell.className = 'select-cell';
            selectCell.textContent = '';

            const idRunCell = document.createElement('td');
            idRunCell.textContent = normalized.idRun || 'N/A';

            const dateCell = document.createElement('td');
            dateCell.textContent = normalized.eventDate;

            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = normalized.description;

            const hazardCell = document.createElement('td');
            hazardCell.textContent = formatHazardLabel(hazardKey);

            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.className = 'hidden-risk-run-id';
            hiddenField.value = normalized.idRun || '';

            row.appendChild(selectCell);
            row.appendChild(idRunCell);
            row.appendChild(dateCell);
            row.appendChild(descriptionCell);
            row.appendChild(hazardCell);
            row.appendChild(hiddenField);
            tableBody.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.setAttribute('colspan', 5);
        noDataCell.textContent = 'No data available';
        row.appendChild(noDataCell);
        tableBody.appendChild(row);
    }
}

async function fetchHazardData(event) {
    event.preventDefault();
    const form = document.getElementById('hazardForm');
    const hazardType = document.getElementById('hazardType').value;
    const config = hazardConfig[hazardType];

    if (!config) {
        console.error('Unsupported hazard type:', hazardType);
        return;
    }

    const formData = new FormData(form);
    formData.delete('hazard_type'); // evita di inviare un parametro non usato dal backend
    if (config.extraParams) {
        Object.entries(config.extraParams).forEach(([key, value]) => {
            if (!formData.has(key)) {
                formData.append(key, value);
            }
        });
    }
    const params = new URLSearchParams(formData).toString();
    const url = config.endpoint + '?' + params;

    try {
        const response = await fetch(url);
        if (response.ok) {
            const jsonResponse = await response.json();
            let data = jsonResponse.data || jsonResponse.Data;
            if (!data && Array.isArray(jsonResponse)) {
                data = jsonResponse;
            } else if (!data && jsonResponse.results) {
                data = jsonResponse.results;
            } else if (!data && jsonResponse.items) {
                data = jsonResponse.items;
            } else if (!data && jsonResponse.runs) {
                data = jsonResponse.runs;
            }
            if (jsonResponse.success === true || Array.isArray(data)) {
                populateHazardTable(data, config, hazardType);
                // ripristina eventuale risk run id selezionato per l'hazard corrente
                if (activeRiskRunIdByHazard[hazardType]) {
                    activeRiskRunID = activeRiskRunIdByHazard[hazardType];
                } else {
                    activeRiskRunID = '';
                }
                paginateTable();
            } else {
                console.error('Server response error:', jsonResponse);
            }
        } else {
            console.error('Response error:', response.status);
        }
    } catch (error) {
        console.error('Error during data fetch:', error);
    }
}

function paginateTable() {
    const rowsPerPage = 5;
    const tableBody = document.getElementById("hazardTableBody");
    const rows = Array.from(tableBody.getElementsByTagName("tr"));
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    let currentPage = 1;
    const hazardType = document.getElementById('hazardType') ? document.getElementById('hazardType').value : 'earthquake';

    function renderPage(page) {
        tableBody.innerHTML = "";
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        rows.slice(start, end).forEach(row => {
            tableBody.appendChild(row);
        });

        rows.forEach(r => {
            const selectCell = r.querySelector('.select-cell');
            if (selectCell) {
                selectCell.textContent = '';
            }
        });

        const storedKey = 'lastSelectedRowIndex_' + hazardType;
        const lastSelectedRowIndex = parseInt(localStorage.getItem(storedKey), 10);
        if (!isNaN(lastSelectedRowIndex) && lastSelectedRowIndex >= start && lastSelectedRowIndex < end) {
            const rowToHighlight = rows[lastSelectedRowIndex];
            if (rowToHighlight) {
                rowToHighlight.querySelector('.select-cell').textContent = 'V';
            }
            if (DEBUG_HAZARD) {
                console.log('[hazard paginate restore]', { hazardType, lastSelectedRowIndex, start, end });
            }
        }
    }

    function createPaginationControls() {
        const paginationControls = document.getElementById("paginationControls");
        paginationControls.innerHTML = "";
        if (totalPages <= 1) {
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "d-flex align-items-center flex-wrap";

        const prevBtn = document.createElement("button");
        prevBtn.textContent = "Prev";
        prevBtn.className = "btn btn-secondary m-1";
        prevBtn.type = "button";

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Next";
        nextBtn.className = "btn btn-secondary m-1";
        nextBtn.type = "button";

        const pageInfo = document.createElement("span");
        pageInfo.className = "mx-2";

        const pageInput = document.createElement("input");
        pageInput.type = "number";
        pageInput.min = "1";
        pageInput.max = totalPages.toString();
        pageInput.value = currentPage;
        pageInput.className = "form-control m-1";
        pageInput.style.width = "100px";

        function updateControls() {
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            pageInput.value = currentPage;
        }

        prevBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage -= 1;
                renderPage(currentPage);
                updateControls();
            }
        });

        nextBtn.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage += 1;
                renderPage(currentPage);
                updateControls();
            }
        });

        pageInput.addEventListener("change", () => {
            const target = parseInt(pageInput.value, 10);
            if (!isNaN(target) && target >= 1 && target <= totalPages) {
                currentPage = target;
                renderPage(currentPage);
            }
            updateControls();
        });

        wrapper.appendChild(prevBtn);
        wrapper.appendChild(nextBtn);
        wrapper.appendChild(pageInfo);
        wrapper.appendChild(pageInput);
        paginationControls.appendChild(wrapper);
        updateControls();
    }

    if (rows.length > 0) {
        renderPage(currentPage);
        createPaginationControls();
    }

}

// Aggiorna il risk run id globale quando cambia l'hazard selezionato
document.addEventListener('DOMContentLoaded', () => {
    const hazardSelect = document.getElementById('hazardType');
    const idRunLastEarthquake = document.getElementById('idRunLastEarthquake')?.dataset?.value || '';
    const idRunLastHeatwave = document.getElementById('idRunLastHeatwave')?.dataset?.value || '';
    const idRunLastExtremePrecipitation = document.getElementById('idRunLastExtremePrecipitation')?.dataset?.value || '';

    // Inizializza gli id_run per hazard dalle info server-side, senza sovrascrivere eventuali selezioni utente già presenti
    if (!activeRiskRunIdByHazard.earthquake && idRunLastEarthquake && !idRunLastEarthquake.startsWith('Error') && !idRunLastEarthquake.startsWith('Exception')) {
        activeRiskRunIdByHazard.earthquake = idRunLastEarthquake;
    }
    if (!activeRiskRunIdByHazard.heatwave && idRunLastHeatwave && !idRunLastHeatwave.startsWith('Error') && !idRunLastHeatwave.startsWith('Exception')) {
        activeRiskRunIdByHazard.heatwave = idRunLastHeatwave;
    }
    if (!activeRiskRunIdByHazard.extremeprecipitation && idRunLastExtremePrecipitation && !idRunLastExtremePrecipitation.startsWith('Error') && !idRunLastExtremePrecipitation.startsWith('Exception')) {
        activeRiskRunIdByHazard.extremeprecipitation = idRunLastExtremePrecipitation;
    }

    if (!hazardSelect) return;

    const syncActiveRiskRunId = (hazard) => {
        const storedId = activeRiskRunIdByHazard[hazard] || '';
        activeRiskRunID = storedId;
        if (DEBUG_HAZARD) {
            console.log('[hazard sync]', { hazard, storedId, activeRiskRunID, selectedRowIndexByHazard, activeRiskRunIdByHazard });
        }
        refreshMapsForActiveRiskRunId();
    };

    syncActiveRiskRunId(hazardSelect.value);

    hazardSelect.addEventListener('change', () => {
        syncActiveRiskRunId(hazardSelect.value);
    });
});
