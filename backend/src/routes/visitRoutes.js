const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', authMiddleware, visitController.createVisit);
router.get('/', authMiddleware, visitController.getVisits);
router.get('/:id', authMiddleware, visitController.getVisit);
router.post('/:id/prescriptions', authMiddleware, visitController.addPrescription);
router.post('/:id/medications', authMiddleware, visitController.addMedication);
router.post('/:id/reports', authMiddleware, upload.single('file'), visitController.uploadReport);

module.exports = router;
