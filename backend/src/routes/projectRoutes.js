const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMembers,
  removeMember,
} = require('../controllers/projectController');
const { createTask, getTasksByProject } = require('../controllers/taskController');
const { getMessages, sendMessage } = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('ADMIN', 'PM'), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', authorize('ADMIN', 'PM'), updateProject);
router.delete('/:id', authorize('ADMIN', 'PM'), deleteProject);

router.post('/:id/members', authorize('ADMIN', 'PM'), addMembers);
router.delete('/:id/members/:userId', authorize('ADMIN', 'PM'), removeMember);

// nested tasks
router.post('/:projectId/tasks', authorize('ADMIN', 'PM'), createTask);
router.get('/:projectId/tasks', getTasksByProject);

// nested chat
router.get('/:projectId/messages', getMessages);
router.post('/:projectId/messages', sendMessage);

module.exports = router;
