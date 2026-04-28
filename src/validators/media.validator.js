import Joi from "joi";

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

const mediaValidate = (schemaName) => (req, res, next) => {
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

export { mediaValidate };
