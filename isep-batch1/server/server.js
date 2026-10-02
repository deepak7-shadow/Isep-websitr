require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Initialize app
const app = express();

// Connect to MongoDB (with graceful fallback if offline)
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'ISEP Batch 1 Archive API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes according to Section 8
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/thoughts', require('./routes/thoughts'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[API Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[ISEP Archive Server] REST API running on port ${PORT}`);
  console.log(`[ISEP Archive Server] Endpoints:`);
  console.log(`  - POST   /api/auth/login`);
  console.log(`  - GET    /api/photos`);
  console.log(`  - POST   /api/photos (Admin)`);
  console.log(`  - DELETE /api/photos/:id (Admin)`);
  console.log(`  - GET    /api/certificates`);
  console.log(`  - POST   /api/certificates (Admin)`);
  console.log(`  - GET    /api/achievements`);
  console.log(`  - POST   /api/achievements (Admin)`);
  console.log(`  - GET    /api/thoughts`);
  console.log(`  - POST   /api/thoughts`);
  console.log(`  - PATCH  /api/thoughts/:id (Admin)`);
  console.log(`  - DELETE /api/thoughts/:id (Admin)`);
});

module.exports = app;
