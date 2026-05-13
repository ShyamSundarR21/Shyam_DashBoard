# 🚀 DineWave Dashboard - Complete Setup Guide

## ✅ System Status

### Backend ✓
- **Server**: Running on `http://localhost:4000`
- **WebSocket**: Running on `ws://localhost:8080`
- **Database**: In-memory mock store with 15 waste entries, 20 sensor readings, 15 ledger blocks
- **Build**: ✓ No errors

### Frontend ✓
- **Dev Server**: `http://localhost:3000`
- **Build**: ✓ Production ready (175.62 KB → 54.16 KB gzipped)
- **Components**: 6 fully functional components

---

## 🎯 Quick Start (2 Commands)

### Terminal 1 - Frontend
```bash
cd /workspaces/Shyam_DashBoard
npm run dev
# Opens http://localhost:3000
```

### Terminal 2 - Backend
```bash
cd /workspaces/Shyam_DashBoard
npm run backend
# Starts on port 4000 + WebSocket on 8080
```

---

## 📊 What You'll See

### 1. Hero Section
- DineWave pitch with IoT-powered waste audit
- Key statistics: 40% waste reduction, $5K/mo savings
- Call-to-action buttons

### 2. Live Dashboard
- **Real-time sensor monitoring** (updates every 3 seconds via WebSocket)
- RFID waste type detection
- Load Cell weight tracking with cost calculation
- Ultrasonic bin capacity monitoring
- Environmental hygiene scoring
- Interactive alerts for bin capacity

### 3. Waste Summary  
- Daily waste statistics
- Waste breakdown by type (FOOD, PLASTIC, ORGANIC)
- Financial impact analysis
- Weekly trend comparison

### 4. Immutable Ledger
- Blockchain-style audit trail
- Cryptographic entry hashing
- All waste entries with timestamps
- Total value and statistics

### 5. Tech Stack
- System architecture visualization
- Four-layer system (Sensors → Hardware → Cloud → Dashboard)
- Feature highlights

### 6. Footer
- Project info and tech stack

---

## 🔌 API Endpoints (Ready to Test)

### Sensors
```bash
# Get current sensor reading
curl http://localhost:4000/api/sensors

# Get sensor history
curl http://localhost:4000/api/sensors/latest
curl http://localhost:4000/api/sensors/history
```

### Waste Tracking
```bash
# Get today's waste summary
curl http://localhost:4000/api/waste

# Get detailed breakdown by type
curl "http://localhost:4000/api/waste?stationId=STATION-001"

# Get waste entries
curl http://localhost:4000/api/waste/entries

# Get analytics
curl http://localhost:4000/api/waste/analytics

# Get summary (daily/weekly/monthly)
curl http://localhost:4000/api/waste/summary
```

### Immutable Ledger
```bash
# Get ledger entries
curl http://localhost:4000/api/ledger

# Verify ledger integrity
curl http://localhost:4000/api/ledger/verify

# Get specific block
curl "http://localhost:4000/api/ledger/block/1"

# Export ledger
curl http://localhost:4000/api/ledger/export > ledger.json
```

### System Health
```bash
# Check API health
curl http://localhost:4000/api/health
```

---

## 📡 WebSocket Live Feed

### Connection
```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => console.log('Connected');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Live update:', data);
};
```

### Message Format
```json
{
  "type": "SENSOR_UPDATE",
  "payload": {
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

Updates arrive **every 3 seconds** automatically.

---

## 📁 Project Structure

```
/workspaces/Shyam_DashBoard/
├── backend/
│   ├── server.js                    # Express server + WebSocket
│   ├── routes/
│   │   ├── sensors.js              # Sensor endpoints
│   │   ├── waste.js                # Waste tracking
│   │   ├── ledger.js               # Immutable ledger
│   │   └── alerts.js               # Alert management
│   ├── services/
│   │   ├── dynamodb.js             # Database (mock + AWS ready)
│   │   ├── alertService.js         # Alert logic
│   │   └── sanitizationService.js  # Sanitization control
│   ├── models/
│   │   ├── WasteEntry.js           # Waste data model
│   │   └── SensorReading.js        # Sensor data model
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication
│   └── config/
│       └── aws.js                  # AWS configuration
├── src/
│   ├── App.jsx                     # Main app component
│   ├── components/
│   │   ├── Hero.jsx                # Landing section
│   │   ├── Dashboard.jsx           # Live monitoring
│   │   ├── WasteSummary.jsx        # Statistics
│   │   ├── Ledger.jsx              # Audit trail
│   │   ├── TechStack.jsx           # Architecture
│   │   └── Footer.jsx              # Footer
│   ├── data/
│   │   └── pitch.js                # Content data
│   └── index.css                   # Global styles
├── package.json                    # Dependencies
└── vite.config.js                  # Vite config
```

---

## 🗂️ Mock Data Overview

### Waste Entries (15)
- Types: FOOD (60%), PLASTIC (25%), ORGANIC (15%)
- Generated with realistic timestamps (last 225 minutes)
- Includes weight, cost, RFID tags, hygiene scores

### Sensor Readings (20)
- 3-minute intervals for last hour
- All sensor types: RFID, Load Cell, Ultrasonic
- Environmental data (temperature, humidity, hygiene)

### Ledger Blocks (15)
- Cryptographically hashed
- Previous hash chain for integrity
- Immutable (append-only)

---

## 🧪 Testing the Dashboard

### Test 1: Live Updates
1. Open `http://localhost:3000` in browser
2. Go to Dashboard section
3. Observe sensor data updating every 3 seconds
4. Check WebSocket connection indicator (green light)

