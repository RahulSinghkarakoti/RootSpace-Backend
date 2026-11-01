import express from "express";
import { mediaValidate } from "./media.validator.js";
import ctrl from "./media.controller.js";

const router = express.Router();

router.get("/:id", ctrl.getMediaById);
router.patch("/:id", mediaValidate("updateMedia"), ctrl.updateMedia);
router.delete("/:id", ctrl.deleteMedia);

export default router;
