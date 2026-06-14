// src/routes/auth.routes.js
import express from 'express';
import passport from 'passport';
import ctrl from './auth.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { validate } from './auth.validator.js';
const router = express.Router();

// ── Local Auth ──────────────────────────────────────────────────────────────

// POST /auth/register
router.post('/register',
  authLimiter,
  validate('register'),
  ctrl.register
);

// POST /auth/login
router.post('/login',
  authLimiter,
  validate('login'),
  ctrl.login
);

router.post('/send-password-reset-email',
  authLimiter,
  validate('sendPasswordResetEmail'), 
  ctrl.sendPasswordResetEmail
);

router.post('/change-password',
  authLimiter,
  validate('changePassword'),
  ctrl.changePassword
);

// POST /auth/refresh
// Public — but rate-limited. Body: { refreshToken }
router.post('/refresh',
  authLimiter,
  validate('refreshToken'),
  ctrl.refreshToken
);

// POST /auth/logout  (requires valid access token)
router.post('/logout',
  protect,
  ctrl.logout
);

// POST /auth/logout-all
router.post('/logout-all',
  protect,
  ctrl.logoutAll
);

router.post('/revoke-session/:sessionId',
  protect,
  ctrl.revokeSession
);

// ── OAuth — Google ───────────────────────────────────────────────────────────

// GET /auth/google  → redirects to Google consent screen
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// GET /auth/google/callback  → Google redirects here after consent
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/v1/auth/google/failed' }),
  ctrl.oauthCallback
);

router.get('/google/failed', (_req, res) => {
  res.status(401).json({ success: false, message: 'Google authentication failed' });
});

// ── Protected ─────────────────────────────────────────────────────────────────

// GET /auth/me
router.get('/me', protect, ctrl.me);

// GET /auth/sessions
router.get('/sessions', protect, ctrl.sessions);

export default router;