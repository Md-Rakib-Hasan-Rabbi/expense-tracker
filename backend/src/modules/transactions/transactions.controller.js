const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const { getPagination } = require('../../common/utils/pagination');
const supabase = require('../../config/supabase');
const { mapTransaction, throwIfSupabaseError } = require('../../common/utils/supabaseHelpers');

function signedAmount(type, amount) {
  return type === 'income' ? Number(amount) : -Number(amount);
}

function normalizeMoney(value) {
  return Number(Number(value).toFixed(2));
}

function applyTransactionFilters(query, reqQuery) {
  let q = query;

  if (reqQuery.from) q = q.gte('transaction_date', new Date(reqQuery.from).toISOString());
  if (reqQuery.to) q = q.lte('transaction_date', new Date(reqQuery.to).toISOString());
  if (reqQuery.type) q = q.eq('type', reqQuery.type);
  if (reqQuery.categoryId) q = q.eq('category_id', reqQuery.categoryId);
  if (reqQuery.accountId) q = q.eq('account_id', reqQuery.accountId);

  if (reqQuery.search) {
    const value = `%${reqQuery.search}%`;
    q = q.or(`note.ilike.${value},merchant.ilike.${value}`);
  }

  return q;
}

async function ensureOwnedAccount(userId, accountId) {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', accountId)
    .eq('user_id', userId)
    .eq('is_archived', false)
    .maybeSingle();

  throwIfSupabaseError(error, 'Failed to verify account');

  if (!data) {
    throw new ApiError(400, 'Invalid account');
  }
  return data;
}

async function ensureOwnedCategory(userId, categoryId, type) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .eq('user_id', userId)
    .eq('is_archived', false)
    .maybeSingle();

  throwIfSupabaseError(error, 'Failed to verify category');

  if (!data) {
    throw new ApiError(400, 'Invalid category');
  }

  if (type && data.type !== type) {
    throw new ApiError(400, 'Category type does not match transaction type');
  }

  return data;
}

async function updateAccountBalance(accountId, userId, delta) {
  const account = await ensureOwnedAccount(userId, accountId);
  const newBalance = normalizeMoney(Number(account.current_balance) + Number(delta));

  const { error } = await supabase
    .from('accounts')
    .update({ current_balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', accountId)
    .eq('user_id', userId);

  throwIfSupabaseError(error, 'Failed to update account balance');
}

const listTransactions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const sort = req.query.sort || '-transactionDate';

  const sortMap = {
    transactionDate: ['transaction_date', true],
    '-transactionDate': ['transaction_date', false],
    amount: ['amount', true],
    '-amount': ['amount', false],
    createdAt: ['created_at', true],
    '-createdAt': ['created_at', false],
  };

  const [sortField, asc] = sortMap[sort] || ['transaction_date', false];

  let query = supabase
    .from('transactions')
    .select(
      '*, category:categories(id,name,type,icon_key,color_token), account:accounts(id,name,type)',
      { count: 'exact' }
    )
    .eq('user_id', req.user.id)
    .order(sortField, { ascending: asc })
    .range(skip, skip + limit - 1);

  query = applyTransactionFilters(query, req.query);

  const { data, count, error } = await query;

  throwIfSupabaseError(error, 'Failed to list transactions');

  res.status(200).json({
    success: true,
    data: (data || []).map(mapTransaction),
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
});

const getTransaction = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(id,name,type,icon_key,color_token), account:accounts(id,name,type)')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  throwIfSupabaseError(error, 'Failed to load transaction');

  if (!data) {
    throw new ApiError(404, 'Transaction not found');
  }

  res.status(200).json({ success: true, data: mapTransaction(data) });
});

const createTransaction = asyncHandler(async (req, res) => {
  const payload = {
    user_id: req.user.id,
    account_id: req.body.accountId,
    category_id: req.body.categoryId,
    type: req.body.type,
    amount: Number(req.body.amount),
    transaction_date: new Date(req.body.transactionDate).toISOString(),
    note: req.body.note || '',
    tags: req.body.tags || [],
    merchant: req.body.merchant || '',
    source: req.body.source || 'manual',
    recurring_rule_id: req.body.recurringRuleId || null,
  };

  await ensureOwnedAccount(req.user.id, payload.account_id);
  await ensureOwnedCategory(req.user.id, payload.category_id, payload.type);

  const { data, error } = await supabase
    .from('transactions')
    .insert(payload)
    .select('*, category:categories(id,name,type,icon_key,color_token), account:accounts(id,name,type)')
    .single();

  throwIfSupabaseError(error, 'Failed to create transaction');

  await updateAccountBalance(payload.account_id, req.user.id, signedAmount(payload.type, payload.amount));

  res.status(201).json({ success: true, data: mapTransaction(data) });
});

const updateTransaction = asyncHandler(async (req, res) => {
  const { data: existing, error: existingError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  throwIfSupabaseError(existingError, 'Failed to load transaction');

  if (!existing) {
    throw new ApiError(404, 'Transaction not found');
  }

  const updated = {
    account_id: req.body.accountId || existing.account_id,
    category_id: req.body.categoryId || existing.category_id,
    type: req.body.type || existing.type,
    amount: req.body.amount !== undefined ? Number(req.body.amount) : Number(existing.amount),
    transaction_date: req.body.transactionDate ? new Date(req.body.transactionDate).toISOString() : existing.transaction_date,
    note: req.body.note ?? existing.note,
    tags: req.body.tags ?? existing.tags,
    merchant: req.body.merchant ?? existing.merchant,
    source: req.body.source || existing.source,
    recurring_rule_id: req.body.recurringRuleId ?? existing.recurring_rule_id,
    updated_at: new Date().toISOString(),
  };

  await ensureOwnedAccount(req.user.id, updated.account_id);
  await ensureOwnedCategory(req.user.id, updated.category_id, updated.type);

  const oldDelta = signedAmount(existing.type, existing.amount);
  const newDelta = signedAmount(updated.type, updated.amount);

  if (existing.account_id === updated.account_id) {
    await updateAccountBalance(updated.account_id, req.user.id, newDelta - oldDelta);
  } else {
    await updateAccountBalance(existing.account_id, req.user.id, -oldDelta);
    await updateAccountBalance(updated.account_id, req.user.id, newDelta);
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(updated)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('*, category:categories(id,name,type,icon_key,color_token), account:accounts(id,name,type)')
    .maybeSingle();

  throwIfSupabaseError(error, 'Failed to update transaction');

  res.status(200).json({ success: true, data: mapTransaction(data) });
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const { data: existing, error: existingError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  throwIfSupabaseError(existingError, 'Failed to load transaction');

  if (!existing) {
    throw new ApiError(404, 'Transaction not found');
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  throwIfSupabaseError(error, 'Failed to delete transaction');

  await updateAccountBalance(existing.account_id, req.user.id, -signedAmount(existing.type, existing.amount));

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
