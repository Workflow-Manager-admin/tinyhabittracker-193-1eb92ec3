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

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Swagger docs
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      {
        url: `${req.protocol}://${req.get('host')}`,
      },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Body/JSON/cookie parsing
app.use(express.json());
app.use(cookieParser());

// Mount /auth endpoints (unprotected except /me)
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// API route-protection: all /api endpoints require authentication
const { authMiddleware } = require('./middleware/auth');

// You must add code like: app.use('/api', authMiddleware);
// This will be invoked before any /api/* route handlers (habits, logs, etc)
app.use('/api', authMiddleware);

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
