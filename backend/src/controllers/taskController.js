const prisma = require('../config/prisma');

const canManageProject = async (projectId, user) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { ok: false, code: 404, message: 'Project not found' };
  if (user.role === 'PM' && project.createdById !== user.id) {
    return { ok: false, code: 403, message: 'Not your project' };
  }
  return { ok: true, project };
};

// POST /api/projects/:projectId/tasks (ADMIN or owning PM)
const createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, priority, deadline, assigneeId } = req.body;

  const check = await canManageProject(projectId, req.user);
  if (!check.ok) return res.status(check.code).json({ message: check.message });

  if (!title) return res.status(400).json({ message: 'Task title is required' });

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority || 'MEDIUM',
      deadline: deadline ? new Date(deadline) : null,
      projectId,
      assigneeId: assigneeId || null,
    },
    include: { assignee: { select: { id: true, name: true } } },
  });

  res.status(201).json(task);
};

// GET /api/projects/:projectId/tasks
const getTasksByProject = async (req, res) => {
  const { projectId } = req.params;
  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: { assignee: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(tasks);
};

// GET /api/tasks/my - MEMBER: their assigned tasks
const getMyTasks = async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { assigneeId: req.user.id },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(tasks);
};

// PUT /api/tasks/:id (ADMIN or owning PM - full edit)
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, deadline, assigneeId, status } = req.body;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const check = await canManageProject(task.projectId, req.user);
  if (!check.ok) return res.status(check.code).json({ message: check.message });

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(priority && { priority }),
      ...(deadline && { deadline: new Date(deadline) }),
      ...(assigneeId !== undefined && { assigneeId }),
      ...(status && { status }),
    },
    include: { assignee: { select: { id: true, name: true } } },
  });
  res.json(updated);
};

// PATCH /api/tasks/:id/status - MEMBER updates status of own task (Kanban drag)
const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const isOwner = task.assigneeId === req.user.id;
  const isManager =
    req.user.role === 'ADMIN' ||
    (req.user.role === 'PM' && (await canManageProject(task.projectId, req.user)).ok);

  if (!isOwner && !isManager) {
    return res.status(403).json({ message: 'You cannot update this task' });
  }

  const updated = await prisma.task.update({ where: { id }, data: { status } });
  await prisma.activityLog.create({
    data: {
      action: 'Task Updated',
      details: `Task "${task.title}" status changed to ${status}`,
      projectId: task.projectId,
      userId: req.user.id
    }
  });
  res.json(updated);
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const check = await canManageProject(task.projectId, req.user);
  if (!check.ok) return res.status(check.code).json({ message: check.message });

  await prisma.task.delete({ where: { id } });
  res.json({ message: 'Task deleted' });
};

module.exports = {
  createTask,
  getTasksByProject,
  getMyTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
