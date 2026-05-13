# 📚 DineWave Backend API Documentation

## Base URL
```
http://localhost:4000
```

## Response Format

All endpoints return JSON responses:

### Success Response
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ }
}
```

### Error Response
```json
{
  "error": "Error message describing what went wrong"
}
```

---

## 🔌 Endpoints Reference

### Health Check

#### `GET /api/health`
Returns system status and service information.

**Response:**
```json
{
  "status": "✅ DineWave Backend Operational",
  "version": "1.0.0",
  "timestamp": "2025-05-13T08:30:00Z",
  "env": "development",
  "services": {
    "database": "DynamoDB",
    "iot": "AWS IoT Core",
    "websocket": "ws://localhost:8080"
  }
}
```

---

### 📡 Sensors

#### `GET /api/sensors`
Get current/latest sensor reading.

**Query Parameters:**
- `stationId` (optional, default: `STATION-001`)

**Response:**
```json
{
  "success": true,
  "data": {
    "readingId": "READ-000001",
    "stationId": "STATION-001",
    "timestamp": "2025-05-13T08:30:00Z",
    "rfid": {
      "active": true,
      "wasteType": "FOOD",
      "signalStrength": -45
    },
    "loadCell": {
      "weightGrams": 1234,
      "weightKg": 1.23
    },
    "ultrasonic": {
      "binCapacityPercent": 65,
      "binStatus": "NORMAL"
    },
    "environment": {
      "temperature": 22.5,
      "humidity": 65,
      "hygieneScore": 87
    }
  }
}
```

---

#### `GET /api/sensors/latest`
Alias for `/api/sensors`. Get latest sensor reading by station ID.

**Query Parameters:**
- `stationId` (optional, default: `STATION-001`)

---

#### `GET /api/sensors/history`
Get sensor reading history.

**Query Parameters:**
- `stationId` (optional, default: `STATION-001`)
- `limit` (optional, default: 50, max: 500)

**Response:**
```json
{
  "success": true,
  "count": 50,
  "data": [
    { /* sensor reading objects */ },
    ...
  ]
}
```

---

#### `POST /api/sensors/reading`
Submit a new sensor reading (called by ESP32 or IoT Lambda).

**Request Body:**
```json
{
  "stationId": "STATION-001",
  "rfid": { "wasteType": "FOOD", "signalStrength": -45 },
  "loadCell": { "weightKg": 1.23 },
  "ultrasonic": { "binCapacityPercent": 65 },
  "environment": { "temperature": 22.5, "humidity": 65, "hygieneScore": 87 }
}
```

**Response:**
```json
{
  "success": true,
  "readingId": "READ-000042"
}
```

---

#### `POST /api/sensors/waste-event`
Full waste detection event with ledger entry and sanitization trigger.

**Request Body:**
```json
{
  "stationId": "STATION-001",
  "wasteType": "FOOD",
  "weight": 1.5,
  "rfidTag": "TAG-12345",
  "environment": { "temperature": 22.5, "humidity": 65 }
}
```

**Response:**
```json
{
  "success": true,
  "entryId": "ENTRY-000123",
  "blockNumber": 42,
  "blockHash": "0xabcdef123456",
  "alertsTriggered": 1,
  "sanitization": {
    "triggered": true,
    "type": "UV-C"
  }
}
```

---

### 🗑️ Waste Tracking

#### `GET /api/waste`
Get today's waste summary for dashboard cards.

**Query Parameters:**
- `stationId` (optional, default: `STATION-001`)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalWaste": 45.3,
    "foodWaste": 28.5,
    "plasticWaste": 10.2,
    "organicWaste": 6.6,
    "financialLoss": 385.05,
    "trend": "up",
    "percentChange": 12.5,
    "wasteByType": [
      {
        "type": "FOOD",
        "count": 1245,
        "weight": 28.5,
        "cost": 242.25
      },
      {
        "type": "PLASTIC",
        "count": 423,
        "weight": 10.2,
        "cost": 86.7
      },
      {
        "type": "ORGANIC",
        "count": 189,
        "weight": 6.6,
        "cost": 56.1
      }
    ]
  }
}
```

---

#### `GET /api/waste/entries`
Get raw waste entries.

**Query Parameters:**
- `stationId` (optional, default: `STATION-001`)
- `limit` (optional, default: 50, max: 500)

**Response:**
```json
{
  "success": true,
  "count": 15,
  "nextKey": null,
  "data": [
    {
      "entryId": "ENTRY-000001",
      "stationId": "STATION-001",
      "timestamp": "2025-05-13T08:30:00Z",
      "wasteType": "FOOD",
      "weight": 2.3,
      "cost": 19.55,
      "rfidTag": "TAG-12345",
      "binCapacity": 65,
      "hygieneScore": 87,
      "hash": "0xabcdef12"
    },
    ...
  ]
}
```

