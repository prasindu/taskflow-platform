const express = require('express');
const { getAllActivities } = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', authorize('ADMIN'), getAllActivities);

module.exports = router;