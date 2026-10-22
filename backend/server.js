require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { router: authRouter } = require('./routes/auth');
const syncRouter = require('./routes/sync');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/typez';

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'TypEz Sync Backend',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/sync', syncRouter);

// Database Connection & Server Boot
async function startServer() {
  try {
    if (process.env.MONGODB_URI) {
      console.log('[TypEz Backend] Connecting to MongoDB Atlas...');
      await mongoose.connect(MONGODB_URI);
      console.log('[TypEz Backend] MongoDB connection established successfully.');
    } else {
      console.warn(
        '[TypEz Backend] Warning: MONGODB_URI is not set in environment. Running in mock/standalone mode. Add your MongoDB connection string in .env to enable database storage.'
      );
    }
  } catch (err) {
    console.error('[TypEz Backend] MongoDB connection error:', err.message);
    console.log('[TypEz Backend] Starting server in offline-database mode...');
  }

  app.listen(PORT, () => {
    console.log(`[TypEz Backend] Server listening on port ${PORT}`);
    console.log(`[TypEz Backend] Health check available at: http://localhost:${PORT}/api/health`);
  });
}

startServer();
