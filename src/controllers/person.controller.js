import personService from "../services/person.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";

const createPerson = async (req, res) => {
  const result = await personService.createPerson(req.params.treeId, req.body, req);
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
  sendSuccess(res, "Person updated successfully", result);
};

const deletePerson = async (req, res) => {
  const result = await personService.deletePerson(req.params.id, req);
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
