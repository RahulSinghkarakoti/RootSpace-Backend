// src/validators/auth.validator.js
import Joi from "joi";

const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+])/)
  .messages({
    "string.pattern.base":
      "Password must contain uppercase, lowercase, number, and special character",
  });

const schemas = {
  register: Joi.object({
    firstName: Joi.string().trim().min(1).max(100).required(),
    lastName: Joi.string().trim().min(1).max(100).required(),
    email: Joi.string().email().lowercase().required(),
    password: password.required(),
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().lowercase().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: password.required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: password.required(),
  }),

  saveBillFile: Joi.object({
    cloudinaryUrl: Joi.string().required(),
    publicId: Joi.string().required(),
    width: Joi.number().required(),
    height: Joi.number().required(),
    bytes: Joi.number().required(),
  }),
};

/**
 * Middleware factory — validates req.body against named schema.
 */
const validate = (schemaName) => (req, res, next) => {
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

export { validate };