---

#### `GET /api/waste/analytics`
Get waste analytics for specified period.

**Query Parameters:**
- `stationId` (optional, default: `STATION-001`)
- `days` (optional, default: 7)

**Response:**
```json
{
  "success": true,
  "stationId": "STATION-001",
  "days": 7,
  "data": {
    "totalEntries": 42,
    "totalWeightKg": 125.5,
    "totalFinancialLoss": 850.0,
    "byWasteType": {
      "FOOD": 25,
      "PLASTIC": 12,
      "ORGANIC": 5
    },
    "avgWeightPerEntry": 2.99,
    "avgCostPerEntry": 20.24
  }
}
```

---

#### `GET /api/waste/summary`
Get daily/weekly/monthly summaries.

**Query Parameters:**
- `stationId` (optional, default: `STATION-001`)

**Response:**
```json
{
  "success": true,
  "stationId": "STATION-001",
  "summary": {
    "daily": { /* daily analytics */ },
    "weekly": { /* weekly analytics */ },
    "monthly": { /* monthly analytics */ }
  }
}
```

---

#### `GET /api/waste/date-range`
Get waste entries for a date range.

**Query Parameters:**
- `stationId` (optional, default: `STATION-001`)
- `startDate` (required, ISO format: `2025-05-01`)
- `endDate` (required, ISO format: `2025-05-13`)

**Response:**
```json
{
  "success": true,
  "count": 28,
  "data": [ /* waste entries */ ]
}
```

---

### 📜 Immutable Ledger

#### `GET /api/ledger`
Get ledger blocks (blockchain-style audit trail).

**Query Parameters:**
- `stationId` (optional, default: `STATION-001`)
- `limit` (optional, default: 50, max: 500)

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "ENTRY-000001",
      "timestamp": "2025-05-13T08:30:00Z",
      "wasteType": "FOOD",
      "weight": 2.3,
      "cost": 19.55,
      "hash": "0xabcdef123456ab",
      "hygieneScore": 87,
      "blockNumber": 1
    },
    ...
  ]
}
```

---

#### `GET /api/ledger/verify`
Verify ledger integrity (hash chain validation).

**Query Parameters:**
- `stationId` (optional, default: `STATION-001`)

**Response:**
```json
{
  "success": true,
  "stationId": "STATION-001",
  "integrity": "✅ INTACT",
  "valid": true,
  "totalBlocks": 15,
  "lastBlockHash": "0x1234567890abcdef"
}
```

---

#### `GET /api/ledger/block/:blockNumber`
Get specific block by block number.

**URL Parameters:**
- `blockNumber` (required, 1-indexed)

**Query Parameters:**
- `stationId` (optional, default: `STATION-001`)

**Response:**
```json
{
  "success": true,
  "data": {
    "blockNumber": 1,
    "timestamp": "2025-05-13T08:30:00Z",
    "entryId": "ENTRY-000001",
    "wasteType": "FOOD",
    "weight": 2.3,
    "cost": 19.55,
    "previousHash": "0x0000000000000000",
    "blockHash": "0xabcdef123456ab",
    "verified": true
  }
}
```

---

#### `GET /api/ledger/export`
Export full ledger as JSON file.

**Query Parameters:**
- `stationId` (optional, default: `STATION-001`)

**Response:**
- File download: `dinewave-ledger-STATION-001-{timestamp}.json`
- Content-Type: `application/json`

---

### 🚨 Alerts

#### `GET /api/alerts`
Get active alerts.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "alertId": "ALERT-001",
      "type": "BIN_CAPACITY",
      "severity": "WARNING",
      "message": "Bin nearly full - 85% capacity",
      "stationId": "STATION-001",
      "timestamp": "2025-05-13T08:30:00Z",
      "resolved": false
    },
    ...
  ]
}
```

---

#### `POST /api/alerts`
Create a new alert.

**Request Body:**
```json
{
  "type": "BIN_CAPACITY",
  "severity": "WARNING",
  "message": "Bin nearly full",
  "stationId": "STATION-001",
  "data": { "binCapacity": 85 }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "alertId": "ALERT-002",
    "type": "BIN_CAPACITY",
    "severity": "WARNING",
    "message": "Bin nearly full",
    "stationId": "STATION-001",
    "timestamp": "2025-05-13T08:30:00Z",
    "resolved": false
  }
}
```

---

#### `PUT /api/alerts/:alertId/resolve`
Resolve/acknowledge an alert.

