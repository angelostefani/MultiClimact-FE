(function () {
    function firstDefinedValue(...values) {
        return values.find((value) => value !== undefined && value !== null && `${value}`.trim() !== "");
    }

    function resolveScenarioStatusId(scenario, graphMetadata) {
        return firstDefinedValue(
            graphMetadata?.config_status,
            graphMetadata?.configStatus,
            graphMetadata?.status_id,
            graphMetadata?.statusId,
            scenario?.config_status,
            scenario?.configStatus,
            scenario?.status_id,
            scenario?.statusId
        )?.toString().trim() ?? "";
    }

    function resolveScenarioResilienceStatus(scenario, graphMetadata) {
        return {
            id: firstDefinedValue(
                graphMetadata?.status_res_id,
                graphMetadata?.statusResId,
                scenario?.status_res_id,
                scenario?.statusResId
            )?.toString().trim() ?? "",
            label: firstDefinedValue(
                graphMetadata?.status_res_str,
                graphMetadata?.statusResStr,
                scenario?.status_res_str,
                scenario?.statusResStr
            )?.toString().trim().toLowerCase() ?? ""
        };
    }

    function findScenarioValue(source, candidateKeys) {
        if (!source || typeof source !== "object") {
            return undefined;
        }

        for (const key of candidateKeys) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                const value = source[key];
                if (value !== undefined && value !== null && `${value}`.trim() !== "") {
                    return value;
                }
            }
        }

        return undefined;
    }

    function extractDependencyGraphNodes(scenario) {
        return firstDefinedValue(
            scenario?.dependencyGraphNodes,
            scenario?.dependency_graph_nodes,
            scenario?.dependency_graph,
            scenario?.graph,
            scenario?.scenario_setup
        ) ?? {};
    }

    function hasResilienceAssessmentPayload(scenario) {
        return Boolean(
            scenario &&
            typeof scenario === "object" &&
            (
                Array.isArray(scenario?.subsector_dep) ||
                Array.isArray(scenario?.poi_dep) ||
                Array.isArray(scenario?.default_prob) ||
                Array.isArray(scenario?.subsector_dep_prob) ||
                Array.isArray(scenario?.poi_dep_prob) ||
                Array.isArray(scenario?.failure) ||
                Array.isArray(scenario?.social_impact_distrib) ||
                Array.isArray(scenario?.sector_impact_distrib) ||
                Array.isArray(scenario?.subsector_impact_distrib) ||
                Array.isArray(scenario?.poi_impact_distrib) ||
                scenario?.iter !== undefined ||
                scenario?.max_path !== undefined ||
                scenario?.max_chains !== undefined
            )
        );
    }

    function getDefaultDependencyProbabilities(scenario) {
        if (scenario?.all_dep_prob) {
            return scenario.all_dep_prob;
        }

        if (!Array.isArray(scenario?.default_prob)) {
            return null;
        }

        const editableEntry = scenario.default_prob.find((entry) =>
            entry &&
            typeof entry === "object" &&
            entry.all_dep_prob
        );

        return editableEntry?.all_dep_prob ?? null;
    }

    function getFailurePoiListValue(scenario) {
        if (!Array.isArray(scenario?.failure)) {
            return "";
        }

        const ids = scenario.failure
            .filter((entry) => typeof entry === "string" || typeof entry === "number")
            .map((entry) => entry.toString().trim())
            .filter(Boolean);

        return ids.length > 0 ? `${ids.join("; ")};` : "";
    }

    function getFailureSetupValue(scenario) {
        if (Array.isArray(scenario?.failure) && scenario.failure.length > 0) {
            return JSON.stringify(scenario.failure, null, 2);
        }

        return getFailurePoiListValue(scenario);
    }

    function extractScenarioFromResponse(json) {
        if (Array.isArray(json?.data)) {
            return json.data.length > 0 ? json.data[0] : null;
        }

        if (json?.data && typeof json.data === "object") {
            return json.data;
        }

        if (json && typeof json === "object" && !Array.isArray(json)) {
            return json;
        }

        return null;
    }

    async function fetchScenarioGraphMetadata(scenarioId) {
        const normalizedScenarioId = scenarioId?.toString().trim() ?? "";
        if (!normalizedScenarioId) {
            return null;
        }

        try {
            const response = await fetch(`/api/GraphProxy/GetGraphs?id_conf=${encodeURIComponent(normalizedScenarioId)}`);
            if (!response.ok) {
                console.warn("[scenario-setup] unable to resolve scenario metadata from GetGraphs", {
                    scenarioId: normalizedScenarioId,
                    status: response.status
                });
                return null;
            }

            const json = await response.json();
            return Array.isArray(json?.data) && json.data.length > 0 ? json.data[0] : null;
        } catch (error) {
            console.warn("[scenario-setup] error while resolving scenario metadata", {
                scenarioId: normalizedScenarioId,
                error
            });
            return null;
        }
    }

    async function fetchResilienceResult(scenarioId) {
        const response = await fetch(`/api/GraphProxy/GetResilienceResult?id_conf=${encodeURIComponent(scenarioId)}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP ${response.status}`);
        }

        const json = await response.json();
        return extractScenarioFromResponse(json);
    }

    window.scenarioSetupUtils = {
        firstDefinedValue,
        resolveScenarioStatusId,
        resolveScenarioResilienceStatus,
        findScenarioValue,
        extractDependencyGraphNodes,
        hasResilienceAssessmentPayload,
        getDefaultDependencyProbabilities,
        getFailurePoiListValue,
        getFailureSetupValue,
        extractScenarioFromResponse,
        fetchScenarioGraphMetadata,
        fetchResilienceResult
    };
})();
