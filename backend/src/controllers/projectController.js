const prisma = require('../config/prisma');
const { sendProjectAssignedEmail } = require('../utils/email');

const projectInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
  members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
  _count: { select: { tasks: true } },
};

// POST /api/projects  (ADMIN or PM)
const createProject = async (req, res) => {
  try {
    const { name, description, deadline, memberIds = [] } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = await prisma.project.create({
      data: {
        name,
        description,
        deadline: deadline ? new Date(deadline) : null,
        status: 'PLANNING',
        createdById: req.user.id,
        members: {
          create: memberIds.map((userId) => ({ userId })),
        },
      },
      include: projectInclude,
    });

    // fire off assignment emails (non-blocking)
    if (memberIds.length) {
      const members = await prisma.user.findMany({ where: { id: { in: memberIds } } });
      members.forEach((m) => {
        sendProjectAssignedEmail({
          toEmail: m.email,
          userName: m.name,
          projectName: project.name,
          assignedByName: req.user.name,
        });
      });
    }

    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/projects  -> admin: all, PM: created by them, MEMBER: assigned to them
const getProjects = async (req, res) => {
  let where = {};
  if (req.user.role === 'PM') {
    where = { createdById: req.user.id };
  } else if (req.user.role === 'MEMBER') {
    where = { members: { some: { userId: req.user.id } } };
  }

  const projects = await prisma.project.findMany({
    where,
    include: projectInclude,
    orderBy: { createdAt: 'desc' },
  });
  res.json(projects);
};

const getProjectById = async (req, res) => {
  const { id } = req.params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { ...projectInclude, tasks: { include: { assignee: { select: { id: true, name: true } } } } },
  });
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
};

// PUT /api/projects/:id  (ADMIN or owning PM)
const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, deadline, status } = req.body;

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Project not found' });
  if (req.user.role === 'PM' && existing.createdById !== req.user.id) {
    return res.status(403).json({ message: 'Not your project' });
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(deadline && { deadline: new Date(deadline) }),
      ...(status && { status }),
    },
    include: projectInclude,
  });
  res.json(project);
};

const deleteProject = async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Project not found' });
  if (req.user.role === 'PM' && existing.createdById !== req.user.id) {
    return res.status(403).json({ message: 'Not your project' });
  }
  await prisma.project.delete({ where: { id } });
  res.json({ message: 'Project deleted' });
};

// POST /api/projects/:id/members  { memberIds: [...] } - adds members + sends email
const addMembers = async (req, res) => {
  const { id } = req.params;
  const { memberIds = [] } = req.body;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (req.user.role === 'PM' && project.createdById !== req.user.id) {
    return res.status(403).json({ message: 'Not your project' });
  }

  await prisma.projectMember.createMany({
    data: memberIds.map((userId) => ({ projectId: id, userId })),
    skipDuplicates: true,
  });

  const members = await prisma.user.findMany({ where: { id: { in: memberIds } } });
  members.forEach((m) => {
    sendProjectAssignedEmail({
      toEmail: m.email,
      userName: m.name,
      projectName: project.name,
      assignedByName: req.user.name,
    });
  });

  const updated = await prisma.project.findUnique({ where: { id }, include: projectInclude });
  res.json(updated);
};

const removeMember = async (req, res) => {
  const { id, userId } = req.params;
  await prisma.projectMember.deleteMany({ where: { projectId: id, userId } });
  res.json({ message: 'Member removed' });
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMembers,
  removeMember,
};
