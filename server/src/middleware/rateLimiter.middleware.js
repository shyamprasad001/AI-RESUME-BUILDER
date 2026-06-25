import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

const createLimiter = (options) => {
  return rateLimit({
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next, options) => {
      logger.warn({ ip: req.ip, path: req.originalUrl }, 'Rate limit exceeded');
      res.status(options.statusCode).send(options.message);
    },
    ...options,
  });
};

// Global Limiter: 100 requests per 15 minutes
export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || '100', 10),
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Strict Limiter (AI & Heavy Endpoints): 5 requests per 1 minute
export const strictLimiter = createLimiter({
  windowMs: 1 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_STRICT_MAX || '5', 10),
  message: {
    success: false,
    message: 'Too many heavy requests from this IP, please try again after a minute'
  }
});
