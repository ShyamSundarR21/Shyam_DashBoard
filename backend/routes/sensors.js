'use strict';

const express  = require('express');
const router   = express.Router();
const { v4: uuidv4 } = require('uuid');
const WasteEntry   = require('../models/WasteEntry');
const SensorReading = require('../models/SensorReading');
const db = require('../services/dynamodb');
const { evaluateWasteEntry } = require('../services/alertService');
const { autoSanitize }       = require('../services/sanitizationService');

// Broadcast to WebSocket clients (injected by server)
let broadcast = null;
const setBroadcast = (fn) => { broadcast = fn; };

// ─── GET /api/sensors ─────────────────────────────────────────────────────────
// Returns current sensor data for dashboard
router.get('/', async (req, res) => {
  try {
    const stationId = req.query.stationId || 'STATION-001';
    const reading   = await db.getLatestSensorReading(stationId);
    if (!reading) {
      return res.json({ success: true, message: 'No readings yet', data: mockSensorReading(stationId) });
    }
    res.json({ success: true, data: reading });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/sensors/latest ──────────────────────────────────────────────────
router.get('/latest', async (req, res) => {
  try {
    const stationId = req.query.stationId || 'STATION-001';
    const reading   = await db.getLatestSensorReading(stationId);
    if (!reading) {
      return res.json({ message: 'No readings yet', mock: true, data: mockSensorReading(stationId) });
    }
    res.json({ success: true, data: reading });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/sensors/history ─────────────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const stationId = req.query.stationId || 'STATION-001';
    const limit     = Math.min(parseInt(req.query.limit) || 50, 500);
    const readings  = await db.getSensorReadings(stationId, limit);
    res.json({ success: true, count: readings.length, data: readings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/sensors/reading ────────────────────────────────────────────────
// Called by ESP32 directly (or via IoT Lambda) to ingest raw sensor data
router.post('/reading', async (req, res) => {
  try {
    const reading = new SensorReading({ ...req.body, readingId: uuidv4(), timestamp: new Date().toISOString() });
    await db.putSensorReading(reading);

    // Broadcast live to dashboard WebSocket
    if (broadcast) broadcast({ type: 'SENSOR_UPDATE', payload: reading.toItem() });

    res.status(201).json({ success: true, readingId: reading.readingId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/sensors/waste-event ───────────────────────────────────────────
// Full waste detection + ledger + sanitization pipeline
router.post('/waste-event', async (req, res) => {
  try {
    const entry  = new WasteEntry({ ...req.body, entryId: uuidv4(), timestamp: new Date().toISOString() });
    const errors = entry.validate();
    if (errors.length) return res.status(400).json({ errors });

    // 1. Persist waste entry
    await db.putWasteEntry(entry);

    // 2. Append to immutable ledger
    const block = await db.appendLedgerBlock(
      entry.stationId, entry.entryId, entry.timestamp, entry.toItem()
    );

    // 3. Evaluate alerts
    const alerts = await evaluateWasteEntry(entry.toItem());

    // 4. Trigger auto-sanitization
    const sanitizationResult = await autoSanitize(entry.stationId, entry.toItem());

    // 5. Broadcast to dashboard
    if (broadcast) {
      broadcast({ type: 'WASTE_EVENT', payload: { entry: entry.toItem(), block, alerts } });
    }

    res.status(201).json({
      success: true,
      entryId: entry.entryId,
      blockNumber: block.blockNumber,
      blockHash:   block.blockHash,
      alertsTriggered: alerts.length,
      sanitization: sanitizationResult,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/sensors/mock ────────────────────────────────────────────────────
// Generate mock data for demo/testing
router.get('/mock', (req, res) => {
  const stationId = req.query.stationId || 'STATION-001';
  res.json({
    sensor: mockSensorReading(stationId),
    wasteEvent: mockWasteEntry(stationId),
  });
});

// ─── Mock Generators ──────────────────────────────────────────────────────────
function mockSensorReading(stationId) {
  const binPct = Math.floor(Math.random() * 100);
  return {
    readingId:  uuidv4(), stationId, timestamp: new Date().toISOString(),
    rfid:       { active: true, tagId: `TAG-${Math.floor(Math.random()*9999)}`, wasteType: randomWasteType(), readCount: 1, signalStrength: -45 },
    loadCell:   { weightGrams: Math.floor(Math.random()*2000), weightKg: +(Math.random()*2).toFixed(2), stable: true },
    ultrasonic: { distanceCm: Math.floor(Math.random()*60), binCapacityPercent: binPct, binStatus: binPct > 85 ? 'CRITICAL' : binPct > 60 ? 'WARNING' : 'NORMAL' },
    environment:{ temperature: +(20 + Math.random()*10).toFixed(1), humidity: Math.floor(40 + Math.random()*50), hygieneScore: Math.floor(60 + Math.random()*40) },
    system:     { wifiRSSI: -55, freeHeap: 180000, uptime: Date.now(), firmwareVersion: '1.2.3', batteryVolt: 3.7 },
  };
}

function mockWasteEntry(stationId) {
  const wt   = randomWasteType();
  const wkg  = +(Math.random()*3).toFixed(2);
  const cost = +(wkg * (2 + Math.random()*8)).toFixed(2);
  const cap  = Math.floor(Math.random()*100);
  return {
    entryId: uuidv4(), stationId, timestamp: new Date().toISOString(),
    rfid:        { tagId: `TAG-${Math.floor(Math.random()*9999)}`, wasteType: wt, confidence: Math.floor(70+Math.random()*30) },
    loadCell:    { weightGrams: Math.round(wkg*1000), weightKg: wkg, financialLoss: cost, currency: 'USD', costPerKg: +(cost/wkg).toFixed(2) },
    ultrasonic:  { distanceCm: Math.floor(60-cap*0.6), binCapacityPercent: cap, binStatus: cap>85?'CRITICAL':cap>60?'WARNING':'NORMAL' },
    sorting:     { sortedTo: `BIN_${wt}`, sortSuccess: true, motorRuntime: 1200 },
    sanitization:{ uvActivated: wkg>1, mistActivated: wt==='FOOD', uvDurationSec: 30, mistDurationSec: 10 },
  };
}

function randomWasteType() {
  const types = ['FOOD','PLASTIC','ORGANIC','LIQUID','PAPER','METAL'];
  return types[Math.floor(Math.random()*types.length)];
}

module.exports = router;
module.exports.setBroadcast = setBroadcast;
