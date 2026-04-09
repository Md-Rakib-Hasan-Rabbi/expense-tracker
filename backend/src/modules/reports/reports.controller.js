const asyncHandler = require('../../common/utils/asyncHandler');
const supabase = require('../../config/supabase');
const { throwIfSupabaseError } = require('../../common/utils/supabaseHelpers');

const summary = asyncHandler(async (req, res) => {
  const from = new Date(req.query.from);
  const to = new Date(req.query.to);

  const { data: rows, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', req.user.id)
    .gte('transaction_date', from.toISOString())
    .lte('transaction_date', to.toISOString());

  throwIfSupabaseError(error, 'Failed to load summary report');

  const income = Number(
    (rows || [])
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
      .toFixed(2)
  );

  const expense = Number(
    (rows || [])
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
      .toFixed(2)
  );

  res.status(200).json({
    success: true,
    data: {
      income,
      expense,
      net: income - expense,
      range: { from, to },
    },
  });
});

const categoryBreakdown = asyncHandler(async (req, res) => {
  const from = new Date(req.query.from);
  const to = new Date(req.query.to);

  const { data: rows, error } = await supabase
    .from('transactions')
    .select('amount, category:categories(id,name,icon_key,color_token)')
    .eq('user_id', req.user.id)
    .eq('type', 'expense')
    .gte('transaction_date', from.toISOString())
    .lte('transaction_date', to.toISOString());

  throwIfSupabaseError(error, 'Failed to load category breakdown');

  const map = new Map();
  for (const row of rows || []) {
    if (!row.category) continue;
    const key = row.category.id;
    if (!map.has(key)) {
      map.set(key, {
        categoryId: key,
        categoryName: row.category.name,
        iconKey: row.category.icon_key,
        colorToken: row.category.color_token,
        total: 0,
      });
    }
    const existing = map.get(key);
    existing.total = Number((existing.total + Number(row.amount || 0)).toFixed(2));
  }

  const result = Array.from(map.values()).sort((a, b) => b.total - a.total);

  res.status(200).json({ success: true, data: result });
});

const monthlyTrend = asyncHandler(async (req, res) => {
  const months = Number(req.query.months || 12);
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1, 0, 0, 0));

  const { data: rows, error } = await supabase
    .from('transactions')
    .select('type, amount, transaction_date')
    .eq('user_id', req.user.id)
    .gte('transaction_date', from.toISOString())
    .lte('transaction_date', now.toISOString())
    .order('transaction_date', { ascending: true });

  throwIfSupabaseError(error, 'Failed to load monthly trend');

  const grouped = new Map();
  for (const row of rows || []) {
    const dt = new Date(row.transaction_date);
    const year = dt.getUTCFullYear();
    const month = dt.getUTCMonth() + 1;
    const key = `${year}-${month}-${row.type}`;
    const total = Number(grouped.get(key) || 0) + Number(row.amount || 0);
    grouped.set(key, Number(total.toFixed(2)));
  }

  const result = Array.from(grouped.entries())
    .map(([key, total]) => {
      const [year, month, type] = key.split('-');
      return { year: Number(year), month: Number(month), type, total };
    })
    .sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year));

  res.status(200).json({ success: true, data: result });
});

module.exports = {
  summary,
  categoryBreakdown,
  monthlyTrend,
};
