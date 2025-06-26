/**
 * PUBLIC_INTERFACE
 * AuthService implements user registration, login, password hashing,
 * JWT issuance/verification, and session cookie helpers.
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-example-secret';
const TOKEN_COOKIE = 'token';
const TOKEN_EXPIRES = 7 * 24 * 3600; // 7 days in seconds

class AuthService {
  // PUBLIC_INTERFACE
  async register(email, password) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return { success: false, error: 'User already exists.' };
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, password: hash } });
    const token = this._generateJWT({ id: user.id, email: user.email });
    return { success: true, user, token };
  }

  // PUBLIC_INTERFACE
  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: 'Incorrect email or password.' };
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return { success: false, error: 'Incorrect email or password.' };
    const token = this._generateJWT({ id: user.id, email: user.email });
    return { success: true, user, token };
  }

  // PUBLIC_INTERFACE
  verifyJWT(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }

  _generateJWT(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
  }

  /**
   * Set JWT token cookie securely.
   * Cookie settings:
   *  - httpOnly: prevents JS access on client, mitigates XSS
   *  - secure: cookie sent only over HTTPS (enabled in production)
   *  - sameSite: 'lax' prevents most CSRF, allowing only top-level nav POSTs (not AJAX from 3rd-party)
   *  - path: '/' (covers all API endpoints)
   *  - maxAge: session lasts for TOKEN_EXPIRES
   * Note: Must be paired with CORS setting credentials:true and explicit allowed origin.
   * Calling this will overwrite any existing session token.
   */
  // PUBLIC_INTERFACE
  setTokenCookie(res, token) {
    res.cookie(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRES * 1000,
      path: '/'
    });
  }

  /**
   * Clear the JWT token cookie (logout).
   * This method ensures all flags match those set, so browser cookie is discarded properly.
   * Always set httpOnly, sameSite, secure, path.
   */
  // PUBLIC_INTERFACE
  clearTokenCookie(res) {
    res.clearCookie(TOKEN_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
  }

  // PUBLIC_INTERFACE
  async getUserFromToken(token) {
    const payload = this.verifyJWT(token);
    if (!payload) return null;
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true }
    });
    return user;
  }
}

module.exports = new AuthService();
