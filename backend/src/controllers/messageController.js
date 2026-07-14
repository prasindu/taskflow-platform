const prisma = require('../config/prisma');

const isProjectMember = async (projectId, user) => {
  if (user.role === 'ADMIN') return true;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return false;
  if (user.role === 'PM' && project.createdById === user.id) return true;
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  return !!membership;
};

// GET /api/projects/:projectId/messages
const getMessages = async (req, res) => {
  const { projectId } = req.params;
  const allowed = await isProjectMember(projectId, req.user);
  if (!allowed) return res.status(403).json({ message: 'Not a member of this project' });

  const messages = await prisma.message.findMany({
    where: { projectId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(messages);
};

// POST /api/projects/:projectId/messages { content }
const sendMessage = async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

  const allowed = await isProjectMember(projectId, req.user);
  if (!allowed) return res.status(403).json({ message: 'Not a member of this project' });

  const message = await prisma.message.create({
    data: { content, projectId, userId: req.user.id },
    include: { user: { select: { id: true, name: true } } },
  });
  res.status(201).json(message);
};

module.exports = { getMessages, sendMessage };
