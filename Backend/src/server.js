require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const { initializeSchema } = require('./schema');

const laborersRouter = require('./routes/laborers');
const sitesRouter = require('./routes/sites');
const attendanceRouter = require('./routes/attendance');
const paymentsRouter = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as connected, DATABASE() as db, VERSION() as version');
    res.json({
      status: 'healthy',
      database: rows[0].db,
      tidbVersion: rows[0].version,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// API Routes
app.use('/api/laborers', laborersRouter);
app.use('/api/sites', sitesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/payments', paymentsRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Server bootstrap
async function startServer() {
  try {
    console.log('[Server] Connecting to TiDB Cloud at', process.env.DB_HOST);
    await initializeSchema();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` Construction Labor Management API (Express.js)     `);
      console.log(` Database: TiDB Cloud [${process.env.DB_NAME}]       `);
      console.log(` Server running at: http://localhost:${PORT}        `);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
