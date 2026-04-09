const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const Budget = require('./budget.model');
const Category = require('../categories/category.model');

function currentMonthKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

const listBudgets = asyncHandler(async (req, res) => {
  const monthKey = req.query.month || currentMonthKey();

  const budgets = await Budget.find({ userId: req.user.id, monthKey })
    .populate('categoryId', 'name type iconKey colorToken')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: budgets });
});

const upsertBudget = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { month } = req.query;
  const { limitAmount, alertThresholdPercent } = req.body;

  const category = await Category.findOne({ _id: categoryId, userId: req.user.id, isArchived: false });
  if (!category) {
    throw new ApiError(400, 'Invalid category');
  }

  const budget = await Budget.findOneAndUpdate(
    {
      userId: req.user.id,
      categoryId,
      monthKey: month,
    },
    {
      $set: {
        limitAmount,
        alertThresholdPercent: alertThresholdPercent ?? 80,
      },
      $setOnInsert: {
        period: 'monthly',
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  ).populate('categoryId', 'name type iconKey colorToken');

  res.status(200).json({ success: true, data: budget });
});

const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

  if (!budget) {
    throw new ApiError(404, 'Budget not found');
  }

  res.status(200).json({
    success: true,
    data: { message: 'Budget deleted successfully' },
  });
});

module.exports = {
  listBudgets,
  upsertBudget,
  deleteBudget,
};
