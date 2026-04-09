import { useEffect, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { ExpensePieChart } from '../components/charts/ExpensePieChart';
import { TrendAreaChart } from '../components/charts/TrendAreaChart';
import { reportsApi } from '../services/resourceApi';
import { useAuth } from '../context/useAuth';
import { getApiErrorMessage } from '../utils/apiError';

function getDefaultRange() {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [breakdown, setBreakdown] = useState([]);
  const [trend, setTrend] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      const range = getDefaultRange();
      try {
        const [summaryRes, breakdownRes, trendRes] = await Promise.all([
          reportsApi.summary(range),
          reportsApi.categoryBreakdown(range),
          reportsApi.monthlyTrend({ months: 12 }),
        ]);

        setSummary(summaryRes.data);
        setBreakdown(breakdownRes.data || []);
        setTrend(trendRes.data || []);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Failed to load dashboard insights'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader title="Dashboard" description="Track key financial metrics and trends" />

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Income" value={summary.income} currency={user?.currency} tone="emerald" />
        <StatCard title="Total Expense" value={summary.expense} currency={user?.currency} tone="rose" />
        <StatCard title="Net Balance" value={summary.net} currency={user?.currency} tone="cyan" />
        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 backdrop-blur-sm comet-overlay prism-float">
          <p className="text-xs uppercase tracking-widest text-slate-400">Top Categories</p>
          <p className="mt-2 text-2xl font-bold text-violet-300">{breakdown.length}</p>
          <p className="mt-1 text-xs text-slate-500">Active spend categories</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading dashboard data...</p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <ExpensePieChart data={breakdown} currency={user?.currency} />
          <TrendAreaChart data={trend} currency={user?.currency} />
        </div>
      )}
    </div>
  );
}
