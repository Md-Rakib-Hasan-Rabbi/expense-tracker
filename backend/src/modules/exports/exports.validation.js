const { z } = require('zod');

const exportTransactionsSchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    type: z.enum(['expense', 'income']).optional(),
    accountId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  }),
});

module.exports = {
  exportTransactionsSchema,
};
