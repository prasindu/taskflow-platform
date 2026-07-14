const prisma = require('../config/prisma');


const getAllActivities = async (req, res) => {
  try {
    const activities = await prisma.activityLog.findMany({
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } } 
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching all activities' });
  }
};

module.exports = { getAllActivities };