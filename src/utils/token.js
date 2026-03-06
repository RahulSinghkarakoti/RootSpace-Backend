// src/utils/token.js
import jwt   from 'jsonwebtoken';
import crypto from 'crypto';

// ── JWT ──────────────────────────────────────────────────────────────────────

/**
 * Generate a short-lived access token.
 * Payload is kept minimal — only what the API needs on every request.
 */
const generateAccessToken = (user) =>
  jwt.sign(
    {
      sub:   user.id,
      email: user.email,
      role:  user.role,
      type:  'access',
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m', issuer: process.env.APP_NAME || 'AuthServer' }
  );

/**
 * Generate a long-lived refresh token (opaque random bytes).
 * We store only its SHA-256 hash in the DB — never the raw token.
 */
const generateRefreshToken = () => crypto.randomBytes(64).toString('hex');

/**
 * Hash any token string with SHA-256 for safe storage.
 */
const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

/**
 * Verify an access token. Returns decoded payload or throws.
 */
const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET);

/**
 * Compute refresh token expiry date from env string like "7d".
 */
const refreshTokenExpiresAt = () => {
  const raw = process.env.JWT_REFRESH_EXPIRES || '7d';
  const unit  = raw.slice(-1);
  const value = parseInt(raw);
  const ms = unit === 'd' ? value * 86400000
            : unit === 'h' ? value * 3600000
            : unit === 'm' ? value * 60000
            : value * 1000;
  return new Date(Date.now() + ms);
};

export  {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyAccessToken,
  refreshTokenExpiresAt,
};