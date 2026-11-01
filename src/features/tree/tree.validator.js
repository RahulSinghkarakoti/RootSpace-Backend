// src/features/tree/tree.validator.js
import Joi from "joi";
import { createValidator } from "../../middleware/validate.js";

const schemas = {
  createTree: Joi.object({
    treeName: Joi.string().trim().min(1).max(100).required(),
    type: Joi.string().valid("FAMILY", "EDUCATIONAL").optional(),
    coverImage: Joi.string().uri().optional().allow(null, ""),
    isPublic: Joi.bool().optional(),
  }),
  updateTree: Joi.object({
    treeName: Joi.string().trim().min(1).max(100).optional(),
    type: Joi.string().valid("FAMILY", "EDUCATIONAL").optional(),
    coverImage: Joi.string().uri().optional().allow(null, ""),
    isPublic: Joi.bool().optional(),
  }).or("treeName", "type", "coverImage", "isPublic"),
  generateShareLink: Joi.object({
    permission: Joi.string().valid("VIEW_ONLY", "MEDIA_ONLY","ADD_PERSON","CONTRIBUTOR","EDITOR","FULL_ACCESS").required(),
    personLimit: Joi.number().integer().min(1).optional().allow(null),
    expiresAt: Joi.valid("3m", "6m","12m","never").optional().allow(null),
  }),
  updateShareLink: Joi.object({
    permission: Joi.string().valid("VIEW_ONLY", "MEDIA_ONLY","ADD_PERSON","CONTRIBUTOR","EDITOR","FULL_ACCESS").optional(),
    personLimit: Joi.number().integer().min(1).optional().allow(null),
    expiresAt: Joi.valid("3m", "6m","12m","never").optional().allow(null),
    isActive: Joi.bool().optional(),
  }).or("permission", "personLimit", "expiresAt", "isActive"),
};

export const treeValidate = createValidator(schemas);
export const validate = treeValidate;
