const habitsService = require('../services/habits');

/**
 * PUBLIC_INTERFACE
 * Controller: Handles all /api/habits endpoints (list, create, update, delete) per authenticated user.
 */
class HabitsController {
  /**
   * @swagger
   * /api/habits:
   *   get:
   *     summary: List all habits for the authenticated user
   *     tags: [Habits]
   *     responses:
   *       200:
   *         description: Array of user habits
   */
  async list(req, res) {
    const habits = await habitsService.listHabits(req.user.id);
    res.json(habits);
  }

  /**
   * @swagger
   * /api/habits:
   *   post:
   *     summary: Create a new habit
   *     tags: [Habits]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *     responses:
   *       201:
   *         description: New habit created
   */
  async create(req, res) {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Habit name is required.' });
      }
      const habit = await habitsService.createHabit(req.user.id, name);
      res.status(201).json(habit);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Could not create habit' });
    }
  }

  /**
   * @swagger
   * /api/habits/{id}:
   *   patch:
   *     summary: Update an existing habit's name
   *     tags: [Habits]
   *     parameters:
   *       - in: path
   *         name: id
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
   *               name:
   *                 type: string
   *     responses:
   *       200:
   *         description: Updated habit
   */
  async update(req, res) {
    try {
      const habitId = parseInt(req.params.id, 10);
      const { name } = req.body;
      if (isNaN(habitId)) return res.status(400).json({ error: 'Invalid habit ID' });
      if (!name) return res.status(400).json({ error: 'New name required' });
      const habit = await habitsService.updateHabit(req.user.id, habitId, name);
      res.json(habit);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Could not update habit' });
    }
  }

  /**
   * @swagger
   * /api/habits/{id}:
   *   delete:
   *     summary: Delete a user habit
   *     tags: [Habits]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *     responses:
   *       204:
   *         description: Deleted
   */
  async delete(req, res) {
    try {
      const habitId = parseInt(req.params.id, 10);
      if (isNaN(habitId)) return res.status(400).json({ error: 'Invalid habit ID' });
      await habitsService.deleteHabit(req.user.id, habitId);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: err.message || 'Could not delete habit' });
    }
  }
}

module.exports = new HabitsController();
