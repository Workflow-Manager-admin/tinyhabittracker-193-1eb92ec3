const express = require('express');
const controller = require('../controllers/logs');

/**
 * @swagger
 * tags:
 *   - name: Logs
 *     description: Logging/checking-off for habits
 */
const router = express.Router();

router.get('/', controller.list.bind(controller));
router.post('/', controller.upsert.bind(controller));
router.patch('/:logId', controller.update.bind(controller));

module.exports = router;
