const express = require('express');
const controller = require('../controllers/habits');

/**
 * @swagger
 * tags:
 *   - name: Habits
 *     description: CRUD for user habits
 */
const router = express.Router();

router.get('/', controller.list.bind(controller));
router.post('/', controller.create.bind(controller));
router.patch('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

module.exports = router;
