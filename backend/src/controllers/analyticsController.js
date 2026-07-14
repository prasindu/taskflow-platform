const prisma = require('../config/prisma');

const getDashboardStats = async (req, res) => {
  try {
    const { role, id } = req.user;

    if (role === 'ADMIN') {
      
      const projectStats = await prisma.project.groupBy({
        by: ['status'],
        _count: { id: true },
      });
      
      const formattedStats = projectStats.map(item => ({
        name: item.status,
        value: item._count.id
      }));

      return res.json({ projectStats: formattedStats });
    } 
    
    if (role === 'PM') {
      
      const tasks = await prisma.task.groupBy({
        by: ['status'],
        where: {
          project: { createdById: id } 
        },
        _count: { id: true },
      });

      const formattedStats = tasks.map(item => ({
        name: item.status,
        value: item._count.id
      }));

      return res.json({ taskStats: formattedStats });
    }

    res.status(403).json({ message: 'No analytics available for this role' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error in Analytics' });
  }
};

module.exports = { getDashboardStats };