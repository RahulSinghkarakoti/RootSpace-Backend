// src/routes/auth.routes.js
import express from 'express';
import ctrl from './upload.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { validate } from '../auth/auth.validator.js';
const router = express.Router();


router.get('/signature',
  // authLimiter,
  protect,
  ctrl.getSignature,
);

router.post('/avatar',
  protect,
  validate('saveAvatarFile'),
  ctrl.saveAvatarFile,
);

router.post('/bills',
  protect,
  validate('saveBillFile'),
  ctrl.saveBillFile,
);


export default router;