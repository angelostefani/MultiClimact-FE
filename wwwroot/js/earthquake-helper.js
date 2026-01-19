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
                localStorage.setItem('lastSelectedRowIndex', index);
                const hiddenField = row.querySelector('.hidden-risk-run-id');
                if (hiddenField) {
                    activeRiskRunID = hiddenField.value;
                    alert(`Risk Run ID: ${hiddenField.value}`);
                }
            });

            const selectCell = document.createElement('td');
            selectCell.className = 'select-cell';
            selectCell.textContent = '';

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
            row.appendChild(dateCell);
            row.appendChild(descriptionCell);
            row.appendChild(hazardCell);
            row.appendChild(hiddenField);
            tableBody.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.setAttribute('colspan', 4);
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

        const lastSelectedRowIndex = parseInt(localStorage.getItem('lastSelectedRowIndex'), 10);
        if (!isNaN(lastSelectedRowIndex) && lastSelectedRowIndex >= start && lastSelectedRowIndex < end) {
            const rowToHighlight = rows[lastSelectedRowIndex];
            if (rowToHighlight) {
                rowToHighlight.querySelector('.select-cell').textContent = 'V';
            }
        }
    }

    function createPaginationControls() {
        const paginationControls = document.getElementById("paginationControls");
        paginationControls.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.className = "btn btn-secondary m-1";
            button.type = "button";
            button.addEventListener("click", () => {
                currentPage = i;
                renderPage(currentPage);
            });
            paginationControls.appendChild(button);
        }
    }

    if (rows.length > 0) {
        renderPage(currentPage);
        createPaginationControls();
    }

    document.querySelectorAll('.hazard-row').forEach((row, index) => {
        row.addEventListener('click', () => {
            document.querySelectorAll('.select-cell').forEach(cell => cell.textContent = '');
            row.querySelector('.select-cell').textContent = 'V';
            localStorage.setItem('lastSelectedRowIndex', index);
        });
    });
}
