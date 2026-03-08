// ── Derived constants ──
let currentScatterMode = 'cot';
const SCATTER_DATA = ALL_SCATTER[currentScatterMode];
const STATS = ALL_STATS[currentScatterMode];
const MALADAPTIVE_DIMS = DIMS.filter(d => !GENERAL_DIMS.includes(d));

// ── Mode tab switching (Section 2) ──
function switchModeTab(panel, btn) {
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.mode-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('mode-' + panel).classList.add('active');
}

// ── Result tab switching (Section 3) ──
function switchResultTab(panel, btn) {
  document.querySelectorAll('.result-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.result-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('result-' + panel).classList.add('active');
  if (panel === 'scatter') {
    const activePanel = document.querySelector('.scatter-sub-panel.active');
    const dims = activePanel && activePanel.id === 'scatter-maladaptive' ? MALADAPTIVE_DIMS : GENERAL_DIMS;
    setTimeout(() => {
      dims.forEach(dim => Plotly.Plots.resize(document.getElementById('plot-' + dim)));
    }, 50);
  }
  if (panel === 'compare') {
    setTimeout(() => {
      const active = document.querySelector('#result-compare .scatter-sub-panel.active');
      if (active) active.querySelectorAll('[id^="compare-"]').forEach(el => Plotly.Plots.resize(el));
    }, 50);
  }
}

// ── Dimension tab switching ──
function switchDimTab(panel, btn) {
  document.querySelectorAll('.dim-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.dim-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-' + panel).classList.add('active');
}

// ── Navigation active state ──
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const id = entry.target.id;
      const link = document.querySelector(`.nav-link[data-section="${id}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => observer.observe(s));

// ── Scatter sub-tab switching ──
function switchScatterTab(panel, btn) {
  const container = btn.closest('#result-scatter');
  container.querySelectorAll('.scatter-sub-tab').forEach(t => t.classList.remove('active'));
  container.querySelectorAll('.scatter-sub-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('scatter-' + panel).classList.add('active');
  const dims = panel === 'general' ? GENERAL_DIMS : MALADAPTIVE_DIMS;
  setTimeout(() => {
    dims.forEach(dim => Plotly.Plots.resize(document.getElementById('plot-' + dim)));
  }, 50);
}

function switchCompareTab(panel, btn) {
  const container = btn.closest('#result-compare');
  container.querySelectorAll('.scatter-sub-tab').forEach(t => t.classList.remove('active'));
  container.querySelectorAll('.scatter-sub-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('compare-' + panel).classList.add('active');
  setTimeout(() => {
    document.getElementById('compare-' + panel).querySelectorAll('[id^="compare-"]').forEach(el => Plotly.Plots.resize(el));
  }, 50);
}

function switchCorrTab(panel, btn) {
  const container = btn.closest('#result-corr');
  container.querySelectorAll('.scatter-sub-tab').forEach(t => t.classList.remove('active'));
  container.querySelectorAll('.scatter-sub-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('corr-' + panel).classList.add('active');
}

function switchScalingTab(panel, btn) {
  const section = document.getElementById('scaling');
  section.querySelectorAll('.scatter-sub-tab').forEach(t => t.classList.remove('active'));
  section.querySelectorAll('.scaling-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('scaling-' + panel).classList.add('active');
  setTimeout(() => {
    const chartId = panel === 'curve' ? 'scaling-chart' : 'scaling-heatmap-chart';
    Plotly.Plots.resize(document.getElementById(chartId));
  }, 50);
}

// ── Plotly scatter plots ──
const plotlyLayout = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(18,18,26,1)',
  font: { family: 'Pretendard, sans-serif', color: '#8888a0', size: 11 },
  margin: { l: 44, r: 16, t: 8, b: 44 },
  xaxis: {
    title: { text: '\uc2e4\uc81c', font: { size: 11 } },
    gridcolor: 'rgba(255,255,255,0.04)',
    zerolinecolor: 'rgba(255,255,255,0.06)',
    range: [15, 100],
  },
  yaxis: {
    title: { text: '\uc608\uce21', font: { size: 11 } },
    gridcolor: 'rgba(255,255,255,0.04)',
    zerolinecolor: 'rgba(255,255,255,0.06)',
    range: [15, 100],
  },
  showlegend: false,
};

const plotlyConfig = { displayModeBar: false, responsive: true };

function renderScatter(dims, gridId) {
  const grid = document.getElementById(gridId);
  dims.forEach(dim => {
    const cell = document.createElement('div');
    cell.className = 'scatter-cell';

    // r-value badge
    const s = ALL_STATS[currentScatterMode][dim];
    const isGeneral = GENERAL_DIMS.includes(dim);
    const color = isGeneral ? '#6366f1' : '#f59e0b';
    const starStr = s.p < 0.001 ? '***' : (s.p < 0.01 ? '**' : (s.p < 0.05 ? '*' : ''));
    const badge = document.createElement('div');
    badge.className = 'scatter-r-badge';
    badge.style.color = color;
    badge.innerHTML = `${DIM_LABELS[dim]}(${dim}) <span style="margin-left:6px;">r = ${s.r.toFixed(2)}${starStr}</span> <span style="font-size:0.7em;color:#555570;margin-left:4px;">${MODE_NAMES[currentScatterMode]}</span>`;
    cell.appendChild(badge);

    const plotDiv = document.createElement('div');
    plotDiv.id = 'plot-' + dim;
    cell.appendChild(plotDiv);
    grid.appendChild(cell);

    const d = ALL_SCATTER[currentScatterMode][dim];
    const n = d.actual.length;
    const mx = d.actual.reduce((a, b) => a + b, 0) / n;
    const my = d.predicted.reduce((a, b) => a + b, 0) / n;
    const slope_num = d.actual.reduce((acc, x, i) => acc + (x - mx) * (d.predicted[i] - my), 0);
    const slope_den = d.actual.reduce((acc, x) => acc + (x - mx) * (x - mx), 0);
    const slope = slope_den ? slope_num / slope_den : 0;
    const intercept = my - slope * mx;

    const pStr = s.p < 0.001 ? 'p < .001' : ('p = ' + s.p.toFixed(3));

    const traces = [
      { x: [15, 100], y: [15, 100], mode: 'lines',
        line: { color: 'rgba(255,255,255,0.08)', width: 1, dash: 'dot' }, hoverinfo: 'skip' },
      { x: [15, 100], y: [slope*15+intercept, slope*100+intercept], mode: 'lines',
        line: { color: color, width: 2, dash: 'dash' }, hoverinfo: 'skip' },
      { x: d.actual, y: d.predicted, mode: 'markers',
        marker: { color: color, size: 7, opacity: 0.75,
          line: { color: 'rgba(255,255,255,0.2)', width: 0.5 } },
        hovertemplate: '\uc2e4\uc81c: %{x:.1f}<br>\uc608\uce21: %{y:.1f}<extra></extra>' },
    ];

    const layout = {
      ...plotlyLayout,
      xaxis: { ...plotlyLayout.xaxis },
      yaxis: { ...plotlyLayout.yaxis },
      annotations: [{
        x: 0.98, y: 0.02, xref: 'paper', yref: 'paper',
        text: pStr, showarrow: false,
        font: { size: 10, color: '#555570' },
        xanchor: 'right', yanchor: 'bottom',
      }],
    };

    Plotly.newPlot(plotDiv, traces, layout, plotlyConfig);
  });
}

renderScatter(GENERAL_DIMS, 'scatter-grid-general');
renderScatter(MALADAPTIVE_DIMS, 'scatter-grid-maladaptive');

// ── Resize handler ──
window.addEventListener('resize', () => {
  DIMS.forEach(dim => {
    const el = document.getElementById('plot-' + dim);
    if (el && el.offsetParent !== null) Plotly.Plots.resize(el);
  });
});

// ── Phone auto-scroll ──
(function() {
  const body = document.getElementById('phone-body');
  if (!body) return;
  const msgs = body.querySelectorAll('.phone-msg, .phone-result');
  const delayMap = { '0':0.3, '1':1.5, '2':3.0, '3':4.5, '4':6.0, '5':7.5, 'result':9.0 };

  msgs.forEach(msg => {
    const step = msg.dataset.step;
    const delay = delayMap[step];
    if (delay === undefined) return;
    setTimeout(() => {
      const target = msg.offsetTop + msg.offsetHeight - body.clientHeight + 16;
      if (target > body.scrollTop) {
        body.scrollTo({ top: target, behavior: 'smooth' });
      }
    }, (delay + 0.4) * 1000);
  });

  setTimeout(() => {
    body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });
  }, 10.5 * 1000);
})();

// ── Scroll-triggered reveal animations ──
(function() {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  const groups = [
    { sel: '.summary-card', stagger: 0.08 },
    { sel: '.mode-tabs, .mode-panel.active', stagger: 0.1 },
    { sel: '.result-tabs', stagger: 0 },
    { sel: '.roadmap-item', stagger: 0.15 },
    { sel: '.apply-card', stagger: 0.1 },
    { sel: '.progress-layout', stagger: 0 },
    { sel: '.corr-criteria', stagger: 0 },
  ];

  groups.forEach(g => {
    document.querySelectorAll(g.sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (g.stagger * i) + 's';
      revealObs.observe(el);
    });
  });
})();

// ── Summary card count-up ──
(function() {
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      const text = el.textContent.trim();
      const isFloat = text.includes('.');
      const target = parseFloat(text);
      if (isNaN(target)) return;
      const dur = 1200;
      const t0 = performance.now();
      function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = isFloat ? (target * e).toFixed(2) : Math.round(target * e).toString();
        if (p < 1) requestAnimationFrame(tick);
      }
      el.textContent = isFloat ? '0.00' : '0';
      requestAnimationFrame(tick);
      countObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.summary-value').forEach(el => countObs.observe(el));
})();

// ── Progress bar scroll animation ──
(function() {
  const fill = document.querySelector('.progress-fill');
  if (!fill) return;
  const target = fill.dataset.target;
  if (!target) return;
  const pObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        fill.style.transition = 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
        fill.style.width = target + '%';
        pObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  pObs.observe(fill.closest('.progress-bar-section') || fill);
})();

// ── Scatter mode switching ──
function switchScatterMode(mode) {
  currentScatterMode = mode;
  ['scatter-grid-general', 'scatter-grid-maladaptive'].forEach(id => {
    document.getElementById(id).innerHTML = '';
  });
  renderScatter(GENERAL_DIMS, 'scatter-grid-general');
  renderScatter(MALADAPTIVE_DIMS, 'scatter-grid-maladaptive');
}

// ── Comparison charts + Scaling charts ──
(function() {
  const modes = ['base', 'item', 'cot'];
  const cfg = { displayModeBar: false, responsive: true };

  const baseLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(18,18,26,1)',
    font: { family: 'Pretendard, sans-serif', color: '#8888a0', size: 12 },
    margin: { l: 46, r: 16, t: 16, b: 70 },
    barmode: 'group',
    legend: { orientation: 'h', x: 1, xanchor: 'right', y: 1.02, yanchor: 'bottom', font: { size: 12 } },
    xaxis: { gridcolor: 'rgba(255,255,255,0.04)', tickfont: { size: 11 } },
    yaxis: { gridcolor: 'rgba(255,255,255,0.04)' },
  };

  function renderGroupCharts(dims, suffix) {
    const labels = dims.map(d => DIM_LABELS[d] + '(' + d + ')');
    const ndims = dims.length;

    // acc2 chart
    const acc2Traces = modes.map(m => ({
      x: labels,
      y: dims.map(d => +(ALL_STATS[m][d].acc2 * 100).toFixed(1)),
      text: dims.map(d => (ALL_STATS[m][d].acc2 * 100).toFixed(1) + '%'),
      textposition: 'outside', textfont: { size: 10, color: MODE_COLORS[m] },
      name: MODE_NAMES[m], type: 'bar',
      marker: { color: MODE_COLORS[m], opacity: 0.85 },
      hovertemplate: '%{x}<br>%{y:.1f}%<extra>' + MODE_NAMES[m] + '</extra>',
    }));
    Plotly.newPlot('compare-acc2-' + suffix, acc2Traces, {
      ...baseLayout,
      yaxis: { ...baseLayout.yaxis, title: { text: '%', font: { size: 12 } }, range: [0, 105] },
      shapes: [{ type: 'line', x0: -0.5, x1: ndims - 0.5, y0: 50, y1: 50,
        line: { color: 'rgba(255,255,255,0.15)', width: 1, dash: 'dot' } }],
    }, cfg);

  }

  renderGroupCharts(GENERAL_DIMS, 'general');
  renderGroupCharts(MALADAPTIVE_DIMS, 'maladaptive');

  // ── Scaling Charts ──
  const SCALING_DATA = window.SCALING_DATA;

  // Scaling curve
  Plotly.newPlot('scaling-chart', [
    { x: SCALING_DATA.models, y: SCALING_DATA.big5, mode: 'lines+markers+text',
      name: 'Big Five (\uc77c\ubc18\uc131\uaca9)', line: { color: '#6366f1', width: 3 },
      marker: { size: 10 }, text: SCALING_DATA.big5.map(v => v.toFixed(3)),
      textposition: 'top center', textfont: { size: 12, color: '#6366f1' } },
    { x: SCALING_DATA.models, y: SCALING_DATA.mal, mode: 'lines+markers+text',
      name: '\ubd80\uc801\uc751\uc131\uaca9 (Maladaptive)', line: { color: '#f59e0b', width: 3 },
      marker: { size: 10, symbol: 'square' }, text: SCALING_DATA.mal.map(v => v.toFixed(3)),
      textposition: 'bottom center', textfont: { size: 12, color: '#f59e0b' } },
  ], {
    ...baseLayout,
    margin: { l: 50, r: 20, t: 20, b: 50 },
    yaxis: { ...baseLayout.yaxis, title: { text: 'Pearson r', font: { size: 13 } }, range: [0.2, 0.7],
      dtick: 0.05 },
    xaxis: { ...baseLayout.xaxis, tickfont: { size: 13 } },
    legend: { ...baseLayout.legend, font: { size: 12 } },
  }, cfg);

  // Scaling heatmap — 최고 모델 강조, 동점 허용
  const heatModels = ['Nano', 'Mini', 'GPT-5.2'];
  const xLabels = DIMS.map(d => DIM_LABELS[d] + '(' + d + ')');
  const heatZ = heatModels.map((_, i) => DIMS.map(d => SCALING_DATA.dimR[d][i]));

  // 차원별 최고 모델 (동점 허용, 0.005 이내)
  const bestIdxSet = DIMS.map((d, di) => {
    const vals = heatModels.map((_, i) => heatZ[i][di]);
    const maxVal = Math.max(...vals);
    const bests = [];
    vals.forEach((v, i) => { if (Math.abs(v - maxVal) < 0.005) bests.push(i); });
    return bests;
  });

  const modelColors = ['#6366f1', '#22c55e', '#f59e0b'];
  const modelColorsMuted = ['rgba(99,102,241,0.15)', 'rgba(34,197,94,0.15)', 'rgba(245,158,11,0.15)'];

  const heatTraces = [];
  heatModels.forEach((model, mi) => {
    const xPos = [], yPos = [], vals = [], textColors = [];
    DIMS.forEach((d, di) => {
      const isBest = bestIdxSet[di].includes(mi);
      xPos.push(xLabels[di]);
      yPos.push(model);
      vals.push(heatZ[mi][di].toFixed(2));
      textColors.push(isBest ? '#fff' : '#666');
    });
    heatTraces.push({
      x: xPos, y: yPos, text: vals, mode: 'text',
      textfont: { size: 14, color: textColors },
      hovertemplate: '%{x}<br>%{y}<br>r = %{text}<extra></extra>',
      showlegend: false,
    });
  });

  const cellShapes = [];
  heatModels.forEach((model, mi) => {
    DIMS.forEach((d, di) => {
      const isBest = bestIdxSet[di].includes(mi);
      cellShapes.push({
        type: 'rect', x0: di - 0.5, x1: di + 0.5, y0: mi - 0.5, y1: mi + 0.5,
        fillcolor: isBest ? modelColors[mi] : modelColorsMuted[mi],
        line: { color: 'rgba(10,10,15,0.8)', width: 2 }, layer: 'below',
      });
    });
  });
  cellShapes.push({
    type: 'line', x0: 4.5, x1: 4.5, y0: -0.5, y1: 2.5,
    line: { color: 'rgba(255,255,255,0.6)', width: 3 },
  });

  Plotly.newPlot('scaling-heatmap-chart', heatTraces, {
    ...baseLayout,
    margin: { l: 70, r: 20, t: 20, b: 80 },
    xaxis: { type: 'category', tickfont: { size: 11, color: '#8888a0' }, gridcolor: 'rgba(0,0,0,0)' },
    yaxis: { type: 'category', tickfont: { size: 13, color: '#8888a0' }, gridcolor: 'rgba(0,0,0,0)', autorange: 'reversed' },
    shapes: cellShapes,
  }, cfg);
})();
