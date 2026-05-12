'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dinewave_dev_secret';

/**
 * JWT Authentication Middleware
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — missing token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized — invalid or expired token' });
  }
}

/**
 * Generate a dev token (for testing without Cognito)
 */
function generateToken(payload = {}) {
  return jwt.sign(
    { sub: payload.sub || 'dev-user', role: payload.role || 'admin', ...payload },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

/**
 * Device secret auth for ESP32 → Server communication
 */
function deviceAuthMiddleware(req, res, next) {
  const deviceSecret = req.headers['x-device-secret'];
  if (!deviceSecret || deviceSecret !== process.env.DEVICE_SECRET) {
    // In dev mode, allow through
    if (process.env.NODE_ENV === 'development') return next();
    return res.status(401).json({ error: 'Unauthorized device' });
  }
  next();
}

module.exports = { authMiddleware, generateToken, deviceAuthMiddleware };
