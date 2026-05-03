import Joi from "joi";

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

const relationValidate = (schemaName) => (req, res, next) => {
  const schema = schemas[schemaName];
  if (!schema) return next();

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  req.body = value;
  next();
};

export { relationValidate };
