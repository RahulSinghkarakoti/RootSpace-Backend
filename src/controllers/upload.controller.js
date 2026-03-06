// src/controllers/auth.controller.js
import uploadService from '../services/upload.service.js';
import {
  sendSuccess, 
  sendError 
} from '../utils/response.js';
 

const getSignature = async (req, res) => {
  const result = await uploadService.getCloudinaryUploadSignature(req,res);
  sendSuccess(res, 'Cloudinary Signature fetched ', result);
};
   
 
 

export default { getSignature };