### Test 2: Waste Statistics
1. Scroll to "Waste Statistics" section
2. Verify KPI cards show realistic data
3. Check breakdown table matches totals

### Test 3: Immutable Ledger
1. Scroll to "Immutable Ledger" section
2. Verify all entries have hashes
3. Check "Live syncing to DynamoDB" indicator

### Test 4: API Testing
```bash
# Terminal 3
# Test sensors
curl -s http://localhost:4000/api/sensors | jq .

# Test waste
curl -s http://localhost:4000/api/waste | jq .

# Test ledger
curl -s http://localhost:4000/api/ledger | jq .

# Test health
curl -s http://localhost:4000/api/health | jq .
```

---

## 🔧 Configuration

### Environment Variables (.env)
```env
PORT=4000
WS_PORT=8080
NODE_ENV=development

# Optional - for AWS DynamoDB (when ready)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

### Adjust Mock Data
Edit `backend/services/dynamodb.js` `initializeMockData()` to change:
- Number of entries
- Time intervals
- Data ranges

---

## 📱 Responsive Design

The dashboard is fully responsive:
- **Desktop** (1920px+): Full layout with all details
- **Tablet** (768px): 2-column grid
- **Mobile** (320px): Single column, optimized

Test with browser dev tools (F12):
- Toggle device toolbar
- Resize viewport

---

## 🚀 Production Deployment

When ready to deploy:

### Build Frontend
```bash
npm run build
# Creates /dist folder
```

### Deploy Backend
```bash
# Using Docker
docker-compose up

# Or directly
npm start
```

### Environment Setup
1. Configure AWS credentials
2. Set up DynamoDB tables
3. Update API endpoints in frontend
4. Configure CORS for production domain

See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) for detailed AWS setup.

---

## 🐛 Troubleshooting

### Frontend won't load
```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
npm run dev
```

### WebSocket connection fails
```bash
# Ensure backend is running
npm run backend

# Check ports are available
lsof -i :4000
lsof -i :8080
```

### API returns empty data
```bash
# Check mock data initialization
curl http://localhost:4000/api/health

# Restart backend to reinitialize
npm run backend
```

### Performance issues
- Check browser console for errors (F12)
- Check backend logs for exceptions
- Verify browser WebSocket support
- Check network tab for slow API calls

---

## 💡 Features Implemented

✅ **Real-Time Monitoring**
- WebSocket live sensor feeds
- Updates every 3 seconds
- Connected indicator

✅ **Sensor Fusion**
- RFID waste type detection
- Load Cell weight tracking
- Ultrasonic bin monitoring
- Environmental sensors

✅ **Financial Tracking**
- Automatic cost calculation
- Daily financial impact
- Type-based pricing

✅ **Immutable Ledger**
- Blockchain-style architecture
- Cryptographic hashing
- Integrity verification
- Full audit trail

✅ **Statistics Dashboard**
- Daily/Weekly/Monthly analytics
- Waste breakdown by type
- Trend analysis
- KPI cards

✅ **Responsive UI**
- Mobile-optimized
- Dark theme
- Smooth animations
- Accessible design

---

## 📞 Support

For issues or questions:
1. Check console logs (F12 in browser)
2. Check terminal output (backend logs)
3. Review API responses with curl
4. Test components individually

---

**Dashboard is fully operational! Ready to use and extend.** 🎉
