'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * SensorReading Model
 * Raw timestamped snapshot of all 3 sensors on the ESP32.
 */
class SensorReading {
  constructor(data = {}) {
    this.readingId   = data.readingId  || uuidv4();
    this.stationId   = data.stationId  || 'STATION-001';
    this.timestamp   = data.timestamp  || new Date().toISOString();
    this.sessionId   = data.sessionId  || null;

    // ── RFID ─────────────────────────────────────────────────────────────────
    this.rfid = {
      active:       data.rfid?.active       ?? false,
      tagId:        data.rfid?.tagId        || null,
      wasteType:    data.rfid?.wasteType    || null,
      readCount:    data.rfid?.readCount    || 0,
      lastSeen:     data.rfid?.lastSeen     || null,
      signalStrength: data.rfid?.signalStrength || 0,
    };

    // ── Load Cell ─────────────────────────────────────────────────────────────
    this.loadCell = {
      rawValue:       data.loadCell?.rawValue       || 0,
      weightGrams:    data.loadCell?.weightGrams     || 0,
      tare:           data.loadCell?.tare            || 0,
      calibrationFactor: data.loadCell?.calibrationFactor || 2280.0,
      stable:         data.loadCell?.stable          ?? false,
    };

    // ── Ultrasonic ────────────────────────────────────────────────────────────
    this.ultrasonic = {
      distanceCm:         data.ultrasonic?.distanceCm         || 0,
      binCapacityPercent: data.ultrasonic?.binCapacityPercent  || 0,
      triggerPin:         data.ultrasonic?.triggerPin          || 5,
      echoPin:            data.ultrasonic?.echoPin             || 18,
      temperature:        data.ultrasonic?.temperature         || 25, // °C compensation
    };

    // ── Environmental ─────────────────────────────────────────────────────────
    this.environment = {
      temperature: data.environment?.temperature || null, // °C
      humidity:    data.environment?.humidity    || null, // %
      hygienScore: data.environment?.hygieneScore || 100, // 0–100
    };

    // ── ESP32 System Health ────────────────────────────────────────────────────
    this.system = {
      wifiRSSI:       data.system?.wifiRSSI       || 0,
      freeHeap:       data.system?.freeHeap       || 0,
      uptime:         data.system?.uptime         || 0,    // ms
      firmwareVersion:data.system?.firmwareVersion || '1.0.0',
      batteryVolt:    data.system?.batteryVolt    || 3.7,
    };

    this.dataQuality = data.dataQuality || 'GOOD'; // GOOD, DEGRADED, POOR
  }

  toItem() {
    return {
      readingId:   this.readingId,
      stationId:   this.stationId,
      timestamp:   this.timestamp,
      sessionId:   this.sessionId,
      rfid:        this.rfid,
      loadCell:    this.loadCell,
      ultrasonic:  this.ultrasonic,
      environment: this.environment,
      system:      this.system,
      dataQuality: this.dataQuality,
    };
  }
}

module.exports = SensorReading;
