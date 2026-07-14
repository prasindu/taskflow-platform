require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const activitieRoutes = require('./routes/activityRoutes');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL  }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activities', activitieRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});



const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`CyphLab backend running on port ${PORT}`));
