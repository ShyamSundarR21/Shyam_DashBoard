'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * WasteEntry Model
 * Represents a single waste detection event from the ESP32 station.
 * Immutable once written — forms the backbone of the audit ledger.
 */
class WasteEntry {
  /**
   * @param {Object} data - Raw sensor fusion payload from ESP32
   */
  constructor(data = {}) {
    // ── Primary Keys ────────────────────────────────────────────────────────
    this.entryId        = data.entryId      || uuidv4();
    this.timestamp      = data.timestamp    || new Date().toISOString();
    this.stationId      = data.stationId    || 'STATION-001';

    // ── RFID Sensor Data ────────────────────────────────────────────────────
    this.rfid = {
      tagId:        data.rfid?.tagId        || null,
      wasteType:    data.rfid?.wasteType    || 'UNKNOWN',   // FOOD, PLASTIC, ORGANIC, LIQUID, HAZARDOUS
      category:     data.rfid?.category     || 'GENERAL',
      itemName:     data.rfid?.itemName     || 'Unidentified Waste',
      confidence:   data.rfid?.confidence   || 0,           // 0–100 %
    };

    // ── Load Cell Data (Weight / Financial Loss) ─────────────────────────────
    this.loadCell = {
      weightGrams:    data.loadCell?.weightGrams    || 0,
      weightKg:       data.loadCell?.weightKg       || 0,
      financialLoss:  data.loadCell?.financialLoss  || 0,   // USD
      currency:       data.loadCell?.currency       || 'USD',
      costPerKg:      data.loadCell?.costPerKg      || 0,
    };

    // ── Ultrasonic Sensor Data (Bin Capacity) ────────────────────────────────
    this.ultrasonic = {
      distanceCm:       data.ultrasonic?.distanceCm       || 0,
      binCapacityPercent: data.ultrasonic?.binCapacityPercent || 0,
      binHeightCm:      data.ultrasonic?.binHeightCm      || 60,
      binStatus:        data.ultrasonic?.binStatus        || 'NORMAL', // NORMAL, WARNING, CRITICAL, FULL
    };

    // ── Sorting & Sanitization ───────────────────────────────────────────────
    this.sorting = {
      sortedTo:     data.sorting?.sortedTo    || 'BIN_GENERAL',
      sortSuccess:  data.sorting?.sortSuccess ?? true,
      motorRuntime: data.sorting?.motorRuntime || 0,        // ms
    };

    this.sanitization = {
      uvActivated:    data.sanitization?.uvActivated    || false,
      mistActivated:  data.sanitization?.mistActivated  || false,
      uvDurationSec:  data.sanitization?.uvDurationSec  || 0,
      mistDurationSec:data.sanitization?.mistDurationSec|| 0,
    };

    // ── Ledger Metadata (Immutability) ───────────────────────────────────────
    this.ledger = {
      blockHash:    data.ledger?.blockHash    || null,      // SHA256 of entry
      prevHash:     data.ledger?.prevHash     || '0000000000000000',
      blockNumber:  data.ledger?.blockNumber  || 0,
      immutable:    true,
    };

    // ── Status ───────────────────────────────────────────────────────────────
    this.status       = data.status       || 'PROCESSED';
    this.alertTriggered = data.alertTriggered || false;
  }

  /**
   * Validate the entry has minimum required fields.
   */
  validate() {
    const errors = [];
    if (!this.stationId)             errors.push('stationId is required');
    if (!this.rfid.wasteType)        errors.push('rfid.wasteType is required');
    if (this.loadCell.weightGrams < 0) errors.push('Weight cannot be negative');
    return errors;
  }

  /**
   * Serialize to DynamoDB-ready plain object.
   */
  toItem() {
    return {
      entryId:       this.entryId,
      timestamp:     this.timestamp,
      stationId:     this.stationId,
      rfid:          this.rfid,
      loadCell:      this.loadCell,
      ultrasonic:    this.ultrasonic,
      sorting:       this.sorting,
      sanitization:  this.sanitization,
      ledger:        this.ledger,
      status:        this.status,
      alertTriggered:this.alertTriggered,
    };
  }

  static wasteTypes() {
    return ['FOOD', 'PLASTIC', 'ORGANIC', 'LIQUID', 'HAZARDOUS', 'PAPER', 'METAL', 'GLASS'];
  }

  static binStatuses() {
    return { NORMAL: '<60%', WARNING: '60–85%', CRITICAL: '85–95%', FULL: '>95%' };
  }
}

module.exports = WasteEntry;
