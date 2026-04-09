const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(128),
    currency: z.string().trim().length(3).optional(),
    timezone: z.string().trim().min(1).max(100).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(128),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
