// src/routes/index.js
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import uploadRoutes from './upload.route.js';
import treeRoutes from './tree.routes.js'
import sharedTreeRoutes from './sharedTree.routes.js';
import personRoutes from './person.routes.js';
import relationRoutes from './relation.routes.js';
import mediaRoutes from './media.routes.js';
import educationRoutes from './education.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Future: const ocrRoutes  = require('./ocr.routes');
// Future: const llmRoutes  = require('./llm.routes');

router.use('/auth', authRoutes);
router.use('/dashboard', protect, dashboardRoutes);
router.use('/shared-trees', protect, sharedTreeRoutes);
router.use('/trees',protect, treeRoutes);
router.use('/person', protect, personRoutes);
router.use('/relations', protect, relationRoutes);
router.use('/media', protect, mediaRoutes);
router.use('/upload',protect, uploadRoutes);
router.use('/', protect, educationRoutes);
// router.use('/ocr', protect, ocrRoutes);
// router.use('/llm', protect, llmRoutes);
 
// Ping route for quick liveliness check
router.get('/ping', (_req, res) => {
  res.json({ success: true, message: 'pong' });
});

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
