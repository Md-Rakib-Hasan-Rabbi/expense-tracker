const express = require('express');
const validate = require('../../common/middleware/validate');
const authRequired = require('../../common/middleware/auth');
const { listBudgets, upsertBudget, deleteBudget } = require('./budgets.controller');
const { listBudgetsSchema, upsertBudgetSchema, budgetIdSchema } = require('./budgets.validation');

const router = express.Router();

router.use(authRequired);
router.get('/', validate(listBudgetsSchema), listBudgets);
router.put('/:categoryId', validate(upsertBudgetSchema), upsertBudget);
router.delete('/:id', validate(budgetIdSchema), deleteBudget);

module.exports = router;
