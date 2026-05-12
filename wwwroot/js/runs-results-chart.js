(function () {
    const FIXED_TIME_AXIS = ['15m', '1h', '3h', '12h', '24h', '48h', '1w', '2w', '4w'];

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

    function buildGraphUrl(userId) {
        return `/api/GraphProxy/GetDefaultScenario?user_id=${encodeURIComponent(userId)}`;
    }

    async function fetchGraphPayload(userId) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 5000);
            const resp = await fetch(buildGraphUrl(userId), { signal: controller.signal });
            clearTimeout(timer);
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }
            return await resp.json();
        } catch (err) {
            console.warn('Graph service not reachable, using mock payload', err);
            return mockGraphPayload;
        }
    }

    function extractResultPayload(payload) {
        if (!payload) {
            return null;
        }

        if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
            return payload.data;
        }

        return payload;
    }

    function formatNodesCompact(nodes) {
        if (!Array.isArray(nodes) || nodes.length === 0) {
            return '—';
        }

        return nodes.join(' → ');
    }

    function normalizePayloadToChart(payload) {
        if (!payload) {
            return { x: [], series: [] };
        }

        if (Array.isArray(payload.x) && Array.isArray(payload.series)) {
            return {
                x: FIXED_TIME_AXIS,
                series: payload.series
            };
        }

        if (Array.isArray(payload.paths) && payload.paths.length > 0) {
            return {
                x: FIXED_TIME_AXIS,
                series: payload.paths.map((path) => ({
                    name: `Path ${path.path_id ?? 'N/A'}`,
                    y: Array.isArray(path.risk_values) ? path.risk_values : []
                }))
            };
        }

        return { x: FIXED_TIME_AXIS, series: [] };
    }

    function niceCeil12510(x) {
        if (!Number.isFinite(x) || x <= 0) return 0;
        const exp = Math.floor(Math.log10(x));
        const base = x / (10 ** exp);
        let niceBase = 10;
        if (base <= 1) niceBase = 1;
        else if (base <= 2) niceBase = 2;
        else if (base <= 5) niceBase = 5;
        return niceBase * (10 ** exp);
    }

    function percentileLinear(sortedValues, percentileValue) {
        if (!Array.isArray(sortedValues) || sortedValues.length === 0) return 0;
        if (sortedValues.length === 1) return sortedValues[0];
        const idx = (percentileValue / 100) * (sortedValues.length - 1);
        const lo = Math.floor(idx);
        const hi = Math.ceil(idx);
        const frac = idx - lo;
        if (lo === hi) return sortedValues[lo];
        return sortedValues[lo] + frac * (sortedValues[hi] - sortedValues[lo]);
    }

    function computeYAxisConfig(payload, options = {}) {
        const percentileValue = options.percentileValue ?? 95;
        const headroom = options.headroom ?? 0.10;
        const l = options.l;

        const fromPayload = payload?.y_axis?.max ?? payload?.yMax ?? payload?.y_max;
        if (Number.isFinite(fromPayload) && fromPayload > 0) {
            return { yMax: fromPayload, source: 'payload' };
        }

        const maxima = (payload?.paths || [])
            .map((path) => (Array.isArray(path.risk_values) && path.risk_values.length ? Math.max(...path.risk_values) : null))
            .filter((value) => Number.isFinite(value))
            .sort((a, b) => a - b);

        if (!maxima.length) {
            return { yMax: 1, source: 'fallback' };
        }

        const pctl = percentileLinear(maxima, percentileValue);
        let yMax = niceCeil12510(pctl * (1 + headroom));
        if (Number.isFinite(l)) {
            yMax = Math.min(yMax, 8 * l);
        }
        if (!Number.isFinite(yMax) || yMax <= 0) {
            yMax = 1;
        }

        return { yMax, source: 'computed' };
    }

    function getClippingInfo(values, yMax) {
        const clippedY = [];
        const isClipped = [];
        const originalY = [];

        (values || []).forEach((value) => {
            const numericValue = Number(value);
            const safeValue = Number.isFinite(numericValue) ? numericValue : null;
            originalY.push(safeValue);
            if (safeValue === null) {
                clippedY.push(null);
                isClipped.push(false);
            } else {
                clippedY.push(Math.min(safeValue, yMax));
                isClipped.push(safeValue > yMax);
            }
        });

        return { clippedY, isClipped, originalY };
    }

    function renderChart(chartContainer, payload) {
        const normalized = normalizePayloadToChart(payload);
        const yAxis = computeYAxisConfig(payload);
        const height = chartContainer.getBoundingClientRect().height || 240;
        const traces = normalized.series.map((seriesItem) => {
            const { clippedY, isClipped, originalY } = getClippingInfo(Array.isArray(seriesItem.y) ? seriesItem.y : [], yAxis.yMax);
            return {
                x: normalized.x,
                y: clippedY,
                name: seriesItem.name || 'Series',
                mode: 'lines+markers',
                connectgaps: false,
                customdata: originalY.map((originalValue, index) => [originalValue, Boolean(isClipped[index])]),
                marker: {
                    symbol: isClipped.map((flag) => (flag ? 'triangle-up' : 'circle'))
                },
                hovertemplate: 'x=%{x}<br>shown=%{y:.3f}<br>real=%{customdata[0]:.3f}<br>clipped=%{customdata[1]}<extra>%{fullData.name}</extra>'
            };
        });

        const layout = {
            margin: { l: 50, r: 10, t: 20, b: 40 },
            height,
            xaxis: { title: 'Time since distruption', tickmode: 'array', tickvals: normalized.x, ticktext: normalized.x },
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
    }

    window.runsResultsChart = {
        DEFAULT_USER_ID: document.body.dataset.userId || 'demo-user',
        fetchGraphPayload,
        extractResultPayload,
        formatNodesCompact,
        renderChart
    };
})();

