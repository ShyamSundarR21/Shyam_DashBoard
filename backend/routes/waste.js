'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../services/dynamodb');

// ─── GET /api/waste ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const stationId = req.query.stationId || 'STATION-001';
    const limit     = Math.min(parseInt(req.query.limit) || 50, 500);
    const { items, nextKey } = await db.getWasteEntries(stationId, limit);
    res.json({ success: true, count: items.length, nextKey, data: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/waste/analytics ─────────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const stationId = req.query.stationId || 'STATION-001';
    const days      = parseInt(req.query.days) || 7;
    const analytics = await db.getWasteAnalytics(stationId, days);
    res.json({ success: true, stationId, days, data: analytics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/waste/date-range ────────────────────────────────────────────────
router.get('/date-range', async (req, res) => {
  try {
    const { stationId = 'STATION-001', startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    const entries = await db.getWasteByDateRange(stationId, startDate, endDate);
    res.json({ success: true, count: entries.length, data: entries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/waste/summary ───────────────────────────────────────────────────
// Quick daily/weekly/monthly summary cards
router.get('/summary', async (req, res) => {
  try {
    const stationId = req.query.stationId || 'STATION-001';
    const [daily, weekly, monthly] = await Promise.all([
      db.getWasteAnalytics(stationId, 1),
      db.getWasteAnalytics(stationId, 7),
      db.getWasteAnalytics(stationId, 30),
    ]);
    res.json({
      success: true,
      stationId,
      summary: { daily, weekly, monthly },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
