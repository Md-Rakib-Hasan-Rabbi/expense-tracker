const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const RecurringRule = require('./recurring-rule.model');
const Account = require('../accounts/account.model');
const Category = require('../categories/category.model');

async function validateOwnership(userId, accountId, categoryId, type) {
  const [account, category] = await Promise.all([
    Account.findOne({ _id: accountId, userId, isArchived: false }),
    Category.findOne({ _id: categoryId, userId, isArchived: false }),
  ]);

  if (!account) {
    throw new ApiError(400, 'Invalid account');
  }

  if (!category) {
    throw new ApiError(400, 'Invalid category');
  }

  if (category.type !== type) {
    throw new ApiError(400, 'Category type does not match recurring transaction type');
  }
}

const listRecurringRules = asyncHandler(async (req, res) => {
  const rules = await RecurringRule.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .populate('categoryId', 'name type iconKey colorToken')
    .populate('accountId', 'name type');

  res.status(200).json({ success: true, data: rules });
});

const createRecurringRule = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  payload.userId = req.user.id;
  payload.startDate = new Date(payload.startDate);
  payload.nextRunAt = new Date(payload.nextRunAt);
  payload.endDate = payload.endDate ? new Date(payload.endDate) : null;

  await validateOwnership(req.user.id, payload.accountId, payload.categoryId, payload.type);

  const rule = await RecurringRule.create(payload);

  res.status(201).json({ success: true, data: rule });
});

const updateRecurringRule = asyncHandler(async (req, res) => {
  const existing = await RecurringRule.findOne({ _id: req.params.id, userId: req.user.id });
  if (!existing) {
    throw new ApiError(404, 'Recurring rule not found');
  }

  const updated = {
    title: req.body.title ?? existing.title,
    amount: req.body.amount ?? existing.amount,
    type: req.body.type ?? existing.type,
    accountId: req.body.accountId ?? existing.accountId,
    categoryId: req.body.categoryId ?? existing.categoryId,
    frequency: req.body.frequency ?? existing.frequency,
    startDate: req.body.startDate ? new Date(req.body.startDate) : existing.startDate,
    endDate:
      req.body.endDate === null
        ? null
        : req.body.endDate
          ? new Date(req.body.endDate)
          : existing.endDate,
    nextRunAt: req.body.nextRunAt ? new Date(req.body.nextRunAt) : existing.nextRunAt,
    isActive: req.body.isActive ?? existing.isActive,
  };

  await validateOwnership(req.user.id, updated.accountId, updated.categoryId, updated.type);

  Object.assign(existing, updated);
  await existing.save();

  res.status(200).json({ success: true, data: existing });
});

const deleteRecurringRule = asyncHandler(async (req, res) => {
  const rule = await RecurringRule.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

  if (!rule) {
    throw new ApiError(404, 'Recurring rule not found');
  }

  res.status(200).json({
    success: true,
    data: { message: 'Recurring rule deleted successfully' },
  });
});

module.exports = {
  listRecurringRules,
  createRecurringRule,
  updateRecurringRule,
  deleteRecurringRule,
};
