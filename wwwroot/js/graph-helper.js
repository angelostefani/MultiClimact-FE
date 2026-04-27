let selectedGraphIdConf = null;
let selectedGraphRowIndex = null;
let activeScenarioID = '';
let selectedGraphStatusId = null;
const graphStatusOptions = [
    { id: 1, label: "submitted" },
    { id: 2, label: "dispatching" },
    { id: 3, label: "processing" },
    { id: 4, label: "initialized" },
    { id: 5, label: "ready" },
    { id: 6, label: "failed" }
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
            defaultText: "All statuses"
        },
        {
            element: document.getElementById("graphStatusResId"),
            defaultText: "All resilience statuses"
        }
    ];

    statusSelects.forEach(({ element, defaultText }) => {
        if (!element) {
            return;
        }

        const currentValue = element.value;
        element.innerHTML = "";

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = defaultText;
        element.appendChild(defaultOption);

        graphStatusOptions.forEach(status => {
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

function getDisplayValue(value) {
    if (value === undefined || value === null || value === "") {
        return "N/A";
    }

    return value;
}

function normalizeGraphItem(raw) {
    const statusId = raw?.status_id ?? raw?.statusId ?? "";
    const statusResId = raw?.status_res_id ?? raw?.statusResId ?? "";

    return {
        idConf: raw?.id_conf ?? raw?.idConf ?? raw?.id ?? "",
        name: raw?.imp_name ?? raw?.name ?? "N/A",
        date: formatGraphDate(raw?.imp_date ?? raw?.date),
        monteCarloIterations: getDisplayValue(raw?.imp_mcarlo_it),
        statusId,
        statusStr: getGraphStatusLabel(statusId, raw?.status_str ?? raw?.statusStr),
        idResrun: getDisplayValue(raw?.id_resrun ?? raw?.idResrun),
        statusResId,
        statusResStr: getGraphStatusLabel(statusResId, raw?.status_res_str ?? raw?.statusResStr)
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
        noDataCell.setAttribute("colspan", 8);
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
            selectedGraphRowIndex = index;
            localStorage.setItem("lastSelectedGraphIdConf", selectedGraphIdConf);
            localStorage.setItem("lastSelectedGraphStatusId", selectedGraphStatusId);
            localStorage.setItem("lastSelectedGraphRowIndex", selectedGraphRowIndex.toString());

            console.log("[graph-helper] scenario selected", {
                idConf: selectedGraphIdConf,
                statusId: selectedGraphStatusId,
                rowIndex: selectedGraphRowIndex
            });

            window.dispatchEvent(new CustomEvent("graph-scenario-selected", {
                detail: {
                    idConf: selectedGraphIdConf,
                    statusId: selectedGraphStatusId
                }
            }));
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
        statusCell.textContent = normalized.statusStr?.toString() || "N/A";

        const idResrunCell = document.createElement("td");
        idResrunCell.textContent = normalized.idResrun?.toString() || "N/A";

        const statusResCell = document.createElement("td");
        statusResCell.textContent = normalized.statusResStr?.toString() || "N/A";

        row.appendChild(selectCell);
        row.appendChild(idConfCell);
        row.appendChild(nameCell);
        row.appendChild(dateCell);
        row.appendChild(mcarloCell);
        row.appendChild(statusCell);
        row.appendChild(idResrunCell);
        row.appendChild(statusResCell);
        tableBody.appendChild(row);
    });
}

async function fetchGraphData(event) {
    event.preventDefault();

    const form = document.getElementById("graphForm");
    if (!form) {
        return;
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
