require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');

const authRoutes = require('./routes/auth');
const driverRoutes = require('./routes/drivers');
const tripRoutes = require('./routes/trips');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      const allowed = String(process.env.FRONTEND_URL || 'http://localhost:5173')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

      if (!origin) return callback(null, true);
      if (allowed.includes(origin) || /\.vercel\.app$/i.test(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'connected' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'John Move API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
