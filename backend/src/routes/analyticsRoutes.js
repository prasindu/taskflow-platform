const express = require('express');
const { getDashboardStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/', authorize('ADMIN', 'PM'), getDashboardStats);

module.exports = router;