'use strict';

require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
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
const PORT   = process.env.PORT || 3000;
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

// Start mock live sensor feed in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const reading = {
      type: 'SENSOR_UPDATE',
      payload: {
        stationId: 'STATION-001',
        timestamp: new Date().toISOString(),
        rfid: { active: Math.random() > 0.5, wasteType: ['FOOD','PLASTIC','ORGANIC'][Math.floor(Math.random()*3)], signalStrength: -45 },
        loadCell: { weightGrams: Math.floor(Math.random()*2000), weightKg: +(Math.random()*2).toFixed(2) },
        ultrasonic: { binCapacityPercent: Math.floor(Math.random()*100), binStatus: 'NORMAL' },
        environment: { temperature: +(22+Math.random()*5).toFixed(1), humidity: Math.floor(45+Math.random()*40), hygieneScore: Math.floor(70+Math.random()*30) },
      },
    };
    broadcast(reading);
  }, 3000); // Every 3 seconds
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type','Authorization','x-device-secret'] }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: 'Too many requests' });
app.use('/api/', limiter);

// ─── Serve Frontend ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── API Routes ───────────────────────────────────────────────────────────────
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

// ─── Station Info ─────────────────────────────────────────────────────────────
app.get('/api/stations', (req, res) => {
  res.json({
    success: true,
    stations: [
      { stationId: 'STATION-001', name: 'Main Kitchen', location: 'Ground Floor', status: 'ONLINE', sensors: ['RFID','LOAD_CELL','ULTRASONIC'] },
      { stationId: 'STATION-002', name: 'Prep Area',    location: 'Ground Floor', status: 'ONLINE', sensors: ['RFID','LOAD_CELL','ULTRASONIC'] },
      { stationId: 'STATION-003', name: 'Storage Room', location: 'Basement',     status: 'IDLE',   sensors: ['RFID','LOAD_CELL','ULTRASONIC'] },
    ],
  });
});

// ─── Fallback to Frontend ─────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('💥 Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    console.log('🚀 DineWave Backend starting...');

    // Initialize DynamoDB tables
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== 'YOUR_ACCESS_KEY_ID') {
      await createTablesIfNotExist();
    } else {
      console.log('⚠️  AWS credentials not set — running in local/mock mode');
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
