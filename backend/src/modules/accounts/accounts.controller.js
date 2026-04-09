const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const Account = require('./account.model');

const listAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ userId: req.user.id }).sort({ name: 1 });

  res.status(200).json({ success: true, data: accounts });
});

const createAccount = asyncHandler(async (req, res) => {
  const payload = { ...req.body, userId: req.user.id };
  if (payload.currentBalance === undefined && payload.openingBalance !== undefined) {
    payload.currentBalance = payload.openingBalance;
  }

  const account = await Account.create(payload);

  res.status(201).json({ success: true, data: account });
});

const updateAccount = asyncHandler(async (req, res) => {
  const account = await Account.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!account) {
    throw new ApiError(404, 'Account not found');
  }

  res.status(200).json({ success: true, data: account });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const account = await Account.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

  if (!account) {
    throw new ApiError(404, 'Account not found');
  }

  res.status(200).json({
    success: true,
    data: { message: 'Account deleted successfully' },
  });
});

module.exports = {
  listAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
};
