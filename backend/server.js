'use strict';

require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const http         = require('http');
const WebSocket    = require('ws');
const path         = require('path');

const { createTablesIfNotExist } = require('./services/dynamodb');
const { setWebSocketServer }     = require('./services/alertService');
const { generateToken }          = require('./middleware/auth');

// Routes
const sensorsRouter = require('./routes/sensors');
const ledgerRouter  = require('./routes/ledger');
const wasteRouter   = require('./routes/waste');
const alertsRouter  = require('./routes/alerts');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 4000;
const WS_PORT = process.env.WS_PORT || 8080;

// ─── WebSocket Server ─────────────────────────────────────────────────────────
const wss = new WebSocket.Server({ port: WS_PORT });
setWebSocketServer(wss);

// Broadcast helper for routes
function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
sensorsRouter.setBroadcast(broadcast);

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'DineWave Live Feed connected', timestamp: new Date().toISOString() }));
  ws.on('close', () => console.log('🔌 WebSocket client disconnected'));
});

// Start mock live sensor feed (always in demo mode)
setInterval(() => {
  const types = ['FOOD', 'PLASTIC', 'ORGANIC'];
  const reading = {
    type: 'SENSOR_UPDATE',
    payload: {
      stationId: 'STATION-001',
      timestamp: new Date().toISOString(),
      rfid: { 
        active: Math.random() > 0.3, 
        wasteType: types[Math.floor(Math.random()*3)], 
        signalStrength: -45 - Math.floor(Math.random() * 20)
      },
      loadCell: { 
        weightGrams: Math.floor(Math.random()*2000), 
        weightKg: parseFloat((Math.random()*2).toFixed(2)) 
      },
      ultrasonic: { 
        binCapacityPercent: Math.floor(Math.random()*100), 
        binStatus: 'NORMAL' 
      },
      environment: { 
        temperature: parseFloat((22+Math.random()*5).toFixed(1)), 
        humidity: Math.floor(45+Math.random()*40), 
        hygieneScore: Math.floor(70+Math.random()*30) 
      },
    },
  };
  broadcast(reading);
}, 3000); // Every 3 seconds

// ─── Middleware (Simplified for Demo) ────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// ─── API Routes (Auth Bypassed for Demo) ──────────────────────────────────────
app.use('/api/sensors', sensorsRouter);
app.use('/api/ledger',  ledgerRouter);
app.use('/api/waste',   wasteRouter);
app.use('/api/alerts',  alertsRouter);

// ─── Auth Token Endpoint (Dev) ────────────────────────────────────────────────
app.post('/api/auth/token', (req, res) => {
  const { username, password } = req.body;
  // In production — integrate AWS Cognito here
  if (username === 'admin' && password === 'dinewave2024') {
    const token = generateToken({ sub: username, role: 'admin' });
    res.json({ success: true, token, expiresIn: '24h' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:    '✅ DineWave Backend Operational',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || 'development',
    services: {
      database:  'DynamoDB',
      iot:       'AWS IoT Core',
      websocket: `ws://localhost:${WS_PORT}`,
    },
  });
});

// ─── Error Handler (Simplified) ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    console.log('🚀 DineWave Backend starting...');

    // Initialize DynamoDB tables
    const hasAwsConfigured = process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION &&
      process.env.AWS_ACCESS_KEY_ID !== 'YOUR_ACCESS_KEY_ID';

    if (hasAwsConfigured) {
      await createTablesIfNotExist();
    } else {
      console.log('⚠️  AWS credentials not set or incomplete — running in local/mock mode');
    }

    server.listen(PORT, () => {
      console.log(`✅ HTTP Server    → http://localhost:${PORT}`);
      console.log(`✅ WebSocket Feed → ws://localhost:${WS_PORT}`);
      console.log(`✅ Dashboard      → http://localhost:${PORT}`);
      console.log(`📋 API Health     → http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Bootstrap failed:', err.message);
    process.exit(1);
  }
}

bootstrap();
module.exports = app;
