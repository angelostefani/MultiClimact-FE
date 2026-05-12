(() => {
  const panel = document.getElementById('panelD17');
  if (!panel) {
    return;
  }

  const {
    DEFAULT_USER_ID,
    fetchGraphPayload,
    extractResultPayload,
    formatNodesCompact,
    renderChart
  } = window.runsResultsChart ?? {};

  if (!fetchGraphPayload || !extractResultPayload || !formatNodesCompact || !renderChart) {
    console.error('[runs-results] chart utilities are not available.');
    return;
  }

  const resilienceResultEventName = 'resilience-result-loaded';
  const graphSelectionStorageKeys = {
    idConf: 'lastSelectedGraphIdConf',
    statusId: 'lastSelectedGraphStatusId',
    statusResId: 'lastSelectedGraphResStatusId',
    idResrun: 'lastSelectedGraphResrunId'
  };
  const SCENARIO_STATUS_INITIALIZED = '4';
  const SCENARIO_STATUS_READY = '5';
  const RESILIENCE_STATUS_COMPLETED = '5';

  const table = panel.querySelector('#rr-chains-table');
  const tableBody = table?.querySelector('tbody') ?? null;
  const chartContainer = panel.querySelector('#rr-chart');
  if (!chartContainer) {
    return;
  }

  const state = {
    currentResilienceResultPayload: null,
    selectedPathIds: new Set(),
    rows: Array.from(tableBody?.querySelectorAll('tr') ?? [])
  };

  const readSelectedGraphValue = (runtimeValue, storageKey) =>
    (runtimeValue !== undefined && runtimeValue !== null && `${runtimeValue}`.trim() !== ''
      ? runtimeValue.toString()
      : (localStorage.getItem(storageKey) || '').trim());

  const resolveSelectedScenarioId = () =>
    readSelectedGraphValue(typeof activeScenarioID !== 'undefined' ? activeScenarioID : null, graphSelectionStorageKeys.idConf);

  const resolveSelectedScenarioStatusId = () =>
    readSelectedGraphValue(typeof selectedGraphStatusId !== 'undefined' ? selectedGraphStatusId : null, graphSelectionStorageKeys.statusId);

  const resolveSelectedScenarioResStatusId = () =>
    readSelectedGraphValue(typeof selectedGraphResStatusId !== 'undefined' ? selectedGraphResStatusId : null, graphSelectionStorageKeys.statusResId);

  const resolveSelectedScenarioResrunId = () =>
    readSelectedGraphValue(typeof selectedGraphResrunId !== 'undefined' ? selectedGraphResrunId : null, graphSelectionStorageKeys.idResrun);

  const getCurrentScenarioSelection = () => ({
    scenarioId: resolveSelectedScenarioId(),
    statusId: resolveSelectedScenarioStatusId(),
    statusResId: resolveSelectedScenarioResStatusId()
  });

  const getSelectedPathIds = () => Array.from(state.selectedPathIds);
  const getRowPathId = (row) => (row?.dataset.path || '').trim();
  const getCurrentResultPayload = () => extractResultPayload(state.currentResilienceResultPayload);

  const drawSparkline = (svg, points) => {
    if (!svg || points.length === 0) {
      return;
    }

    const width = 100;
    const height = 20;
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const span = Math.max(max - min, 0.001);
    const step = points.length > 1 ? width / (points.length - 1) : width;
    const coords = points.map((point, index) => {
      const x = index * step;
      const y = height - ((point - min) / span) * height;
      return `${x},${y}`;
    });

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', '#2563eb');
    polyline.setAttribute('stroke-width', '1.6');
    polyline.setAttribute('points', coords.join(' '));
    svg.innerHTML = '';
    svg.appendChild(polyline);
  };

  const hydrateRowSparkline = (row) => {
    const svg = row.querySelector('.rr-sparkline');
    const points = (row.dataset.points || '')
      .split(',')
      .map((value) => parseFloat(value))
      .filter((value) => !Number.isNaN(value));
    drawSparkline(svg, points);
  };

  const hydrateAllRowSparklines = () => {
    state.rows.forEach((row) => hydrateRowSparkline(row));
  };

  const resolveCurrentResrunId = () => {
    const resultPayload = getCurrentResultPayload();
    const candidateResrunIds = [
      resultPayload?.resrun_id,
      resultPayload?.resrunId,
      resultPayload?.id_resrun,
      resultPayload?.idResrun,
      resolveSelectedScenarioResrunId()
    ];

    return candidateResrunIds
      .map((value) => (value ?? '').toString().trim())
      .find((value) => value !== '' && value.toLowerCase() !== 'n/a') || '';
  };

  const syncSelectedRowsUi = () => {
    state.rows.forEach((row) => {
      row.classList.toggle('is-selected', state.selectedPathIds.has(getRowPathId(row)));
    });
  };

  const updateRunsResultsMapSelection = () => {
    if (typeof window.updateRunsResultsMapLayer !== 'function') {
      return;
    }

    window.updateRunsResultsMapLayer(resolveCurrentResrunId(), getSelectedPathIds());
  };

  const getChartPayloadForSelection = () => {
    const resultPayload = getCurrentResultPayload();
    if (!resultPayload || !Array.isArray(resultPayload.paths)) {
      return resultPayload;
    }

    const selectedPathIds = getSelectedPathIds();
    if (selectedPathIds.length === 0) {
      return resultPayload;
    }

    return {
      ...resultPayload,
      paths: resultPayload.paths.filter((path) => {
        const pathId = (path?.path_id ?? path?.pathId ?? '').toString().trim();
        return pathId !== '' && state.selectedPathIds.has(pathId);
      })
    };
  };

  const refreshChartForSelection = () => {
    renderChart(chartContainer, getChartPayloadForSelection());
  };

  const toggleRowSelection = (row) => {
    const pathId = getRowPathId(row);
    if (!pathId) {
      return;
    }

    if (state.selectedPathIds.has(pathId)) {
      state.selectedPathIds.delete(pathId);
    } else {
      state.selectedPathIds.add(pathId);
    }

    syncSelectedRowsUi();
    updateRunsResultsMapSelection();
    refreshChartForSelection();
  };

  const bindRowSelection = () => {
    state.rows.forEach((row) => {
      row.addEventListener('click', () => toggleRowSelection(row));
    });
  };

  const resetRenderedRowsState = () => {
    state.rows = Array.from(tableBody?.querySelectorAll('tr') ?? []);
  };

  const selectDefaultPath = () => {
    state.selectedPathIds = state.rows.length > 0
      ? new Set([getRowPathId(state.rows[0])].filter(Boolean))
      : new Set();
  };

  const renderEmptyChainsTable = () => {
    tableBody.innerHTML = `
      <tr>
        <td class="text-center" colspan="6">No result data available</td>
      </tr>`;
    resetRenderedRowsState();
    state.selectedPathIds = new Set();
    updateRunsResultsMapSelection();
  };

  const buildPathRowMarkup = (path, index) => {
    const points = Array.isArray(path?.risk_values)
      ? path.risk_values.map((value) => `${value ?? ''}`).join(',')
      : '';
    const rank = index + 1;
    const pathId = path?.path_id ?? path?.pathId ?? rank;
    const nodesCompact = formatNodesCompact(path?.path_nodes);
    const resilience = path?.resilience ?? 'N/A';
    const peakRisk = path?.peak_risk ?? path?.peakRisk ?? 'N/A';

    return `
      <tr data-rank="${rank}" data-path="${pathId}" data-nodes="${nodesCompact}" data-res="${resilience}" data-peak="${peakRisk}" data-points="${points}">
        <td class="text-center">${rank}</td>
        <td>${pathId}</td>
        <td class="rr-nodes-cell">
          <span class="rr-nodes-text">${nodesCompact}</span>
          <svg class="rr-sparkline" viewBox="0 0 100 20" preserveAspectRatio="none"></svg>
        </td>
        <td>${resilience}</td>
        <td>${peakRisk}</td>
        <td class="text-end"><i class="bi bi-three-dots-vertical"></i></td>
      </tr>`;
  };

  const syncRenderedTableState = () => {
    resetRenderedRowsState();
    hydrateAllRowSparklines();
    bindRowSelection();
    selectDefaultPath();
    syncSelectedRowsUi();
    updateRunsResultsMapSelection();
    refreshChartForSelection();
  };

  const renderChainsTable = (payload) => {
    if (!tableBody) {
      return;
    }

    const resultPayload = extractResultPayload(payload);
    const paths = Array.isArray(resultPayload?.paths) ? resultPayload.paths : [];
    if (paths.length === 0) {
      renderEmptyChainsTable();
      return;
    }

    tableBody.innerHTML = paths.map(buildPathRowMarkup).join('');
    syncRenderedTableState();
  };

  const applyResilienceResultPayload = (payload) => {
    state.currentResilienceResultPayload = payload;
    const resultPayload = extractResultPayload(payload);
    renderChainsTable(resultPayload);
    if (!resultPayload || !Array.isArray(resultPayload.paths) || resultPayload.paths.length === 0) {
      renderChart(chartContainer, resultPayload);
    }
  };

  const refreshRunActionsState = () => {
    const { statusId } = getCurrentScenarioSelection();
    const canSaveScenario = statusId === SCENARIO_STATUS_INITIALIZED || statusId === SCENARIO_STATUS_READY;
    const canRunScenario = statusId === SCENARIO_STATUS_READY;
    const runBtn = panel.querySelector('#rr-config-run');
    const executeRunBtn = panel.querySelector('#rr-run');

    if (runBtn) {
      runBtn.disabled = !canSaveScenario;
    }
    if (executeRunBtn) {
      executeRunBtn.disabled = !canRunScenario;
    }
  };

  const extractSavedScenarioId = (responseJson) => {
    if (!responseJson) {
      return '';
    }

    if (responseJson.id_conf !== undefined && responseJson.id_conf !== null && `${responseJson.id_conf}`.trim() !== '') {
      return responseJson.id_conf.toString();
    }

    if (Array.isArray(responseJson.data) && responseJson.data.length > 0) {
      const firstValidEntry = responseJson.data.find((item) =>
        item &&
        item.id_conf !== undefined &&
        item.id_conf !== null &&
        `${item.id_conf}`.trim() !== '');

      if (firstValidEntry) {
        return firstValidEntry.id_conf.toString();
      }
    }

    if (responseJson.data && !Array.isArray(responseJson.data) &&
      responseJson.data.id_conf !== undefined &&
      responseJson.data.id_conf !== null &&
      `${responseJson.data.id_conf}`.trim() !== '') {
      return responseJson.data.id_conf.toString();
    }

    return '';
  };

  const isRunsResultsDataAvailable = () =>
    resolveSelectedScenarioStatusId() === SCENARIO_STATUS_READY &&
    resolveSelectedScenarioResStatusId() === RESILIENCE_STATUS_COMPLETED;

  const fetchResilienceResult = async (scenarioId) => {
    const response = await fetch(`/api/GraphProxy/GetResilienceResult?id_conf=${encodeURIComponent(scenarioId)}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    return response.json();
  };

  const loadRunsResultsForSelection = async () => {
    const { scenarioId } = getCurrentScenarioSelection();
    if (!scenarioId || !isRunsResultsDataAvailable()) {
      applyResilienceResultPayload(null);
      return;
    }

    try {
      const resultPayload = await fetchResilienceResult(scenarioId);
      applyResilienceResultPayload(resultPayload);
    } catch {
      applyResilienceResultPayload(null);
    }
  };

  const runBtn = panel.querySelector('#rr-config-run');
  runBtn?.addEventListener('click', async () => {
    const scenarioId = resolveSelectedScenarioId();
    if (!scenarioId) {
      window.alert('Select a scenario before saving.');
      return;
    }

    if (typeof window.buildResilienceScenarioSavePayload !== 'function') {
      window.alert('Scenario payload builder is not available.');
      return;
    }

    const payload = window.buildResilienceScenarioSavePayload();
    runBtn.disabled = true;

    try {
      const response = await fetch(`/api/GraphProxy/SaveScenario?id_conf=${encodeURIComponent(scenarioId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const savedScenarioId = extractSavedScenarioId(await response.json());
      if (savedScenarioId) {
        activeScenarioID = savedScenarioId;
        localStorage.setItem(graphSelectionStorageKeys.idConf, savedScenarioId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to save the scenario.';
      window.alert(errorMessage);
    } finally {
      refreshRunActionsState();
    }
  });

  const executeRunBtn = panel.querySelector('#rr-run');
  executeRunBtn?.addEventListener('click', async () => {
    const scenarioId = resolveSelectedScenarioId();
    if (!scenarioId) {
      window.alert('Select a scenario before running.');
      return;
    }

    executeRunBtn.disabled = true;
    try {
      const response = await fetch(`/api/GraphProxy/RunResilience?id_conf=${encodeURIComponent(scenarioId)}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to submit the resilience run.';
      window.alert(errorMessage);
    } finally {
      refreshRunActionsState();
    }
  });

  const applyBtn = panel.querySelector('#rr-apply');
  const clearBtn = panel.querySelector('#rr-clear');
  applyBtn?.addEventListener('click', () => {
    console.log('Apply filters', {
      search: panel.querySelector('.rr-search-input')?.value ?? '',
      minRes: panel.querySelector('#rr-min-res')?.value ?? '',
      maxRes: panel.querySelector('#rr-max-res')?.value ?? '',
      peak: panel.querySelector('#rr-peak-risk')?.value ?? '',
      contains: panel.querySelector('#rr-contains-node')?.value ?? ''
    });
  });

  clearBtn?.addEventListener('click', () => {
    panel.querySelector('.rr-search-input').value = '';
    panel.querySelector('#rr-min-res').value = 0;
    panel.querySelector('#rr-max-res').value = 100;
    panel.querySelector('#rr-peak-risk').value = 0;
    panel.querySelector('#rr-contains-node').value = '';
  });

  window.addEventListener('graph-scenario-selected', () => {
    refreshRunActionsState();
    void loadRunsResultsForSelection();
  });

  window.addEventListener(resilienceResultEventName, (event) => {
    applyResilienceResultPayload(event.detail?.result ?? null);
  });

  window.addEventListener('storage', refreshRunActionsState);

  hydrateAllRowSparklines();
  bindRowSelection();
  refreshRunActionsState();

  if (window.resilienceResultState?.result) {
    applyResilienceResultPayload(window.resilienceResultState.result);
  } else {
    void loadRunsResultsForSelection().then(() => {
      if (!state.currentResilienceResultPayload) {
        fetchGraphPayload(DEFAULT_USER_ID).then((payload) => renderChart(chartContainer, payload));
      }
    });
  }
})();

