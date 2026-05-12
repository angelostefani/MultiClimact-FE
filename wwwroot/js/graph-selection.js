let selectedGraphIdConf = null;
let selectedGraphRowIndex = null;
let activeScenarioID = '';
let selectedGraphStatusId = null;
let selectedGraphResrunId = null;
let selectedGraphResStatusId = null;

// Shared selection state used across the graph browser and resilience tabs.
const graphSelectionStorageKeys = {
    idConf: "lastSelectedGraphIdConf",
    statusId: "lastSelectedGraphStatusId",
    idResrun: "lastSelectedGraphResrunId",
    statusResId: "lastSelectedGraphResStatusId",
    rowIndex: "lastSelectedGraphRowIndex"
};

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
        localStorage.getItem(graphSelectionStorageKeys.idConf) ??
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

function setSelectedGraphState(selection) {
    selectedGraphIdConf = selection.idConf;
    activeScenarioID = selection.idConf;
    selectedGraphStatusId = selection.statusId;
    selectedGraphResrunId = selection.idResrun;
    selectedGraphResStatusId = selection.statusResId;
    selectedGraphRowIndex = selection.rowIndex;

    localStorage.setItem(graphSelectionStorageKeys.idConf, selectedGraphIdConf);
    localStorage.setItem(graphSelectionStorageKeys.statusId, selectedGraphStatusId);
    localStorage.setItem(graphSelectionStorageKeys.idResrun, selectedGraphResrunId);
    localStorage.setItem(graphSelectionStorageKeys.statusResId, selectedGraphResStatusId);
    localStorage.setItem(graphSelectionStorageKeys.rowIndex, selectedGraphRowIndex.toString());
}

function clearSelectedGraphSearchState() {
    activeScenarioID = '';
    selectedGraphStatusId = null;
    selectedGraphResStatusId = null;
    localStorage.removeItem(graphSelectionStorageKeys.statusId);
    localStorage.removeItem(graphSelectionStorageKeys.statusResId);
}

function clearGraphRowSelection() {
    document.querySelectorAll(".graph-row").forEach(row => {
        row.classList.remove("graph-row-selected");
        const cell = row.querySelector(".select-cell");
        if (cell) {
            cell.textContent = "";
        }
    });
}

function markGraphRowAsSelected(row) {
    const selectCell = row.querySelector(".select-cell");
    if (selectCell) {
        selectCell.textContent = "✔";
    }
    row.classList.add("graph-row-selected");
}

function emitGraphScenarioSelected(selection) {
    console.log("[graph-helper] scenario selected", selection);

    window.dispatchEvent(new CustomEvent("graph-scenario-selected", {
        detail: {
            idConf: selection.idConf,
            statusId: selection.statusId,
            statusResId: selection.statusResId,
            idResrun: selection.idResrun
        }
    }));
}

