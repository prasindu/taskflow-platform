const express = require('express');
const {
  getMyTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/my', getMyTasks);
router.put('/:id', authorize('ADMIN', 'PM'), updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', authorize('ADMIN', 'PM'), deleteTask);

module.exports = router;
