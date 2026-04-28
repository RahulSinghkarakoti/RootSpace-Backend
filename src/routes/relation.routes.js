import express from "express";
import { apiLimiter } from "../middleware/rateLimiter.js";
import { relationValidate } from "../validators/relation.validator.js";
import ctrl from "../controllers/relation.controller.js";

const router = express.Router();

router.get("/:id", apiLimiter, ctrl.getRelationById);
router.patch("/:id", apiLimiter, relationValidate("updateRelation"), ctrl.updateRelation);
router.delete("/:id", apiLimiter, ctrl.deleteRelation);

export default router;
