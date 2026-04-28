import Joi from "joi";

const schemas = {
  createPerson: Joi.object({
    fullName: Joi.string().trim().min(1).max(255).required(),
    gender: Joi.string().trim().max(50).optional().allow(null, ""),
    birthDate: Joi.date().iso().optional().allow(null),
    deathDate: Joi.date().iso().optional().allow(null),
    notes: Joi.string().trim().max(1000).optional().allow(null, ""),
  }).custom((value, helpers) => {
    if (value.birthDate && value.deathDate) {
      const birth = new Date(value.birthDate);
      const death = new Date(value.deathDate);
      if (death < birth) {
        return helpers.message('deathDate must be the same or after birthDate');
      }
    }
    return value;
  }),

  updatePerson: Joi.object({
    fullName: Joi.string().trim().min(1).max(255).optional(),
    gender: Joi.string().trim().max(50).optional().allow(null, ""),
    birthDate: Joi.date().iso().optional().allow(null),
    deathDate: Joi.date().iso().optional().allow(null),
    notes: Joi.string().trim().max(1000).optional().allow(null, ""),
  })
    .or("fullName", "gender", "birthDate", "deathDate", "notes")
    .custom((value, helpers) => {
      if (value.birthDate && value.deathDate) {
        const birth = new Date(value.birthDate);
        const death = new Date(value.deathDate);
        if (death < birth) {
          return helpers.message('deathDate must be the same or after birthDate');
        }
      }
      return value;
    }),
};

const personValidate = (schemaName) => (req, res, next) => {
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

export { personValidate };
