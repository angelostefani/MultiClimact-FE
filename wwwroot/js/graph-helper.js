let selectedGraphIdConf = null;
let selectedGraphRowIndex = null;
let activeScenarioID = '';
let selectedGraphStatusId = null;
let selectedGraphResrunId = null;
const graphStatusOptions = [
    { id: 1, label: "submitted" },
    { id: 2, label: "dispatching" },
    { id: 3, label: "processing" },
    { id: 4, label: "initialized" },
    { id: 5, label: "ready" },
    { id: 6, label: "failed" }
];
const graphResilienceStatusOptions = [
    { id: 1, label: "submitted" },
    { id: 2, label: "scheduled" },
    { id: 3, label: "dispatching" },
    { id: 4, label: "processing" },
    { id: 5, label: "completed" },
    { id: 6, label: "failed" },
    { id: 7, label: "cancelled" }
];

function formatGraphDate(value) {
    if (!value) {
        return "N/A";
    }

    const parsed = new Date(value);
    if (isNaN(parsed)) {
        return typeof value === "string" ? value : "N/A";
    }

    return parsed.toISOString().replace("T", " ").substring(0, 19);
}

function htmlDateToWs13Date(htmlDate) {
    if (!htmlDate || !/^\d{4}-\d{2}-\d{2}$/.test(htmlDate)) {
        return "";
    }
    return htmlDate.replaceAll("-", ":");
}

function initializeGraphStatusDropdown() {
    const statusSelects = [
        {
            element: document.getElementById("graphStatusId"),
            defaultText: "All statuses",
            options: graphStatusOptions
        },
        {
            element: document.getElementById("graphStatusResId"),
            defaultText: "All resilience statuses",
            options: graphResilienceStatusOptions
        }
    ];

    statusSelects.forEach(({ element, defaultText, options }) => {
        if (!element) {
            return;
        }

        const currentValue = element.value;
        element.innerHTML = "";

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = defaultText;
        element.appendChild(defaultOption);

        options.forEach(status => {
            const option = document.createElement("option");
            option.value = status.id.toString();
            option.textContent = status.label;
            element.appendChild(option);
        });

        element.value = currentValue;
    });
}

function getGraphStatusLabel(statusId, statusStr) {
    if (statusStr !== undefined && statusStr !== null && statusStr !== "") {
        return statusStr;
    }

    const normalizedStatusId = statusId?.toString() ?? "";
    if (!normalizedStatusId) {
        return "N/A";
    }

    return graphStatusOptions.find(status => status.id.toString() === normalizedStatusId)?.label ?? normalizedStatusId;
}

function getGraphResilienceStatusLabel(statusId, statusStr) {
    if (statusStr !== undefined && statusStr !== null && statusStr !== "") {
        return statusStr;
    }

    const normalizedStatusId = statusId?.toString() ?? "";
    if (!normalizedStatusId) {
        return "N/A";
    }

    return graphResilienceStatusOptions.find(status => status.id.toString() === normalizedStatusId)?.label ?? normalizedStatusId;
}

function getDisplayValue(value) {
    if (value === undefined || value === null || value === "") {
        return "N/A";
    }

    return value;
}

function getCurrentSelectedGraphId() {
    return (
        selectedGraphIdConf ??
        activeScenarioID ??
        localStorage.getItem("lastSelectedGraphIdConf") ??
        ""
    ).toString();
}

function isSelectedGraphId(idConf) {
    const selectedId = getCurrentSelectedGraphId();
    return selectedId !== "" && selectedId === (idConf ?? "").toString();
}

function appendGraphStatusValue(cell, value) {
    const statusValue = value?.toString() || "N/A";
    if (statusValue.trim().toLowerCase() === "completed") {
        const statusBadge = document.createElement("span");
        statusBadge.className = "hazard-status-badge hazard-status-badge-completed";
        statusBadge.textContent = statusValue;
        cell.appendChild(statusBadge);
    } else {
        cell.textContent = statusValue;
    }
}

