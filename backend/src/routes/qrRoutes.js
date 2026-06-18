const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const authMiddleware = require('../middleware/auth');

router.post('/shared/:token/visit', qrController.createVisitFromSharedToken);
router.get('/shared/:token', qrController.getSharedRecord);
router.post('/generate', authMiddleware, qrController.generateQRToken);
router.post('/validate', qrController.validateQRToken);

module.exports = router;
