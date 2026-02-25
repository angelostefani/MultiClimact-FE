let selectedGraphIdConf = null;
let selectedGraphRowIndex = null;

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

function normalizeGraphItem(raw) {
    return {
        idConf: raw?.id_conf ?? raw?.idConf ?? raw?.id ?? "",
        name: raw?.imp_name ?? raw?.name ?? "N/A",
        date: formatGraphDate(raw?.imp_date ?? raw?.date),
        monteCarloIterations: raw?.imp_mcarlo_it ?? "N/A",
        pathLength: raw?.imp_path_length ?? "N/A"
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
        noDataCell.setAttribute("colspan", 6);
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
            document.querySelectorAll(".graph-row .select-cell").forEach(cell => {
                cell.textContent = "";
            });
            const selectCell = row.querySelector(".select-cell");
            if (selectCell) {
                selectCell.textContent = "V";
            }

            selectedGraphIdConf = normalized.idConf?.toString() ?? "";
            selectedGraphRowIndex = index;
            localStorage.setItem("lastSelectedGraphIdConf", selectedGraphIdConf);
            localStorage.setItem("lastSelectedGraphRowIndex", selectedGraphRowIndex.toString());
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

        const pathLengthCell = document.createElement("td");
        pathLengthCell.textContent = normalized.pathLength?.toString() || "N/A";

        row.appendChild(selectCell);
        row.appendChild(idConfCell);
        row.appendChild(nameCell);
        row.appendChild(dateCell);
        row.appendChild(mcarloCell);
        row.appendChild(pathLengthCell);
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

    try {
        const response = await fetch(`/api/GraphProxy/GetGraphs?${params.toString()}`);
        if (!response.ok) {
            console.error("Graph response error:", response.status);
            return;
        }

        const jsonResponse = await response.json();
        const data = Array.isArray(jsonResponse?.data) ? jsonResponse.data : [];
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
                cell.textContent = "V";
                return;
            }
        }

        if (selectedId) {
            for (const row of rows.slice(start, end)) {
                const idCell = row.children[1];
                const selectCell = row.querySelector(".select-cell");
                if (idCell && selectCell && idCell.textContent?.trim() === selectedId) {
                    selectCell.textContent = "V";
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
        pageInput.value = currentPage.toString();
        pageInput.className = "form-control m-1";
        pageInput.style.width = "100px";

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
