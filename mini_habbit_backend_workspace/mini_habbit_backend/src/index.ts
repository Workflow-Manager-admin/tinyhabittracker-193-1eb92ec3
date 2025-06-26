import express from 'express';

/**
 * PUBLIC_INTERFACE
 * The entry point for the Express app in TypeScript.
 * Sets up a basic Express server and listens on specified port.
 */
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Service is healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`TS Server running at http://localhost:${PORT}`);
});
