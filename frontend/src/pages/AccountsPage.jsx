import { useCallback, useEffect, useState } from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { Input } from '../components/common/Input';
import { PageHeader } from '../components/common/PageHeader';
import { Select } from '../components/common/Select';
import { accountsApi } from '../services/resourceApi';
import { getApiErrorMessage } from '../utils/apiError';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/useAuth';

const defaultForm = {
  name: '',
  type: 'bank',
  openingBalance: '0',
  currentBalance: '0',
};

export function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await accountsApi.list();
      setAccounts(res.data || []);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Failed to load accounts'));
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const reset = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const payload = {
      name: form.name,
      type: form.type,
      openingBalance: Number(form.openingBalance),
      currentBalance: Number(form.currentBalance),
    };

    try {
      if (editingId) {
        await accountsApi.update(editingId, payload);
      } else {
        await accountsApi.create(payload);
      }
      await load();
      reset();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Failed to save account'));
    }
  };

  const onEdit = (account) => {
    setEditingId(account._id);
    setForm({
      name: account.name,
      type: account.type,
      openingBalance: String(account.openingBalance),
      currentBalance: String(account.currentBalance),
    });
  };

  const onDelete = async (id) => {
    try {
      await accountsApi.remove(id);
      await load();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, 'Failed to delete account'));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Accounts" description="Track balances across your wallets and bank accounts" />
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <Card title={editingId ? 'Edit Account' : 'Create Account'}>
        <form className="grid gap-3 md:grid-cols-5" onSubmit={submit}>
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="card">Card</option>
            <option value="wallet">Wallet</option>
            <option value="other">Other</option>
          </Select>
          <Input
            label="Opening"
            type="number"
            step="0.01"
            value={form.openingBalance}
            onChange={(event) => setForm((prev) => ({ ...prev, openingBalance: event.target.value }))}
          />
          <Input
            label="Current"
            type="number"
            step="0.01"
            value={form.currentBalance}
            onChange={(event) => setForm((prev) => ({ ...prev, currentBalance: event.target.value }))}
          />
          <div className="flex items-end gap-2">
            <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
            {editingId ? (
              <Button type="button" variant="secondary" onClick={reset}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card title="Account List">
        {accounts.length === 0 ? (
          <EmptyState title="No accounts found" message="Add your first cash or bank account." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account) => (
              <article key={account._id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                <p className="font-semibold text-slate-100">{account.name}</p>
                <p className="text-xs capitalize text-slate-400">{account.type}</p>
                <p className="mt-2 text-sm text-slate-200">
                  Balance: {formatCurrency(account.currentBalance, user?.currency)}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" className="px-3 py-1" onClick={() => onEdit(account)}>
                    Edit
                  </Button>
                  <Button variant="danger" className="px-3 py-1" onClick={() => onDelete(account._id)}>
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
