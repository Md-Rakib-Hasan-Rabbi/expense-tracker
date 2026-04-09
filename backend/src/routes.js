const express = require('express');

const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const categoriesRoutes = require('./modules/categories/categories.routes');
const accountsRoutes = require('./modules/accounts/accounts.routes');
const transactionsRoutes = require('./modules/transactions/transactions.routes');
const budgetsRoutes = require('./modules/budgets/budgets.routes');
const reportsRoutes = require('./modules/reports/reports.routes');
const recurringRoutes = require('./modules/recurring/recurring.routes');
const exportsRoutes = require('./modules/exports/exports.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/categories', categoriesRoutes);
router.use('/accounts', accountsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/budgets', budgetsRoutes);
router.use('/reports', reportsRoutes);
router.use('/recurring-rules', recurringRoutes);
router.use('/exports', exportsRoutes);

module.exports = router;
