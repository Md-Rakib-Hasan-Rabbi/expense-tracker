const { z, objectIdSchema } = require('../../common/validators/commonSchemas');

const recurringBody = z.object({
  title: z.string().trim().min(1).max(120),
  amount: z.number().positive(),
  type: z.enum(['expense', 'income']),
  accountId: objectIdSchema,
  categoryId: objectIdSchema,
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
  nextRunAt: z.string().datetime(),
  isActive: z.boolean().optional(),
});

const createRecurringSchema = z.object({
  body: recurringBody,
});

const updateRecurringSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: recurringBody.partial(),
});

const recurringIdSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

module.exports = {
  createRecurringSchema,
  updateRecurringSchema,
  recurringIdSchema,
};
