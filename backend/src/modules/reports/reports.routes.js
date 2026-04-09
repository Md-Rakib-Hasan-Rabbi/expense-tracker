const express = require('express');
const validate = require('../../common/middleware/validate');
const authRequired = require('../../common/middleware/auth');
const { summary, categoryBreakdown, monthlyTrend } = require('./reports.controller');
const { summarySchema, categoryBreakdownSchema, monthlyTrendSchema } = require('./reports.validation');

const router = express.Router();

router.use(authRequired);
router.get('/summary', validate(summarySchema), summary);
router.get('/category-breakdown', validate(categoryBreakdownSchema), categoryBreakdown);
router.get('/monthly-trend', validate(monthlyTrendSchema), monthlyTrend);

module.exports = router;
