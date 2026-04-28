import educationService from "../services/education.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";

const createEducation = async (req, res) => {
  const result = await educationService.createEducation(
    req.params.personId,
    req.body,
    req,
  );
  sendCreated(res, "Education entry created successfully", result);
};

const getPersonEducation = async (req, res) => {
  const result = await educationService.getPersonEducation(req.params.personId, req);
  sendSuccess(res, "Education entries fetched successfully", result);
};

const getEducationById = async (req, res) => {
  const result = await educationService.getEducationById(req.params.id, req);
  sendSuccess(res, "Education entry fetched successfully", result);
};

const updateEducation = async (req, res) => {
  const result = await educationService.updateEducation(req.params.id, req.body, req);
  sendSuccess(res, "Education entry updated successfully", result);
};

const deleteEducation = async (req, res) => {
  const result = await educationService.deleteEducation(req.params.id, req);
  sendSuccess(res, "Education entry deleted successfully", result);
};

export default {
  createEducation,
  getPersonEducation,
  getEducationById,
  updateEducation,
  deleteEducation,
};
