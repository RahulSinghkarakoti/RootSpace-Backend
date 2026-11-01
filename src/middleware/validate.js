// src/middleware/validate.js

/**
 * Validates req.body against a Joi schema or schema dictionary.
 *
 * Usage:
 *   const validate = createValidator(schemas);
 *   router.post("/", validate("create"), controller.create);
 *
 * Or directly:
 *   router.post("/", validateBody(schema), controller.create);
 */

export const validateBody = (schema) => (req, res, next) => {
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

  req.body = value;
  next();
};

export const createValidator = (schemas) => (schemaName) => (req, res, next) => {
  const schema = schemas[schemaName];
  return validateBody(schema)(req, res, next);
};

export default createValidator;
