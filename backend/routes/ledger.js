'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../services/dynamodb');

// ─── GET /api/ledger ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const stationId = req.query.stationId || 'STATION-001';
    const limit     = Math.min(parseInt(req.query.limit) || 50, 500);
    const blocks    = await db.getLedger(stationId, limit);
    
    // Format blocks as expected by frontend
    const data = blocks.map((block, idx) => ({
      id: block.entryId || `ENTRY-${String(idx + 1).padStart(6, '0')}`,
      timestamp: block.timestamp,
      wasteType: block.data?.wasteType || block.wasteType || 'UNKNOWN',
      weight: block.data?.weight || 0,
      cost: block.data?.cost || 0,
      hash: block.blockHash,
      hygieneScore: block.data?.environment?.hygieneScore || 75,
      blockNumber: block.blockNumber,
    }));
    
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/ledger/verify ───────────────────────────────────────────────────
// Runs full hash chain verification to prove ledger integrity
router.get('/verify', async (req, res) => {
  try {
    const stationId = req.query.stationId || 'STATION-001';
    const result    = await db.verifyLedgerIntegrity(stationId);
    res.json({
      success: true,
      stationId,
      integrity: result.valid ? '✅ INTACT' : '❌ COMPROMISED',
      ...result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/ledger/block/:blockNumber ───────────────────────────────────────
router.get('/block/:blockNumber', async (req, res) => {
  try {
    const stationId   = req.query.stationId || 'STATION-001';
    const blockNumber = parseInt(req.params.blockNumber);
    const blocks      = await db.getLedger(stationId, 1000);
    const block       = blocks.find(b => b.blockNumber === blockNumber);
    if (!block) return res.status(404).json({ error: 'Block not found' });
    res.json({ success: true, data: block });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/ledger/export ───────────────────────────────────────────────────
router.get('/export', async (req, res) => {
  try {
    const stationId = req.query.stationId || 'STATION-001';
    const blocks    = await db.getLedger(stationId, 10000);
    res.setHeader('Content-Disposition', `attachment; filename=dinewave-ledger-${stationId}-${Date.now()}.json`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ exportedAt: new Date().toISOString(), stationId, totalBlocks: blocks.length, blocks }, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
