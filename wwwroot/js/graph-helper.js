function normalizeGraphItem(raw) {
    const statusId = raw?.config_status ?? raw?.configStatus ?? raw?.status_id ?? raw?.statusId ?? "";
    const statusResId = raw?.status_res_id ?? raw?.statusResId ?? "";
    const rawIdResrun = raw?.id_resrun ?? raw?.idResrun ?? "";

    return {
        idConf: raw?.id_conf ?? raw?.idConf ?? raw?.id ?? "",
        name: raw?.imp_name ?? raw?.name ?? "N/A",
        date: formatGraphDate(raw?.imp_date ?? raw?.date),
        monteCarloIterations: getDisplayValue(raw?.imp_mcarlo_it),
        statusId,
        statusStr: getGraphStatusLabel(statusId, raw?.config_status_str ?? raw?.configStatusStr ?? raw?.status_str ?? raw?.statusStr),
        idResrun: getDisplayValue(rawIdResrun),
        rawIdResrun,
        statusResId,
        statusResStr: getGraphResilienceStatusLabel(statusResId, raw?.status_res_str ?? raw?.statusResStr)
    };
}

function createGraphRow(normalized, index) {
    const row = document.createElement("tr");
    row.className = "graph-row";

    row.addEventListener("click", () => {
        clearGraphRowSelection();
        markGraphRowAsSelected(row);

        const selection = {
            idConf: normalized.idConf?.toString() ?? "",
            statusId: normalized.statusId?.toString() ?? "",
            statusResId: normalized.statusResId?.toString() ?? "",
            idResrun: normalized.rawIdResrun?.toString() ?? "",
            rowIndex: index
        };

        setSelectedGraphState(selection);
        emitGraphScenarioSelected(selection);
        updateGraphDeleteButtons();
    });

    const selectCell = document.createElement("td");
    selectCell.className = "select-cell";

    const idConfCell = document.createElement("td");
    idConfCell.textContent = normalized.idConf?.toString() || "N/A";

    const nameCell = document.createElement("td");
    nameCell.textContent = normalized.name;

    const dateCell = document.createElement("td");
    dateCell.textContent = normalized.date;

    const mcarloCell = document.createElement("td");
    mcarloCell.textContent = normalized.monteCarloIterations?.toString() || "N/A";

    const statusCell = document.createElement("td");
    appendGraphStatusValue(statusCell, normalized.statusStr);

    const idResrunCell = document.createElement("td");
    idResrunCell.textContent = normalized.idResrun?.toString() || "N/A";

    const statusResCell = document.createElement("td");
    appendGraphStatusValue(statusResCell, normalized.statusResStr);

    const deleteCell = document.createElement("td");
    deleteCell.className = "graph-delete-cell";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-outline-danger graph-delete-btn";
    deleteBtn.dataset.idConf = normalized.idConf?.toString() ?? "";
    deleteBtn.title = "Delete scenario";
    deleteBtn.setAttribute("aria-label", `Delete scenario ${normalized.idConf}`);
    deleteBtn.innerHTML = '<i class="bi bi-trash" aria-hidden="true"></i>';
    deleteBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await deleteGraphScenario(normalized.idConf, deleteBtn);
    });

    deleteCell.appendChild(deleteBtn);
    row.append(selectCell, idConfCell, nameCell, dateCell, mcarloCell, statusCell, idResrunCell, statusResCell, deleteCell);
    return row;
}

function populateGraphTable(data) {
    const tableBody = document.getElementById("graphTableBody");
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";
    if (!Array.isArray(data) || data.length === 0) {
        const row = document.createElement("tr");
        const noDataCell = document.createElement("td");
        noDataCell.setAttribute("colspan", 9);
        noDataCell.textContent = "No data available";
        row.appendChild(noDataCell);
        tableBody.appendChild(row);
        return;
    }

    data
        .map(normalizeGraphItem)
        .forEach((normalized, index) => tableBody.appendChild(createGraphRow(normalized, index)));

    updateGraphDeleteButtons();
}

function getGraphSearchParamsFromForm() {
    const form = document.getElementById("graphForm");
    if (!form) {
        return null;
    }

    const formData = new FormData(form);
    const fieldNames = ["name", "id_conf", "status_id", "id_resrun", "status_res_id"];
    const params = new URLSearchParams();
    params.append("user_id", formData.get("user_id")?.toString() || "system");

    const startTime = htmlDateToWs13Date(formData.get("start_date")?.toString() || "");
    const endTime = htmlDateToWs13Date(formData.get("end_date")?.toString() || "");
    if (startTime) {
        params.append("start_time", startTime);
    }
    if (endTime) {
        params.append("end_time", endTime);
    }

    fieldNames.forEach((fieldName) => {
        const value = formData.get(fieldName)?.toString().trim() || "";
        if (value) {
            params.append(fieldName, value);
        }
    });

    return params;
}

async function loadGraphDataFromForm() {
    const params = getGraphSearchParamsFromForm();
    if (!params) {
        return;
    }

    try {
        const response = await fetch(`/api/GraphProxy/GetGraphs?${params.toString()}`);
        if (!response.ok) {
            console.error("Graph response error:", response.status);
            return;
        }

        const jsonResponse = await response.json();
        clearSelectedGraphSearchState();
        populateGraphTable(Array.isArray(jsonResponse?.data) ? jsonResponse.data : []);
        paginateGraphTable();
    } catch (error) {
        console.error("Error during graph data fetch:", error);
    }
}

async function fetchGraphData(event) {
    event?.preventDefault();
    await loadGraphDataFromForm();
}

