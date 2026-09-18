require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./src/routes/api');
const errorHandler = require('./src/middleware/errorHandler');
const { PORT } = require('./src/config/constants');
const db = require('./src/db/database');

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

// Body parsing middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Study Companion API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Serve the production React build from the same Node service.
const clientDist = path.join(__dirname, '../client/dist');
if (require('fs').existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 AI Study Companion Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`📊 Health check at http://localhost:${PORT}/health`);
  console.log(`====================================================`);
});

module.exports = { app, server };
