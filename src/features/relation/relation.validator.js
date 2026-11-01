import Joi from "joi";
import { createValidator } from "../../middleware/validate.js";

const schemas = {
  createRelation: Joi.object({
    fromId: Joi.string().uuid().required(),
    toId: Joi.string().uuid().required(),
    type: Joi.string()
      .valid(
        "PARENT_OF",
        "SPOUSE_OF",
        "SIBLING_OF",
      )
      .required(),
    metadata: Joi.object().optional(),
    isActive: Joi.bool().optional(),
  }).custom((value, helpers) => {
    if (value.fromId === value.toId) {
      return helpers.message("fromId and toId must be different");
    }
    return value;
  }),

  updateRelation: Joi.object({
    fromId: Joi.string().uuid().optional(),
    toId: Joi.string().uuid().optional(),
    type: Joi.string().valid(
      "PARENT_OF",
      "SPOUSE_OF",
      "SIBLING_OF",
    ),
    metadata: Joi.object().optional(),
    isActive: Joi.bool().optional(),
  })
    .or("fromId", "toId", "type", "metadata", "isActive")
    .custom((value, helpers) => {
      if (value.fromId && value.toId && value.fromId === value.toId) {
        return helpers.message("fromId and toId must be different");
      }
      return value;
    }),
};

export const relationValidate = createValidator(schemas);
export const validate = relationValidate;
