'use strict';

/**
 * Sanitization Service
 * Controls UV-C lamp and Mist sprayer on the ESP32 station.
 * Sends MQTT commands via IoT Core.
 */

const { IOT_CONFIG } = require('../config/aws');
const { THRESHOLDS } = require('./alertService');

let mqttClient = null;

function setMqttClient(client) {
  mqttClient = client;
}

// ─── Publish MQTT Command to ESP32 ───────────────────────────────────────────
function publishCommand(topic, payload) {
  if (!mqttClient) {
    console.warn('⚠️  MQTT client not connected — skipping command publish');
    return false;
  }
  mqttClient.publish(topic, JSON.stringify(payload));
  console.log(`📡 MQTT → ${topic}:`, payload);
  return true;
}

// ─── Activate UV-C Sanitization ───────────────────────────────────────────────
function activateUVC(stationId, durationSeconds = 30) {
  const command = {
    action:   'ACTIVATE_UVC',
    stationId,
    duration: durationSeconds,
    timestamp: new Date().toISOString(),
  };
  return publishCommand(IOT_CONFIG.topics.uvmist, command);
}

// ─── Activate Mist Sprayer ─────────────────────────────────────────────────────
function activateMist(stationId, durationSeconds = 10) {
  const command = {
    action:   'ACTIVATE_MIST',
    stationId,
    duration: durationSeconds,
    timestamp: new Date().toISOString(),
  };
  return publishCommand(IOT_CONFIG.topics.uvmist, command);
}

// ─── Control Sorting Motor ─────────────────────────────────────────────────────
function activateSortingMotor(stationId, targetBin, wasteType) {
  const command = {
    action:    'SORT_WASTE',
    stationId,
    targetBin,
    wasteType,
    timestamp: new Date().toISOString(),
  };
  return publishCommand(IOT_CONFIG.topics.uvmist, command);
}

// ─── Smart Sanitization Decision ──────────────────────────────────────────────
function shouldActivateUVC(wasteCount, wasteType) {
  const highRiskTypes = ['FOOD', 'ORGANIC', 'LIQUID', 'HAZARDOUS'];
  return wasteCount >= THRESHOLDS.uvTrigger || highRiskTypes.includes(wasteType);
}

function shouldActivateMist(humidity, wasteType) {
  const mistTypes = ['FOOD', 'ORGANIC', 'HAZARDOUS'];
  return humidity >= THRESHOLDS.mistHumidity || mistTypes.includes(wasteType);
}

// ─── Determine Bin Routing ────────────────────────────────────────────────────
const BIN_MAP = {
  FOOD:      'BIN_ORGANIC',
  ORGANIC:   'BIN_ORGANIC',
  PLASTIC:   'BIN_RECYCLABLE',
  PAPER:     'BIN_RECYCLABLE',
  METAL:     'BIN_RECYCLABLE',
  GLASS:     'BIN_RECYCLABLE',
  LIQUID:    'BIN_LIQUID',
  HAZARDOUS: 'BIN_HAZARDOUS',
  UNKNOWN:   'BIN_GENERAL',
};

function getBinForWasteType(wasteType) {
  return BIN_MAP[wasteType] || 'BIN_GENERAL';
}

// ─── Auto-Sanitization Trigger ────────────────────────────────────────────────
async function autoSanitize(stationId, entry, sessionWasteCount = 0) {
  const actions = [];
  const wasteType = entry.rfid?.wasteType;
  const humidity  = entry.environment?.humidity || 0;

  const targetBin = getBinForWasteType(wasteType);
  const sorted = activateSortingMotor(stationId, targetBin, wasteType);
  if (sorted) actions.push({ action: 'SORTED', targetBin });

  if (shouldActivateUVC(sessionWasteCount, wasteType)) {
    const activated = activateUVC(stationId, 30);
    if (activated) actions.push({ action: 'UVC_ACTIVATED', duration: 30 });
  }

  if (shouldActivateMist(humidity, wasteType)) {
    const activated = activateMist(stationId, 10);
    if (activated) actions.push({ action: 'MIST_ACTIVATED', duration: 10 });
  }

  return { stationId, actions, timestamp: new Date().toISOString() };
}

module.exports = {
  setMqttClient,
  activateUVC,
  activateMist,
  activateSortingMotor,
  autoSanitize,
  getBinForWasteType,
  shouldActivateUVC,
  shouldActivateMist,
};
