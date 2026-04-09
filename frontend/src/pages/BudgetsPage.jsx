import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { Input } from '../components/common/Input';
import { PageHeader } from '../components/common/PageHeader';
import { Select } from '../components/common/Select';
import { budgetsApi, categoriesApi } from '../services/resourceApi';
import { formatCurrency } from '../utils/formatters';
import { getApiErrorMessage } from '../utils/apiError';
import { useAuth } from '../context/useAuth';
import { useAppState } from '../context/useAppState';

export function BudgetsPage() {
  const { user } = useAuth();
  const { selectedMonth, setSelectedMonth } = useAppState();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ categoryId: '', limitAmount: '', alertThresholdPercent: 80 });
  const [error, setError] = useState('');

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === 'expense'),
    [categories]
  );

  const load = useCallback(async () => {
    try {
      const [budgetRes, categoryRes] = await Promise.all([
        budgetsApi.list(selectedMonth),
        categoriesApi.list(),
      ]);
      setBudgets(budgetRes.data || []);
      setCategories(categoryRes.data || []);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Failed to load budgets'));
    }
  }, [selectedMonth]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.categoryId) {
      setError('Please select a category for this budget.');
      return;
    }

    if (!Number(form.limitAmount) || Number(form.limitAmount) <= 0) {
      setError('Budget limit must be greater than zero.');
      return;
    }

    try {
      await budgetsApi.upsert(form.categoryId, selectedMonth, {
        limitAmount: Number(form.limitAmount),
        alertThresholdPercent: Number(form.alertThresholdPercent),
      });
      setForm({ categoryId: '', limitAmount: '', alertThresholdPercent: 80 });
      await load();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Failed to save budget'));
    }
  };

  const removeBudget = async (id) => {
    try {
      await budgetsApi.remove(id);
      await load();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, 'Failed to delete budget'));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Budgets" description="Set monthly limits and monitor category spending caps" />
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <Card title="Budget Controls">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-4">
          <Input
            label="Month"
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          />
          <Select
            label="Category"
            value={form.categoryId}
            onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
          >
            <option value="">Select expense category</option>
            {expenseCategories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Input
            label="Limit"
            type="number"
            step="0.01"
            value={form.limitAmount}
            onChange={(event) => setForm((prev) => ({ ...prev, limitAmount: event.target.value }))}
          />
          <Input
            label="Alert %"
            type="number"
            min="1"
            max="100"
            value={form.alertThresholdPercent}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, alertThresholdPercent: event.target.value }))
            }
          />
          <div className="md:col-span-4 mt-1">
            <Button type="submit">Save Budget</Button>
          </div>
        </form>
      </Card>

      <Card title={`Budgets for ${selectedMonth}`}>
        {budgets.length === 0 ? (
          <EmptyState title="No budgets set" message="Create budgets for expense categories to track limits." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {budgets.map((budget) => (
              <article key={budget._id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                <p className="font-semibold text-slate-100">{budget.categoryId?.name || 'Category'}</p>
                <p className="text-sm text-slate-300">
                  Limit: {formatCurrency(budget.limitAmount, user?.currency)}
                </p>
                <p className="text-sm text-slate-300">
                  Spent: {formatCurrency(budget.spentAmount, user?.currency)}
                </p>
                <p className="text-sm text-slate-300">
                  Remaining: {formatCurrency(budget.remainingAmount, user?.currency)}
                </p>
                <div className="mt-2 h-2 rounded-full bg-slate-800">
                  <div
                    className={`h-2 rounded-full ${budget.isOverspent ? 'bg-rose-500' : budget.isThresholdReached ? 'bg-amber-400' : 'bg-cyan-400'}`}
                    style={{ width: `${Math.min(100, Number(budget.progressPercent || 0))}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">Progress: {Number(budget.progressPercent || 0).toFixed(2)}%</p>
                <p className="text-xs text-slate-400">Alert at {budget.alertThresholdPercent}%</p>
                <div className="mt-3">
                  <Button variant="danger" className="px-3 py-1" onClick={() => removeBudget(budget._id)}>
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
