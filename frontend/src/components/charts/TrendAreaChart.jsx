import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../common/Card';
import { formatCurrency } from '../../utils/formatters';

function buildMonthlyRows(data) {
  const rows = new Map();

  (data || []).forEach((item) => {
    const key = `${item.year}-${String(item.month).padStart(2, '0')}`;
    if (!rows.has(key)) {
      rows.set(key, { month: key, income: 0, expense: 0 });
    }
    const row = rows.get(key);
    row[item.type] = item.total;
  });

  return Array.from(rows.values());
}

export function TrendAreaChart({ data, currency = 'USD' }) {
  const rows = buildMonthlyRows(data);

  return (
    <Card title="Monthly Trend" className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip formatter={(value) => formatCurrency(value, currency)} />
          <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#incomeGradient)" />
          <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#expenseGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
