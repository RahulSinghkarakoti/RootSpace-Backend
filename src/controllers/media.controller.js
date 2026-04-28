import mediaService from "../services/media.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";

const createMedia = async (req, res) => {
  const result = await mediaService.createMedia(req.params.treeId, req.body, req);
  sendCreated(res, "Media created successfully", result);
};

const getTreeMedia = async (req, res) => {
  const result = await mediaService.getTreeMedia(req.params.treeId, req);
  sendSuccess(res, "Media fetched successfully", result);
};

const getMediaById = async (req, res) => {
  const result = await mediaService.getMediaById(req.params.id, req);
  sendSuccess(res, "Media fetched successfully", result);
};

const updateMedia = async (req, res) => {
  const result = await mediaService.updateMedia(req.params.id, req.body, req);
  sendSuccess(res, "Media updated successfully", result);
};

const deleteMedia = async (req, res) => {
  const result = await mediaService.deleteMedia(req.params.id, req);
  sendSuccess(res, "Media deleted successfully", result);
};

export default {
  createMedia,
  getTreeMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
};
