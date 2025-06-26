const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

/**
 * PUBLIC_INTERFACE
 * Express application root: mounts global middleware, Swagger, and routes.
 * Adds cookie-parser for secure session management.
 * Protects all /api routes (e.g., /api/habits, /api/logs) with authentication middleware.
 */
const app = express();

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps/curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS origin not allowed'), false);
    }
  },
  credentials: true, // allow cookies (HTTP-only)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

/**
 * Serve Swagger API documentation at /docs using Swagger UI Express.
 * This provides an interactive UI for exploring API endpoints.
 */
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Body/JSON/cookie parsing
app.use(express.json());
app.use(cookieParser());

// Mount /auth endpoints (unprotected except /me)
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const { authMiddleware } = require('./middleware/auth');

const habitsRoutes = require('./routes/habits');
const logsRoutes = require('./routes/logs');

app.use('/api', authMiddleware);

// Mount protected /api/habits and /api/logs for all logged-in users
app.use('/api/habits', habitsRoutes);
app.use('/api/logs', logsRoutes);

// Mount legacy/health check and other routes (these are public)
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

module.exports = app;
