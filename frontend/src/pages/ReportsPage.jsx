import { useCallback, useEffect, useState } from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { Input } from '../components/common/Input';
import { ExpensePieChart } from '../components/charts/ExpensePieChart';
import { TrendAreaChart } from '../components/charts/TrendAreaChart';
import { reportsApi } from '../services/resourceApi';
import { formatCurrency, toISODate } from '../utils/formatters';
import { getApiErrorMessage } from '../utils/apiError';
import { useAuth } from '../context/useAuth';

function getDefaultDateInputs() {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 1);

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function ReportsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [breakdown, setBreakdown] = useState([]);
  const [trend, setTrend] = useState([]);
  const [filters, setFilters] = useState(getDefaultDateInputs());
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    const params = {
      from: toISODate(filters.from),
      to: toISODate(filters.to),
    };

    try {
      const [summaryRes, breakdownRes, trendRes] = await Promise.all([
        reportsApi.summary(params),
        reportsApi.categoryBreakdown(params),
        reportsApi.monthlyTrend({ months: 12 }),
      ]);
      setSummary(summaryRes.data || { income: 0, expense: 0, net: 0 });
      setBreakdown(breakdownRes.data || []);
      setTrend(trendRes.data || []);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Failed to load reports'));
    }
  }, [filters.from, filters.to]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  return (
    <div className="space-y-5">
      <PageHeader title="Reports" description="Analyze your spending behavior with deep insights" />

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <Card title="Report Range" subtitle="Apply a date range for summary and category analytics">
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="From"
            type="date"
            value={filters.from}
            onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
          />
          <Input
            label="To"
            type="date"
            value={filters.to}
            onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
          />
          <div className="flex items-end">
            <Button className="w-full" onClick={load}>
              Refresh Report
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Income">
          <p className="text-2xl font-bold text-emerald-300">{formatCurrency(summary.income, user?.currency)}</p>
        </Card>
        <Card title="Expense">
          <p className="text-2xl font-bold text-rose-300">{formatCurrency(summary.expense, user?.currency)}</p>
        </Card>
        <Card title="Net">
          <p className="text-2xl font-bold text-cyan-300">{formatCurrency(summary.net, user?.currency)}</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ExpensePieChart data={breakdown} currency={user?.currency} />
        <TrendAreaChart data={trend} currency={user?.currency} />
      </div>

      <Card title="Category Breakdown Table">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="px-2 py-2">Category</th>
                <th className="px-2 py-2">Spent</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((item) => (
                <tr key={item.categoryId} className="border-b border-slate-800/60 text-slate-200">
                  <td className="px-2 py-2">{item.categoryName}</td>
                  <td className="px-2 py-2">{formatCurrency(item.total, user?.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