function normalizeGraphItem(raw) {
    const statusId = raw?.status_id ?? raw?.statusId ?? "";
    const statusResId = raw?.status_res_id ?? raw?.statusResId ?? "";
    const rawIdResrun = raw?.id_resrun ?? raw?.idResrun ?? "";

    return {
        idConf: raw?.id_conf ?? raw?.idConf ?? raw?.id ?? "",
        name: raw?.imp_name ?? raw?.name ?? "N/A",
        date: formatGraphDate(raw?.imp_date ?? raw?.date),
        monteCarloIterations: getDisplayValue(raw?.imp_mcarlo_it),
        statusId,
        statusStr: getGraphStatusLabel(statusId, raw?.status_str ?? raw?.statusStr),
        idResrun: getDisplayValue(rawIdResrun),
        rawIdResrun,
        statusResId,
        statusResStr: getGraphResilienceStatusLabel(statusResId, raw?.status_res_str ?? raw?.statusResStr)
    };
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

    data.forEach((item, index) => {
        const normalized = normalizeGraphItem(item);
        const row = document.createElement("tr");
        row.className = "graph-row";

        row.addEventListener("click", () => {
            document.querySelectorAll(".graph-row").forEach(r => {
                r.classList.remove("graph-row-selected");
                const cell = r.querySelector(".select-cell");
                if (cell) {
                    cell.textContent = "";
                }
            });
            const selectCell = row.querySelector(".select-cell");
            if (selectCell) {
                selectCell.textContent = "✔";
            }
            row.classList.add("graph-row-selected");

            selectedGraphIdConf = normalized.idConf?.toString() ?? "";
            activeScenarioID = normalized.idConf?.toString() ?? '';
            selectedGraphStatusId = normalized.statusId?.toString() ?? "";
            selectedGraphResrunId = normalized.rawIdResrun?.toString() ?? "";
            selectedGraphRowIndex = index;
            localStorage.setItem("lastSelectedGraphIdConf", selectedGraphIdConf);
            localStorage.setItem("lastSelectedGraphStatusId", selectedGraphStatusId);
            localStorage.setItem("lastSelectedGraphResrunId", selectedGraphResrunId);
            localStorage.setItem("lastSelectedGraphRowIndex", selectedGraphRowIndex.toString());

            console.log("[graph-helper] scenario selected", {
                idConf: selectedGraphIdConf,
                statusId: selectedGraphStatusId,
                idResrun: selectedGraphResrunId,
                rowIndex: selectedGraphRowIndex
            });

            window.dispatchEvent(new CustomEvent("graph-scenario-selected", {
                detail: {
                    idConf: selectedGraphIdConf,
                    statusId: selectedGraphStatusId,
                    idResrun: selectedGraphResrunId
                }
            }));

            updateGraphDeleteButtons();
        });

        const selectCell = document.createElement("td");
        selectCell.className = "select-cell";
        selectCell.textContent = "";

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

        const deleteIcon = document.createElement("i");
        deleteIcon.className = "bi bi-trash";
        deleteIcon.setAttribute("aria-hidden", "true");
        deleteBtn.appendChild(deleteIcon);

        deleteBtn.addEventListener("click", async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await deleteGraphScenario(normalized.idConf, deleteBtn);
        });

        deleteCell.appendChild(deleteBtn);

        row.appendChild(selectCell);
        row.appendChild(idConfCell);
        row.appendChild(nameCell);
        row.appendChild(dateCell);
        row.appendChild(mcarloCell);
        row.appendChild(statusCell);
        row.appendChild(idResrunCell);
        row.appendChild(statusResCell);
        row.appendChild(deleteCell);
        tableBody.appendChild(row);
    });

    updateGraphDeleteButtons();
}

function getGraphSearchParamsFromForm() {
    const form = document.getElementById("graphForm");
    if (!form) {
        return null;
    }

    const formData = new FormData(form);
    const userId = formData.get("user_id")?.toString() || "system";
    const startDate = formData.get("start_date")?.toString() || "";
    const endDate = formData.get("end_date")?.toString() || "";
    const graphName = formData.get("name")?.toString().trim() || "";
    const idConfRaw = formData.get("id_conf")?.toString().trim() || "";
    const statusIdRaw = formData.get("status_id")?.toString().trim() || "";
    const idResrunRaw = formData.get("id_resrun")?.toString().trim() || "";
    const statusResIdRaw = formData.get("status_res_id")?.toString().trim() || "";

    const params = new URLSearchParams();
    params.append("user_id", userId);

    const startTime = htmlDateToWs13Date(startDate);
    const endTime = htmlDateToWs13Date(endDate);
    if (startTime) {
        params.append("start_time", startTime);
    }
    if (endTime) {
        params.append("end_time", endTime);
    }
    if (graphName) {
        params.append("name", graphName);
    }
    if (idConfRaw) {
        params.append("id_conf", idConfRaw);
    }
    if (statusIdRaw) {
        params.append("status_id", statusIdRaw);
    }
    if (idResrunRaw) {
        params.append("id_resrun", idResrunRaw);
    }
    if (statusResIdRaw) {
        params.append("status_res_id", statusResIdRaw);
    }

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
        const data = Array.isArray(jsonResponse?.data) ? jsonResponse.data : [];
        activeScenarioID = '';
        selectedGraphStatusId = null;
        localStorage.removeItem("lastSelectedGraphStatusId");
        populateGraphTable(data);
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
        button.title = disabled
            ? "The currently selected scenario cannot be deleted"
            : "Delete scenario";
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

    const confirmed = window.confirm(`Delete scenario config ${normalizedIdConf}?`);
    if (!confirmed) {
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

    function renderPage(page) {
        tableBody.innerHTML = "";
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        rows.slice(start, end).forEach(row => tableBody.appendChild(row));

        rows.forEach(r => {
            r.classList.remove("graph-row-selected");
            const selectCell = r.querySelector(".select-cell");
            if (selectCell) {
                selectCell.textContent = "";
            }
        });

        const selectedId = (selectedGraphIdConf ?? localStorage.getItem("lastSelectedGraphIdConf") ?? "").toString();
        const selectedIndexRaw = selectedGraphRowIndex ?? localStorage.getItem("lastSelectedGraphRowIndex");
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
            for (const row of rows.slice(start, end)) {
                const idCell = row.children[1];
                const selectCell = row.querySelector(".select-cell");
                if (idCell && selectCell && idCell.textContent?.trim() === selectedId) {
                    selectCell.textContent = "✔";
                    row.classList.add("graph-row-selected");
                    break;
                }
            }
        }

        updateGraphDeleteButtons();
    }

    function createPaginationControls() {
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

        function updateControls() {
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            pageInput.value = currentPage.toString();
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
        localStorage.setItem("lastSelectedGraphIdConf", defaultId);
    }
});
