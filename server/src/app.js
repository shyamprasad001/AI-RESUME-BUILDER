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

// --- Middleware ---
app.use(pinoHttp({ logger }));
app.use(globalLimiter);
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
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
