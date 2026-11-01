import express from "express";
import { relationValidate } from "./relation.validator.js";
import ctrl from "./relation.controller.js";

const router = express.Router();

router.get("/:id", ctrl.getRelationById);
router.patch("/:id", relationValidate("updateRelation"), ctrl.updateRelation);
router.delete("/:id", ctrl.deleteRelation);

export default router;
