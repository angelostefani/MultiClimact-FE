(() => {
  const panel = document.getElementById('panelD17');
  if (!panel) {
    return;
  }

  const resilienceResultEventName = 'resilience-result-loaded';
  let currentResilienceResultPayload = null;
  let currentSelectedPathIds = new Set();

  const table = panel.querySelector('#rr-chains-table');
  const tableBody = table?.querySelector('tbody') ?? null;
  let rows = Array.from(tableBody?.querySelectorAll('tr') ?? []);

  const drawSparkline = (svg, points) => {
    if (!svg || points.length === 0) return;
    const w = 100;
    const h = 20;
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const span = Math.max(max - min, 0.001);
    const step = points.length > 1 ? w / (points.length - 1) : w;
    const coords = points.map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / span) * h;
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
      .map((n) => parseFloat(n))
      .filter((n) => !Number.isNaN(n));
    drawSparkline(svg, points);
  };

  rows.forEach((row) => hydrateRowSparkline(row));

  const resolveCurrentResrunId = () => {
    const resultPayload = extractResultPayload(currentResilienceResultPayload);
    const candidateResrunIds = [
      resultPayload?.resrun_id,
      resultPayload?.resrunId,
      resultPayload?.id_resrun,
      resultPayload?.idResrun,
      typeof selectedGraphResrunId !== 'undefined' ? selectedGraphResrunId : '',
      localStorage.getItem('lastSelectedGraphResrunId') || ''
    ];

    const resolvedResrunId = candidateResrunIds
      .map((value) => (value ?? '').toString().trim())
      .find((value) => value !== '' && value.toLowerCase() !== 'n/a') || '';

    console.log('[runs-results] resolved resrun id', {
      resolvedResrunId,
      candidateResrunIds,
      resultPayload
    });

    return resolvedResrunId;
  };

  const syncSelectedRowsUi = () => {
    rows.forEach((row) => {
      const pathId = (row.dataset.path || '').trim();
      row.classList.toggle('is-selected', currentSelectedPathIds.has(pathId));
    });
  };

  const updateRunsResultsMapSelection = () => {
    if (typeof window.updateRunsResultsMapLayer !== 'function') {
      return;
    }

    const resrunId = resolveCurrentResrunId();
    const selectedPathIds = Array.from(currentSelectedPathIds);

    console.log('[runs-results] updating map selection', {
      resrunId,
      selectedPathIds
    });

    window.updateRunsResultsMapLayer(resrunId, selectedPathIds);
  };

  const getChartPayloadForSelection = () => {
    const resultPayload = extractResultPayload(currentResilienceResultPayload);
    if (!resultPayload || !Array.isArray(resultPayload.paths)) {
      return resultPayload || mockGraphPayload;
    }

    const selectedPathIds = Array.from(currentSelectedPathIds);
    if (selectedPathIds.length === 0) {
      return resultPayload;
    }

    const filteredPaths = resultPayload.paths.filter((path) => {
      const pathId = (path?.path_id ?? path?.pathId ?? '').toString().trim();
      return pathId !== '' && currentSelectedPathIds.has(pathId);
    });

    return {
      ...resultPayload,
      paths: filteredPaths
    };
  };

  const toggleRowSelection = (row) => {
    const pathId = (row.dataset.path || '').trim();
    if (!pathId) {
      return;
    }

    if (currentSelectedPathIds.has(pathId)) {
      currentSelectedPathIds.delete(pathId);
    } else {
      currentSelectedPathIds.add(pathId);
    }

    syncSelectedRowsUi();
    updateRunsResultsMapSelection();
    renderChart(getChartPayloadForSelection());

    console.log('[runs-results] rows selected', {
      selectedPathIds: Array.from(currentSelectedPathIds)
    });
  };

  const bindRowSelection = () => {
    rows.forEach((row) => {
      row.addEventListener('click', () => toggleRowSelection(row));
    });
  };

  bindRowSelection();

  const runBtn = panel.querySelector('#rr-config-run');
  const executeRunBtn = panel.querySelector('#rr-run');
  const resolveSelectedScenarioId = () =>
    (typeof activeScenarioID !== 'undefined' && activeScenarioID !== null && `${activeScenarioID}`.trim() !== ''
      ? activeScenarioID.toString()
      : (localStorage.getItem('lastSelectedGraphIdConf') || '').trim());
  const resolveSelectedScenarioStatusId = () =>
    (typeof selectedGraphStatusId !== 'undefined' && selectedGraphStatusId !== null && `${selectedGraphStatusId}`.trim() !== ''
      ? selectedGraphStatusId.toString()
      : (localStorage.getItem('lastSelectedGraphStatusId') || '').trim());
  const SCENARIO_STATUS_INITIALIZED = '4';
  const SCENARIO_STATUS_READY = '5';
  const refreshRunActionsState = () => {
    const scenarioId = resolveSelectedScenarioId();
    const statusId = resolveSelectedScenarioStatusId();
    const canSaveScenario = statusId === SCENARIO_STATUS_INITIALIZED || statusId === SCENARIO_STATUS_READY;
    const canRunScenario = statusId === SCENARIO_STATUS_READY;

    console.log('[runs-results] active scenario status', {
      scenarioId,
      statusId,
      canSaveScenario,
      canRunScenario
    });

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

  window.addEventListener('graph-scenario-selected', refreshRunActionsState);
  window.addEventListener('storage', refreshRunActionsState);
  refreshRunActionsState();

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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const json = await response.json();
      const savedScenarioId = extractSavedScenarioId(json);

      if (savedScenarioId) {
        activeScenarioID = savedScenarioId;
        localStorage.setItem('lastSelectedGraphIdConf', savedScenarioId);
      }

      refreshRunActionsState();
      console.log('Scenario saved', { scenarioId, response: json, payload });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to save the scenario.';
      console.error('Error while saving scenario', { scenarioId, error, payload });
      window.alert(errorMessage);
    } finally {
      refreshRunActionsState();
    }
  });

  // WS20: si attiva quando clicco Run nel tab Run & Results.
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

      const responseText = await response.text();
      console.log('Resilience run submitted', {
        scenarioId,
        response: responseText
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to submit the resilience run.';
      console.error('Error while submitting resilience run', { scenarioId, error });
      window.alert(errorMessage);
    } finally {
      refreshRunActionsState();
    }
  });

  const applyBtn = panel.querySelector('#rr-apply');
  const clearBtn = panel.querySelector('#rr-clear');
  applyBtn?.addEventListener('click', () => {
    const payload = {
      search: panel.querySelector('.rr-search-input')?.value ?? '',
      minRes: panel.querySelector('#rr-min-res')?.value ?? '',
      maxRes: panel.querySelector('#rr-max-res')?.value ?? '',
      peak: panel.querySelector('#rr-peak-risk')?.value ?? '',
      contains: panel.querySelector('#rr-contains-node')?.value ?? '',
    };
    console.log('Apply filters', payload);
  });

  clearBtn?.addEventListener('click', () => {
    panel.querySelector('.rr-search-input').value = '';
    panel.querySelector('#rr-min-res').value = 0;
    panel.querySelector('#rr-max-res').value = 100;
    panel.querySelector('#rr-peak-risk').value = 0;
    panel.querySelector('#rr-contains-node').value = '';
  });

  /* ---------- Plotly chart with remote (placeholder) data ---------- */
  const chartContainer = panel.querySelector('#rr-chart');
  if (!chartContainer) return;
  const FIXED_TIME_AXIS = ['15m', '1h', '3h', '12h', '24h', '48h', '1w', '2w', '4w'];

  const DEFAULT_USER_ID = document.body.dataset.userId || 'demo-user';
  const mockGraphPayload = {
    y_axis: {
      max: 20,
      source: 'backend-precomputed'
    },
    paths: [
      {
        path_id: 165,
        path_nodes: ['11360212181', '339171243', '1695045254', '8035257826'],
        risk_values: [1.235, 2.335, 0.095, 0.0, 0.0, 1.78, 3.85, 8.4, 0.0],
        resilience: 82.61,
        peak_risk: 12.36,
        combined_risk: 188.06
      },
      {
        path_id: 83,
        path_nodes: ['11360212181', '4340515202', '8888140912', '10914539925'],
        risk_values: [1.0, 1.335, 0.0, 6.22, 3.655, 0.0, 1.78, 9.335, 0.0],
        resilience: 82.99,
        peak_risk: 18.67,
        combined_risk: 294.055
      },
      {
        path_id: 56,
        path_nodes: ['128738555', '8035257826', '9035499426', '10914539925'],
        risk_values: [4.665, 0.0, 0.935, 0.0, 4.84, 2.235, 4.545, 3.28, 5.135],
        resilience: 83.88,
        peak_risk: 10.27,
        combined_risk: 157.185
      },
      {
        path_id: 53,
        path_nodes: ['6299268246', '8035257826', '4258805303', '10914539925'],
        risk_values: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 4.11, 0.335, 11.4],
        resilience: 83.925,
        peak_risk: 13.33,
        combined_risk: 183.75
      },
      {
        path_id: 39,
        path_nodes: ['0070730722', '11360212181', '4258805303', '10914539925'],
        risk_values: [0.0, 0.0, 0.0, 0.0, 0.0, 1.925, 0.0, 7.06, 4.0],
        resilience: 83.935,
        peak_risk: 9.68,
        combined_risk: 142.675
      }
    ]
  };

  const buildGraphUrl = (userId) =>
    `/api/GraphProxy/GetDefaultScenario?user_id=${encodeURIComponent(userId)}`;

  const fetchGraphPayload = async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const resp = await fetch(buildGraphUrl(DEFAULT_USER_ID), { signal: controller.signal });
      clearTimeout(timer);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const data = await resp.json();
      return data;
    } catch (err) {
      console.warn('Graph service not reachable, using mock payload', err);
      return mockGraphPayload;
    }
  };

  const extractResultPayload = (payload) => {
    if (!payload) {
      return null;
    }

    if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
      return payload.data;
    }

    return payload;
  };

  const formatNodesCompact = (nodes) => {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return '—';
    }

    return nodes.join(' → ');
  };

  const renderChainsTable = (payload) => {
    if (!tableBody) {
      return;
    }

    const resultPayload = extractResultPayload(payload);
    const paths = Array.isArray(resultPayload?.paths) ? resultPayload.paths : [];

    console.log('[runs-results] rendering chains table', {
      resultPayload,
      pathsCount: paths.length
    });

    if (paths.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td class="text-center" colspan="6">No result data available</td>
        </tr>`;
      rows = Array.from(tableBody.querySelectorAll('tr'));
      currentSelectedPathIds = new Set();
      updateRunsResultsMapSelection();
      return;
    }

    tableBody.innerHTML = paths.map((path, index) => {
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
    }).join('');

    rows = Array.from(tableBody.querySelectorAll('tr'));
    rows.forEach((row) => hydrateRowSparkline(row));
    bindRowSelection();
    currentSelectedPathIds = rows.length > 0
      ? new Set([(rows[0].dataset.path || '').trim()].filter(Boolean))
      : new Set();
    syncSelectedRowsUi();
    updateRunsResultsMapSelection();
    renderChart(getChartPayloadForSelection());
  };

  const normalizePayloadToChart = (payload) => {
    if (!payload) return { x: [], series: [] };

    if (Array.isArray(payload.x) && Array.isArray(payload.series)) {
      return {
        x: FIXED_TIME_AXIS,
        series: payload.series
      };
    }

    if (Array.isArray(payload.paths) && payload.paths.length > 0) {
      const series = payload.paths.map((path) => ({
        name: `Path ${path.path_id ?? 'N/A'}`,
        y: Array.isArray(path.risk_values) ? path.risk_values : []
      }));
      return { x: FIXED_TIME_AXIS, series };
    }

    return { x: FIXED_TIME_AXIS, series: [] };
  };

  const niceCeil12510 = (x) => {
    if (!Number.isFinite(x) || x <= 0) return 0;
    const exp = Math.floor(Math.log10(x));
    const base = x / (10 ** exp);
    let niceBase = 10;
    if (base <= 1) niceBase = 1;
    else if (base <= 2) niceBase = 2;
    else if (base <= 5) niceBase = 5;
    return niceBase * (10 ** exp);
  };

  const percentileLinear = (sortedValues, percentileValue) => {
    if (!Array.isArray(sortedValues) || sortedValues.length === 0) return 0;
    if (sortedValues.length === 1) return sortedValues[0];
    const idx = (percentileValue / 100) * (sortedValues.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    const frac = idx - lo;
    if (lo === hi) return sortedValues[lo];
    return sortedValues[lo] + frac * (sortedValues[hi] - sortedValues[lo]);
  };

  const computeYAxisConfig = (payload, options = {}) => {
    const percentileValue = options.percentileValue ?? 95;
    const headroom = options.headroom ?? 0.10;
    const l = options.l;

    const fromPayload =
      payload?.y_axis?.max ??
      payload?.yMax ??
      payload?.y_max;

    if (Number.isFinite(fromPayload) && fromPayload > 0) {
      return { yMax: fromPayload, source: 'payload' };
    }

    const maxima = (payload?.paths || [])
      .map((p) => (Array.isArray(p.risk_values) && p.risk_values.length ? Math.max(...p.risk_values) : null))
      .filter((v) => Number.isFinite(v))
      .sort((a, b) => a - b);

    if (!maxima.length) return { yMax: 1, source: 'fallback' };

    const pctl = percentileLinear(maxima, percentileValue);
    let yMax = niceCeil12510(pctl * (1 + headroom));
    if (Number.isFinite(l)) {
      yMax = Math.min(yMax, 8 * l);
    }
    if (!Number.isFinite(yMax) || yMax <= 0) yMax = 1;
    return { yMax, source: 'computed' };
  };

  const getClippingInfo = (values, yMax) => {
    const clippedY = [];
    const isClipped = [];
    const originalY = [];
    (values || []).forEach((v) => {
      const n = Number(v);
      const safe = Number.isFinite(n) ? n : null;
      originalY.push(safe);
      if (safe === null) {
        clippedY.push(null);
        isClipped.push(false);
      } else {
        clippedY.push(Math.min(safe, yMax));
        isClipped.push(safe > yMax);
      }
    });
    return { clippedY, isClipped, originalY };
  };

  const renderChart = (payload) => {
    const normalized = normalizePayloadToChart(payload);
    const yAxis = computeYAxisConfig(payload);
    const x = normalized.x;
    const height = chartContainer.getBoundingClientRect().height || 240;
    const traces = normalized.series.map((serie) => {
      const { clippedY, isClipped, originalY } = getClippingInfo(Array.isArray(serie.y) ? serie.y : [], yAxis.yMax);
      return {
        x,
        y: clippedY,
        name: serie.name || 'Series',
        mode: 'lines+markers',
        connectgaps: false,
        customdata: originalY.map((orig, idx) => [orig, Boolean(isClipped[idx])]),
        marker: {
          symbol: isClipped.map((flag) => (flag ? 'triangle-up' : 'circle'))
        },
        hovertemplate: 'x=%{x}<br>shown=%{y:.3f}<br>real=%{customdata[0]:.3f}<br>clipped=%{customdata[1]}<extra>%{fullData.name}</extra>'
      };
    });

    const layout = {
      margin: { l: 50, r: 10, t: 20, b: 40 },
      height,
      xaxis: { title: 'Time since distruption', tickmode: 'array', tickvals: x, ticktext: x },
      yaxis: {
        title: 'Risk Value',
        range: [0, yAxis.yMax]
      },
      showlegend: true
    };

    const config = { responsive: true, displaylogo: false };

    if (!chartContainer.dataset.rendered) {
      Plotly.newPlot(chartContainer, traces, layout, config);
      chartContainer.dataset.rendered = 'true';
    } else {
      Plotly.react(chartContainer, traces, layout, config);
    }
  };

  const applyResilienceResultPayload = (payload) => {
    currentResilienceResultPayload = payload;
    const resultPayload = extractResultPayload(payload);
    console.log('[runs-results] applying resilience result payload', {
      payload,
      resultPayload
    });
    renderChainsTable(resultPayload);
  };

  window.addEventListener(resilienceResultEventName, (event) => {
    applyResilienceResultPayload(event.detail?.result ?? null);
  });

  if (window.resilienceResultState?.result) {
    applyResilienceResultPayload(window.resilienceResultState.result);
  } else {
    fetchGraphPayload().then(renderChart);
  }
})();
