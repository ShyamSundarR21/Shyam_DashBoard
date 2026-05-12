'use strict';

require('dotenv').config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

// ─── AWS SDK Configuration (Hardcoded Defaults for Demo) ──────────────────────
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

// ─── DynamoDB Client ─────────────────────────────────────────────────────────
const dynamoClient = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

// ─── Table Names ─────────────────────────────────────────────────────────────
const TABLES = {
  WASTE:   process.env.DYNAMODB_WASTE_TABLE   || 'dinewave-waste-entries',
  SENSOR:  process.env.DYNAMODB_SENSOR_TABLE  || 'dinewave-sensor-readings',
  LEDGER:  process.env.DYNAMODB_LEDGER_TABLE  || 'dinewave-immutable-ledger',
  ALERTS:  process.env.DYNAMODB_ALERTS_TABLE  || 'dinewave-alerts',
};

// ─── IoT Core Config ─────────────────────────────────────────────────────────
const IOT_CONFIG = {
  endpoint:  process.env.IOT_ENDPOINT || 'demo.iot.endpoint',
  clientId:  process.env.IOT_CLIENT_ID || 'dinewave-server',
  topics: {
    sensors:  'dinewave/sensors/#',
    waste:    'dinewave/waste',
    sanitize: 'dinewave/sanitize',
  },
};

module.exports = { docClient, TABLES, IOT_CONFIG, awsConfig };
