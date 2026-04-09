const express = require('express');
const authRequired = require('../../common/middleware/auth');
const validate = require('../../common/middleware/validate');
const { exportTransactionsSchema } = require('./exports.validation');
const { exportTransactionsCsv } = require('./exports.controller');

const router = express.Router();

router.use(authRequired);
router.get('/transactions/csv', validate(exportTransactionsSchema), exportTransactionsCsv);

module.exports = router;
