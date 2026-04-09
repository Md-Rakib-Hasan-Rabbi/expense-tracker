import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { Input } from '../components/common/Input';
import { PageHeader } from '../components/common/PageHeader';
import { Select } from '../components/common/Select';
import { accountsApi, categoriesApi, transactionsApi } from '../services/resourceApi';
import { formatCurrency, formatDate, toISODate } from '../utils/formatters';
import { getApiErrorMessage } from '../utils/apiError';
import { useAuth } from '../context/useAuth';

const defaultForm = {
  accountId: '',
  categoryId: '',
  type: 'expense',
  amount: '',
  transactionDate: new Date().toISOString().slice(0, 10),
  note: '',
  merchant: '',
};

export function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ from: '', to: '', type: '' });
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  );

  const loadDependencies = useCallback(async () => {
    const [accountsRes, categoriesRes] = await Promise.all([accountsApi.list(), categoriesApi.list()]);
    setAccounts(accountsRes.data || []);
    setCategories(categoriesRes.data || []);
  }, []);

  const loadTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 15,
      };

      if (filters.from) params.from = toISODate(filters.from);
      if (filters.to) params.to = toISODate(filters.to);
      if (filters.type) params.type = filters.type;

      const res = await transactionsApi.list(params);
      setTransactions(res.data || []);
      setMeta(res.meta || { page: 1, totalPages: 1 });
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Failed to load transactions'));
    } finally {
      setLoading(false);
    }
  }, [filters.from, filters.to, filters.type]);

  useEffect(() => {
    const run = async () => {
      try {
        await loadDependencies();
        await loadTransactions(1);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Failed to initialize transactions page'));
      }
    };
    queueMicrotask(() => {
      void run();
    });
  }, [loadDependencies, loadTransactions]);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setError('');

    const payload = {
      accountId: form.accountId,
      categoryId: form.categoryId,
      type: form.type,
      amount: Number(form.amount),
      transactionDate: toISODate(form.transactionDate),
      note: form.note,
      merchant: form.merchant,
    };

    try {
      if (editingId) {
        await transactionsApi.update(editingId, payload);
      } else {
        await transactionsApi.create(payload);
      }
      await loadTransactions(meta.page || 1);
      resetForm();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Failed to save transaction'));
    }
  };

  const onEdit = (tx) => {
    setEditingId(tx._id);
    setForm({
      accountId: tx.accountId?._id || tx.accountId,
      categoryId: tx.categoryId?._id || tx.categoryId,
      type: tx.type,
      amount: String(tx.amount),
      transactionDate: new Date(tx.transactionDate).toISOString().slice(0, 10),
      note: tx.note || '',
      merchant: tx.merchant || '',
    });
  };

  const onDelete = async (id) => {
    try {
      await transactionsApi.remove(id);
      await loadTransactions(meta.page || 1);
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, 'Failed to delete transaction'));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Transactions" description="Record and manage your income and expenses" />

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <Card title={editingId ? 'Edit Transaction' : 'New Transaction'}>
        <form className="grid gap-3 md:grid-cols-3" onSubmit={submitForm}>
          <Select
            label="Type"
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value, categoryId: '' }))}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>

          <Select
            label="Account"
            value={form.accountId}
            onChange={(event) => setForm((prev) => ({ ...prev, accountId: event.target.value }))}
            required
          >
            <option value="">Select account</option>
            {accounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.name}
              </option>
            ))}
          </Select>

          <Select
            label="Category"
            value={form.categoryId}
            onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
            required
          >
            <option value="">Select category</option>
            {filteredCategories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </Select>

          <Input
            label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
          />

          <Input
            label="Date"
            type="date"
            required
            value={form.transactionDate}
            onChange={(event) => setForm((prev) => ({ ...prev, transactionDate: event.target.value }))}
          />

          <Input
            label="Merchant"
            value={form.merchant}
            onChange={(event) => setForm((prev) => ({ ...prev, merchant: event.target.value }))}
          />

          <div className="md:col-span-3">
            <Input
              label="Note"
              value={form.note}
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            />
          </div>

          <div className="md:col-span-3 flex flex-wrap gap-2">
            <Button type="submit">{editingId ? 'Update Transaction' : 'Add Transaction'}</Button>
            {editingId ? (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel Edit
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card title="Filters">
        <div className="grid gap-3 md:grid-cols-4">
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
          <Select
            label="Type"
            value={filters.type}
            onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
          >
            <option value="">All</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
          <div className="flex items-end">
            <Button className="w-full" onClick={() => loadTransactions(1)}>
              Apply
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Transaction History" subtitle={loading ? 'Loading...' : `${transactions.length} results`}>
        {transactions.length === 0 ? (
          <EmptyState title="No transactions yet" message="Create your first transaction to start tracking spend." />
        ) : (
          <div className="scrollbar-thin overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Type</th>
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">Account</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-slate-800/70 text-slate-200">
                    <td className="px-2 py-2">{formatDate(tx.transactionDate)}</td>
                    <td className="px-2 py-2 capitalize">{tx.type}</td>
                    <td className="px-2 py-2">{tx.categoryId?.name || '-'}</td>
                    <td className="px-2 py-2">{tx.accountId?.name || '-'}</td>
                    <td className="px-2 py-2">{formatCurrency(tx.amount, user?.currency)}</td>
                    <td className="px-2 py-2">
                      <div className="flex gap-2">
                        <Button variant="secondary" className="px-3 py-1" onClick={() => onEdit(tx)}>
                          Edit
                        </Button>
                        <Button variant="danger" className="px-3 py-1" onClick={() => onDelete(tx._id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page {meta.page || 1} of {meta.totalPages || 1}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="px-3 py-1"
              disabled={(meta.page || 1) <= 1}
              onClick={() => loadTransactions((meta.page || 1) - 1)}
            >
              Prev
            </Button>
            <Button
              variant="ghost"
              className="px-3 py-1"
              disabled={(meta.page || 1) >= (meta.totalPages || 1)}
              onClick={() => loadTransactions((meta.page || 1) + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
