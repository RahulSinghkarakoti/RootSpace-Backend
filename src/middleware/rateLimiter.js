// src/middleware/rateLimiter.js
import  rateLimit from'express-rate-limit';
import { sendError }from '../utils/response.js';

const buildLimiter = (max, windowMs, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => sendError(res, 429, message),
  });

// General API limiter
const apiLimiter = buildLimiter(
  parseInt(process.env.RATE_LIMIT_MAX) || 100,
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  'Too many requests. Please try again later.',
);

// Strict limiter for auth endpoints (login, register, etc.)
const authLimiter = buildLimiter(
  parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  15 * 60 * 1000,
  'Too many auth attempts. Please wait 15 minutes.',
);

const uploadLimiter = buildLimiter(
  parseInt(process.env.UPLOAD_RATE_LIMIT_MAX) || 10,
  15 * 60 * 1000,
  'Too many upload attempts. Please wait 15 minutes.',
);

export{ apiLimiter, authLimiter ,uploadLimiter};