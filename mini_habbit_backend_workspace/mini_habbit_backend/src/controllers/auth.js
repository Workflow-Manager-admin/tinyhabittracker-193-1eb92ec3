const authService = require('../services/auth');

/**
 * PUBLIC_INTERFACE
 * Controller for authentication endpoints (register, login, logout, session check).
 */
class AuthController {
  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       201:
   *         description: User created successfully
   *       400:
   *         description: Invalid input or user already exists
   */
  async register(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password || password.length < 6) {
        return res.status(400).json({ error: 'Email and password (min 6 chars) required.' });
      }
      const result = await authService.register(email, password);
      if (!result.success) {
        return res.status(400).json({ error: result.error || 'Failed to register.' });
      }
      authService.setTokenCookie(res, result.token);
      return res.status(201).json({ user: { email: result.user.email } });
    } catch (e) {
      return res.status(500).json({ error: 'Registration error.' });
    }
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login with email and password
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Authenticated
   *       401:
   *         description: Invalid credentials
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
      const result = await authService.login(email, password);
      if (!result.success) {
        return res.status(401).json({ error: result.error || 'Invalid credentials' });
      }
      authService.setTokenCookie(res, result.token);
      return res.json({ user: { email: result.user.email } });
    } catch (e) {
      return res.status(500).json({ error: 'Login failed' });
    }
  }

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     summary: Logout current user
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Logout successful
   */
  async logout(req, res) {
    authService.clearTokenCookie(res);
    res.json({ message: 'Logged out' });
  }

  /**
   * @swagger
   * /auth/me:
   *   get:
   *     summary: Get current authenticated user
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Session valid
   *       401:
   *         description: Not authenticated
   */
  async me(req, res) {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    return res.json({ user: { email: req.user.email } });
  }
}

module.exports = new AuthController();
