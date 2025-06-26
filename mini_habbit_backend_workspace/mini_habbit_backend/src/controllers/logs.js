const logsService = require('../services/logs');

/**
 * PUBLIC_INTERFACE
 * Controller for /api/logs endpoints (batch reading, single create/update).
 */
class LogsController {
  /**
   * @swagger
   * /api/logs:
   *   get:
   *     summary: List log entries for the current user's habits, optionally filter by habit, date, or range
   *     tags: [Logs]
   *     parameters:
   *       - in: query
   *         name: habitId
   *         schema:
   *           type: integer
   *       - in: query
   *         name: from
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: to
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: day
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         description: Array of logs
   */
  async list(req, res) {
    try {
      const { habitId, from, to, day } = req.query;
      const logs = await logsService.listLogs(req.user.id, { habitId, from, to, day });
      res.json(logs);
    } catch (e) {
      res.status(400).json({ error: e.message || 'Could not fetch logs' });
    }
  }

  /**
   * @swagger
   * /api/logs:
   *   post:
   *     summary: Create or update (check-in) a log for habit/day. Will upsert.
   *     tags: [Logs]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               habitId:
   *                 type: integer
   *               day:
   *                 type: string
   *                 format: date
   *               done:
   *                 type: boolean
   *             required: [habitId, day, done]
   *     responses:
   *       201:
   *         description: Created or updated log
   */
  async upsert(req, res) {
    try {
      const { habitId, day, done } = req.body;
      if (!habitId || !day || typeof done !== 'boolean') {
        return res.status(400).json({ error: 'habitId, day, and done required' });
      }
      const log = await logsService.upsertLog(req.user.id, parseInt(habitId, 10), day, done);
      res.status(201).json(log);
    } catch (e) {
      res.status(400).json({ error: e.message || 'Check-in error' });
    }
  }

  /**
   * @swagger
   * /api/logs/{logId}:
   *   patch:
   *     summary: Update a log "done" state by ID (only if user owns it)
   *     tags: [Logs]
   *     parameters:
   *       - in: path
   *         name: logId
   *         schema:
   *           type: integer
   *         required: true
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               done:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Updated log
   */
  async update(req, res) {
    try {
      const logId = parseInt(req.params.logId, 10);
      const patch = req.body || {};
      if (isNaN(logId) || typeof patch.done !== 'boolean') {
        return res.status(400).json({ error: 'Valid logId and done required' });
      }
      const updated = await logsService.updateLogById(req.user.id, logId, patch);
      res.json(updated);
    } catch (e) {
      res.status(400).json({ error: e.message || 'Failed to update log' });
    }
  }
}

module.exports = new LogsController();
