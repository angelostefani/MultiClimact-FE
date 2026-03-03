(() => {
  const panel = document.getElementById('panelD17');
  if (!panel) {
    return;
  }

  const table = panel.querySelector('#rr-chains-table');
  const rows = Array.from(table?.querySelectorAll('tbody tr') ?? []);

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

  rows.forEach((row) => {
    const svg = row.querySelector('.rr-sparkline');
    const points = (row.dataset.points || '')
      .split(',')
      .map((n) => parseFloat(n))
      .filter((n) => !Number.isNaN(n));
    drawSparkline(svg, points);
  });

  const selectRow = (row) => {
    rows.forEach((r) => r.classList.remove('is-selected'));
    row.classList.add('is-selected');
    // Hook for map highlight / detail panel
    console.log('Row selected → highlight on map + open details', {
      rank: row.dataset.rank,
      path: row.dataset.path,
    });
  };

  if (rows.length) {
    selectRow(rows[0]);
  }

  rows.forEach((row) => {
    row.addEventListener('click', () => selectRow(row));
  });

  const runBtn = panel.querySelector('#rr-config-run');
  const executeRunBtn = panel.querySelector('#rr-run');
  const runName = panel.querySelector('#rr-run-name');
  runBtn?.addEventListener('click', () => {
    console.log('Run simulation', { name: runName?.value ?? '' });
    runBtn.disabled = true;
    setTimeout(() => { runBtn.disabled = false; }, 500);
  });

  executeRunBtn?.addEventListener('click', () => {
    console.log('Execute run', { scenarioName: runName?.value ?? '' });
    executeRunBtn.disabled = true;
    setTimeout(() => { executeRunBtn.disabled = false; }, 500);
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
    `http://192.168.154.23:8000/users/${encodeURIComponent(userId)}/graph/default_graph`;

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
      xaxis: { title: 'Time', tickmode: 'array', tickvals: x, ticktext: x },
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

  fetchGraphPayload().then(renderChart);
})();
