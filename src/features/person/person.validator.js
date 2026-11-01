import Joi from "joi";
import { createValidator } from "../../middleware/validate.js";

const schemas = {
  createPerson: Joi.object({
    fullName: Joi.string().trim().min(1).max(255).required(),
    birthPlace: Joi.string().trim().min(1).max(255).allow("").optional(),
    gender: Joi.string().trim().max(50).optional().allow(null, ""),
    birthDate: Joi.date().optional().allow(null),
    deathDate: Joi.date().optional().allow(null),
    notes: Joi.string().trim().max(1000).optional().allow(null, ""),
    relations: Joi.array()
      .items(
        Joi.object({
          toId: Joi.string().uuid().required(),
          type: Joi.string()
            .valid(
              "PARENT_OF",
              "SPOUSE_OF",
              "CHILD_OF",
              "SIBLING_OF",
            )
            .required(),
          metadata: Joi.object().optional(),
          isActive: Joi.bool().optional(),
        }),
      )
      .optional(),
  }).custom((value, helpers) => {
    if (value.birthDate && value.deathDate) {
      const birth = new Date(value.birthDate);
      const death = new Date(value.deathDate);
      if (death && birth && death < birth) {
        return helpers.message("deathDate must be the same or after birthDate");
      }
    }
    return value;
  }),

  updatePerson: Joi.object({
    fullName: Joi.string().trim().min(1).max(255).optional(),
    birthPlace: Joi.string().trim().min(1).max(255).allow("").optional(),
    gender: Joi.string().trim().max(50).optional().allow(null, ""),
    birthDate: Joi.date().optional().allow(null),
    deathDate: Joi.date().optional().allow(null),
    notes: Joi.string().trim().max(1000).optional().allow(null, ""),
    avatarUrl: Joi.string().uri().optional().allow(null, ""),
  })
    .or("fullName", "birthPlace", "gender", "birthDate", "deathDate", "notes", "avatarUrl")
    .custom((value, helpers) => {
      if (value.birthDate && value.deathDate) {
        const birth = new Date(value.birthDate);
        const death = new Date(value.deathDate);
        if (death < birth) {
          return helpers.message(
            "deathDate must be the same or after birthDate",
          );
        }
      }
      return value;
    }),
};

export const personValidate = createValidator(schemas);
export const validate = personValidate;
