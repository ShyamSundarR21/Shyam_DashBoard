'use strict';

/**
 * AWS Lambda Function — IoT Core Sensor Processor
 * Triggered by AWS IoT Core Rule Engine.
 * Processes incoming ESP32 sensor payloads and persists to DynamoDB.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const client    = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLES = {
  WASTE:  process.env.DYNAMODB_WASTE_TABLE  || 'dinewave-waste-entries',
  SENSOR: process.env.DYNAMODB_SENSOR_TABLE || 'dinewave-sensor-readings',
  LEDGER: process.env.DYNAMODB_LEDGER_TABLE || 'dinewave-immutable-ledger',
  ALERTS: process.env.DYNAMODB_ALERTS_TABLE || 'dinewave-alerts',
};

function computeHash(entryId, timestamp, prevHash, data) {
  return crypto.createHash('sha256')
    .update(JSON.stringify({ entryId, timestamp, prevHash, data }))
    .digest('hex');
}

async function getLastBlock(stationId) {
  const res = await docClient.send(new QueryCommand({
    TableName: TABLES.LEDGER,
    KeyConditionExpression: 'stationId = :sid',
    ExpressionAttributeValues: { ':sid': stationId },
    ScanIndexForward: false,
    Limit: 1,
  }));
  return res.Items[0] || null;
}

async function appendLedger(stationId, entryId, timestamp, data) {
  const last        = await getLastBlock(stationId);
  const prevHash    = last?.blockHash   || '0000000000000000';
  const blockNumber = last ? (last.blockNumber + 1) : 0;
  const blockHash   = computeHash(entryId, timestamp, prevHash, data);

  await docClient.send(new PutCommand({
    TableName: TABLES.LEDGER,
    Item: { stationId, blockNumber, entryId, timestamp, prevHash, blockHash, data, immutable: true, createdAt: new Date().toISOString() },
    ConditionExpression: 'attribute_not_exists(blockNumber)',
  }));
  return { blockNumber, blockHash };
}

function classifyBinStatus(pct) {
  if (pct >= 95) return 'FULL';
  if (pct >= 85) return 'CRITICAL';
  if (pct >= 60) return 'WARNING';
  return 'NORMAL';
}

function shouldTriggerAlert(payload) {
  const alerts = [];
  const cap = payload.ultrasonic?.binCapacityPercent || 0;
  if (cap >= 85) alerts.push({ type: 'BIN_CAPACITY', severity: cap >= 95 ? 'CRITICAL' : 'WARNING', message: `Bin at ${cap}%` });
  if ((payload.loadCell?.financialLoss || 0) >= 50) alerts.push({ type: 'FINANCIAL_LOSS', severity: 'WARNING', message: `Loss: $${payload.loadCell.financialLoss}` });
  return alerts;
}

// ─── Lambda Handler ───────────────────────────────────────────────────────────
exports.handler = async (event) => {
  console.log('📥 IoT Event:', JSON.stringify(event, null, 2));

  try {
    const topic     = event.topic     || 'dinewave/waste';
    const stationId = event.stationId || 'STATION-001';
    const timestamp = event.timestamp || new Date().toISOString();

    // ── 1. Route by topic ─────────────────────────────────────────────────────
    if (topic.includes('sensors') || topic.includes('reading')) {
      // Raw sensor reading — persist to sensor table
      const reading = {
        readingId:   uuidv4(),
        stationId,
        timestamp,
        rfid:        event.rfid        || {},
        loadCell:    event.loadCell    || {},
        ultrasonic:  event.ultrasonic  || {},
        environment: event.environment || {},
        system:      event.system      || {},
        dataQuality: 'GOOD',
      };
      await docClient.send(new PutCommand({ TableName: TABLES.SENSOR, Item: reading }));
      console.log('✅ Sensor reading saved:', reading.readingId);
      return { statusCode: 200, body: JSON.stringify({ readingId: reading.readingId }) };
    }

    if (topic.includes('waste')) {
      // Full waste event — persist + ledger + alerts
      const entryId   = uuidv4();
      const wasteType = event.rfid?.wasteType || 'UNKNOWN';
      const weightKg  = event.loadCell?.weightKg || 0;
      const cap       = event.ultrasonic?.binCapacityPercent || 0;

      const entry = {
        entryId,
        stationId,
        timestamp,
        rfid: {
          tagId:      event.rfid?.tagId || null,
          wasteType,
          category:   event.rfid?.category || 'GENERAL',
          confidence: event.rfid?.confidence || 0,
        },
        loadCell: {
          weightGrams:   Math.round(weightKg * 1000),
          weightKg,
          financialLoss: event.loadCell?.financialLoss || 0,
          currency:      'USD',
          costPerKg:     event.loadCell?.costPerKg || 0,
        },
        ultrasonic: {
          distanceCm:         event.ultrasonic?.distanceCm || 0,
          binCapacityPercent: cap,
          binStatus:          classifyBinStatus(cap),
        },
        sorting: {
          sortedTo:     `BIN_${wasteType}`,
          sortSuccess:  true,
          motorRuntime: 1200,
        },
        sanitization: {
          uvActivated:    weightKg > 1 || ['FOOD','ORGANIC','HAZARDOUS'].includes(wasteType),
          mistActivated:  ['FOOD','ORGANIC'].includes(wasteType),
          uvDurationSec:  30,
          mistDurationSec:10,
        },
        status: 'PROCESSED',
      };

      // Save waste entry
      await docClient.send(new PutCommand({ TableName: TABLES.WASTE, Item: entry }));

      // Append to immutable ledger
      const { blockNumber, blockHash } = await appendLedger(stationId, entryId, timestamp, entry);

      // Save alerts if triggered
      const triggeredAlerts = shouldTriggerAlert(entry);
      for (const alert of triggeredAlerts) {
        await docClient.send(new PutCommand({
          TableName: TABLES.ALERTS,
          Item: { alertId: uuidv4(), timestamp, stationId, status: 'ACTIVE', ...alert },
        }));
      }

      console.log(`✅ Waste entry: ${entryId} → Block #${blockNumber} [${blockHash.substring(0,16)}...]`);
      return { statusCode: 200, body: JSON.stringify({ entryId, blockNumber, blockHash, alertsTriggered: triggeredAlerts.length }) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Topic not handled', topic }) };
  } catch (err) {
    console.error('❌ Lambda error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
