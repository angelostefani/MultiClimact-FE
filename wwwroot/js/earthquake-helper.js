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

/**
 * Populates the earthquake table with data.
 * Adds rows dynamically based on the provided earthquake data array.
 * 
 * @param {Array} data - Array of earthquake data objects.
 */
function populateEarthquakeTable(data) {
    const tableBody = document.getElementById('earthquakeTableBody');
    tableBody.innerHTML = '';

    if (Array.isArray(data)) {
        data.forEach((item, index) => {
            const row = document.createElement('tr');
            row.className = 'earthquake-row';

            // Add click event to highlight the row
            row.addEventListener('click', () => {
                // Remove selection mark from all rows
                document.querySelectorAll('.earthquake-row').forEach(r => {
                    const selectCell = r.querySelector('.select-cell');
                    if (selectCell) {
                        selectCell.textContent = '';
                    }
                });
                // Highlight the clicked row
                row.querySelector('.select-cell').textContent = '✓';

                // Save the last selected row index in localStorage
                localStorage.setItem('lastSelectedRowIndex', index);
                // Simulate function invocation and display risk_run_id
                const hiddenField = row.querySelector('.hidden-risk-run-id');
                if (hiddenField) {
                    activeRiskRunID =  hiddenField.value ;
                    alert(`Risk Run ID: ${hiddenField.value}`);
                }
            });

            // Create table cells for the row
            const selectCell = document.createElement('td');
            selectCell.className = 'select-cell';
            selectCell.textContent = ''; // Empty selection mark initially

            const dateCell = document.createElement('td');
            dateCell.textContent = item.eventDate || 'N/A';

            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = item.description || 'N/A';

            const magnitudeCell = document.createElement('td');
            magnitudeCell.textContent = item.magnitude || 'N/A';

            // Create hidden field for risk_run_id
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.className = 'hidden-risk-run-id';
            hiddenField.value = item.idRun || '';

            // Append cells to the row
            row.appendChild(selectCell);
            row.appendChild(dateCell);
            row.appendChild(descriptionCell);
            row.appendChild(magnitudeCell);
            row.appendChild(hiddenField);

            tableBody.appendChild(row);
        });
    } else {
        // Handle case where no data is available
        const row = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.setAttribute('colspan', 4);
        noDataCell.textContent = 'No data available';
        row.appendChild(noDataCell);
        tableBody.appendChild(row);
    }
}

/**
 * Fetches earthquake data from the server and populates the table.
 * Uses form data as query parameters for the request.
 * 
 * @param {Event} event - The form submission event.
 */
async function fetchEarthquakeData(event) {
    event.preventDefault();
    const form = document.getElementById('earthquakeForm');
    const formData = new FormData(form);
    const params = new URLSearchParams(formData).toString();
    const url = form.action + '?' + params;

    try {
        const response = await fetch(url);
        if (response.ok) {
            const jsonResponse = await response.json();
            if (jsonResponse.success && Array.isArray(jsonResponse.data)) {
                populateEarthquakeTable(jsonResponse.data);
                paginateTable(); // Reapply pagination after updating table data
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

/**
 * Implements pagination for the earthquake table.
 * Displays rows in pages with navigation controls.
 */
function paginateTable() {
    const rowsPerPage = 5;
    const tableBody = document.getElementById("earthquakeTableBody");
    const rows = Array.from(tableBody.getElementsByTagName("tr"));
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    let currentPage = 1;

    /**
     * Renders a specific page of table rows.
     * 
     * @param {number} page - The page number to render.
     */
    function renderPage(page) {
        tableBody.innerHTML = "";
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        rows.slice(start, end).forEach(row => {
            tableBody.appendChild(row);
        });

        // Clear selection marks from rows not visible on the current page
        rows.forEach(r => {
            const selectCell = r.querySelector('.select-cell');
            if (selectCell) {
                selectCell.textContent = '';
            }
        });

        // Restore selection mark for the last selected row if visible
        const lastSelectedRowIndex = parseInt(localStorage.getItem('lastSelectedRowIndex'), 10);
        if (!isNaN(lastSelectedRowIndex) && lastSelectedRowIndex >= start && lastSelectedRowIndex < end) {
            const rowToHighlight = rows[lastSelectedRowIndex];
            rowToHighlight.querySelector('.select-cell').textContent = '✓';
        }
    }

    /**
     * Creates pagination controls for navigating table pages.
     */
    function createPaginationControls() {
        const paginationControls = document.getElementById("paginationControls");
        paginationControls.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.className = "btn btn-secondary m-1";
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

    // Update selection mark on row click
    document.querySelectorAll('.earthquake-row').forEach((row, index) => {
        row.addEventListener('click', () => {
            // Clear selection marks from all rows
            document.querySelectorAll('.select-cell').forEach(cell => cell.textContent = '');

            // Add selection mark to the clicked row
            row.querySelector('.select-cell').textContent = '✓';
            localStorage.setItem('lastSelectedRowIndex', index); // Update last selected row index
        });
    });
}
