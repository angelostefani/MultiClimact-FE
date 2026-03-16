(() => {
    const panel = document.getElementById("panelD13");
    if (!panel) {
        return;
    }

    const latInput = document.getElementById("ra-latitude");
    const lonInput = document.getElementById("ra-longitude");
    const radiusInput = document.getElementById("ra-radius");
    const newBtn = document.getElementById("ra-new");
    const duplicateBtn = document.getElementById("ra-duplicate");
    const backBtn = document.getElementById("ra-back");
    const createGraphBtn = document.getElementById("ra-create-graph");
    const defaultActions = document.getElementById("ra-default-actions");
    const editActions = document.getElementById("ra-edit-actions");

    const inputs = [latInput, lonInput, radiusInput].filter(Boolean);
    if (
        inputs.length === 0 ||
        !newBtn ||
        !duplicateBtn ||
        !backBtn ||
        !createGraphBtn ||
        !defaultActions ||
        !editActions
    ) {
        return;
    }

    const sectorCheckboxes = Array.from(panel.querySelectorAll(".ra-checkbox-grid input[type='checkbox']"));
    const sectorLabels = Array.from(panel.querySelectorAll(".ra-checkbox-grid label"));
    let transientScenarioConfig = null;

    const readValues = () => ({
        latitude: latInput?.value ?? "",
        longitude: lonInput?.value ?? "",
        radius: radiusInput?.value ?? "",
        sectors: sectorCheckboxes.map(cb => cb.checked)
    });
    const initialValues = readValues();
    const initialPlaceholders = {
        latitude: latInput?.getAttribute("placeholder") ?? "",
        longitude: lonInput?.getAttribute("placeholder") ?? "",
        radius: radiusInput?.getAttribute("placeholder") ?? ""
    };

    const applyValues = (values) => {
        if (!values) {
            return;
        }
        if (latInput) {
            latInput.value = values.latitude ?? "";
        }
        if (lonInput) {
            lonInput.value = values.longitude ?? "";
        }
        if (radiusInput) {
            radiusInput.value = values.radius ?? "";
        }
        if (Array.isArray(values.sectors) && values.sectors.length === sectorCheckboxes.length) {
            sectorCheckboxes.forEach((cb, index) => {
                cb.checked = Boolean(values.sectors[index]);
            });
        }
    };

    const setEditMode = (enabled) => {
        panel.dataset.scenarioEditMode = enabled ? "on" : "off";
        defaultActions.classList.toggle("d-none", enabled);
        editActions.classList.toggle("d-none", !enabled);
    };

    const readTransientConfig = (mode) => ({
        mode,
        dependencyGraphNodes: {
            latitude: latInput?.value?.trim() ?? "",
            longitude: lonInput?.value?.trim() ?? "",
            radiusKm: radiusInput?.value?.trim() ?? "",
            sectors: sectorCheckboxes.map((checkbox, index) => ({
                name: sectorLabels[index]?.textContent?.trim() ?? `sector-${index + 1}`,
                selected: Boolean(checkbox.checked)
            }))
        },
        createdAtUtc: new Date().toISOString()
    });

    const syncTransientConfig = () => {
        if (!transientScenarioConfig) {
            return;
        }

        transientScenarioConfig = readTransientConfig(panel.dataset.scenarioMode || transientScenarioConfig.mode || "edit");
    };

    const enterEditMode = (mode) => {
        transientScenarioConfig = readTransientConfig(mode);
        setEditMode(true);
        panel.dataset.scenarioMode = mode;
        void logTransientConfig();
    };

    const leaveEditMode = () => {
        transientScenarioConfig = null;
        setEditMode(false);
        panel.dataset.scenarioMode = "";
    };

    newBtn.addEventListener("click", () => {
        inputs.forEach(input => {
            input.value = "";
        });
        if (latInput) {
            latInput.setAttribute("placeholder", "");
        }
        if (lonInput) {
            lonInput.setAttribute("placeholder", "");
        }
        if (radiusInput) {
            radiusInput.setAttribute("placeholder", "");
        }
        sectorCheckboxes.forEach(cb => {
            cb.checked = false;
            cb.disabled = false;
        });
        enterEditMode("new");
    });

    duplicateBtn.addEventListener("click", () => {
        applyValues(initialValues);
        if (latInput) {
            latInput.setAttribute("placeholder", initialPlaceholders.latitude);
            latInput.value = initialPlaceholders.latitude;
        }
        if (lonInput) {
            lonInput.setAttribute("placeholder", initialPlaceholders.longitude);
            lonInput.value = initialPlaceholders.longitude;
        }
        if (radiusInput) {
            radiusInput.setAttribute("placeholder", initialPlaceholders.radius);
            radiusInput.value = initialPlaceholders.radius;
        }
        sectorCheckboxes.forEach(cb => {
            cb.disabled = false;
        });
        enterEditMode("duplicate");
    });

    backBtn.addEventListener("click", () => {
        leaveEditMode();
    });

    createGraphBtn.addEventListener("click", async () => {
        if (!transientScenarioConfig) {
            return;
        }

        syncTransientConfig();
        createGraphBtn.disabled = true;
        try {
            const response = await fetch("/api/GraphProxy/CreateGraph", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(transientScenarioConfig)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error("Error while creating graph:", error);
        } finally {
            createGraphBtn.disabled = false;
        }
    });

    const logTransientConfig = async () => {
        if (!transientScenarioConfig) {
            return;
        }

        try {
            await fetch("/api/GraphProxy/LogScenarioSetup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(transientScenarioConfig)
            });
        } catch (error) {
            console.error("Error while logging scenario setup:", error);
        }
    };

    inputs.forEach((input) => {
        input.addEventListener("input", syncTransientConfig);
    });
    sectorCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", syncTransientConfig);
    });

    setEditMode(false);

    let currentScenarioData = null;

    const d13Tab = document.getElementById("tabD13-tab");
    if (d13Tab) {
        d13Tab.addEventListener("shown.bs.tab", async () => {
            const scenarioId = activeScenarioID || localStorage.getItem("lastSelectedGraphIdConf") || '';
            if (!scenarioId) {
                return;
            }
            try {
                const response = await fetch(`/api/GraphProxy/GetGraphs?id_conf=${encodeURIComponent(scenarioId)}`);
                if (!response.ok) {
                    return;
                }
                const json = await response.json();
                const data = Array.isArray(json?.data) && json.data.length > 0 ? json.data[0] : null;
                if (!data) {
                    return;
                }
                currentScenarioData = data;
                console.log('[scenario-setup] loaded scenario', { scenarioId, currentScenarioData });
            } catch (error) {
                console.error('[scenario-setup] error loading scenario:', error);
            }
        });
    }
})();
