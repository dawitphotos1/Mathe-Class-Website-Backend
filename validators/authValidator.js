const Joi = require("joi");

exports.registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("student", "teacher", "admin").required(),
  subject: Joi.when("role", {
    is: Joi.valid("teacher", "student"),
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
