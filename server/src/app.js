const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const agentsRoutes = require('./routes/agents');
const profilesRoutes = require('./routes/profiles');
const cooldownsRoutes = require('./routes/cooldowns');
const limitsRoutes = require('./routes/limits');
const dataRoutes = require('./routes/data');
const path = require('path');
const { authenticateToken } = require('./middleware/auth');

app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/agents', authenticateToken, agentsRoutes);
app.use('/api/profiles', authenticateToken, profilesRoutes);
app.use('/api/cooldowns', authenticateToken, cooldownsRoutes);
app.use('/api/limits', authenticateToken, limitsRoutes);
app.use('/api/data', authenticateToken, dataRoutes);

// Serve frontend statics
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
