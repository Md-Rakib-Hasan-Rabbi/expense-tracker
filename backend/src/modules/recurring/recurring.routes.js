const express = require('express');
const validate = require('../../common/middleware/validate');
const authRequired = require('../../common/middleware/auth');
const {
  createRecurringSchema,
  updateRecurringSchema,
  recurringIdSchema,
} = require('./recurring.validation');
const {
  listRecurringRules,
  createRecurringRule,
  updateRecurringRule,
  deleteRecurringRule,
} = require('./recurring.controller');

const router = express.Router();

router.use(authRequired);
router.get('/', listRecurringRules);
router.post('/', validate(createRecurringSchema), createRecurringRule);
router.patch('/:id', validate(updateRecurringSchema), updateRecurringRule);
router.delete('/:id', validate(recurringIdSchema), deleteRecurringRule);

module.exports = router;
