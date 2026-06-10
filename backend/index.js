require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

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
} else {
  // On Vercel (production serverless), lazy-initialize database connection on the first request
  let dbInitialized = false;
  app.use(async (req, res, next) => {
    if (!dbInitialized) {
      try {
        await initDb();
        dbInitialized = true;
      } catch (err) {
        console.error('Failed to lazy initialize database:', err.message);
      }
    }
    next();
  });
}

module.exports = app;
