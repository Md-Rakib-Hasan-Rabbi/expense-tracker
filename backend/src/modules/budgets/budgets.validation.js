const { z, objectIdSchema } = require('../../common/validators/commonSchemas');

const monthKeyRegex = /^\d{4}-\d{2}$/;

const listBudgetsSchema = z.object({
  query: z.object({
    month: z.string().regex(monthKeyRegex).optional(),
  }),
});

const upsertBudgetSchema = z.object({
  params: z.object({
    categoryId: objectIdSchema,
  }),
  query: z.object({
    month: z.string().regex(monthKeyRegex),
  }),
  body: z.object({
    limitAmount: z.number().min(0),
    alertThresholdPercent: z.number().min(1).max(100).optional(),
  }),
});

const budgetIdSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

module.exports = {
  listBudgetsSchema,
  upsertBudgetSchema,
  budgetIdSchema,
};
