'use strict';

const {
  PutCommand, GetCommand, QueryCommand,
  ScanCommand, UpdateCommand, DeleteCommand,
  TransactWriteCommand,
} = require('@aws-sdk/lib-dynamodb');
const {
  CreateTableCommand, DescribeTableCommand,
  ListTablesCommand,
} = require('@aws-sdk/client-dynamodb');
const { docClient, TABLES } = require('../config/aws');
const crypto = require('crypto');

// ─── Table Definitions ────────────────────────────────────────────────────────
const TABLE_DEFINITIONS = {
  [TABLES.WASTE]: {
    TableName: TABLES.WASTE,
    KeySchema: [
      { AttributeName: 'stationId', KeyType: 'HASH' },
      { AttributeName: 'timestamp', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'stationId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' },
      { AttributeName: 'entryId',   AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [{
      IndexName: 'EntryIdIndex',
      KeySchema: [{ AttributeName: 'entryId', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  [TABLES.SENSOR]: {
    TableName: TABLES.SENSOR,
    KeySchema: [
      { AttributeName: 'stationId', KeyType: 'HASH' },
      { AttributeName: 'timestamp', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'stationId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  [TABLES.LEDGER]: {
    TableName: TABLES.LEDGER,
    KeySchema: [
      { AttributeName: 'stationId',   KeyType: 'HASH' },
      { AttributeName: 'blockNumber', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'stationId',   AttributeType: 'S' },
      { AttributeName: 'blockNumber', AttributeType: 'N' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  [TABLES.ALERTS]: {
    TableName: TABLES.ALERTS,
    KeySchema: [
      { AttributeName: 'alertId',   KeyType: 'HASH' },
      { AttributeName: 'timestamp', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'alertId',   AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
};

// ─── Create DynamoDB Tables ───────────────────────────────────────────────────
async function createTablesIfNotExist() {
  const { TableNames } = await docClient.send(new ListTablesCommand({}));
  for (const [name, def] of Object.entries(TABLE_DEFINITIONS)) {
    if (!TableNames.includes(name)) {
      await docClient.send(new CreateTableCommand(def));
      console.log(`✅ Created DynamoDB table: ${name}`);
    } else {
      console.log(`✔  Table exists: ${name}`);
    }
  }
}

// ─── Compute SHA-256 Block Hash (Immutable Ledger) ───────────────────────────
function computeBlockHash(entryId, timestamp, prevHash, data) {
  const content = JSON.stringify({ entryId, timestamp, prevHash, data });
  return crypto.createHash('sha256').update(content).digest('hex');
}

// ─── WASTE ENTRIES ────────────────────────────────────────────────────────────

async function putWasteEntry(entry) {
  const item = entry.toItem ? entry.toItem() : entry;
  await docClient.send(new PutCommand({ TableName: TABLES.WASTE, Item: item }));
  return item;
}

async function getWasteEntries(stationId, limit = 50, lastKey = null) {
  const params = {
    TableName: TABLES.WASTE,
    KeyConditionExpression: 'stationId = :sid',
    ExpressionAttributeValues: { ':sid': stationId },
    ScanIndexForward: false,
    Limit: limit,
  };
  if (lastKey) params.ExclusiveStartKey = lastKey;
  const result = await docClient.send(new QueryCommand(params));
  return { items: result.Items, nextKey: result.LastEvaluatedKey };
}

async function getWasteByDateRange(stationId, startDate, endDate) {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.WASTE,
    KeyConditionExpression: 'stationId = :sid AND #ts BETWEEN :start AND :end',
    ExpressionAttributeNames: { '#ts': 'timestamp' },
    ExpressionAttributeValues: {
      ':sid':   stationId,
      ':start': startDate,
      ':end':   endDate,
    },
    ScanIndexForward: false,
  }));
  return result.Items;
}

// ─── SENSOR READINGS ─────────────────────────────────────────────────────────

async function putSensorReading(reading) {
  const item = reading.toItem ? reading.toItem() : reading;
  await docClient.send(new PutCommand({ TableName: TABLES.SENSOR, Item: item }));
  return item;
}

async function getLatestSensorReading(stationId) {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.SENSOR,
    KeyConditionExpression: 'stationId = :sid',
    ExpressionAttributeValues: { ':sid': stationId },
    ScanIndexForward: false,
    Limit: 1,
  }));
  return result.Items[0] || null;
}

async function getSensorReadings(stationId, limit = 100) {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.SENSOR,
    KeyConditionExpression: 'stationId = :sid',
    ExpressionAttributeValues: { ':sid': stationId },
    ScanIndexForward: false,
    Limit: limit,
  }));
  return result.Items;
}

// ─── IMMUTABLE LEDGER ─────────────────────────────────────────────────────────

async function getLastLedgerBlock(stationId) {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.LEDGER,
    KeyConditionExpression: 'stationId = :sid',
    ExpressionAttributeValues: { ':sid': stationId },
    ScanIndexForward: false,
    Limit: 1,
  }));
  return result.Items[0] || null;
}

async function appendLedgerBlock(stationId, entryId, timestamp, data) {
  const lastBlock = await getLastLedgerBlock(stationId);
  const prevHash    = lastBlock?.blockHash   || '0000000000000000';
  const blockNumber = lastBlock ? (lastBlock.blockNumber + 1) : 0;
  const blockHash   = computeBlockHash(entryId, timestamp, prevHash, data);

  const block = {
    stationId,
    blockNumber,
    entryId,
    timestamp,
    prevHash,
    blockHash,
    data,
    immutable: true,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({
    TableName: TABLES.LEDGER,
    Item: block,
    // Ensure block number is never overwritten
    ConditionExpression: 'attribute_not_exists(blockNumber)',
  }));
  return block;
}

async function getLedger(stationId, limit = 100) {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.LEDGER,
    KeyConditionExpression: 'stationId = :sid',
    ExpressionAttributeValues: { ':sid': stationId },
    ScanIndexForward: false,
    Limit: limit,
  }));
  return result.Items;
}

