import Joi from "joi";

const schemas = {
  createEducation: Joi.object({
    title: Joi.string().trim().min(1).max(255).required(),
    institution: Joi.string().trim().min(1).max(255).required(),
    level: Joi.string()
      .valid("HIGH_SCHOOL", "BACHELORS", "MASTERS", "PHD", "OTHER")
      .required(),
    startDate: Joi.date().iso().optional().allow(null),
    endDate: Joi.date().iso().optional().allow(null),
    description: Joi.string().trim().max(1000).optional().allow(null, ""),
    degreeUrl: Joi.string().uri().optional().allow(null, ""),
  }).custom((value, helpers) => {
    if (value.startDate && value.endDate) {
      const start = new Date(value.startDate);
      const end = new Date(value.endDate);
      if (end < start) {
        return helpers.message("endDate must be the same or after startDate");
      }
    }
    return value;
  }),
  updateEducation: Joi.object({
    title: Joi.string().trim().min(1).max(255).optional(),
    institution: Joi.string().trim().min(1).max(255).optional(),
    level: Joi.string().valid("HIGH_SCHOOL", "BACHELORS", "MASTERS", "PHD", "OTHER").optional(),
    startDate: Joi.date().iso().optional().allow(null),
    endDate: Joi.date().iso().optional().allow(null),
    description: Joi.string().trim().max(1000).optional().allow(null, ""),
    degreeUrl: Joi.string().uri().optional().allow(null, ""),
  })
    .or("title", "institution", "level", "startDate", "endDate", "description", "degreeUrl")
    .custom((value, helpers) => {
      if (value.startDate && value.endDate) {
        const start = new Date(value.startDate);
        const end = new Date(value.endDate);
        if (end < start) {
          return helpers.message("endDate must be the same or after startDate");
        }
      }
      return value;
    }),
};

const educationValidate = (schemaName) => (req, res, next) => {
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

export { educationValidate };
