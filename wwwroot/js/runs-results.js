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
  const runName = panel.querySelector('#rr-run-name');
  runBtn?.addEventListener('click', () => {
    console.log('Run simulation', { name: runName?.value ?? '' });
    runBtn.disabled = true;
    setTimeout(() => { runBtn.disabled = false; }, 500);
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

  const DEFAULT_USER_ID = document.body.dataset.userId || 'demo-user';
  const mockGraphPayload = {
    x: ['T0', 'T1', 'T2', 'T3', 'T4'],
    series: [
      { name: 'Exposure', y: [0.2, 0.3, null, 0.6, 0.7] },
      { name: 'Vulnerability', y: [0.1, 0.15, 0.2, null, 0.4] }
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

  const renderChart = (payload) => {
    if (!payload) return;
    const x = Array.isArray(payload.x) ? payload.x : [];
    const height = chartContainer.getBoundingClientRect().height || 240;
    const traces = (payload.series || []).map((serie) => ({
      x,
      y: Array.isArray(serie.y) ? serie.y : [],
      name: serie.name || 'Series',
      mode: 'lines+markers',
      connectgaps: false
    }));

    const layout = {
      margin: { l: 50, r: 10, t: 20, b: 40 },
      height,
      xaxis: { title: 'Time', tickmode: 'array', tickvals: x, ticktext: x },
      yaxis: { title: 'Value' },
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
