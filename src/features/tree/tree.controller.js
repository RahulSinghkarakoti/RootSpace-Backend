import treeService from "./tree.service.js";
import {
  sendSuccess,
  sendCreated,
} from "../../utils/response.js";

const createTree = async (req, res) => {
  const result = await treeService.createTree(req.body, req);
  sendCreated(res, 'Tree Created Succesfully.', result);
};

const generateShareLink = async (req, res) => {
  const result = await treeService.generateShareLink(req.params.treeId, req.body, req);
  sendSuccess(res, "Share link generated successfully", result);
};

const getAllSharedTrees = async (req, res) => {
  const result = await treeService.getAllSharedTrees(req.params.treeId, req);
  sendSuccess(res, "Shared trees fetched successfully", result);
};

const deleteShareLink = async (req, res) => {
  const result = await treeService.deleteShareLink(req.params.treeId, req.params.token, req);
  sendSuccess(res, "Share link deleted successfully", result);
};

const updateTreeShareLink = async (req, res) => {
  const result = await treeService.updateSharelink(req.params.treeId, req.params.token,req.body, req);
  sendSuccess(res, "Share link updated successfully", result);
};

const getAllTrees = async (req, res) => {
  const result = await treeService.getAllTrees(req);
  sendSuccess(res, 'All Trees fetched', result);
};
const deleteTree = async (req, res) => {
  const id = req.params.id;
  const result = await treeService.deleteTree(id, req);
  sendSuccess(res, 'Trees Deleted Successfully', result);
};
const getTreeById = async (req, res) => {
  const id = req.params.id;
  const result = await treeService.getTreeById(id, req);
  sendSuccess(res, 'Trees Fetched Successfully', result);
};
const getTreeBySlug = async (req, res) => {
  const slug = req.params.slug;
  const result = await treeService.getTreeBySlug(slug, req);
  sendSuccess(res, 'Trees Fetched Successfully', result);
};
const updateTree = async (req, res) => {
  const result = await treeService.updateTree(req.params.id, req.body, req);
  sendSuccess(res, 'Tree Updated Successfully', result);
};

const getCollaborations = async (req, res) => {
  console.log("getCollaborations - req.user.id:", req.user.id);
  const result = await treeService.getCollaborations(req);
  sendSuccess(res, 'Collaborations fetched successfully', result);
};

export default {
  createTree,
  getAllTrees,
  deleteTree,
  getTreeBySlug,
  getTreeById,
  updateTree,
  generateShareLink,
  getAllSharedTrees,
  deleteShareLink,
  updateTreeShareLink,
  getCollaborations,
};