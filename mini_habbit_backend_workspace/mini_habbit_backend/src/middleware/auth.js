/**
 * PUBLIC_INTERFACE
 * Express middleware for route protection and session user loading.
 * Adds req.user if authenticated.
 */
const authService = require('../services/auth');

const TOKEN_COOKIE = 'token';

async function authMiddleware(req, res, next) {
  const token = req.cookies?.[TOKEN_COOKIE] || req.headers?.authorization?.replace('Bearer ', '') || null;
  if (!token) {
    req.user = null;
    return res.status(401).json({ error: 'Authentication required' });
  }
  const payload = authService.verifyJWT(token);
  if (!payload) {
    req.user = null;
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
  // Attach user to req for downstream handlers
  req.user = { id: payload.id, email: payload.email };
  next();
}

// Use for routes where authentication is optional, attaches req.user if valid
async function loadUserIfAuthenticated(req, res, next) {
  const token = req.cookies?.[TOKEN_COOKIE] || req.headers?.authorization?.replace('Bearer ', '') || null;
  if (!token) {
    req.user = null;
    return next();
  }
  const payload = authService.verifyJWT(token);
  req.user = payload ? { id: payload.id, email: payload.email } : null;
  next();
}

module.exports = {
  authMiddleware,
  loadUserIfAuthenticated
};
