const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const supabase = require('../../config/supabase');
const { mapRecurringRule, throwIfSupabaseError } = require('../../common/utils/supabaseHelpers');

async function validateOwnership(userId, accountId, categoryId, type) {
  const [accountResult, categoryResult] = await Promise.all([
    supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', userId)
      .eq('is_archived', false)
      .maybeSingle(),
    supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .eq('user_id', userId)
      .eq('is_archived', false)
      .maybeSingle(),
  ]);

  throwIfSupabaseError(accountResult.error, 'Failed to verify account');
  throwIfSupabaseError(categoryResult.error, 'Failed to verify category');

  const account = accountResult.data;
  const category = categoryResult.data;

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
  const { data, error } = await supabase
    .from('recurring_rules')
    .select('*, category:categories(id,name,type,icon_key,color_token), account:accounts(id,name,type)')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  throwIfSupabaseError(error, 'Failed to list recurring rules');

  res.status(200).json({ success: true, data: (data || []).map(mapRecurringRule) });
});

const createRecurringRule = asyncHandler(async (req, res) => {
  const payload = {
    user_id: req.user.id,
    title: req.body.title,
    amount: Number(req.body.amount),
    type: req.body.type,
    account_id: req.body.accountId,
    category_id: req.body.categoryId,
    frequency: req.body.frequency,
    start_date: new Date(req.body.startDate).toISOString(),
    end_date: req.body.endDate ? new Date(req.body.endDate).toISOString() : null,
    next_run_at: new Date(req.body.nextRunAt).toISOString(),
    is_active: req.body.isActive ?? true,
  };

  await validateOwnership(req.user.id, payload.account_id, payload.category_id, payload.type);

  const { data, error } = await supabase
    .from('recurring_rules')
    .insert(payload)
    .select('*, category:categories(id,name,type,icon_key,color_token), account:accounts(id,name,type)')
    .single();

  throwIfSupabaseError(error, 'Failed to create recurring rule');

  res.status(201).json({ success: true, data: mapRecurringRule(data) });
});

const updateRecurringRule = asyncHandler(async (req, res) => {
  const { data: existing, error: existingError } = await supabase
    .from('recurring_rules')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  throwIfSupabaseError(existingError, 'Failed to load recurring rule');

  if (!existing) {
    throw new ApiError(404, 'Recurring rule not found');
  }

  const updated = {
    title: req.body.title ?? existing.title,
    amount: req.body.amount !== undefined ? Number(req.body.amount) : existing.amount,
    type: req.body.type ?? existing.type,
    account_id: req.body.accountId ?? existing.account_id,
    category_id: req.body.categoryId ?? existing.category_id,
    frequency: req.body.frequency ?? existing.frequency,
    start_date: req.body.startDate ? new Date(req.body.startDate).toISOString() : existing.start_date,
    end_date:
      req.body.endDate === null
        ? null
        : req.body.endDate
          ? new Date(req.body.endDate).toISOString()
          : existing.end_date,
    next_run_at: req.body.nextRunAt ? new Date(req.body.nextRunAt).toISOString() : existing.next_run_at,
    is_active: req.body.isActive ?? existing.is_active,
    updated_at: new Date().toISOString(),
  };

  await validateOwnership(req.user.id, updated.account_id, updated.category_id, updated.type);

  const { data, error } = await supabase
    .from('recurring_rules')
    .update(updated)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('*, category:categories(id,name,type,icon_key,color_token), account:accounts(id,name,type)')
    .maybeSingle();

  throwIfSupabaseError(error, 'Failed to update recurring rule');

  res.status(200).json({ success: true, data: mapRecurringRule(data) });
});

const deleteRecurringRule = asyncHandler(async (req, res) => {
  const { data: rule, error } = await supabase
    .from('recurring_rules')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('id')
    .maybeSingle();

  throwIfSupabaseError(error, 'Failed to delete recurring rule');

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
