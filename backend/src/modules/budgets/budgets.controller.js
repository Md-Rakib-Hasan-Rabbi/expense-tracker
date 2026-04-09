const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const mongoose = require('mongoose');
const Budget = require('./budget.model');
const Category = require('../categories/category.model');
const Transaction = require('../transactions/transaction.model');

function currentMonthKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

const listBudgets = asyncHandler(async (req, res) => {
  const monthKey = req.query.month || currentMonthKey();
  const [year, month] = monthKey.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  const userObjectId = new mongoose.Types.ObjectId(req.user.id);

  const budgets = await Budget.find({ userId: req.user.id, monthKey })
    .populate('categoryId', 'name type iconKey colorToken')
    .sort({ createdAt: -1 });

  const spendAggregation = await Transaction.aggregate([
    {
      $match: {
        userId: userObjectId,
        type: 'expense',
        transactionDate: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$categoryId',
        spentAmount: { $sum: '$amount' },
      },
    },
  ]);

  const spendMap = new Map(spendAggregation.map((item) => [String(item._id), item.spentAmount]));

  const enrichedBudgets = budgets.map((budget) => {
    const spentAmount = Number(spendMap.get(String(budget.categoryId?._id || budget.categoryId)) || 0);
    const remainingAmount = Number((budget.limitAmount - spentAmount).toFixed(2));
    const progressPercent = budget.limitAmount > 0 ? Number(((spentAmount / budget.limitAmount) * 100).toFixed(2)) : 0;

    return {
      ...budget.toObject(),
      spentAmount,
      remainingAmount,
      progressPercent,
      isThresholdReached: progressPercent >= budget.alertThresholdPercent,
      isOverspent: spentAmount > budget.limitAmount,
    };
  });

  const totals = enrichedBudgets.reduce(
    (acc, budget) => {
      acc.totalLimit += Number(budget.limitAmount || 0);
      acc.totalSpent += Number(budget.spentAmount || 0);
      return acc;
    },
    { totalLimit: 0, totalSpent: 0 }
  );
  totals.totalRemaining = Number((totals.totalLimit - totals.totalSpent).toFixed(2));

  res.status(200).json({ success: true, data: enrichedBudgets, meta: { monthKey, ...totals } });
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
