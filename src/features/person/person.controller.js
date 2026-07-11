import personService from "./person.service.js";
import { sendSuccess, sendCreated } from "../../utils/response.js";
import { invalidatePersonCache } from "../../lib/cache.js";

const createPerson = async (req, res) => {
  const result = await personService.createPerson(req.params.treeId, req.body, req);
  await invalidatePersonCache(req.params.treeId);
  sendCreated(res, "Person added to tree successfully", result);
};

const getAllPeople = async (req, res) => {
  const result = await personService.getAllPeople(req.params.treeId, req);
  sendSuccess(res, "People fetched successfully", result);
};

const getPersonInTree = async (req, res) => {
  const result = await personService.getPersonInTree(
    req.params.treeId,
    req.params.personId,
    req,
  );
  sendSuccess(res, "Person fetched successfully", result);
};

const getPersonById = async (req, res) => {
  const result = await personService.getPersonById(req.params.id, req);
  sendSuccess(res, "Person fetched successfully", result);
};

const updatePerson = async (req, res) => {
  const result = await personService.updatePerson(req.params.id, req.body, req);
  // Invalidate cache for the tree that contains this person
  // Note: We invalidate all person caches as a fallback - consider optimizing with tree ID
  sendSuccess(res, "Person updated successfully", result);
};

const deletePerson = async (req, res) => {
  const result = await personService.deletePerson(req.params.id, req);
  // Invalidate cache for the tree that contains this person
  sendSuccess(res, "Person deleted successfully", result);
};

export default {
  createPerson,
  getAllPeople,
  getPersonInTree,
  getPersonById,
  updatePerson,
  deletePerson, 
};
