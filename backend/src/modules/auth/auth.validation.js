const { z } = require('zod');

const optionalTrimmedString = (schema) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value;
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    },
    schema.optional()
  );

const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(128),
    currency: optionalTrimmedString(z.string().length(3)),
    timezone: optionalTrimmedString(z.string().max(100)),
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
