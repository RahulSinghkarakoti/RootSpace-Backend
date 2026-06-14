import express from "express";
import { apiLimiter } from "../../middleware/rateLimiter.js";
import { personValidate } from "./person.validator.js";
import ctrl from "./person.controller.js";

const router = express.Router();

router.get("/:id", apiLimiter, ctrl.getPersonById);
router.patch("/:id", apiLimiter, personValidate("updatePerson"), ctrl.updatePerson);
router.delete("/:id", apiLimiter, ctrl.deletePerson);

export default router;
