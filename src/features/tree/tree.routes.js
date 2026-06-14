import express from "express";
import { apiLimiter } from "../../middleware/rateLimiter.js";
import { treeValidate } from "./tree.validator.js";
import { personValidate } from "./person.validator.js";
import { relationValidate } from "./relation.validator.js";
import { mediaValidate } from "./media.validator.js";
import treeCtrl from "./tree.controller.js";
import personCtrl from "./person.controller.js";
import relationCtrl from "./relation.controller.js";
import mediaCtrl from "./media.controller.js";

const router = express.Router();

router.post("/", apiLimiter, treeValidate("createTree"), treeCtrl.createTree);
router.get("/", apiLimiter, treeCtrl.getAllTrees);
router.get('/collaborations', apiLimiter, treeCtrl.getCollaborations);
router.get("/:id", treeCtrl.getTreeById);
router.get("/slug/:slug", treeCtrl.getTreeBySlug);
router.delete("/:id", treeCtrl.deleteTree);
router.patch(
  "/:id",
  apiLimiter,
  treeValidate("updateTree"),
  treeCtrl.updateTree,
);

//share operations
router.post("/:treeId/share", apiLimiter, treeValidate("generateShareLink"), treeCtrl.generateShareLink,);
router.patch("/:treeId/share/:token",apiLimiter,treeValidate("updateShareLink"),treeCtrl.updateTreeShareLink)
router.get("/:treeId/share", treeCtrl.getAllSharedTrees);
router.delete("/:treeId/share/:token", treeCtrl.deleteShareLink);
// people operations
router.post(
  "/:treeId/person",
  apiLimiter,
  personValidate("createPerson"),
  personCtrl.createPerson,
);

router.get("/:treeId/person", apiLimiter, personCtrl.getAllPeople);
router.get("/:treeId/person/:personId", apiLimiter, personCtrl.getPersonInTree);

// relation operations
router.post(
  "/:treeId/relations",
  apiLimiter,
  relationValidate("createRelation"),
  relationCtrl.createRelation,
);
router.get("/:treeId/relations", apiLimiter, relationCtrl.getTreeRelations);

// media operations
router.post(
  "/:treeId/media",
  apiLimiter,
  mediaValidate("createMedia"),
  mediaCtrl.createMedia,
);
router.get("/:treeId/media", apiLimiter, mediaCtrl.getTreeMedia);

export default router;
