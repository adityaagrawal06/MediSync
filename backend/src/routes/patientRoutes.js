const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/auth');

router.get('/me', authMiddleware, patientController.getMe);
router.put('/me', authMiddleware, patientController.updateMe);

module.exports = router;
