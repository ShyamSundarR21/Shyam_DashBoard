'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../services/dynamodb');

// ─── GET /api/waste ───────────────────────────────────────────────────────────
// Returns today's waste summary for dashboard
router.get('/', async (req, res) => {
  try {
    const stationId = req.query.stationId || 'STATION-001';
    
    // Get today's analytics
    const today = await db.getWasteAnalytics(stationId, 1);
    const yesterday = await db.getWasteAnalytics(stationId, 2); // Get 2 days to isolate yesterday
    
    // Get waste entries by type
    const allEntries = await db.getWasteEntries(stationId, 1000);
    const items = allEntries.items || [];

    const wasteByType = [
      {
        type: 'FOOD',
        count: items.filter(i => i.wasteType === 'FOOD').length,
        weight: items.filter(i => i.wasteType === 'FOOD').reduce((s, i) => s + (i.weight || 0), 0),
        cost: items.filter(i => i.wasteType === 'FOOD').reduce((s, i) => s + (i.cost || 0), 0),
      },
      {
        type: 'PLASTIC',
        count: items.filter(i => i.wasteType === 'PLASTIC').length,
        weight: items.filter(i => i.wasteType === 'PLASTIC').reduce((s, i) => s + (i.weight || 0), 0),
        cost: items.filter(i => i.wasteType === 'PLASTIC').reduce((s, i) => s + (i.cost || 0), 0),
      },
      {
        type: 'ORGANIC',
        count: items.filter(i => i.wasteType === 'ORGANIC').length,
        weight: items.filter(i => i.wasteType === 'ORGANIC').reduce((s, i) => s + (i.weight || 0), 0),
        cost: items.filter(i => i.wasteType === 'ORGANIC').reduce((s, i) => s + (i.cost || 0), 0),
      },
    ];

    const data = {
      totalWaste: today.totalWeightKg,
      foodWaste: wasteByType.find(w => w.type === 'FOOD')?.weight || 0,
      plasticWaste: wasteByType.find(w => w.type === 'PLASTIC')?.weight || 0,
      organicWaste: wasteByType.find(w => w.type === 'ORGANIC')?.weight || 0,
      financialLoss: today.totalFinancialLoss,
      trend: 'up',
      percentChange: 12.5,
      wasteByType: wasteByType.map(w => ({
        ...w,
        weight: parseFloat(w.weight.toFixed(2)),
        cost: parseFloat(w.cost.toFixed(2)),
      })),
    };

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
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

// ─── GET /api/waste/entries ───────────────────────────────────────────────────
// Raw waste entries
router.get('/entries', async (req, res) => {
  try {
    const stationId = req.query.stationId || 'STATION-001';
    const limit = Math.min(parseInt(req.query.limit) || 50, 500);
    const { items, nextKey } = await db.getWasteEntries(stationId, limit);
    res.json({ success: true, count: items.length, nextKey, data: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
