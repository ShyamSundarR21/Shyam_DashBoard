# DineWave — Automated Restaurant Waste Audit Station

DineWave is an IoT-enabled waste audit system that uses **sensor fusion** to track food loss, financial loss, and hygiene in restaurants. It combines RFID, Load Cells, and Ultrasonic sensors with an ESP32-WROOM-32 microcontroller to automate waste sorting, sanitization (UV-C/Mist), and data logging to an immutable cloud ledger.

## Key Features

| Feature | Description |
|---------|-------------|
| **Sensor Fusion** | RFID (waste type), Load Cells (weight/cost), Ultrasonic (bin capacity) |
| **Live Dashboard** | Real-time waste tracking, financial impact, hygiene scores |
| **Immutable Ledger** | Blockchain-style audit trail to DynamoDB |
| **ESP32 Integration** | Autonomous sorting, UV-C/Mist sanitization control |
| **WebSocket Feed** | Live sensor updates for responsive UI |
| **AWS Cloud** | DynamoDB ledger, IoT Core, Lambda processing |

## Quick Start

```bash
# Install dependencies
npm install

# Development mode (frontend + backend)
npm run dev          # Frontend at http://localhost:3000
npm run backend      # Backend API at http://localhost:4000

# Or start both services
npm start            # Backend only
```

## API Endpoints

- `GET /api/health` — System status
- `GET /api/sensors` — Current sensor readings
- `GET /api/ledger` — Immutable audit trail
- `GET /api/waste` — Waste statistics
- `GET /api/alerts` — Active alerts
- `WS ws://localhost:8080` — Live sensor feed

## Tech Stack

- **Frontend**: React 18 + Vite, Tailwind CSS, Chart.js
- **Backend**: Express.js, Node.js, WebSocket
- **Database**: AWS DynamoDB
- **IoT**: AWS IoT Core, ESP32-WROOM-32
- **Deployment**: Docker, AWS Lambda
- **Auth**: JWT + AWS Cognito (ready)
