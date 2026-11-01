import Joi from "joi";
import { createValidator } from "../../middleware/validate.js";

const schemas = {
  createMedia: Joi.object({
    url: Joi.string().uri().required(),
    type: Joi.string().valid("PHOTO", "VIDEO", "DOCUMENT").required(),
    personId: Joi.string().uuid().optional(),
    altText: Joi.string().trim().max(255).optional().allow(null, ""),
    caption: Joi.string().trim().max(500).optional().allow(null, ""),
    isFeatured: Joi.bool().optional(),
    order: Joi.number().integer().min(0).optional(),
  }),
  updateMedia: Joi.object({
    url: Joi.string().uri().optional(),
    type: Joi.string().valid("PHOTO", "VIDEO", "DOCUMENT").optional(),
    personId: Joi.string().uuid().optional().allow(null),
    altText: Joi.string().trim().max(255).optional().allow(null, ""),
    caption: Joi.string().trim().max(500).optional().allow(null, ""),
    isFeatured: Joi.bool().optional(),
    order: Joi.number().integer().min(0).optional(),
  }).or("url", "type", "personId", "altText", "caption", "isFeatured", "order"),
};

export const mediaValidate = createValidator(schemas);
export const validate = mediaValidate;
