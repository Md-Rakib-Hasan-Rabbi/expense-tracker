const express = require('express');
const validate = require('../../common/middleware/validate');
const authRequired = require('../../common/middleware/auth');
const {
  createAccountSchema,
  updateAccountSchema,
  accountIdSchema,
} = require('./accounts.validation');
const {
  listAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} = require('./accounts.controller');

const router = express.Router();

router.use(authRequired);
router.get('/', listAccounts);
router.post('/', validate(createAccountSchema), createAccount);
router.patch('/:id', validate(updateAccountSchema), updateAccount);
router.delete('/:id', validate(accountIdSchema), deleteAccount);

module.exports = router;
