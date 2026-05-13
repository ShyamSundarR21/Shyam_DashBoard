'use strict';

const crypto = require('crypto');

// ─── In-Memory Mock Store for Demo Mode ──────────────────────────────────────
const MOCK_STORE = {
  waste: [],
  sensors: [],
  ledger: [],
  alerts: [],
};

// Initialize with sample data
function initializeMockData() {
  const types = ['FOOD', 'PLASTIC', 'ORGANIC'];
  const now = new Date();

  // Generate sample waste entries
  for (let i = 0; i < 15; i++) {
    const timestamp = new Date(now - i * 15 * 60000).toISOString();
    const type = types[Math.floor(Math.random() * 3)];
    const weight = parseFloat((Math.random() * 5).toFixed(2));
    const cost = parseFloat((weight * 8.5).toFixed(2));

    MOCK_STORE.waste.push({
      entryId: `ENTRY-${String(i + 1).padStart(6, '0')}`,
      stationId: 'STATION-001',
      timestamp,
      wasteType: type,
      weight,
      cost,
      rfidTag: `TAG-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
      binCapacity: Math.floor(Math.random() * 100),
      hygieneScore: Math.floor(70 + Math.random() * 30),
      hash: `0x${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    });
  }

  // Generate ledger blocks
  MOCK_STORE.waste.forEach((entry, i) => {
    const prevHash = i === 0 ? '0x0000000000000000' : MOCK_STORE.ledger[i - 1].hash;
    const block = {
      blockNumber: i + 1,
      timestamp: entry.timestamp,
      entryId: entry.entryId,
      wasteType: entry.wasteType,
      weight: entry.weight,
      cost: entry.cost,
      previousHash: prevHash,
      hash: `0x${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
      verified: true,
    };
    MOCK_STORE.ledger.push(block);
  });

  // Generate sensor readings (every 3 seconds for last hour)
  for (let i = 0; i < 20; i++) {
    const timestamp = new Date(now - i * 180000).toISOString();
    MOCK_STORE.sensors.push({
      readingId: `READ-${String(i + 1).padStart(6, '0')}`,
      stationId: 'STATION-001',
      timestamp,
      rfid: {
        active: Math.random() > 0.3,
        wasteType: types[Math.floor(Math.random() * 3)],
        signalStrength: -45 - Math.floor(Math.random() * 20),
      },
      loadCell: {
        weightGrams: Math.floor(Math.random() * 2000),
        weightKg: parseFloat((Math.random() * 2).toFixed(2)),
      },
      ultrasonic: {
        binCapacityPercent: Math.floor(Math.random() * 100),
        binStatus: 'NORMAL',
      },
      environment: {
        temperature: parseFloat((22 + Math.random() * 5).toFixed(1)),
        humidity: Math.floor(45 + Math.random() * 40),
        hygieneScore: Math.floor(70 + Math.random() * 30),
      },
    });
  }

  console.log('✅ Mock data initialized:', {
    waste: MOCK_STORE.waste.length,
    sensors: MOCK_STORE.sensors.length,
    ledger: MOCK_STORE.ledger.length,
  });
}

// Initialize on module load
initializeMockData();

const isMockMode = () => true; // Always demo mode for dashboard

// ─── Create DynamoDB Tables ───────────────────────────────────────────────────
async function createTablesIfNotExist() {
  return console.log('✅ DEMO MODE: Using In-Memory Database');
}

// ─── WASTE ENTRIES ────────────────────────────────────────────────────────────
async function putWasteEntry(entry) {
  MOCK_STORE.waste.unshift(entry);
  return entry;
}

async function getWasteEntries(stationId, limit = 50) {
  const items = MOCK_STORE.waste.slice(0, limit);
  return { items, nextKey: null };
}

async function getWasteByDateRange(stationId, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return MOCK_STORE.waste.filter(w => {
    const wTime = new Date(w.timestamp);
    return wTime >= start && wTime <= end;
  });
}

// ─── SENSOR READINGS ──────────────────────────────────────────────────────────
async function putSensorReading(reading) {
  MOCK_STORE.sensors.unshift(reading);
  return reading;
}

async function getLatestSensorReading(stationId) {
  return MOCK_STORE.sensors[0] || null;
}

async function getSensorReadings(stationId, limit = 50) {
  return MOCK_STORE.sensors.slice(0, limit);
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
async function getWasteAnalytics(stationId, days = 7) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const filtered = MOCK_STORE.waste.filter(w => new Date(w.timestamp) >= cutoff);

  const byType = { FOOD: 0, PLASTIC: 0, ORGANIC: 0 };
  let totalWeight = 0;
  let totalCost = 0;
  let count = 0;

  filtered.forEach(w => {
    byType[w.wasteType] = (byType[w.wasteType] || 0) + 1;
    totalWeight += w.weight;
    totalCost += w.cost;
    count += 1;
  });

  return {
    totalEntries: count,
    totalWeightKg: parseFloat(totalWeight.toFixed(2)),
    totalFinancialLoss: parseFloat(totalCost.toFixed(2)),
    byWasteType: byType,
    avgWeightPerEntry: count > 0 ? parseFloat((totalWeight / count).toFixed(2)) : 0,
    avgCostPerEntry: count > 0 ? parseFloat((totalCost / count).toFixed(2)) : 0,
  };
}

// ─── LEDGER ───────────────────────────────────────────────────────────────────
async function appendLedgerBlock(stationId, entryId, timestamp, data) {
  const blockNumber = MOCK_STORE.ledger.length + 1;
  const previousHash = MOCK_STORE.ledger.length > 0
    ? MOCK_STORE.ledger[MOCK_STORE.ledger.length - 1].hash
    : '0x0000000000000000';

  const blockData = JSON.stringify({ stationId, entryId, timestamp, ...data });
  const blockHash = '0x' + crypto
    .createHash('sha256')
    .update(blockData + previousHash)
    .digest('hex')
    .substring(0, 16)
    .toUpperCase();

  const block = {
    blockNumber,
    stationId,
    entryId,
    timestamp,
    data,
    previousHash,
    blockHash,
    verified: true,
  };

  MOCK_STORE.ledger.unshift(block);
  return block;
}

async function getLedger(stationId, limit = 50) {
  return MOCK_STORE.ledger.slice(0, limit);
}

async function verifyLedgerIntegrity(stationId) {
  let valid = true;
  let lastHash = '0x0000000000000000';

  for (let i = MOCK_STORE.ledger.length - 1; i >= 0; i--) {
    const block = MOCK_STORE.ledger[i];
    if (block.previousHash !== lastHash) {
      valid = false;
      break;
    }
    lastHash = block.blockHash;
  }

  return {
    valid,
    stationId,
    totalBlocks: MOCK_STORE.ledger.length,
    lastBlockHash: lastHash,
  };
}

// ─── ALERTS ───────────────────────────────────────────────────────────────────
async function putAlert(alert) {
  MOCK_STORE.alerts.unshift(alert);
  return alert;
}

async function getActiveAlerts(stationId = 'STATION-001') {
  return MOCK_STORE.alerts.filter(a => !a.resolved);
}

async function resolveAlert(alertId, timestamp) {
  const alert = MOCK_STORE.alerts.find(a => a.alertId === alertId);
  if (alert) {
    alert.resolved = true;
    alert.resolvedAt = timestamp;
  }
  return alert;
}

// ─── Exporting all functions ──────────────────────────────────────────────────
module.exports = {
  createTablesIfNotExist,
  putWasteEntry,
  getWasteEntries,
  getWasteAnalytics,
  getWasteByDateRange,
  putSensorReading,
  getLatestSensorReading,
  getSensorReadings,
  appendLedgerBlock,
  getLedger,
  verifyLedgerIntegrity,
  putAlert,
  getActiveAlerts,
  resolveAlert,
  // Exposed for testing
  MOCK_STORE,
  initializeMockData,
};
