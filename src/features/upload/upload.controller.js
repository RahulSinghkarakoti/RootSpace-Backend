// src/controllers/auth.controller.js
import uploadService from "./upload.service.js";
import { sendSuccess, sendError, sendCreated } from "../../utils/response.js";

const getSignature = async (req, res) => {
  const result = await uploadService.getCloudinaryUploadSignature(req, res);
  sendSuccess(res, "Cloudinary Signature fetched", result);
};

const saveAvatarFile = async (req, res) => {
  const result = await uploadService.savePersonAvatar(req.body, req, res);
  sendSuccess(res, "Person avatar updated successfully", result);
};

const saveBillFile = async (req, res) => {
  const billId = await uploadService.saveBillFile(req.body, req, res);
  sendCreated(res, "Cloudinary bill upload recorded.", {
    billId: billId.toString(), // BigInt → string for JSON safety
    status: "QUEUED",
  });
};

export default { getSignature, saveAvatarFile, saveBillFile };
