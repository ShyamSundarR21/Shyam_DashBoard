'use strict';

/**
 * Simplified Auth for Demo — Allows everything
 */
function authMiddleware(req, res, next) {
  next();
}

function generateToken(payload = {}) {
  return 'demo-token';
}

function deviceAuthMiddleware(req, res, next) {
  next();
}

module.exports = { authMiddleware, generateToken, deviceAuthMiddleware };
