const asyncHandler = require('../../common/utils/asyncHandler');
const ApiError = require('../../common/utils/ApiError');
const supabase = require('../../config/supabase');
const { mapBudget, throwIfSupabaseError } = require('../../common/utils/supabaseHelpers');

function currentMonthKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

const listBudgets = asyncHandler(async (req, res) => {
  const monthKey = req.query.month || currentMonthKey();
  const [year, month] = monthKey.split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  const { data: budgetsRows, error: budgetsError } = await supabase
    .from('budgets')
    .select('*, category:categories(id,name,type,icon_key,color_token)')
    .eq('user_id', req.user.id)
    .eq('month_key', monthKey)
    .order('created_at', { ascending: false });

  throwIfSupabaseError(budgetsError, 'Failed to list budgets');

  const { data: transactionsRows, error: transactionsError } = await supabase
    .from('transactions')
    .select('category_id, amount')
    .eq('user_id', req.user.id)
    .eq('type', 'expense')
    .gte('transaction_date', start.toISOString())
    .lte('transaction_date', end.toISOString());

  throwIfSupabaseError(transactionsError, 'Failed to calculate budget spend');

  const spendMap = new Map();
  for (const tx of transactionsRows || []) {
    const currentTotal = Number(spendMap.get(tx.category_id) || 0);
    spendMap.set(tx.category_id, Number((currentTotal + Number(tx.amount || 0)).toFixed(2)));
  }

  const mappedBudgets = (budgetsRows || []).map(mapBudget);

  const enrichedBudgets = mappedBudgets.map((budget) => {
    const categoryId = budget.categoryId?._id || budget.categoryId;
    const spentAmount = Number(spendMap.get(String(categoryId)) || 0);
    const remainingAmount = Number((Number(budget.limitAmount) - spentAmount).toFixed(2));
    const progressPercent =
      Number(budget.limitAmount) > 0 ? Number(((spentAmount / Number(budget.limitAmount)) * 100).toFixed(2)) : 0;

    return {
      ...budget,
      spentAmount,
      remainingAmount,
      progressPercent,
      isThresholdReached: progressPercent >= Number(budget.alertThresholdPercent),
      isOverspent: spentAmount > Number(budget.limitAmount),
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

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .eq('user_id', req.user.id)
    .eq('is_archived', false)
    .maybeSingle();

  throwIfSupabaseError(categoryError, 'Failed to verify category');

  if (!category) {
    throw new ApiError(400, 'Invalid category');
  }

  const { data: existing, error: existingError } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', req.user.id)
    .eq('category_id', categoryId)
    .eq('month_key', month)
    .maybeSingle();

  throwIfSupabaseError(existingError, 'Failed to query budget');

  const payload = {
    user_id: req.user.id,
    category_id: categoryId,
    month_key: month,
    period: 'monthly',
    limit_amount: Number(limitAmount),
    alert_threshold_percent: Number(alertThresholdPercent ?? 80),
    updated_at: new Date().toISOString(),
  };

  let writeQuery = supabase.from('budgets');
  if (existing) {
    writeQuery = writeQuery
      .update(payload)
      .eq('id', existing.id)
      .eq('user_id', req.user.id);
  } else {
    writeQuery = writeQuery.insert(payload);
  }

  const { data: savedRows, error: saveError } = await writeQuery
    .select('*, category:categories(id,name,type,icon_key,color_token)');

  throwIfSupabaseError(saveError, 'Failed to save budget');

  res.status(200).json({ success: true, data: mapBudget(savedRows[0]) });
});

const deleteBudget = asyncHandler(async (req, res) => {
  const { data: budget, error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('id')
    .maybeSingle();

  throwIfSupabaseError(error, 'Failed to delete budget');

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
