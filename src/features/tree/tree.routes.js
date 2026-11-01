import express from "express";
import { treeValidate } from "./tree.validator.js";
import { personValidate } from "../person/person.validator.js";
import { relationValidate } from "../relation/relation.validator.js";
import { mediaValidate } from "../media/media.validator.js";
import treeCtrl from "./tree.controller.js";
import personCtrl from "../person/person.controller.js";
import relationCtrl from "../relation/relation.controller.js";
import mediaCtrl from "../media/media.controller.js";

const router = express.Router();

router.post("/", treeValidate("createTree"), treeCtrl.createTree);
router.get("/", treeCtrl.getAllTrees);
router.get("/collaborations", treeCtrl.getCollaborations);
router.get("/:id", treeCtrl.getTreeById);
router.get("/slug/:slug", treeCtrl.getTreeBySlug);
router.delete("/:id", treeCtrl.deleteTree);
router.patch("/:id", treeValidate("updateTree"), treeCtrl.updateTree);

// share operations
router.post("/:treeId/share", treeValidate("generateShareLink"), treeCtrl.generateShareLink);
router.patch("/:treeId/share/:token", treeValidate("updateShareLink"), treeCtrl.updateTreeShareLink);
router.get("/:treeId/share", treeCtrl.getAllSharedTrees);
router.delete("/:treeId/share/:token", treeCtrl.deleteShareLink);

// people operations
router.post("/:treeId/person", personValidate("createPerson"), personCtrl.createPerson);
router.get("/:treeId/person", personCtrl.getAllPeople);
router.get("/:treeId/person/:personId", personCtrl.getPersonInTree);

// relation operations
router.post("/:treeId/relations", relationValidate("createRelation"), relationCtrl.createRelation);
router.get("/:treeId/relations", relationCtrl.getTreeRelations);

// media operations
router.post("/:treeId/media", mediaValidate("createMedia"), mediaCtrl.createMedia);
router.get("/:treeId/media", mediaCtrl.getTreeMedia);

export default router;
