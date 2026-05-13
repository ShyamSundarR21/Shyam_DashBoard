# DineWave Setup & Quick Start Guide

## 🚀 Project Updated Successfully!

Your DineWave dashboard has been completely updated with a modern frontend and backend. Here's how to run it:

### Quick Start (Development Mode)

#### Option 1: Run Both Services (Recommended)

```bash
# Terminal 1 - Frontend (Port 3000)
npm run dev

# Terminal 2 - Backend (Port 4000) + WebSocket (Port 8080)
npm run backend
```

Then open: **http://localhost:3000**

#### Option 2: Run Individually

```bash
# Frontend only (Vite dev server)
npm run frontend

# Backend only (Express + WebSocket)
npm run backend

# Direct Node
npm start
```

---

## 📊 What's New

### Frontend Components
- **Hero**: DineWave pitch with IoT waste tracking focus
- **Dashboard**: Real-time sensor data (RFID, Load Cells, Ultrasonic)
- **WasteSummary**: Daily waste statistics and composition breakdown
- **Ledger**: Immutable blockchain-style audit trail
- **TechStack**: System architecture visualization

### Backend Features
- **REST API** (`/api/sensors`, `/api/waste`, `/api/ledger`, `/api/alerts`)
- **WebSocket Live Feed** (Port 8080) - Real-time sensor updates
- **Mock Data Generation** - In development mode, sensors stream every 3s
- **DynamoDB Integration** - AWS storage ready
- **JWT Auth** - Token generation (`/api/auth/token`)

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System status check |
| `/api/sensors` | GET | Current sensor readings |
| `/api/waste` | GET | Waste statistics |
| `/api/ledger` | GET | Immutable audit trail |
| `/api/alerts` | GET | Active alert conditions |
| `ws://localhost:8080` | WS | Live sensor stream |

**WebSocket Message Format:**
```json
{
  "type": "SENSOR_UPDATE",
  "payload": {
    "stationId": "STATION-001",
    "timestamp": "2025-05-13T08:30:00Z",
    "rfid": { "wasteType": "FOOD", "signalStrength": -45 },
    "loadCell": { "weightKg": 2.3 },
    "ultrasonic": { "binCapacityPercent": 65 },
    "environment": { "hygieneScore": 87 }
  }
}
```

---

## 🛠️ Development Environment

### Environment Variables
Create `.env` file in the root:
```env
PORT=4000
WS_PORT=8080
NODE_ENV=development
AWS_REGION=us-east-1
# Add AWS credentials if using real DynamoDB
```

### Databases
- **Development**: Mock data in-memory
- **Production**: AWS DynamoDB (configure in `backend/config/aws.js`)

### Build & Deploy
```bash
# Build frontend for production
npm run build

# Preview production build
npm run preview

# Docker deployment
docker-compose up
```

---

## 🎯 Key Features Implemented

✅ **Real-Time Sensor Dashboard**
- RFID waste type detection
- Load cell weight tracking
- Ultrasonic bin capacity monitoring
- Environmental hygiene scoring

✅ **Financial Audit**
- Automatic cost calculation per waste entry
- Daily waste breakdown by type
- Weekly trend analysis

✅ **Immutable Ledger**
- Cryptographic entry hashing
- DynamoDB storage with read-only access
- Compliance-ready audit trail

✅ **WebSocket Live Feed**
- Real-time sensor updates
- Connected client management
- Broadcasting to all clients

---

## 📱 Frontend Navigation

Users can scroll through:
1. **Hero** - DineWave pitch & stats
2. **Dashboard** - Live sensor monitoring
3. **Waste Summary** - Statistical breakdown
4. **Ledger** - Audit trail inspection
5. **Tech Stack** - Architecture overview
6. **Footer** - Developer info

---

## 🔐 Authentication (Ready)

Default dev credentials:
```
Username: admin
Password: dinewave2024
```

Request token:
```bash
curl -X POST http://localhost:4000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"dinewave2024"}'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

---

## 🐛 Troubleshooting

**WebSocket connection refused?**
- Ensure backend is running: `npm run backend`
- Check WS_PORT=8080 is available

**Frontend won't load?**
- Clear browser cache: `Ctrl+Shift+Delete`
- Check port 3000 is available
- Try: `npm run dev -- --port 3001`

**Backend errors?**
- Install missing deps: `npm install`
- Check Node version: `node -v` (requires 16+)
- See logs: `npm run backend 2>&1 | grep -i error`

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | Express.js + Node.js |
| **Real-Time** | WebSocket |
| **Database** | AWS DynamoDB |
| **IoT** | AWS IoT Core + ESP32 |
| **Auth** | JWT + AWS Cognito |
| **Deployment** | Docker + AWS Lambda |

---

## 🚢 Production Deployment

See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) for:
- EC2 setup
- DynamoDB configuration
- Lambda function deployment
- API Gateway integration
- IAM role setup

---

**Questions?** Check backend logs or frontend console for detailed error messages!
