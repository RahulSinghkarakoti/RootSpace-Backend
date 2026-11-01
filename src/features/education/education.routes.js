import express from "express";
import { educationValidate } from "./education.validator.js";
import ctrl from "./education.controller.js";

const router = express.Router();

router.post("/people/:personId/education", educationValidate("createEducation"), ctrl.createEducation);
router.get("/people/:personId/education", ctrl.getPersonEducation);
router.get("/education/:id", ctrl.getEducationById);
router.patch("/education/:id", educationValidate("updateEducation"), ctrl.updateEducation);
router.delete("/education/:id", ctrl.deleteEducation);

export default router;