async function verifyLedgerIntegrity(stationId) {
  const blocks = await getLedger(stationId, 1000);
  const sorted  = blocks.sort((a, b) => a.blockNumber - b.blockNumber);
  const issues  = [];

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    const prev = sorted[i - 1];
    if (curr.prevHash !== prev.blockHash) {
      issues.push({
        blockNumber: curr.blockNumber,
        issue: 'HASH_MISMATCH',
        expected: prev.blockHash,
        found: curr.prevHash,
      });
    }
    const recomputed = computeBlockHash(curr.entryId, curr.timestamp, curr.prevHash, curr.data);
    if (recomputed !== curr.blockHash) {
      issues.push({ blockNumber: curr.blockNumber, issue: 'TAMPERED_BLOCK' });
    }
  }
  return { valid: issues.length === 0, totalBlocks: sorted.length, issues };
}

// ─── ALERTS ───────────────────────────────────────────────────────────────────

async function putAlert(alert) {
  await docClient.send(new PutCommand({ TableName: TABLES.ALERTS, Item: alert }));
  return alert;
}

async function getActiveAlerts() {
  const result = await docClient.send(new ScanCommand({
    TableName: TABLES.ALERTS,
    FilterExpression: '#s = :active',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':active': 'ACTIVE' },
  }));
  return result.Items;
}

async function resolveAlert(alertId, timestamp) {
  await docClient.send(new UpdateCommand({
    TableName: TABLES.ALERTS,
    Key: { alertId, timestamp },
    UpdateExpression: 'SET #s = :resolved, resolvedAt = :now',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: {
      ':resolved': 'RESOLVED',
      ':now':      new Date().toISOString(),
    },
  }));
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

async function getWasteAnalytics(stationId, days = 7) {
  const startDate = new Date(Date.now() - days * 86400000).toISOString();
  const endDate   = new Date().toISOString();
  const entries   = await getWasteByDateRange(stationId, startDate, endDate);

  const analytics = {
    totalEntries:      entries.length,
    totalWeightKg:     0,
    totalFinancialLoss:0,
    wasteTypeBreakdown:{},
    dailyLoss:         {},
    avgBinCapacity:    0,
    sanitizationCount: { uv: 0, mist: 0 },
  };

  entries.forEach(e => {
    analytics.totalWeightKg      += (e.loadCell?.weightKg     || 0);
    analytics.totalFinancialLoss += (e.loadCell?.financialLoss || 0);

    const wt = e.rfid?.wasteType || 'UNKNOWN';
    analytics.wasteTypeBreakdown[wt] = (analytics.wasteTypeBreakdown[wt] || 0) + 1;

    const day = e.timestamp?.substring(0, 10);
    if (day) analytics.dailyLoss[day] = (analytics.dailyLoss[day] || 0) + (e.loadCell?.financialLoss || 0);

    analytics.avgBinCapacity += (e.ultrasonic?.binCapacityPercent || 0);
    if (e.sanitization?.uvActivated)   analytics.sanitizationCount.uv++;
    if (e.sanitization?.mistActivated) analytics.sanitizationCount.mist++;
  });

  if (entries.length > 0) {
    analytics.avgBinCapacity = +(analytics.avgBinCapacity / entries.length).toFixed(1);
    analytics.totalWeightKg  = +analytics.totalWeightKg.toFixed(2);
    analytics.totalFinancialLoss = +analytics.totalFinancialLoss.toFixed(2);
  }
  return analytics;
}

module.exports = {
  createTablesIfNotExist,
  computeBlockHash,
  putWasteEntry,
  getWasteEntries,
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
  getWasteAnalytics,
};
