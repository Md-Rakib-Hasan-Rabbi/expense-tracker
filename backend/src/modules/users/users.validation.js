const { z } = require('zod');

const updateMeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    currency: z.string().trim().length(3).optional(),
    timezone: z.string().trim().min(1).max(100).optional(),
    settings: z
      .object({
        theme: z.enum(['light', 'dark', 'system']).optional(),
      })
      .optional(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(8).max(128),
    newPassword: z.string().min(8).max(128),
  }),
});

module.exports = {
  updateMeSchema,
  changePasswordSchema,
};
