const asyncHandler = require('../../common/utils/asyncHandler');
const Transaction = require('../transactions/transaction.model');

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
  const filter = { userId: req.user.id };

  const { start, end } = monthDateRange();
  const from = req.query.from ? new Date(req.query.from) : start;
  const to = req.query.to ? new Date(req.query.to) : end;

  filter.transactionDate = { $gte: from, $lte: to };
  if (req.query.type) filter.type = req.query.type;
  if (req.query.accountId) filter.accountId = req.query.accountId;
  if (req.query.categoryId) filter.categoryId = req.query.categoryId;

  const transactions = await Transaction.find(filter)
    .sort({ transactionDate: -1 })
    .populate('categoryId', 'name type')
    .populate('accountId', 'name type');

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
    new Date(tx.transactionDate).toISOString(),
    tx.type,
    tx.amount,
    tx.categoryId?.name || '',
    tx.accountId?.name || '',
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
