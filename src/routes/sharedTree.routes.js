import express from "express";
import { apiLimiter } from "../middleware/rateLimiter.js";
import { personValidate } from "../validators/person.validator.js";
import sharedTreeCtrl from "../controllers/sharedTree.controller.js";

const router = express.Router();

router.get("/", apiLimiter, sharedTreeCtrl.getAllSharedTrees);
router.get("/:token/verify", apiLimiter, sharedTreeCtrl.verifyShareToken);
router.get("/:token", apiLimiter, sharedTreeCtrl.getSharedTreeData);
router.post(
  "/:token/person",
  apiLimiter,
  personValidate("createPerson"),
  sharedTreeCtrl.createSharedPerson,
);
router.patch(
  "/:token/person/:personId",
  apiLimiter,
  personValidate("updatePerson"),
  sharedTreeCtrl.updateSharedPerson,
);
router.delete(
  "/:token/person/:personId",
  apiLimiter,
  sharedTreeCtrl.deleteSharedPerson,
);

export default router;
