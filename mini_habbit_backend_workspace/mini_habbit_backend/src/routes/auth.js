const express = require('express');
const authController = require('../controllers/auth');
const { authMiddleware, loadUserIfAuthenticated } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication and session
 */

const router = express.Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.get('/me', loadUserIfAuthenticated, authController.me.bind(authController));

module.exports = router;
