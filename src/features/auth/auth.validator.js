// src/validators/auth.validator.js
import Joi from "joi";
import { createValidator } from "../../middleware/validate.js";

const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+])/)
  .messages({
    "string.pattern.base":
      "Password must contain uppercase, lowercase, number, and special character",
  });

const email = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase();

const schemas = {
  register: Joi.object({
    firstName: Joi.string().trim().min(1).max(100).required(),
    lastName: Joi.string().trim().min(1).max(100).default("").optional(),
    email: email.required(),
    password: password.required(),
  }),

  login: Joi.object({
    email: email.required(),
    password: Joi.string().required(),
  }),
  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  sendPasswordResetEmail: Joi.object({
    email: email.required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: password.required(),
  }),

  changePassword: Joi.object({
    token: Joi.string().required(),
    newPassword: password.required(),
  }),

  saveBillFile: Joi.object({
    cloudinaryUrl: Joi.string().required(),
    publicId: Joi.string().required(),
    width: Joi.number().required(),
    height: Joi.number().required(),
    bytes: Joi.number().required(),
  }),

  saveAvatarFile: Joi.object({
    personId: Joi.string().uuid().required(),
    cloudinaryUrl: Joi.string().uri().required(),
    publicId: Joi.string().required(),
    shareToken: Joi.string().optional().allow(null, ""),
  }),
};

export const validate = createValidator(schemas);
