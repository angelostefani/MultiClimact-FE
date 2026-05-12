(() => {
    const panel = document.getElementById("panelD13");
    if (!panel) {
        return;
    }

    const {
        firstDefinedValue,
        resolveScenarioStatusId,
        resolveScenarioResilienceStatus,
        findScenarioValue,
        extractDependencyGraphNodes,
        hasResilienceAssessmentPayload,
        getDefaultDependencyProbabilities,
        getFailureSetupValue,
        extractScenarioFromResponse,
        fetchScenarioGraphMetadata,
        fetchResilienceResult
    } = window.scenarioSetupUtils ?? {};

    if (!firstDefinedValue || !resolveScenarioStatusId || !resolveScenarioResilienceStatus) {
        console.error("[scenario-setup] required utilities are not available.");
        return;
    }

    const nameInput = document.getElementById("ra-name");
    const latInput = document.getElementById("ra-latitude");
    const lonInput = document.getElementById("ra-longitude");
    const radiusInput = document.getElementById("ra-radius");
    const loadScenarioBtn = document.getElementById("ra-load-scenario");
    const newBtn = document.getElementById("ra-new");
    const cancelBtn = document.getElementById("ra-cancel");
    const createGraphBtn = document.getElementById("ra-create-graph");
    const defaultActions = document.getElementById("ra-default-actions");
    const editActions = document.getElementById("ra-edit-actions");

    const inputs = [nameInput, latInput, lonInput, radiusInput].filter(Boolean);
    if (
        inputs.length === 0 ||
        !loadScenarioBtn ||
        !newBtn ||
        !cancelBtn ||
        !createGraphBtn ||
        !defaultActions ||
        !editActions
    ) {
        return;
    }

    const sectorCheckboxes = Array.from(panel.querySelectorAll(".ra-checkbox-grid input[type='checkbox']"));
    const sectorLabels = Array.from(panel.querySelectorAll(".ra-checkbox-grid label"));
    let transientScenarioConfig = null;
    let currentScenarioData = null;
    let draftBaselineValues = null;
    const resilienceScenarioEventName = "resilience-scenario-loaded";
    const resilienceResultEventName = "resilience-result-loaded";
    const scenarioStatuses = {
        draft: "DRAFT",
        submitted: "SUBMITTED",
        dispatching: "DISPATCHING"
    };

    const statusBox = document.createElement("div");
    statusBox.className = "alert alert-info d-none mt-2";
    statusBox.setAttribute("role", "status");
    panel.querySelector(".ra-box--left")?.prepend(statusBox);

    const showStatus = (message, level = "info") => {
        statusBox.className = `alert alert-${level} mt-2`;
        statusBox.textContent = message;
    };

    const hideStatus = () => {
        statusBox.className = "alert alert-info d-none mt-2";
        statusBox.textContent = "";
    };

    const getSelectedScenarioId = () =>
        activeScenarioID || localStorage.getItem("lastSelectedGraphIdConf") || "";

    const getSelectedScenarioStatusId = () =>
        (typeof selectedGraphStatusId !== "undefined" && selectedGraphStatusId !== null && `${selectedGraphStatusId}`.trim() !== ""
            ? selectedGraphStatusId
            : localStorage.getItem("lastSelectedGraphStatusId")) || "";

    const fetchScenarioStatusId = async (scenarioId) => {
        const normalizedScenarioId = scenarioId?.toString().trim() ?? "";
        if (!normalizedScenarioId) {
            return "";
        }

        try {
            const graphItem = await fetchScenarioGraphMetadata(normalizedScenarioId);
            const resolvedStatusId = firstDefinedValue(
                graphItem?.config_status,
                graphItem?.configStatus,
                graphItem?.status_id,
                graphItem?.statusId
            );

            if (resolvedStatusId !== undefined && resolvedStatusId !== null && `${resolvedStatusId}`.trim() !== "") {
                if (typeof selectedGraphStatusId !== "undefined") {
                    selectedGraphStatusId = resolvedStatusId.toString();
                }
                localStorage.setItem("lastSelectedGraphStatusId", resolvedStatusId.toString());
                return resolvedStatusId.toString();
            }
        } catch (error) {
            console.warn("[scenario-setup] error while resolving scenario status", {
                scenarioId: normalizedScenarioId,
                error
            });
        }

        return "";
    };

    const SCENARIO_STATUS_READY = "5";
    const RESILIENCE_STATUS_RESULT_AVAILABLE = "5";

    const shouldFetchResilienceResult = (scenario, graphMetadata) => {
        // Runs & Results can be populated only when both the scenario and resilience run are complete.
        const scenarioStatusId = resolveScenarioStatusId(scenario, graphMetadata);
        const resilienceStatus = resolveScenarioResilienceStatus(scenario, graphMetadata);

        return scenarioStatusId === SCENARIO_STATUS_READY &&
            (resilienceStatus.id === RESILIENCE_STATUS_RESULT_AVAILABLE || resilienceStatus.label === "completed");
    };

    const fetchScenarioStatusContext = async (scenarioId) => {
        const normalizedScenarioId = scenarioId?.toString().trim() ?? "";
        if (!normalizedScenarioId) {
            return "";
        }

        const resolvedStatusId = await fetchScenarioStatusId(normalizedScenarioId);
        return resolvedStatusId?.toString().trim() ?? "";
    };

    const setEditorValueById = (elementId, value) => {
        const textarea = document.getElementById(elementId);
        if (!textarea) {
            return;
        }

        const normalizedValue = typeof value === "string"
            ? value
            : JSON.stringify(value ?? "", null, 2);

        if (textarea._cmEditor) {
            textarea._cmEditor.setValue(normalizedValue);
            return;
        }

        textarea.value = normalizedValue;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        textarea.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const setInputValueById = (elementId, value) => {
        const input = document.getElementById(elementId);
        if (!input) {
            return;
        }

        input.value = value?.toString() ?? "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const getEditorValueById = (elementId) => {
        const textarea = document.getElementById(elementId);
        if (!textarea) {
            return "";
        }

        if (textarea._cmEditor) {
            return textarea._cmEditor.getValue();
        }

        return textarea.value ?? "";
    };

    const normalizeSectorName = (value) =>
        (value ?? "")
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[\s_-]+/g, " ");

    const publishLoadedScenario = (scenarioId, scenario) => {
        window.resilienceScenarioState = {
            scenarioId: scenarioId?.toString() ?? "",
            scenario
        };

        window.dispatchEvent(new CustomEvent(resilienceScenarioEventName, {
            detail: window.resilienceScenarioState
        }));
    };

    const publishResilienceResult = (scenarioId, result) => {
        window.resilienceResultState = {
            scenarioId: scenarioId?.toString() ?? "",
            result
        };

        window.dispatchEvent(new CustomEvent(resilienceResultEventName, {
            detail: window.resilienceResultState
        }));
    };

    const syncScenarioSetupMapLayer = async (scenario, preferredStatusId) => {
        const scenarioId = firstDefinedValue(
            findScenarioValue(scenario, ["id_conf", "idConf", "id"]),
            getSelectedScenarioId()
        );
        let statusId = firstDefinedValue(
            preferredStatusId,
            findScenarioValue(scenario, ["config_status", "configStatus", "status_id", "statusId"]),
            getSelectedScenarioStatusId()
        );

        if ((statusId === undefined || statusId === null || `${statusId}`.trim() === "") && scenarioId) {
            statusId = await fetchScenarioStatusId(scenarioId);
        }

        console.log("[scenario-setup] syncScenarioSetupMapLayer", {
            scenarioId,
            statusId,
            scenarioStatusId: findScenarioValue(scenario, ["config_status", "configStatus", "status_id", "statusId"]),
            selectedScenarioId: getSelectedScenarioId(),
            selectedScenarioStatusId: getSelectedScenarioStatusId()
        });

        if (typeof window.updateScenarioSetupMapLayerVisibility === "function") {
            window.updateScenarioSetupMapLayerVisibility(statusId, scenarioId);
        }
    };

    const applyScenarioToAssessmentTabs = (scenario) => {
        setEditorValueById("subsec_dep", scenario?.subsector_dep ?? []);
        setEditorValueById("poi_dep", scenario?.poi_dep ?? []);
        setEditorValueById("all_dep_prob", getDefaultDependencyProbabilities(scenario) ?? {});
        setEditorValueById("subsec_dep_prob", scenario?.subsector_dep_prob ?? []);
        setEditorValueById("poi_dep_prob", scenario?.poi_dep_prob ?? []);

        const failureSetupValue = getFailureSetupValue(scenario);
        setInputValueById("failure-poi-list", failureSetupValue);

        const failureTextarea = document.getElementById("failure-poi-list");
        if (failureTextarea) {
            failureTextarea.dataset.default = failureSetupValue;
        }

        setEditorValueById("impact-distributions-editor", scenario?.social_impact_distrib ?? []);
        setEditorValueById("impact-sector-editor", scenario?.sector_impact_distrib ?? []);
        setEditorValueById("impact-subsector-editor", scenario?.subsector_impact_distrib ?? []);
        setEditorValueById("impact-poi-editor", scenario?.poi_impact_distrib ?? []);

        setInputValueById("impact-mc-iterations", firstDefinedValue(scenario?.iter, 0));
        setInputValueById("impact-mc-max-path", firstDefinedValue(scenario?.max_path, 0));
        setInputValueById("impact-mc-max-chains", firstDefinedValue(scenario?.max_chains, 0));
    };

    const applyScenarioToInputs = (scenario) => {
        const dependencyGraphNodes = extractDependencyGraphNodes(scenario);

        const latitude = firstDefinedValue(
            findScenarioValue(dependencyGraphNodes, ["imp_lat"]),
            findScenarioValue(scenario, ["imp_lat"]),
            findScenarioValue(dependencyGraphNodes, ["latitude", "lat"]),
            findScenarioValue(scenario, ["latitude", "lat"])
        );
        const name = firstDefinedValue(
            findScenarioValue(dependencyGraphNodes, ["name", "scenarioName"]),
            findScenarioValue(scenario, ["imp_name", "name", "scenarioName"])
        );
        const longitude = firstDefinedValue(
            findScenarioValue(dependencyGraphNodes, ["imp_lon"]),
            findScenarioValue(scenario, ["imp_lon"]),
            findScenarioValue(dependencyGraphNodes, ["longitude", "lon", "long"]),
            findScenarioValue(scenario, ["longitude", "lon", "long"])
        );
        const radius = firstDefinedValue(
            findScenarioValue(dependencyGraphNodes, ["imp_radius"]),
            findScenarioValue(scenario, ["imp_radius"]),
            findScenarioValue(dependencyGraphNodes, ["radiusKm", "radius_km", "radius"]),
            findScenarioValue(scenario, ["radiusKm", "radius_km", "radius", "rad"])
        );

        if (nameInput) {
            nameInput.value = name?.toString() ?? "";
        }
        if (latInput) {
            latInput.value = latitude?.toString() ?? "";
        }
        if (lonInput) {
            lonInput.value = longitude?.toString() ?? "";
        }
        if (radiusInput) {
            radiusInput.value = radius?.toString() ?? "";
        }

        const rawSectors = firstDefinedValue(
            findScenarioValue(dependencyGraphNodes, ["sectors", "sectorSelections", "selectedSectors"]),
            findScenarioValue(scenario, ["sectors", "sectorSelections", "selectedSectors"])
        );

        let sectorNames = [];
        if (Array.isArray(rawSectors)) {
            sectorNames = rawSectors
                .filter((item) => item !== undefined && item !== null)
                .map((item) => {
                    if (typeof item === "string") {
                        return item;
                    }
                    if (typeof item === "object" && item.selected !== false) {
                        return firstDefinedValue(item.name, item.label, item.id, item.code);
                    }
                    return null;
                })
                .filter(Boolean)
                .map(normalizeSectorName);
        }

        if (sectorNames.length > 0) {
            sectorCheckboxes.forEach((checkbox, index) => {
                const label = sectorLabels[index]?.textContent ?? "";
                checkbox.checked = sectorNames.includes(normalizeSectorName(label));
            });
            return;
        }

        const sectorsMask = findScenarioValue(scenario, ["imp_sector_str", "sectors_str", "sectorsMask", "sectorMask"]);
        if (typeof sectorsMask === "string" && sectorsMask.length > 0) {
            sectorCheckboxes.forEach((checkbox, index) => {
                checkbox.checked = sectorsMask.charAt(index) === "1";
            });
        }
    };

    const readValues = () => ({
        name: nameInput?.value ?? "",
        latitude: latInput?.value ?? "",
        longitude: lonInput?.value ?? "",
        radius: radiusInput?.value ?? "",
        sectors: sectorCheckboxes.map(cb => cb.checked)
    });
    const initialValues = readValues();
    const initialPlaceholders = {
        name: nameInput?.getAttribute("placeholder") ?? "",
        latitude: latInput?.getAttribute("placeholder") ?? "",
        longitude: lonInput?.getAttribute("placeholder") ?? "",
        radius: radiusInput?.getAttribute("placeholder") ?? ""
    };

    const applyValues = (values) => {
        if (!values) {
            return;
        }
        if (nameInput) {
            nameInput.value = values.name ?? "";
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
        createGraphBtn.disabled = !enabled;
    };

    const setScenarioStatus = (status) => {
        panel.dataset.scenarioStatus = status ?? "";
    };

    const restoreDraftBaselineValues = () => {
        if (!draftBaselineValues) {
            return;
        }

        applyValues(draftBaselineValues);
    };

    const validateScenarioDraft = () => {
        const validationErrors = [];
        const name = nameInput?.value?.trim() ?? "";
        const latitude = latInput?.value?.trim() ?? "";
        const longitude = lonInput?.value?.trim() ?? "";
        const radius = radiusInput?.value?.trim() ?? "";
        const hasSelectedSector = sectorCheckboxes.some((checkbox) => checkbox.checked);

        if (!name) {
            validationErrors.push("Scenario name is required.");
        }

        if (!latitude) {
            validationErrors.push("Latitude is required.");
        }

        if (!longitude) {
            validationErrors.push("Longitude is required.");
        }

        if (!radius) {
            validationErrors.push("Radius is required.");
        }

        if (!hasSelectedSector) {
            validationErrors.push("Select at least one infrastructure sector.");
        }

        return validationErrors;
    };

    const deepClone = (value) => {
        if (value === undefined || value === null) {
            return value;
        }

        return JSON.parse(JSON.stringify(value));
    };

    const parseJsonEditorValue = (elementId, fallbackValue) => {
        const rawValue = getEditorValueById(elementId)?.trim();
        if (!rawValue) {
            return deepClone(fallbackValue);
        }

        try {
            return JSON.parse(rawValue);
        } catch (error) {
            console.warn(`[scenario-setup] invalid JSON in ${elementId}`, error);
            return deepClone(fallbackValue);
        }
    };

    const buildSectorsMask = () =>
        sectorCheckboxes
            .map((checkbox) => (checkbox.checked ? "1" : "0"))
            .join("");

    const buildSelectedSectorNames = () =>
        sectorCheckboxes
            .map((checkbox, index) => ({
                checked: checkbox.checked,
                label: sectorLabels[index]?.textContent?.trim() ?? ""
            }))
            .filter((entry) => entry.checked && entry.label)
            .map((entry) => entry.label);

    const parseNullableNumber = (...values) => {
        for (const value of values) {
            if (value === undefined || value === null) {
                continue;
            }

            const normalizedValue = value.toString().trim();
            if (!normalizedValue) {
                continue;
            }

            const parsedValue = Number(normalizedValue.replace(",", "."));
            if (Number.isFinite(parsedValue)) {
                return parsedValue;
            }
        }

        return null;
    };

    const extractScenarioIdFromResponse = (responseJson) => {
        if (!responseJson) {
            return "";
        }

        const rootId = firstDefinedValue(responseJson.id_conf, responseJson.idConf);
        if (rootId !== undefined && rootId !== null && `${rootId}`.trim() !== "") {
            return rootId.toString();
        }

        if (Array.isArray(responseJson.data) && responseJson.data.length > 0) {
            const firstValidEntry = responseJson.data.find((item) => {
                const itemId = firstDefinedValue(item?.id_conf, item?.idConf, item?.id);
                return itemId !== undefined && itemId !== null && `${itemId}`.trim() !== "";
            });

            if (firstValidEntry) {
                return firstDefinedValue(firstValidEntry.id_conf, firstValidEntry.idConf, firstValidEntry.id).toString();
            }
        }

        if (responseJson.data && typeof responseJson.data === "object") {
            const dataId = firstDefinedValue(responseJson.data.id_conf, responseJson.data.idConf, responseJson.data.id);
            if (dataId !== undefined && dataId !== null && `${dataId}`.trim() !== "") {
                return dataId.toString();
            }
        }

        return "";
    };

    const buildScenarioSubmitPayload = () => {
        const baseScenario = currentScenarioData ? deepClone(currentScenarioData) : {};
        const name = nameInput?.value?.trim() ?? "";
        const latitude = latInput?.value?.trim() ?? "";
        const longitude = lonInput?.value?.trim() ?? "";
        const radius = radiusInput?.value?.trim() ?? "";
        const sectorsMask = buildSectorsMask();
        const submitLatitude = parseNullableNumber(
            latitude,
            baseScenario?.lat,
            baseScenario?.imp_lat,
            baseScenario?.latitude,
            baseScenario?.dependencyGraphNodes?.lat,
            baseScenario?.dependencyGraphNodes?.latitude,
            baseScenario?.dependency_graph_nodes?.lat,
            baseScenario?.dependency_graph_nodes?.latitude
        );
        const submitLongitude = parseNullableNumber(
            longitude,
            baseScenario?.lon,
            baseScenario?.long,
            baseScenario?.imp_lon,
            baseScenario?.longitude,
            baseScenario?.dependencyGraphNodes?.lon,
            baseScenario?.dependencyGraphNodes?.longitude,
            baseScenario?.dependency_graph_nodes?.lon,
            baseScenario?.dependency_graph_nodes?.longitude
        );
        const submitRadius = parseNullableNumber(
            radius,
            baseScenario?.rad,
            baseScenario?.imp_radius,
            baseScenario?.radiusKm,
            baseScenario?.radius_km,
            baseScenario?.radius,
            baseScenario?.dependencyGraphNodes?.radius,
            baseScenario?.dependencyGraphNodes?.radiusKm,
            baseScenario?.dependency_graph_nodes?.radius,
            baseScenario?.dependency_graph_nodes?.radiusKm
        );
        const submitSubsectors = Array.isArray(baseScenario?.subsectors)
            ? deepClone(baseScenario.subsectors)
            : (Array.isArray(baseScenario?.imp_subsectors) ? deepClone(baseScenario.imp_subsectors) : []);

        return {
            imp_name: name,
            lat: submitLatitude,
            lon: submitLongitude,
            rad: submitRadius,
            sectors_str: sectorsMask,
            subsectors: submitSubsectors
        };
    };

    const readTransientConfig = (mode) => ({
        mode,
        status: scenarioStatuses.draft,
        dependencyGraphNodes: {
            name: nameInput?.value?.trim() ?? "",
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
        setScenarioStatus(scenarioStatuses.draft);
        void logTransientConfig();
    };

    const leaveEditMode = () => {
        transientScenarioConfig = null;
        setEditMode(false);
        panel.dataset.scenarioMode = "";
        draftBaselineValues = null;
    };

    newBtn.addEventListener("click", () => {
        draftBaselineValues = readValues();
        inputs.forEach(input => {
            input.value = "";
        });
        if (nameInput) {
            nameInput.setAttribute("placeholder", "");
        }
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

    cancelBtn.addEventListener("click", () => {
        restoreDraftBaselineValues();
        if (nameInput) {
            nameInput.setAttribute("placeholder", initialPlaceholders.name);
        }
        if (latInput) {
            latInput.setAttribute("placeholder", initialPlaceholders.latitude);
        }
        if (lonInput) {
            lonInput.setAttribute("placeholder", initialPlaceholders.longitude);
        }
        if (radiusInput) {
            radiusInput.setAttribute("placeholder", initialPlaceholders.radius);
        }
        leaveEditMode();
        setScenarioStatus(firstDefinedValue(
            findScenarioValue(currentScenarioData, ["status", "scenario_status"]),
            findScenarioValue(currentScenarioData, ["config_status", "configStatus", "status_id", "statusId"]),
            ""
        ));
        hideStatus();
    });

    createGraphBtn.addEventListener("click", async () => {
        if (!transientScenarioConfig) {
            return;
        }

        syncTransientConfig();
        const validationErrors = validateScenarioDraft();
        if (validationErrors.length > 0) {
            window.alert(validationErrors.join("\n"));
            showStatus("Fill in all required fields before creating the graph.", "warning");
            return;
        }

        const submitPayload = buildScenarioSubmitPayload();
        createGraphBtn.disabled = true;
        try {
            const response = await fetch("/api/GraphProxy/CreateGraph", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(submitPayload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            const json = await response.json();
            const createdScenarioId = extractScenarioIdFromResponse(json);

            if (createdScenarioId) {
                activeScenarioID = createdScenarioId;
                selectedGraphIdConf = createdScenarioId;
                localStorage.setItem("lastSelectedGraphIdConf", createdScenarioId);
            }

            transientScenarioConfig = submitPayload;
            transientScenarioConfig.status = scenarioStatuses.submitted;
            setScenarioStatus(scenarioStatuses.submitted);
            showStatus("Scenario submitted successfully. Status set to SUBMITTED.", "success");
            leaveEditMode();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unable to submit the scenario.";
            showStatus(errorMessage, "danger");
            window.alert(errorMessage);
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
    setScenarioStatus("");

    const loadSelectedScenario = async ({ endpoint, populateAssessmentTabs = false } = {}) => {
        const scenarioId = getSelectedScenarioId();
        if (!scenarioId) {
            currentScenarioData = null;
            hideStatus();
            showStatus("Select a scenario from the bottom bar before opening Scenario Setup.", "warning");
            return;
        }

        loadScenarioBtn.disabled = true;
        try {
            hideStatus();
            const response = await fetch(`${endpoint}?id_conf=${encodeURIComponent(scenarioId)}`);
            if (!response.ok) {
                currentScenarioData = null;
                showStatus("Unable to load the selected scenario.", "danger");
                return;
            }

            const json = await response.json();
            const scenario = extractScenarioFromResponse(json);
            if (!scenario) {
                currentScenarioData = null;
                showStatus("No data found for the selected scenario.", "warning");
                return;
            }

            const graphMetadata = await fetchScenarioGraphMetadata(scenarioId);
            const resolvedResrunId = firstDefinedValue(
                graphMetadata?.id_resrun,
                graphMetadata?.idResrun,
                scenario?.id_resrun,
                scenario?.idResrun
            )?.toString().trim() ?? "";

            if (typeof selectedGraphResrunId !== "undefined") {
                selectedGraphResrunId = resolvedResrunId;
            }
            localStorage.setItem("lastSelectedGraphResrunId", resolvedResrunId);

            currentScenarioData = scenario;
            applyScenarioToInputs(scenario);
            setScenarioStatus(firstDefinedValue(
                findScenarioValue(scenario, ["status", "scenario_status"]),
                findScenarioValue(scenario, ["config_status", "configStatus", "status_id", "statusId"]),
                ""
            ));
            if (populateAssessmentTabs) {
                const resolvedStatusId = await fetchScenarioStatusContext(scenarioId);
                await syncScenarioSetupMapLayer(scenario, resolvedStatusId);
            }

            if (populateAssessmentTabs) {
                if (hasResilienceAssessmentPayload(scenario)) {
                    applyScenarioToAssessmentTabs(scenario);
                    publishLoadedScenario(scenarioId, scenario);
                    showStatus(`Scenario ${scenarioId} loaded across Resilience Assessment tabs.`, "success");
                } else {
                    showStatus(`Scenario ${scenarioId} loaded in Scenario Setup, but the response did not include the full resilience configuration.`, "warning");
                }
            } else {
                showStatus(`Scenario ${scenarioId} loaded in Scenario Setup.`, "success");
            }

            if (shouldFetchResilienceResult(scenario, graphMetadata)) {
                try {
                    const resilienceResult = await fetchResilienceResult(scenarioId);
                    publishResilienceResult(scenarioId, resilienceResult);
                } catch (error) {
                    publishResilienceResult(scenarioId, null);
                    console.warn("[scenario-setup] unable to load resilience result:", {
                        scenarioId,
                        error
                    });
                }
            } else {
                const resilienceStatus = resolveScenarioResilienceStatus(scenario, graphMetadata);
                publishResilienceResult(scenarioId, null);
                console.log("[scenario-setup] skipped resilience result load", {
                    scenarioId,
                    statusId: resolveScenarioStatusId(scenario, graphMetadata),
                    statusResId: resilienceStatus.id,
                    statusResStr: resilienceStatus.label,
                    resolvedResrunId
                });
            }

            console.log("[scenario-setup] loaded scenario", { scenarioId, currentScenarioData });
        } catch (error) {
            currentScenarioData = null;
            showStatus("An unexpected error occurred while loading the scenario.", "danger");
            console.error("[scenario-setup] error loading scenario:", error);
        } finally {
            loadScenarioBtn.disabled = false;
        }
    };

    loadScenarioBtn.addEventListener("click", () => {
        const scenarioEndpoint =
            loadScenarioBtn.dataset.scenarioEndpoint ||
            panel.dataset.scenarioEndpoint ||
            "/api/GraphProxy/GetGraphs";

        void loadSelectedScenario({
            endpoint: scenarioEndpoint,
            populateAssessmentTabs: true
        });
    });

    const d13Tab = document.getElementById("tabD13-tab");
    if (d13Tab) {
        d13Tab.addEventListener("shown.bs.tab", () => {
            hideStatus();
        });
    }
})();
