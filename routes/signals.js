const express = require('express');
const router = express.Router();
const signalsController = require('../controllers/signalsController');

router.post('/mxn', signalsController.generateMXNSignals);
router.get('/upcoming', signalsController.getUpcomingSignals);
router.post('/clear-cache', signalsController.clearCache);

module.exports = router;
