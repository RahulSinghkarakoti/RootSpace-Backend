import sharedTreeService from "../services/sharedTree.service.js";
import { sendCreated, sendSuccess } from "../utils/response.js";

const verifyShareToken = async (req, res) => {
  const result = await sharedTreeService.verifyShareToken(req.params.token, req);
  sendSuccess(res, "Share token verified successfully", result);
};

const getSharedTreeData = async (req, res) => {
  const result = await sharedTreeService.getSharedTreeData(req.params.token, req);
  sendSuccess(res, "Shared tree fetched successfully", result);
};

const createSharedPerson = async (req, res) => {
  const result = await sharedTreeService.createSharedPerson(req.params.token, req.body, req);
  sendCreated(res, "Person added to shared tree successfully", result);
};

const updateSharedPerson = async (req, res) => {
  const result = await sharedTreeService.updateSharedPerson(
    req.params.token,
    req.params.personId,
    req.body,
    req,
  );
  sendSuccess(res, "Shared tree person updated successfully", result);
};

const deleteSharedPerson = async (req, res) => {
  const result = await sharedTreeService.deleteSharedPerson(
    req.params.token,
    req.params.personId,
    req,
  );
  sendSuccess(res, "Shared tree person deleted successfully", result);
};

const getAllSharedTrees = async (req, res) => {
  const result = await sharedTreeService.getAllSharedTrees(req);
  sendSuccess(res, "All shared trees fetched successfully", result);
};

export default {
  verifyShareToken,
  getSharedTreeData,
  createSharedPerson,
  updateSharedPerson,
  deleteSharedPerson,getAllSharedTrees
};
