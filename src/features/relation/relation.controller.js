import relationService from "./relation.service.js";
import { sendSuccess, sendCreated } from "../../utils/response.js";
import { invalidateRelationCache } from "../../lib/cache.js";

const createRelation = async (req, res) => {
  const result = await relationService.createRelation(
    req.params.treeId,
    req.body,
    req,
  );
  await invalidateRelationCache(req.params.treeId);
  sendCreated(res, "Relation created successfully", result);
};

const getTreeRelations = async (req, res) => {
  const result = await relationService.getTreeRelations(req.params.treeId, req);
  sendSuccess(res, "Relations fetched successfully", result);
};

const getRelationById = async (req, res) => {
  const result = await relationService.getRelationById(req.params.id, req);
  sendSuccess(res, "Relation fetched successfully", result);
};

const updateRelation = async (req, res) => {
  const result = await relationService.updateRelation(req.params.id, req.body, req);
  sendSuccess(res, "Relation updated successfully", result);
};

const deleteRelation = async (req, res) => {
  const result = await relationService.deleteRelation(req.params.id, req);
  sendSuccess(res, "Relation deleted successfully", result);
};

export default {
  createRelation,
  getTreeRelations,
  getRelationById,
  updateRelation,
  deleteRelation,
};
