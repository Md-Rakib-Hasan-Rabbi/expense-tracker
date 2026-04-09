const express = require('express');
const validate = require('../../common/middleware/validate');
const authRequired = require('../../common/middleware/auth');
const {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} = require('./categories.validation');
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('./categories.controller');

const router = express.Router();

router.use(authRequired);
router.get('/', listCategories);
router.post('/', validate(createCategorySchema), createCategory);
router.patch('/:id', validate(updateCategorySchema), updateCategory);
router.delete('/:id', validate(categoryIdSchema), deleteCategory);

module.exports = router;
