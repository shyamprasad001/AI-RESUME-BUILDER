// ============================================
// app.js - Express Application Setup
// ============================================
// Configures the Express app with CORS, body parsing,
// API routes, and error handling.
// ============================================

import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import logger from './utils/logger.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { globalLimiter } from './middleware/rateLimiter.middleware.js';

const app = express(); // Express app instance (Express.js: Application Setup)
app.set('trust proxy', 1); // Trust first proxy (Render) for rate limiting

// --- Middleware ---
app.use(pinoHttp({ logger }));
const getOrigins = () => {
  const origins = ['http://localhost:5173'];
  if (process.env.CLIENT_URL) {
    origins.push(process.env.CLIENT_URL.startsWith('http') ? process.env.CLIENT_URL : `https://${process.env.CLIENT_URL}`);
  }
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL.startsWith('http') ? process.env.FRONTEND_URL : `https://${process.env.FRONTEND_URL}`);
  }
  return origins;
};

app.use(cors({ origin: getOrigins(), credentials: true }));
app.use(globalLimiter);
app.use(express.json({ limit: '10mb' }));

// Set COOP header to allow Google Auth popups to work smoothly
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// --- Routes ---
app.use('/api', routes); // Route mounting (Express.js: Route Organization)

// --- Error Handling ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
