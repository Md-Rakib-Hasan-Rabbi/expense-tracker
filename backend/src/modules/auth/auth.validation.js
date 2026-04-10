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
    name: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters long')
      .max(80, 'Full name must be at most 80 characters long'),
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password must be at most 128 characters long'),
    currency: optionalTrimmedString(
      z.string().length(3, 'Currency must be a 3-letter code (e.g., BDT)')
    ),
    timezone: optionalTrimmedString(
      z.string().max(100, 'Timezone must be at most 100 characters long')
    ),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password must be at most 128 characters long'),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
