const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./config/db');

// ─── Connect to MongoDB Atlas ────────────────────────────
connectDB();

// ─── Express App ─────────────────────────────────────────
const app  = express();
const PORT = Number(process.env.PORT) || 5055;

const DEFAULT_ALLOWED_ORIGINS = [
  'https://multi-branch-ats.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
const extraOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = [...DEFAULT_ALLOWED_ORIGINS, ...extraOrigins];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth.routes'));
app.use('/api/jobs',         require('./routes/job.routes'));
app.use('/api/applications', require('./routes/application.routes'));
app.use('/api/branches',     require('./routes/branch.routes'));
app.use('/api/interviews',   require('./routes/interview.routes'));

// ─── Health check ────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── 404 handler ─────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.path} not found` }));

// ─── Global error handler ────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ─── Start server ────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`[Server] ATS API running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Error] Port ${PORT} already in use. Change PORT in server/.env`);
  } else {
    console.error('[Error]', err);
  }
  process.exit(1);
});
