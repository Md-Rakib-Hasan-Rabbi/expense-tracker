const { z, objectIdSchema } = require('../../common/validators/commonSchemas');

const categoryBody = z.object({
  name: z.string().trim().min(1).max(60),
  type: z.enum(['expense', 'income']),
  iconKey: z.string().trim().min(1).max(50).optional(),
  colorToken: z.string().trim().min(1).max(30).optional(),
  isArchived: z.boolean().optional(),
});

const createCategorySchema = z.object({
  body: categoryBody,
});

const updateCategorySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: categoryBody.partial(),
});

const categoryIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
};
