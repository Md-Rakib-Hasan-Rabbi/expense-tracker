const { z } = require('zod');

const summarySchema = z.object({
  query: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }),
});

const categoryBreakdownSchema = summarySchema;

const monthlyTrendSchema = z.object({
  query: z.object({
    months: z.coerce.number().min(1).max(36).optional(),
  }),
});

module.exports = {
  summarySchema,
  categoryBreakdownSchema,
  monthlyTrendSchema,
};
