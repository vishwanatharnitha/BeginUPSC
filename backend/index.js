require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

let dbInitialized = false;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${new Date().toISOString()} | Method: ${req.method} | URL: ${req.url} | Path: ${req.path}`);
  next();
});

// URL normalization middleware to handle Vercel rewrites and path variants
app.use((req, res, next) => {
  const originalUrl = req.url;
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '/api');
  } else if (!req.url.startsWith('/api') && !req.url.startsWith('/health')) {
    req.url = '/api' + req.url;
  }
  
  if (originalUrl !== req.url) {
    console.log(`[ROUTE NORMALIZATION] Rewrote URL from ${originalUrl} to ${req.url}`);
  }
  next();
});

// Lazy-initialize database on Vercel
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      console.log('[DATABASE] First request received. Initializing connection...');
      await initDb();
      dbInitialized = true;
      console.log('[DATABASE] Lazy-initialization completed successfully.');
    } catch (err) {
      console.error('[DATABASE] Lazy-initialization failed:', err.message);
      return res.status(500).json({
        message: 'Internal server error during database initialization.',
        error: err.message
      });
    }
  }
  next();
});

// Enable CORS with secure credentials-supported options
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*') || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Bind API routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Exception:', err.stack);
  res.status(500).json({
    message: 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server after DB initialization
const startServer = async () => {
  try {
    await initDb();
    dbInitialized = true;
    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`BeginUPSC Backend running on port: ${PORT}`);
      console.log(`API base path: http://localhost:${PORT}/api`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`===================================================`);
    });
  } catch (err) {
    console.error('Failed to start server due to database error:', err.message);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}

module.exports = app;
