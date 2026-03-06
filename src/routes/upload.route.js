// src/routes/auth.routes.js
import express from 'express';
import passport from 'passport';
import ctrl     from '../controllers/upload.controller.js';
import { protect }    from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate }   from '../validators/auth.validator.js';
const router = express.Router();

 
router.get('/signature',
  // authLimiter,
  protect,
  ctrl.getSignature
);
  
 

export default router;