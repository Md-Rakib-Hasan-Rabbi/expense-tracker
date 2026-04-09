const { z, objectIdSchema } = require('../../common/validators/commonSchemas');

const accountBody = z.object({
  name: z.string().trim().min(1).max(60),
  type: z.enum(['cash', 'bank', 'card', 'wallet', 'other']).optional(),
  openingBalance: z.number().min(0).optional(),
  currentBalance: z.number().optional(),
  isArchived: z.boolean().optional(),
});

const createAccountSchema = z.object({
  body: accountBody,
});

const updateAccountSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: accountBody.partial(),
});

const accountIdSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

module.exports = {
  createAccountSchema,
  updateAccountSchema,
  accountIdSchema,
};
