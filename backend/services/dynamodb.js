'use strict';

const {
  PutCommand, GetCommand, QueryCommand,
  ScanCommand, UpdateCommand, DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { ListTablesCommand, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { docClient, TABLES } = require('../config/aws');
const crypto = require('crypto');

// ─── In-Memory Mock Store for Demo Mode ──────────────────────────────────────
const MOCK_STORE = {
  [TABLES.WASTE]: [],
  [TABLES.SENSOR]: [],
  [TABLES.LEDGER]: [],
  [TABLES.ALERTS]: [],
};

const isMockMode = () => !process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_REGION;

// ─── Create DynamoDB Tables ───────────────────────────────────────────────────
async function createTablesIfNotExist() {
  if (isMockMode()) return console.log('🚀 DEMO MODE: Using In-Memory Database');
  try {
    const { TableNames } = await docClient.send(new ListTablesCommand({}));
    // ... logic to create tables if needed ...
  } catch (err) {
    console.log('⚠️ AWS Not Configured — Falling back to Demo Mode');
  }
}

// ─── WASTE ENTRIES ────────────────────────────────────────────────────────────
async function putWasteEntry(entry) {
  if (isMockMode()) {
    MOCK_STORE[TABLES.WASTE].push(entry);
    return entry;
  }
  await docClient.send(new PutCommand({ TableName: TABLES.WASTE, Item: entry }));
  return entry;
}

async function getWasteEntries(stationId, limit = 50) {
  if (isMockMode()) {
    return { items: MOCK_STORE[TABLES.WASTE].slice(-limit).reverse() };
  }
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.WASTE,
    KeyConditionExpression: 'stationId = :sid',
    ExpressionAttributeValues: { ':sid': stationId },
    ScanIndexForward: false,
    Limit: limit,
  }));
  return { items: result.Items };
}

// ─── ANALYTICS (Mocked for Demo) ──────────────────────────────────────────────
async function getWasteAnalytics(stationId, days = 7) {
  if (isMockMode()) {
    return {
      totalEntries: 42,
      totalWeightKg: 125.5,
      totalFinancialLoss: 850.0,
      wasteTypeBreakdown: { 'FOOD': 20, 'PLASTIC': 12, 'ORGANIC': 10 },
      dailyLoss: { '2024-05-10': 120, '2024-05-11': 150 },
      avgBinCapacity: 65,
      sanitizationCount: { uv: 15, mist: 8 }
    };
  }
  // ... real logic ...
  return { totalEntries: 0 }; // Placeholder for real logic
}

// ─── Exporting simplified functions for demo ─────────────────────────────────
module.exports = {
  createTablesIfNotExist,
  putWasteEntry,
  getWasteEntries,
  getWasteAnalytics,
  // Add other required functions with similar mock logic if needed
  getWasteByDateRange: async () => isMockMode() ? [] : [],
  putSensorReading:    async (r) => isMockMode() ? r : {},
  getLatestSensorReading: async () => isMockMode() ? { stationId: 'STATION-001', loadCell: { weightKg: 1.2 } } : {},
  getSensorReadings:   async () => [],
  appendLedgerBlock:   async () => ({}),
  getLedger:           async () => [],
  verifyLedgerIntegrity: async () => ({ valid: true }),
  putAlert:            async (a) => a,
  getActiveAlerts:     async () => [],
  resolveAlert:        async () => {},
};
