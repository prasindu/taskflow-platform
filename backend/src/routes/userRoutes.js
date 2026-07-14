const express = require('express');
const { getPendingUsers, getAllUsers, approveUser, changeRole } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', authorize('ADMIN', 'PM'), getAllUsers); // PM needs this for member-select dropdown
router.get('/pending', authorize('ADMIN'), getPendingUsers);
router.patch('/:id/approve', authorize('ADMIN'), approveUser);
router.patch('/:id/role', authorize('ADMIN'), changeRole);

module.exports = router;
