import express from "express";
import { apiLimiter } from "../../middleware/rateLimiter.js";
import { educationValidate } from "./education.validator.js";
import ctrl from "./education.controller.js";

const router = express.Router();

router.post("/people/:personId/education", apiLimiter, educationValidate("createEducation"), ctrl.createEducation);
router.get("/people/:personId/education", apiLimiter, ctrl.getPersonEducation);
router.get("/education/:id", apiLimiter, ctrl.getEducationById);
router.patch("/education/:id", apiLimiter, educationValidate("updateEducation"), ctrl.updateEducation);
router.delete("/education/:id", apiLimiter, ctrl.deleteEducation);

export default router;
