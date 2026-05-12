// ── DineWave Main App ─────────────────────────────────────────────────────
const API = location.hostname === 'localhost' ? 'http://localhost:3000' : '';

const app = (() => {
  let currentStation = 'STATION-001';
  let wasteData = [], alertsData = [], sanitizeStats = { uvc:{ count:0, duration:0 }, mist:{ count:0, duration:0 } };

  // ── API Helper ──────────────────────────────────────────────────────────
  async function get(path) {
    try { const r = await fetch(API + path); return await r.json(); } catch(e) { return null; }
  }
  async function post(path, body) {
    try { const r = await fetch(API + path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }); return await r.json(); } catch(e) { return null; }
  }

  // ── Navigation ──────────────────────────────────────────────────────────
  function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const pg = document.getElementById('page-' + page);
    const nav = document.getElementById('nav-' + page);
    if (pg) pg.classList.add('active');
    if (nav) nav.classList.add('active');
    const titles = { dashboard:'Dashboard Overview', sensors:'Live Sensors', waste:'Waste Event Log', ledger:'Immutable Ledger', sanitize:'Sanitization Control', alerts:'Active Alerts' };
    document.getElementById('page-title').textContent = titles[page] || 'Dashboard';
    if (page === 'sensors') { charts.initWeightLive(); charts.initBinLive(); loadSensorDetail(); }
    if (page === 'waste')   loadWasteTable();
    if (page === 'ledger')  loadLedger();
    if (page === 'alerts')  loadAlerts();
  }

  // ── Clock ───────────────────────────────────────────────────────────────
  function startClock() {
    const el = document.getElementById('live-clock');
    setInterval(() => { if(el) el.textContent = new Date().toLocaleString(); }, 1000);
  }

  // ── Station select ──────────────────────────────────────────────────────
  function bindStation() {
    const sel = document.getElementById('station-select');
    if (sel) sel.addEventListener('change', e => { currentStation = e.target.value; refresh(); });
  }

  // ── Toast ───────────────────────────────────────────────────────────────
  function toast(msg, type = 'success') {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  }

  // ── Update Stat Cards ───────────────────────────────────────────────────
  function updateStats(analytics, sensor) {
    const safe = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    safe('stat-entries', analytics?.totalEntries ?? '—');
    safe('stat-loss',    analytics ? '$' + analytics.totalFinancialLoss.toFixed(2) : '—');
    safe('stat-weight',  analytics ? analytics.totalWeightKg + ' kg' : '—');
    const binPct = sensor?.ultrasonic?.binCapacityPercent ?? 0;
    safe('stat-bin', binPct + '%');
    const bar = document.getElementById('bin-progress');
    if (bar) { bar.style.width = binPct + '%'; bar.style.background = binPct > 85 ? 'linear-gradient(90deg,#ef4444,#f97316)' : binPct > 60 ? 'linear-gradient(90deg,#f59e0b,#f97316)' : 'linear-gradient(90deg,#10b981,#06b6d4)'; }
    safe('stat-hygiene', sensor?.environment?.hygieneScore ? sensor.environment.hygieneScore + '/100' : '—');
    safe('delta-bin', sensor?.ultrasonic?.binStatus || '—');
  }

  function updateLedgerStats(ledger) {
    const el = document.getElementById('stat-blocks');
    if (el) el.textContent = ledger?.count ?? '—';
  }

  // ── Live Sensor Panel ───────────────────────────────────────────────────
  function updateSensorPanel(payload) {
    const safe = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };
    safe('rfid-tag',  payload.rfid?.tagId   || 'No Tag');
    safe('rfid-type', 'Waste Type: ' + (payload.rfid?.wasteType || '—'));
    const wg = payload.loadCell?.weightGrams || 0;
    safe('lc-weight', wg + ' g');
    safe('lc-loss',   'Loss: $' + (payload.loadCell?.financialLoss || 0).toFixed(2));
    const lcBar = document.getElementById('lc-bar');
    if (lcBar) lcBar.style.width = Math.min((wg/3000)*100, 100) + '%';
    const cap = payload.ultrasonic?.binCapacityPercent || 0;
    safe('us-dist', (payload.ultrasonic?.distanceCm || 0) + ' cm');
    safe('us-cap',  'Capacity: ' + cap + '%');
    safe('ring-label', cap + '%');
    const offset = 251.2 - (251.2 * cap / 100);
    const fill = document.getElementById('ring-fill');
    if (fill) { fill.style.strokeDashoffset = offset; fill.style.stroke = cap > 85 ? '#ef4444' : cap > 60 ? '#f59e0b' : '#10b981'; }
    charts.pushLive(wg, cap);
  }

  // ── Recent Events ───────────────────────────────────────────────────────
  const wasteEmoji = { FOOD:'🍕', PLASTIC:'♻️', ORGANIC:'🌿', LIQUID:'💧', HAZARDOUS:'⚠️', PAPER:'📄', METAL:'🔩', UNKNOWN:'❓' };
  const dotColor   = { FOOD:'#10b981', PLASTIC:'#3b82f6', ORGANIC:'#14b8a6', LIQUID:'#06b6d4', HAZARDOUS:'#ef4444', PAPER:'#f59e0b', METAL:'#8b5cf6' };

  function renderEvents(items) {
    const list = document.getElementById('events-list');
    if (!list) return;
    if (!items?.length) { list.innerHTML = '<div class="empty-state">No events yet. Simulate one!</div>'; return; }
    list.innerHTML = items.slice(0,10).map(e => {
      const wt = e.rfid?.wasteType || 'UNKNOWN';
      return `<div class="event-item">
        <div class="event-dot" style="background:${dotColor[wt]||'#64748b'}"></div>
        <div class="event-info">
          <div class="event-type">${wasteEmoji[wt]||'❓'} ${wt} · ${e.rfid?.tagId||'—'}</div>
          <div class="event-time">${new Date(e.timestamp).toLocaleTimeString()} · ${e.loadCell?.weightGrams||0}g</div>
        </div>
        <div class="event-loss">$${(e.loadCell?.financialLoss||0).toFixed(2)}</div>
      </div>`;
    }).join('');
  }

  // ── Waste Table ─────────────────────────────────────────────────────────
  async function loadWasteTable() {
    const res = await get('/api/waste?stationId=' + currentStation + '&limit=100');
    wasteData = res?.data || [];
    renderWasteTable(wasteData);
  }

  function renderWasteTable(items) {
    const tbody = document.getElementById('waste-table-body');
    if (!tbody) return;
    if (!items.length) { tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No waste events. Simulate one!</td></tr>'; return; }
    tbody.innerHTML = items.map(e => {
      const wt = e.rfid?.wasteType || 'UNKNOWN';
      const sanitized = (e.sanitization?.uvActivated || e.sanitization?.mistActivated);
      return `<tr>
        <td>${new Date(e.timestamp).toLocaleString()}</td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:.72rem">${e.rfid?.tagId||'—'}</td>
        <td><span class="badge badge-${wt.toLowerCase()}">${wasteEmoji[wt]||''} ${wt}</span></td>
        <td>${e.loadCell?.weightGrams||0} g</td>
        <td style="color:#ef4444;font-weight:700">$${(e.loadCell?.financialLoss||0).toFixed(2)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <div style="height:6px;width:60px;background:rgba(255,255,255,.1);border-radius:3px">
              <div style="height:6px;border-radius:3px;width:${e.ultrasonic?.binCapacityPercent||0}%;background:${(e.ultrasonic?.binCapacityPercent||0)>85?'#ef4444':'#10b981'}"></div>
            </div>
            ${e.ultrasonic?.binCapacityPercent||0}%
          </div>
        </td>
        <td style="font-family:'JetBrains Mono',monospace;font-size:.72rem">${e.sorting?.sortedTo||'—'}</td>
        <td>${sanitized ? '✅' : '—'}</td>
        <td><span class="badge" style="background:rgba(16,185,129,.1);color:#10b981">${e.status||'PROCESSED'}</span></td>
      </tr>`;
    }).join('');
  }

  function filterWaste() {
    const wt = document.getElementById('waste-type-filter').value;
    renderWasteTable(wt ? wasteData.filter(e => e.rfid?.wasteType === wt) : wasteData);
  }

  // ── Ledger ──────────────────────────────────────────────────────────────
  async function loadLedger() {
    const res = await get('/api/ledger?stationId=' + currentStation + '&limit=50');
    updateLedgerStats(res);
    const view = document.getElementById('blockchain-view');
    if (!view) return;
    const blocks = res?.data || [];
    if (!blocks.length) { view.innerHTML = '<div class="empty-state">No ledger blocks yet.</div>'; return; }
    view.innerHTML = blocks.map(b => `
      <div class="block-card">
        <div class="block-header">
          <span class="block-num">#${b.blockNumber}</span>
          <span class="block-ts">${new Date(b.timestamp).toLocaleString()}</span>
          <span class="badge" style="background:rgba(16,185,129,.1);color:#10b981;margin-left:auto">✅ VALID</span>
        </div>
        <div class="block-hash">🔑 ${b.blockHash}</div>
        <div class="block-prev">⬅ PREV: ${b.prevHash}</div>
        <div class="block-data">
          <div class="block-field"><span>Entry ID</span><strong>${b.entryId?.substring(0,12)}…</strong></div>
          <div class="block-field"><span>Waste Type</span><strong>${b.data?.rfid?.wasteType||'—'}</strong></div>
          <div class="block-field"><span>Weight</span><strong>${b.data?.loadCell?.weightKg||0} kg</strong></div>
          <div class="block-field"><span>Loss</span><strong>$${(b.data?.loadCell?.financialLoss||0).toFixed(2)}</strong></div>
        </div>
      </div>`).join('');
  }

  async function verifyLedger() {
    const res = await get('/api/ledger/verify?stationId=' + currentStation);
    const banner = document.getElementById('integrity-banner');
    const text   = document.getElementById('integrity-text');
    if (!res) return;
    if (banner) banner.style.borderColor = res.integrity?.includes('INTACT') ? '#10b981' : '#ef4444';
    if (text)  text.textContent = `${res.integrity} · ${res.totalBlocks} blocks verified`;
    const intEl = document.getElementById('ledger-integrity');
    if (intEl) intEl.textContent = res.integrity?.includes('INTACT') ? '✅ Intact' : '❌ Compromised';
    toast(res.integrity?.includes('INTACT') ? '✅ Ledger integrity verified!' : '❌ Ledger tampered!', res.integrity?.includes('INTACT') ? 'success' : 'error');
  }

  function exportLedger() {
    window.open(API + '/api/ledger/export?stationId=' + currentStation, '_blank');
  }

  // ── Alerts ──────────────────────────────────────────────────────────────
  async function loadAlerts() {
    const res = await get('/api/alerts');
    alertsData = res?.data || [];
    document.getElementById('alert-count-badge').textContent = alertsData.length;
    const list = document.getElementById('alerts-list');
    if (!list) return;
    if (!alertsData.length) { list.innerHTML = '<div class="empty-state">✅ No active alerts</div>'; return; }
    const iconMap = { CRITICAL:'🚨', WARNING:'⚠️', INFO:'ℹ️', EMERGENCY:'🆘' };
    list.innerHTML = alertsData.map(a => `
      <div class="alert-item alert-${a.severity} ${a.severity}">
        <div class="alert-icon">${iconMap[a.severity]||'🔔'}</div>
        <div class="alert-body">
          <div class="alert-type alert-${a.severity}">${a.type} · ${a.severity}</div>
          <div class="alert-msg">${a.message}</div>
          <div class="alert-meta">${a.stationId} · ${new Date(a.timestamp).toLocaleString()}</div>
        </div>
        <button class="btn-resolve" onclick="app.resolveAlert('${a.alertId}','${a.timestamp}')">Resolve</button>
      </div>`).join('');
  }

  async function resolveAlert(alertId, timestamp) {
    await post('/api/alerts/' + alertId + '/resolve', { timestamp });
    toast('Alert resolved ✅'); loadAlerts();
  }

  // ── Analytics ───────────────────────────────────────────────────────────
  async function loadAnalytics(days = 7) {
    const res = await get(`/api/waste/analytics?stationId=${currentStation}&days=${days}`);
    if (!res?.data) return;
    const d = res.data;
    charts.initDailyLoss(d.dailyLoss || {});
    charts.initWasteTypes(d.wasteTypeBreakdown || { FOOD:5, PLASTIC:3, ORGANIC:4, LIQUID:2 });
    updateStats(d, null);
  }

  // ── Sanitize ────────────────────────────────────────────────────────────
  async function triggerSanitize(type) {
    const res = await post('/api/sensors/waste-event', {
      stationId: currentStation,
      rfid: { wasteType:'FOOD', tagId:'MANUAL' },
      loadCell: { weightGrams:500, weightKg:0.5, financialLoss:4.5, currency:'USD' },
      ultrasonic: { binCapacityPercent:45, distanceCm:33 },
      sanitization: { uvActivated: type==='UVC', mistActivated: type==='MIST', uvDurationSec:30, mistDurationSec:10 }
    });
    const key = type === 'UVC' ? 'uvc' : 'mist';
    sanitizeStats[key].count++;
    sanitizeStats[key].duration += type === 'UVC' ? 30 : 10;
    document.getElementById(key + '-count').textContent    = sanitizeStats[key].count;
    document.getElementById(key + '-duration').textContent = sanitizeStats[key].duration + 's';
    document.getElementById(key + '-last').textContent     = new Date().toLocaleTimeString();
    const orb = document.getElementById(key === 'uvc' ? 'uvc-orb' : 'mist-orb');
    if (orb) { orb.classList.add('active'); setTimeout(() => orb.classList.remove('active'), (type==='UVC'?30:10)*1000); }
    toast(type === 'UVC' ? '☀️ UV-C activated for 30s' : '💧 Mist activated for 10s');
    let secs = type === 'UVC' ? 30 : 10;
    const cd = document.getElementById(key + '-countdown');
    const timer = setInterval(() => { if(cd) cd.textContent = secs-- + 's'; if(secs < 0) { clearInterval(timer); if(cd) cd.textContent = ''; toast(type + ' sanitization complete ✅'); } }, 1000);
  }

  async function addMockWasteEvent() {
    const r = await get('/api/sensors/mock?stationId=' + currentStation);
    if (!r?.wasteEvent) return;
    const res = await post('/api/sensors/waste-event', r.wasteEvent);
    if (res?.success) { toast('✅ Mock waste event logged — Block #' + res.blockNumber); refresh(); }
  }

  // ── Sensor Detail Page ──────────────────────────────────────────────────
  async function loadSensorDetail() {
    const res = await get('/api/sensors/latest?stationId=' + currentStation);
    const d   = res?.data || res?.mock;
    if (!d) return;
    const grid = document.getElementById('sensor-detail-grid');
    if (!grid) return;
    grid.innerHTML = `
      <div class="detail-card"><h3>📶 RFID Sensor</h3>
        <div class="detail-row"><span>Tag ID</span><strong>${d.rfid?.tagId||'—'}</strong></div>
        <div class="detail-row"><span>Waste Type</span><strong>${d.rfid?.wasteType||'—'}</strong></div>
        <div class="detail-row"><span>Confidence</span><strong>${d.rfid?.confidence||0}%</strong></div>
        <div class="detail-row"><span>Signal</span><strong>${d.rfid?.signalStrength||0} dBm</strong></div>
        <div class="detail-row"><span>Status</span><strong style="color:#10b981">${d.rfid?.active?'ACTIVE':'IDLE'}</strong></div>
      </div>
      <div class="detail-card"><h3>⚖️ Load Cell</h3>
        <div class="detail-row"><span>Weight</span><strong>${d.loadCell?.weightGrams||0} g</strong></div>
        <div class="detail-row"><span>Weight (kg)</span><strong>${d.loadCell?.weightKg||0} kg</strong></div>
        <div class="detail-row"><span>Stable</span><strong style="color:${d.loadCell?.stable?'#10b981':'#f59e0b'}">${d.loadCell?.stable?'YES':'NO'}</strong></div>
        <div class="detail-row"><span>Cal. Factor</span><strong>${d.loadCell?.calibrationFactor||2280}</strong></div>
      </div>
      <div class="detail-card"><h3>📡 Ultrasonic</h3>
        <div class="detail-row"><span>Distance</span><strong>${d.ultrasonic?.distanceCm||0} cm</strong></div>
        <div class="detail-row"><span>Capacity</span><strong>${d.ultrasonic?.binCapacityPercent||0}%</strong></div>
        <div class="detail-row"><span>Bin Status</span><strong style="color:${(d.ultrasonic?.binCapacityPercent||0)>85?'#ef4444':'#10b981'}">${d.ultrasonic?.binStatus||'NORMAL'}</strong></div>
        <div class="detail-row"><span>Temperature</span><strong>${d.ultrasonic?.temperature||25}°C</strong></div>
      </div>
      <div class="detail-card"><h3>🌡️ Environment</h3>
        <div class="detail-row"><span>Temperature</span><strong>${d.environment?.temperature||'—'}°C</strong></div>
        <div class="detail-row"><span>Humidity</span><strong>${d.environment?.humidity||'—'}%</strong></div>
        <div class="detail-row"><span>Hygiene Score</span><strong>${d.environment?.hygieneScore||'—'}/100</strong></div>
      </div>
      <div class="detail-card"><h3>⚙️ ESP32 System</h3>
        <div class="detail-row"><span>WiFi RSSI</span><strong>${d.system?.wifiRSSI||'—'} dBm</strong></div>
        <div class="detail-row"><span>Free Heap</span><strong>${d.system?.freeHeap||'—'} B</strong></div>
        <div class="detail-row"><span>Firmware</span><strong>${d.system?.firmwareVersion||'1.0.0'}</strong></div>
        <div class="detail-row"><span>Battery</span><strong>${d.system?.batteryVolt||3.7} V</strong></div>
      </div>`;
  }

  // ── Refresh All ─────────────────────────────────────────────────────────
  async function refresh() {
    const [sensorRes, analyticsRes, ledgerRes, alertsRes] = await Promise.all([
      get('/api/sensors/latest?stationId=' + currentStation),
      get('/api/waste/analytics?stationId=' + currentStation + '&days=7'),
      get('/api/ledger?stationId=' + currentStation + '&limit=1'),
      get('/api/alerts'),
    ]);
    const sensor    = sensorRes?.data || sensorRes?.mock;
    const analytics = analyticsRes?.data;
    if (sensor)    updateSensorPanel(sensor);
    if (analytics || sensor) updateStats(analytics, sensor);
    if (analytics?.dailyLoss)      charts.initDailyLoss(analytics.dailyLoss);
    if (analytics?.wasteTypeBreakdown) charts.initWasteTypes(analytics.wasteTypeBreakdown);
    if (ledgerRes) updateLedgerStats(ledgerRes);
    if (alertsRes?.data) { alertsData = alertsRes.data; document.getElementById('alert-count-badge').textContent = alertsData.length; }
    const wasteRes = await get('/api/waste?stationId=' + currentStation + '&limit=10');
    renderEvents(wasteRes?.data || []);
  }

  // ── WebSocket Events ────────────────────────────────────────────────────
  function bindWsEvents() {
    window.addEventListener('dinewave:ws', (e) => {
      const msg = e.detail;
      if (msg.type === 'SENSOR_UPDATE') updateSensorPanel(msg.payload);
      if (msg.type === 'WASTE_EVENT') {
        toast(`🗑️ New waste: ${msg.payload?.entry?.rfid?.wasteType||'UNKNOWN'} — Block #${msg.payload?.block?.blockNumber}`);
        refresh();
      }
      if (msg.type === 'ALERT') {
        toast(`🚨 Alert: ${msg.payload?.message}`, 'error');
        const cnt = document.getElementById('alert-count-badge');
        if (cnt) cnt.textContent = parseInt(cnt.textContent||0) + 1;
      }
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function init() {
    startClock(); bindStation(); bindWsEvents();
    document.querySelectorAll('.nav-item').forEach(n => {
      n.addEventListener('click', (e) => { e.preventDefault(); navigate(n.dataset.page); });
    });
    WS.connect();
    refresh();
    setInterval(refresh, 15000);
  }

  document.addEventListener('DOMContentLoaded', init);

  return { refresh, navigate, filterWaste, triggerSanitize, addMockWasteEvent, verifyLedger, exportLedger, resolveAlert, loadWastePage: () => navigate('waste'), loadAnalytics };
})();
