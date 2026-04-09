const asyncHandler = require('../../common/utils/asyncHandler');
const supabase = require('../../config/supabase');
const { throwIfSupabaseError } = require('../../common/utils/supabaseHelpers');

function escapeCsv(value) {
  const stringValue = String(value ?? '');
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function monthDateRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return { start, end };
}

const exportTransactionsCsv = asyncHandler(async (req, res) => {
  const { start, end } = monthDateRange();
  const from = req.query.from ? new Date(req.query.from) : start;
  const to = req.query.to ? new Date(req.query.to) : end;

  let query = supabase
    .from('transactions')
    .select('transaction_date,type,amount,note,merchant,source,category:categories(name,type),account:accounts(name,type)')
    .eq('user_id', req.user.id)
    .gte('transaction_date', from.toISOString())
    .lte('transaction_date', to.toISOString())
    .order('transaction_date', { ascending: false });

  if (req.query.type) query = query.eq('type', req.query.type);
  if (req.query.accountId) query = query.eq('account_id', req.query.accountId);
  if (req.query.categoryId) query = query.eq('category_id', req.query.categoryId);

  const { data: transactions, error } = await query;
  throwIfSupabaseError(error, 'Failed to export transactions');

  const header = [
    'Date',
    'Type',
    'Amount',
    'Category',
    'Account',
    'Merchant',
    'Note',
    'Source',
  ];

  const rows = transactions.map((tx) => [
    new Date(tx.transaction_date).toISOString(),
    tx.type,
    tx.amount,
    tx.category?.name || '',
    tx.account?.name || '',
    tx.merchant || '',
    tx.note || '',
    tx.source || 'manual',
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((value) => escapeCsv(value)).join(','))
    .join('\n');

  const filename = `transactions-${from.toISOString().slice(0, 10)}-to-${to
    .toISOString()
    .slice(0, 10)}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  res.status(200).send(csv);
});

module.exports = {
  exportTransactionsCsv,
};
