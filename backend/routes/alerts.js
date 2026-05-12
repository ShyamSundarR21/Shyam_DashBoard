'use strict';

const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getActiveAlerts, resolveAlert, createAlert, SEVERITY, ALERT_TYPES } = require('../services/alertService');

// ─── GET /api/alerts ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const alerts = await getActiveAlerts();
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/alerts ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { type, severity, message, stationId, data } = req.body;
    if (!type || !severity || !message || !stationId) {
      return res.status(400).json({ error: 'type, severity, message, stationId are required' });
    }
    const alert = await createAlert({ type, severity, message, stationId, data });
    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/alerts/:alertId/resolve ────────────────────────────────────────
router.put('/:alertId/resolve', async (req, res) => {
  try {
    const { alertId }  = req.params;
    const { timestamp } = req.body;
    if (!timestamp) return res.status(400).json({ error: 'timestamp is required' });
    await resolveAlert(alertId, timestamp);
    res.json({ success: true, message: 'Alert resolved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/alerts/types ────────────────────────────────────────────────────
router.get('/types', (req, res) => {
  res.json({ success: true, types: ALERT_TYPES, severities: SEVERITY });
});

module.exports = router;
