import express from "express";
import { personValidate } from "./person.validator.js";
import ctrl from "./person.controller.js";

const router = express.Router();

router.get("/:id", ctrl.getPersonById);
router.patch("/:id", personValidate("updatePerson"), ctrl.updatePerson);
router.delete("/:id", ctrl.deletePerson);

export default router;
