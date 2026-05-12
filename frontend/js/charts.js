// ── DineWave Charts Module ────────────────────────────────────────────────
const charts = (() => {
  const COLORS = {
    green:'#10b981', blue:'#3b82f6', purple:'#8b5cf6',
    yellow:'#f59e0b', red:'#ef4444', cyan:'#06b6d4',
    orange:'#f97316', pink:'#ec4899', teal:'#14b8a6'
  };
  const WASTE_COLORS = { FOOD:COLORS.green, PLASTIC:COLORS.blue, ORGANIC:COLORS.teal, LIQUID:COLORS.cyan, HAZARDOUS:COLORS.red, PAPER:COLORS.yellow, METAL:COLORS.purple, UNKNOWN:'#64748b' };

  Chart.defaults.color = '#94a3b8';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
  Chart.defaults.font.family = "'Inter', sans-serif";

  let dailyLossChart=null, wasteTypeChart=null, weightLiveChart=null, binLiveChart=null;
  let currentDays = 7;
  const weightHistory=[], binHistory=[], timeLabels=[];
  const MAX_LIVE = 20;

  function gradFill(ctx, c1, c2) {
    const g = ctx.createLinearGradient(0, 0, 0, 200);
    g.addColorStop(0, c1 + '55'); g.addColorStop(1, c1 + '00');
    return g;
  }

  function initDailyLoss(data) {
    const ctx = document.getElementById('chart-daily-loss');
    if (!ctx) return;
    if (dailyLossChart) dailyLossChart.destroy();
    const labels = Object.keys(data).sort().slice(-currentDays);
    const values = labels.map(d => +(data[d]||0).toFixed(2));
    dailyLossChart = new Chart(ctx, {
      type:'line',
      data:{ labels, datasets:[{ label:'Financial Loss ($)', data:values,
        borderColor:COLORS.red, backgroundColor: gradFill(ctx.getContext('2d'), COLORS.red, COLORS.red),
        tension:.4, fill:true, pointRadius:4, pointHoverRadius:7, borderWidth:2 }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false },
        tooltip:{ callbacks:{ label: t => `$${t.raw.toFixed(2)}` } } },
        scales:{ y:{ beginAtZero:true, ticks:{ callback: v => `$${v}` } }, x:{ grid:{ display:false } } } }
    });
  }

  function initWasteTypes(breakdown) {
    const ctx = document.getElementById('chart-waste-types');
    if (!ctx) return;
    if (wasteTypeChart) wasteTypeChart.destroy();
    const labels = Object.keys(breakdown);
    const values = labels.map(k => breakdown[k]);
    const colors = labels.map(k => WASTE_COLORS[k] || '#64748b');
    wasteTypeChart = new Chart(ctx, {
      type:'doughnut',
      data:{ labels, datasets:[{ data:values, backgroundColor:colors.map(c=>c+'cc'),
        borderColor:colors, borderWidth:2, hoverOffset:8 }] },
      options:{ responsive:true, maintainAspectRatio:false, cutout:'65%',
        plugins:{ legend:{ position:'bottom', labels:{ padding:12, font:{ size:11 } } } } }
    });
  }

  function initWeightLive() {
    const ctx = document.getElementById('chart-weight-live');
    if (!ctx) return;
    if (weightLiveChart) weightLiveChart.destroy();
    weightLiveChart = new Chart(ctx, {
      type:'line',
      data:{ labels: timeLabels, datasets:[{ label:'Weight (g)', data: weightHistory,
        borderColor:COLORS.blue, backgroundColor: gradFill(ctx.getContext('2d'), COLORS.blue, COLORS.blue),
        tension:.4, fill:true, pointRadius:2, borderWidth:2 }] },
      options:{ responsive:true, maintainAspectRatio:false, animation:false,
        plugins:{ legend:{ display:false } },
        scales:{ y:{ beginAtZero:true }, x:{ grid:{ display:false }, ticks:{ maxTicksLimit:8 } } } }
    });
  }

  function initBinLive() {
    const ctx = document.getElementById('chart-bin-live');
    if (!ctx) return;
    if (binLiveChart) binLiveChart.destroy();
    binLiveChart = new Chart(ctx, {
      type:'bar',
      data:{ labels: timeLabels, datasets:[{ label:'Bin %', data: binHistory,
        backgroundColor: binHistory.map(v => v > 85 ? COLORS.red+'99' : v > 60 ? COLORS.yellow+'99' : COLORS.green+'99'),
        borderRadius:4, borderSkipped:false }] },
      options:{ responsive:true, maintainAspectRatio:false, animation:false,
        plugins:{ legend:{ display:false } },
        scales:{ y:{ min:0, max:100, ticks:{ callback: v => v+'%' } }, x:{ grid:{ display:false }, ticks:{ maxTicksLimit:8 } } } }
    });
  }

  function pushLive(weightG, binPct) {
    const label = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    timeLabels.push(label); weightHistory.push(weightG); binHistory.push(binPct);
    if (timeLabels.length > MAX_LIVE) { timeLabels.shift(); weightHistory.shift(); binHistory.shift(); }
    if (weightLiveChart) { weightLiveChart.update(); }
    if (binLiveChart) { binLiveChart.data.datasets[0].backgroundColor = binHistory.map(v => v>85?COLORS.red+'99':v>60?COLORS.yellow+'99':COLORS.green+'99'); binLiveChart.update(); }
  }

  function setDays(d) {
    currentDays = d;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    app.loadAnalytics(d);
  }

  return { initDailyLoss, initWasteTypes, initWeightLive, initBinLive, pushLive, setDays };
})();
