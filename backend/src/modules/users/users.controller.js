const bcrypt = require('bcrypt');
const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const supabase = require('../../config/supabase');
const { mapUser, throwIfSupabaseError } = require('../../common/utils/supabaseHelpers');

const getMe = asyncHandler(async (req, res) => {
  const { data: userRow, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .maybeSingle();

  throwIfSupabaseError(error, 'Failed to load user profile');

  if (!userRow) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    data: mapUser(userRow),
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (update.currency) {
    update.currency = update.currency.toUpperCase();
  }

  const payload = {
    ...(update.name !== undefined ? { name: update.name } : {}),
    ...(update.currency !== undefined ? { currency: update.currency } : {}),
    ...(update.timezone !== undefined ? { timezone: update.timezone } : {}),
    ...(update.settings !== undefined ? { settings: update.settings } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data: userRow, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', req.user.id)
    .select('*')
    .maybeSingle();

  throwIfSupabaseError(error, 'Failed to update profile');

  if (!userRow) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    data: mapUser(userRow),
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .maybeSingle();

  throwIfSupabaseError(userError, 'Failed to load user');

  if (!userRow) {
    throw new ApiError(404, 'User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, userRow.password_hash);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  const { error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
    .eq('id', req.user.id);

  throwIfSupabaseError(error, 'Failed to update password');

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