function updateGraphDeleteButtons() {
    document.querySelectorAll(".graph-delete-btn").forEach(button => {
        const idConf = button.dataset.idConf ?? "";
        const disabled = isSelectedGraphId(idConf);
        button.disabled = disabled;
        button.classList.toggle("d-none", disabled);
        button.classList.toggle("graph-delete-btn-disabled", disabled);
        button.title = disabled ? "The currently selected scenario cannot be deleted" : "Delete scenario";
        button.setAttribute("aria-hidden", disabled ? "true" : "false");
    });
}

async function deleteGraphScenario(idConf, button) {
    const normalizedIdConf = idConf?.toString().trim() ?? "";
    if (!normalizedIdConf) {
        window.alert("A valid id_conf is required.");
        return;
    }

    if (isSelectedGraphId(normalizedIdConf)) {
        window.alert("The currently selected scenario cannot be deleted.");
        updateGraphDeleteButtons();
        return;
    }

    if (!window.confirm(`Delete scenario config ${normalizedIdConf}?`)) {
        return;
    }

    const originalDisabled = button?.disabled ?? false;
    if (button) {
        button.disabled = true;
        button.classList.add("graph-delete-btn-busy");
    }

    try {
        const response = await fetch(`/api/GraphProxy/DeleteScenario?id_conf=${encodeURIComponent(normalizedIdConf)}`, {
            method: "DELETE"
        });
        const responseText = await response.text();
        let responseJson = null;

        if (responseText) {
            try {
                responseJson = JSON.parse(responseText);
            } catch {
                responseJson = null;
            }
        }

        if (!response.ok || responseJson?.success === false) {
            const serviceMessage =
                responseJson?.data?.message ??
                responseJson?.message ??
                responseText ??
                `HTTP ${response.status}`;
            throw new Error(serviceMessage);
        }

        await loadGraphDataFromForm();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to delete the selected scenario.";
        window.alert(errorMessage);
        console.error("Error while deleting scenario:", error);
    } finally {
        if (button) {
            button.disabled = originalDisabled;
            button.classList.remove("graph-delete-btn-busy");
        }
        updateGraphDeleteButtons();
    }
}

function paginateGraphTable() {
    const rowsPerPage = 5;
    const tableBody = document.getElementById("graphTableBody");
    const paginationControls = document.getElementById("graphPaginationControls");
    if (!tableBody || !paginationControls) {
        return;
    }

    const rows = Array.from(tableBody.getElementsByTagName("tr"));
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    let currentPage = 1;

    const renderPage = (page) => {
        tableBody.innerHTML = "";
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        rows.slice(start, end).forEach(row => tableBody.appendChild(row));

        rows.forEach(row => {
            row.classList.remove("graph-row-selected");
            const selectCell = row.querySelector(".select-cell");
            if (selectCell) {
                selectCell.textContent = "";
            }
        });

        const selectedId = (selectedGraphIdConf ?? localStorage.getItem(graphSelectionStorageKeys.idConf) ?? "").toString();
        const selectedIndexRaw = selectedGraphRowIndex ?? localStorage.getItem(graphSelectionStorageKeys.rowIndex);
        const selectedIndex = Number.parseInt(selectedIndexRaw, 10);

        if (!Number.isNaN(selectedIndex) && selectedIndex >= start && selectedIndex < end) {
            const rowByIndex = rows[selectedIndex];
            const cell = rowByIndex?.querySelector(".select-cell");
            if (cell) {
                cell.textContent = "✔";
                rowByIndex.classList.add("graph-row-selected");
                updateGraphDeleteButtons();
                return;
            }
        }

        if (selectedId) {
            rows.slice(start, end).forEach(row => {
                const idCell = row.children[1];
                const selectCell = row.querySelector(".select-cell");
                if (idCell && selectCell && idCell.textContent?.trim() === selectedId) {
                    selectCell.textContent = "✔";
                    row.classList.add("graph-row-selected");
                }
            });
        }

        updateGraphDeleteButtons();
    };

    const createPaginationControls = () => {
        paginationControls.innerHTML = "";
        if (totalPages <= 1) {
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "bottom-bar-pagination d-flex align-items-center flex-wrap";

        const prevBtn = document.createElement("button");
        prevBtn.textContent = "Prev";
        prevBtn.className = "btn btn-outline-primary bottom-bar-page-btn";
        prevBtn.type = "button";

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Next";
        nextBtn.className = "btn btn-outline-primary bottom-bar-page-btn";
        nextBtn.type = "button";

        const pageInfo = document.createElement("span");
        pageInfo.className = "mx-2";

        const pageInput = document.createElement("input");
        pageInput.type = "number";
        pageInput.min = "1";
        pageInput.max = totalPages.toString();
        pageInput.value = currentPage.toString();
        pageInput.className = "form-control bottom-bar-page-input";

        const updateControls = () => {
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            pageInput.value = currentPage.toString();
        };

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

        wrapper.append(prevBtn, nextBtn, pageInfo, pageInput);
        paginationControls.appendChild(wrapper);
        updateControls();
    };

    if (rows.length > 0) {
        renderPage(currentPage);
        createPaginationControls();
    } else {
        paginationControls.innerHTML = "";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    initializeGraphStatusDropdown();

    const defaultId = document.getElementById("defaultScenarioIdConf")?.dataset?.value ?? "";
    if (defaultId && defaultId !== "undefined") {
        activeScenarioID = defaultId;
        selectedGraphIdConf = defaultId;
        localStorage.setItem(graphSelectionStorageKeys.idConf, defaultId);
    }
});
