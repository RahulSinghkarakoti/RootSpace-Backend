import express from "express";
import { personValidate } from "../person/person.validator.js";
import sharedTreeCtrl from "./sharedTree.controller.js";

const router = express.Router();

router.get("/", sharedTreeCtrl.getAllSharedTrees);
router.get("/:token/verify", sharedTreeCtrl.verifyShareToken);
router.get("/:token", sharedTreeCtrl.getSharedTreeData);
router.post(
  "/:token/person",
  personValidate("createPerson"),
  sharedTreeCtrl.createSharedPerson,
);
router.patch(
  "/:token/person/:personId",
  personValidate("updatePerson"),
  sharedTreeCtrl.updateSharedPerson,
);
router.delete(
  "/:token/person/:personId",
  sharedTreeCtrl.deleteSharedPerson,
);

export default router;
