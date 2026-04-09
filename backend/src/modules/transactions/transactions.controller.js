const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const { getPagination } = require('../../common/utils/pagination');
const Transaction = require('./transaction.model');
const Account = require('../accounts/account.model');
const Category = require('../categories/category.model');

function signedAmount(type, amount) {
  return type === 'income' ? amount : -amount;
}

function normalizeMoney(value) {
  return Number(Number(value).toFixed(2));
}

async function ensureOwnedAccount(userId, accountId) {
  const account = await Account.findOne({ _id: accountId, userId, isArchived: false });
  if (!account) {
    throw new ApiError(400, 'Invalid account');
  }
  return account;
}

async function ensureOwnedCategory(userId, categoryId, type) {
  const category = await Category.findOne({ _id: categoryId, userId, isArchived: false });
  if (!category) {
    throw new ApiError(400, 'Invalid category');
  }
  if (type && category.type !== type) {
    throw new ApiError(400, 'Category type does not match transaction type');
  }
  return category;
}

const listTransactions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { userId: req.user.id };

  if (req.query.from || req.query.to) {
    filter.transactionDate = {};
    if (req.query.from) filter.transactionDate.$gte = new Date(req.query.from);
    if (req.query.to) filter.transactionDate.$lte = new Date(req.query.to);
  }

  if (req.query.type) filter.type = req.query.type;
  if (req.query.categoryId) filter.categoryId = req.query.categoryId;
  if (req.query.accountId) filter.accountId = req.query.accountId;
  if (req.query.search) {
    filter.$or = [
      { note: { $regex: req.query.search, $options: 'i' } },
      { merchant: { $regex: req.query.search, $options: 'i' } },
      { tags: { $elemMatch: { $regex: req.query.search, $options: 'i' } } },
    ];
  }

  const sort = req.query.sort || '-transactionDate';

  const [items, total] = await Promise.all([
    Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('categoryId', 'name type iconKey colorToken')
      .populate('accountId', 'name type'),
    Transaction.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

const getTransaction = asyncHandler(async (req, res) => {
  const tx = await Transaction.findOne({ _id: req.params.id, userId: req.user.id })
    .populate('categoryId', 'name type iconKey colorToken')
    .populate('accountId', 'name type');

  if (!tx) {
    throw new ApiError(404, 'Transaction not found');
  }

  res.status(200).json({ success: true, data: tx });
});

const createTransaction = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  payload.userId = req.user.id;
  payload.transactionDate = new Date(payload.transactionDate);

  const account = await ensureOwnedAccount(req.user.id, payload.accountId);
  await ensureOwnedCategory(req.user.id, payload.categoryId, payload.type);

  const tx = await Transaction.create(payload);

  account.currentBalance = normalizeMoney(account.currentBalance + signedAmount(tx.type, tx.amount));
  await account.save();

  res.status(201).json({ success: true, data: tx });
});

const updateTransaction = asyncHandler(async (req, res) => {
  const existing = await Transaction.findOne({ _id: req.params.id, userId: req.user.id });
  if (!existing) {
    throw new ApiError(404, 'Transaction not found');
  }

  const updatedPayload = {
    accountId: req.body.accountId || existing.accountId.toString(),
    categoryId: req.body.categoryId || existing.categoryId.toString(),
    type: req.body.type || existing.type,
    amount: req.body.amount ?? existing.amount,
    transactionDate: req.body.transactionDate ? new Date(req.body.transactionDate) : existing.transactionDate,
    note: req.body.note ?? existing.note,
    tags: req.body.tags ?? existing.tags,
    merchant: req.body.merchant ?? existing.merchant,
    source: req.body.source || existing.source,
    recurringRuleId: req.body.recurringRuleId ?? existing.recurringRuleId,
  };

  const oldAccount = await ensureOwnedAccount(req.user.id, existing.accountId);
  const newAccount = await ensureOwnedAccount(req.user.id, updatedPayload.accountId);
  await ensureOwnedCategory(req.user.id, updatedPayload.categoryId, updatedPayload.type);

  oldAccount.currentBalance = normalizeMoney(
    oldAccount.currentBalance - signedAmount(existing.type, existing.amount)
  );

  newAccount.currentBalance = normalizeMoney(
    newAccount.currentBalance + signedAmount(updatedPayload.type, updatedPayload.amount)
  );

  await Promise.all([oldAccount.save(), oldAccount._id.equals(newAccount._id) ? Promise.resolve() : newAccount.save()]);

  Object.assign(existing, updatedPayload);
  await existing.save();

  res.status(200).json({ success: true, data: existing });
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const tx = await Transaction.findOne({ _id: req.params.id, userId: req.user.id });

  if (!tx) {
    throw new ApiError(404, 'Transaction not found');
  }

  const account = await Account.findOne({ _id: tx.accountId, userId: req.user.id });
  if (account) {
    account.currentBalance = normalizeMoney(account.currentBalance - signedAmount(tx.type, tx.amount));
    await account.save();
  }

  await tx.deleteOne();

  res.status(200).json({
    success: true,
    data: { message: 'Transaction deleted successfully' },
  });
});

module.exports = {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
