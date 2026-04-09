const { z, objectIdSchema } = require('../../common/validators/commonSchemas');

const transactionBody = z.object({
  accountId: objectIdSchema,
  categoryId: objectIdSchema,
  type: z.enum(['expense', 'income']),
  amount: z.number().positive(),
  transactionDate: z.string().datetime(),
  note: z.string().max(500).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  merchant: z.string().max(120).optional(),
  source: z.enum(['manual', 'import', 'recurring']).optional(),
  recurringRuleId: objectIdSchema.optional(),
});

const listTransactionsSchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    type: z.enum(['expense', 'income']).optional(),
    categoryId: objectIdSchema.optional(),
    accountId: objectIdSchema.optional(),
    search: z.string().max(100).optional(),
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    sort: z.enum(['transactionDate', '-transactionDate', 'amount', '-amount', 'createdAt', '-createdAt']).optional(),
  }),
});

const createTransactionSchema = z.object({
  body: transactionBody,
});

const updateTransactionSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: transactionBody.partial(),
});

const transactionIdSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

module.exports = {
  listTransactionsSchema,
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdSchema,
};
