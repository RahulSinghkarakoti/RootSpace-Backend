// src/validators/auth.validator.js
import Joi from "joi";

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
};

/**
 * Middleware factory — validates req.body against named schema.
 */
const treeValidate = (schemaName) => (req, res, next) => {
  const schema = schemas[schemaName];
  if (!schema) return next();

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join("."),
      message: d.message,
    }));
    return res
      .status(400)
      .json({ success: false, message: "Validation failed", errors });
  }

  req.body = value; // use sanitised values
  next();
};

export { treeValidate };
