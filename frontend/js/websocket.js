// ── DineWave WebSocket Client ─────────────────────────────────────────────
const WS = (() => {
  const WS_URL = `ws://${location.hostname}:8080`;
  let socket = null, reconnectTimer = null, reconnectDelay = 2000;

  function connect() {
    try {
      socket = new WebSocket(WS_URL);
      socket.onopen    = onOpen;
      socket.onmessage = onMessage;
      socket.onclose   = onClose;
      socket.onerror   = onError;
    } catch(e) { scheduleReconnect(); }
  }

  function onOpen() {
    reconnectDelay = 2000;
    const ind = document.getElementById('ws-indicator');
    const txt = document.getElementById('ws-status-text');
    if (ind) ind.classList.add('connected');
    if (txt) txt.textContent = 'Live Connected';
    document.getElementById('ws-badge').textContent = 'LIVE';
    console.log('🔌 WS connected');
  }

  function onMessage(ev) {
    try {
      const msg = JSON.parse(ev.data);
      window.dispatchEvent(new CustomEvent('dinewave:ws', { detail: msg }));
    } catch(e) {}
  }

  function onClose() {
    const ind = document.getElementById('ws-indicator');
    const txt = document.getElementById('ws-status-text');
    if (ind) ind.classList.remove('connected');
    if (txt) txt.textContent = 'Reconnecting…';
    scheduleReconnect();
  }

  function onError() { socket && socket.close(); }

  function scheduleReconnect() {
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => { reconnectDelay = Math.min(reconnectDelay * 1.5, 30000); connect(); }, reconnectDelay);
  }

  return { connect };
})();
