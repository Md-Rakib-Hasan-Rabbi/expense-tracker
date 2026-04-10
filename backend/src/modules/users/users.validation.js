const { z } = require('zod');

const updateMeSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters long')
      .max(80, 'Full name must be at most 80 characters long')
      .optional(),
    currency: z
      .string()
      .trim()
      .length(3, 'Currency must be a 3-letter code (e.g., USD)')
      .optional(),
    timezone: z
      .string()
      .trim()
      .min(1, 'Timezone is required when provided')
      .max(100, 'Timezone must be at most 100 characters long')
      .optional(),
    settings: z
      .object({
        theme: z.enum(['light', 'dark', 'system']).optional(),
      })
      .optional(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(8, 'Current password must be at least 8 characters long')
      .max(128, 'Current password must be at most 128 characters long'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long')
      .max(128, 'New password must be at most 128 characters long'),
  }),
});

module.exports = {
  updateMeSchema,
  changePasswordSchema,
};
