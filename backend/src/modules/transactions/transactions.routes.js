const express = require('express');
const validate = require('../../common/middleware/validate');
const authRequired = require('../../common/middleware/auth');
const {
  listTransactionsSchema,
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdSchema,
} = require('./transactions.validation');
const {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('./transactions.controller');

const router = express.Router();

router.use(authRequired);
router.get('/', validate(listTransactionsSchema), listTransactions);
router.post('/', validate(createTransactionSchema), createTransaction);
router.get('/:id', validate(transactionIdSchema), getTransaction);
router.patch('/:id', validate(updateTransactionSchema), updateTransaction);
router.delete('/:id', validate(transactionIdSchema), deleteTransaction);

module.exports = router;
