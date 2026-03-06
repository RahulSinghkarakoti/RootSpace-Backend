// src/routes/index.js
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import uploadRoutes from './upload.route.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Future: const ocrRoutes  = require('./ocr.routes');
// Future: const llmRoutes  = require('./llm.routes');

router.use('/auth', authRoutes);
router.use('/upload',protect, uploadRoutes);
// router.use('/ocr', protect, ocrRoutes);
// router.use('/llm', protect, llmRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

export default router;