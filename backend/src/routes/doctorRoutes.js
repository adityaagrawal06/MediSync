const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

router.post('/', doctorController.createDoctor);
router.post('/qr-visit', doctorController.createVisitViaQR);

module.exports = router;