**URL Parameters:**
- `alertId` (required)

**Request Body:**
```json
{
  "timestamp": "2025-05-13T08:35:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alert resolved"
}
```

---

#### `GET /api/alerts/types`
Get available alert types and severities.

**Response:**
```json
{
  "success": true,
  "types": [
    "BIN_CAPACITY",
    "HYGIENE_LOW",
    "SENSOR_ERROR",
    "SYSTEM_ERROR"
  ],
  "severities": [
    "INFO",
    "WARNING",
    "CRITICAL"
  ]
}
```

---

### 🔐 Authentication

#### `POST /api/auth/token`
Generate JWT token for API access (demo mode).

**Request Body:**
```json
{
  "username": "admin",
  "password": "dinewave2024"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

---

## 🌐 WebSocket Events

### Connection
```
URL: ws://localhost:8080
Protocol: WebSocket
```

### Receiving Data

#### SENSOR_UPDATE
Real-time sensor updates (every 3 seconds).

```json
{
  "type": "SENSOR_UPDATE",
  "payload": {
    "stationId": "STATION-001",
    "timestamp": "2025-05-13T08:30:00Z",
    "rfid": { "wasteType": "FOOD", "signalStrength": -45 },
    "loadCell": { "weightKg": 1.23 },
    "ultrasonic": { "binCapacityPercent": 65 },
    "environment": { "temperature": 22.5, "humidity": 65, "hygieneScore": 87 }
  }
}
```

#### WASTE_EVENT
Waste detection event with ledger entry.

```json
{
  "type": "WASTE_EVENT",
  "payload": {
    "entry": { /* waste entry data */ },
    "block": { /* ledger block */ },
    "alerts": [ /* triggered alerts */ ]
  }
}
```

#### CONNECTED
Connection confirmation.

```json
{
  "type": "CONNECTED",
  "message": "DineWave Live Feed connected",
  "timestamp": "2025-05-13T08:30:00Z"
}
```

---

## 📊 Data Types

### Waste Entry
```typescript
{
  entryId: string;           // Unique ID
  stationId: string;         // Station identifier
  timestamp: string;         // ISO timestamp
  wasteType: "FOOD" | "PLASTIC" | "ORGANIC";
  weight: number;            // kg
  cost: number;              // USD
  rfidTag: string;           // RFID identifier
  binCapacity: number;       // 0-100%
  hygieneScore: number;      // 0-100
  hash: string;              // Cryptographic hash
}
```

### Sensor Reading
```typescript
{
  readingId: string;
  stationId: string;
  timestamp: string;
  rfid: {
    active: boolean;
    wasteType: string;
    signalStrength: number;  // dBm
  };
  loadCell: {
    weightGrams: number;
    weightKg: number;
  };
  ultrasonic: {
    binCapacityPercent: number; // 0-100
    binStatus: string;          // "NORMAL" | "WARNING" | "CRITICAL"
  };
  environment: {
    temperature: number;        // Celsius
    humidity: number;           // 0-100%
    hygieneScore: number;       // 0-100
  };
}
```

### Ledger Block
```typescript
{
  blockNumber: number;
  timestamp: string;
  entryId: string;
  wasteType: string;
  weight: number;
  cost: number;
  previousHash: string;
  blockHash: string;
  verified: boolean;
}
```

### Alert
```typescript
{
  alertId: string;
  type: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  message: string;
  stationId: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}
```

---

## 🧪 Example cURL Requests

### Get System Health
```bash
curl http://localhost:4000/api/health
```

### Get Current Sensor Data
```bash
curl http://localhost:4000/api/sensors
```

### Get Today's Waste Summary
```bash
curl http://localhost:4000/api/waste
```

### Get Waste Analytics (7 days)
```bash
curl "http://localhost:4000/api/waste/analytics?days=7"
```

### Get Ledger Entries
```bash
curl http://localhost:4000/api/ledger
```

### Verify Ledger Integrity
```bash
curl http://localhost:4000/api/ledger/verify
```

### Get Active Alerts
```bash
curl http://localhost:4000/api/alerts
```

### Get Auth Token
```bash
curl -X POST http://localhost:4000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"dinewave2024"}'
```

### Test WebSocket Connection
```bash
wscat -c ws://localhost:8080
```

---

## ✅ Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Auth required |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal error |

---

## 🔍 Notes

- All timestamps are in ISO 8601 format
- Costs are in USD
- Weights are in kilograms
- Temperatures in Celsius
- Humidity in percentages (0-100)
- All endpoints return JSON
- WebSocket updates occur every 3 seconds
- Mock data is regenerated on server restart

