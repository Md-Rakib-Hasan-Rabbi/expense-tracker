const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const supabase = require('../../config/supabase');
const { mapAccount, throwIfSupabaseError } = require('../../common/utils/supabaseHelpers');

const listAccounts = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', req.user.id)
    .order('name', { ascending: true });

  throwIfSupabaseError(error, 'Failed to list accounts');

  res.status(200).json({ success: true, data: (data || []).map(mapAccount) });
});

const createAccount = asyncHandler(async (req, res) => {
  const openingBalance = req.body.openingBalance ?? 0;
  const currentBalance = req.body.currentBalance ?? openingBalance;

  const payload = {
    user_id: req.user.id,
    name: req.body.name,
    type: req.body.type || 'bank',
    opening_balance: openingBalance,
    current_balance: currentBalance,
    is_archived: req.body.isArchived || false,
  };

  const { data, error } = await supabase.from('accounts').insert(payload).select('*').single();

  throwIfSupabaseError(error, 'Failed to create account');

  res.status(201).json({ success: true, data: mapAccount(data) });
});

const updateAccount = asyncHandler(async (req, res) => {
  const payload = {
    ...(req.body.name !== undefined ? { name: req.body.name } : {}),
    ...(req.body.type !== undefined ? { type: req.body.type } : {}),
    ...(req.body.openingBalance !== undefined ? { opening_balance: req.body.openingBalance } : {}),
    ...(req.body.currentBalance !== undefined ? { current_balance: req.body.currentBalance } : {}),
    ...(req.body.isArchived !== undefined ? { is_archived: req.body.isArchived } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('accounts')
    .update(payload)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('*')
    .maybeSingle();

  throwIfSupabaseError(error, 'Failed to update account');

  if (!data) {
    throw new ApiError(404, 'Account not found');
  }

  res.status(200).json({ success: true, data: mapAccount(data) });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('id')
    .maybeSingle();

  throwIfSupabaseError(error, 'Failed to delete account');

  if (!data) {
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
