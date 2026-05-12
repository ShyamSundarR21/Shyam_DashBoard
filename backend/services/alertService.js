'use strict';

const { v4: uuidv4 } = require('uuid');
const { putAlert, resolveAlert, getActiveAlerts } = require('./dynamodb');

// ─── Alert Severity Levels ────────────────────────────────────────────────────
const SEVERITY = { INFO: 'INFO', WARNING: 'WARNING', CRITICAL: 'CRITICAL', EMERGENCY: 'EMERGENCY' };

// ─── Alert Types ──────────────────────────────────────────────────────────────
const ALERT_TYPES = {
  BIN_CAPACITY:    'BIN_CAPACITY',
  HIGH_WASTE:      'HIGH_WASTE',
  FINANCIAL_LOSS:  'FINANCIAL_LOSS',
  RFID_UNKNOWN:    'RFID_UNKNOWN',
  SANITIZE_NEEDED: 'SANITIZE_NEEDED',
  SENSOR_OFFLINE:  'SENSOR_OFFLINE',
  TAMPERED_LEDGER: 'TAMPERED_LEDGER',
  HYGIENE_RISK:    'HYGIENE_RISK',
};

// ─── Thresholds ────────────────────────────────────────────────────────────────
const THRESHOLDS = {
  binWarning:    Number(process.env.BIN_CAPACITY_ALERT_PERCENT) || 75,
  binCritical:   90,
  financialLoss: 50,   // USD per event
  weightKg:      5,    // kg per event
  uvTrigger:     Number(process.env.UV_TRIGGER_WASTE_COUNT)    || 10,
  mistHumidity:  Number(process.env.MIST_TRIGGER_HUMIDITY)     || 80,
};

let wsServer = null; // WebSocket broadcast reference

function setWebSocketServer(ws) {
  wsServer = ws;
}

function broadcastAlert(alert) {
  if (wsServer) {
    wsServer.clients?.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: 'ALERT', payload: alert }));
      }
    });
  }
}

async function createAlert({ type, severity, message, stationId, data = {} }) {
  const alert = {
    alertId:   uuidv4(),
    timestamp: new Date().toISOString(),
    type,
    severity,
    message,
    stationId,
    status: 'ACTIVE',
    data,
  };
  await putAlert(alert);
  broadcastAlert(alert);
  console.log(`🚨 ALERT [${severity}] ${type}: ${message}`);
  return alert;
}

// ─── Smart Alert Evaluation ────────────────────────────────────────────────────
async function evaluateWasteEntry(entry) {
  const alerts = [];

  // Bin capacity alert
  const cap = entry.ultrasonic?.binCapacityPercent || 0;
  if (cap >= THRESHOLDS.binCritical) {
    alerts.push(await createAlert({
      type: ALERT_TYPES.BIN_CAPACITY, severity: SEVERITY.CRITICAL,
      message: `Bin is ${cap}% full — immediate emptying required!`,
      stationId: entry.stationId, data: { binCapacityPercent: cap },
    }));
  } else if (cap >= THRESHOLDS.binWarning) {
    alerts.push(await createAlert({
      type: ALERT_TYPES.BIN_CAPACITY, severity: SEVERITY.WARNING,
      message: `Bin is ${cap}% full — please plan for emptying.`,
      stationId: entry.stationId, data: { binCapacityPercent: cap },
    }));
  }

  // High financial loss alert
  const loss = entry.loadCell?.financialLoss || 0;
  if (loss >= THRESHOLDS.financialLoss) {
    alerts.push(await createAlert({
      type: ALERT_TYPES.FINANCIAL_LOSS, severity: SEVERITY.WARNING,
      message: `High financial loss detected: $${loss.toFixed(2)} in a single event.`,
      stationId: entry.stationId, data: { financialLoss: loss },
    }));
  }

  // Unknown RFID tag
  if (entry.rfid?.wasteType === 'UNKNOWN' || !entry.rfid?.tagId) {
    alerts.push(await createAlert({
      type: ALERT_TYPES.RFID_UNKNOWN, severity: SEVERITY.INFO,
      message: `Unidentified waste type detected — manual classification required.`,
      stationId: entry.stationId, data: { rfid: entry.rfid },
    }));
  }

  // Hygiene risk — high weight + no sanitization
  if ((entry.loadCell?.weightKg || 0) >= THRESHOLDS.weightKg && !entry.sanitization?.uvActivated) {
    alerts.push(await createAlert({
      type: ALERT_TYPES.HYGIENE_RISK, severity: SEVERITY.WARNING,
      message: `Large waste event without sanitization — UV-C/Mist recommended.`,
      stationId: entry.stationId, data: { weightKg: entry.loadCell?.weightKg },
    }));
  }

  return alerts;
}

module.exports = {
  setWebSocketServer,
  createAlert,
  evaluateWasteEntry,
  resolveAlert,
  getActiveAlerts,
  SEVERITY,
  ALERT_TYPES,
  THRESHOLDS,
};
