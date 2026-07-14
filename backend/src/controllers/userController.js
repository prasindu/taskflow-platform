const prisma = require('../config/prisma');
const { sendUserApprovedEmail } = require('../utils/email');

// GET /api/users/pending - admin only
const getPendingUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    where: { isApproved: false },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  res.json(users);
};

// GET /api/users - admin only, list all (for member-select dropdowns etc)
const getAllUsers = async (req, res) => {
  const { approvedOnly } = req.query;
  const users = await prisma.user.findMany({
    where: approvedOnly === 'true' ? { isApproved: true } : {},
    select: { id: true, name: true, email: true, role: true, isApproved: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
};

// PATCH /api/users/:id/approve - admin only { role: 'PM' | 'MEMBER' }
const approveUser = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['ADMIN', 'PM', 'MEMBER'].includes(role)) {
    return res.status(400).json({ message: 'Valid role is required (ADMIN, PM, MEMBER)' });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isApproved: true, role },
  });

  
  sendUserApprovedEmail({
    toEmail: user.email,
    userName: user.name,
  });

  res.json({ message: 'User approved', user: { id: user.id, name: user.name, role: user.role } });
};

// PATCH /api/users/:id/role - admin only, change role of an already approved user
const changeRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['ADMIN', 'PM', 'MEMBER'].includes(role)) {
    return res.status(400).json({ message: 'Valid role is required' });
  }

  const user = await prisma.user.update({ where: { id }, data: { role } });
  res.json({ message: 'Role updated', user: { id: user.id, role: user.role } });
};

module.exports = { getPendingUsers, getAllUsers, approveUser, changeRole };
