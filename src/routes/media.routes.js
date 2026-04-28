import express from "express";
import { apiLimiter } from "../middleware/rateLimiter.js";
import { mediaValidate } from "../validators/media.validator.js";
import ctrl from "../controllers/media.controller.js";

const router = express.Router();

router.get("/:id", apiLimiter, ctrl.getMediaById);
router.patch("/:id", apiLimiter, mediaValidate("updateMedia"), ctrl.updateMedia);
router.delete("/:id", apiLimiter, ctrl.deleteMedia);

export default router;
