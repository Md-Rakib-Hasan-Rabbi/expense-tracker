const bcrypt = require('bcrypt');
const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const User = require('./user.model');

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    data: user.toSafeObject(),
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (update.currency) {
    update.currency = update.currency.toUpperCase();
  }

  const user = await User.findByIdAndUpdate(req.user.id, update, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    data: user.toSafeObject(),
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      message: 'Password updated successfully',
    },
  });
});

module.exports = {
  getMe,
  updateMe,
  changePassword,
};
