const { z } = require('zod');

const exportTransactionsSchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    type: z.enum(['expense', 'income']).optional(),
    accountId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
  }),
});

module.exports = {
  exportTransactionsSchema,
};
