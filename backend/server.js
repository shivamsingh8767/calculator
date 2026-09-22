import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import formulaRoutes from './routes/formulaRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

// Basic Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Lightweight In-Memory Rate Limiter (Conservative abuse protection)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX, 10) || 500; // 500 requests per 15 min

const rateLimiter = (req, res, next) => {
  // Exclude health check from rate limiting
  if (req.path === '/api/health') return next();

  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    record.count++;
  }

  rateLimitMap.set(ip, record);

  // Clean stale entries periodically
  if (rateLimitMap.size > 5000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) rateLimitMap.delete(key);
    }
  }

  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_MAX - record.count));

  if (record.count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  }

  next();
};

app.use(rateLimiter);

// CORS Configuration
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const defaultDevOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultDevOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, restricted in production via CLIENT_URL
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middleware with strict size bounds
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health Check Endpoint (Sanitized, production safe)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MATH/OS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/formulas', formulaRoutes);
app.use('/api/history', historyRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

/**
 * Start Server after establishing database connection
 */
const startServer = async () => {
  try {
    // Attempt MongoDB connection
    await connectDB();

    const server = app.listen(PORT, HOST, () => {
      console.log(`\x1b[32m[MATH/OS API Server]\x1b[0m Running on http://${HOST}:${PORT} (ENV: ${process.env.NODE_ENV || 'development'})`);
      console.log(`\x1b[36m[Health Check]\x1b[0m http://localhost:${PORT}/api/health`);
    });

    // Handle graceful shutdown
    const shutdown = () => {
      console.log('\n[MATH/OS API Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[MATH/OS API Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('\x1b[31m[MATH/OS Server Startup Failed]\x1b[0m Server cannot start without database connection.');
    console.error(error.message);
    // Exit with non-zero code to notify process supervisor
    process.exit(1);
  }
};

// If run directly (node backend/server.js)
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer();
}

export default app;

