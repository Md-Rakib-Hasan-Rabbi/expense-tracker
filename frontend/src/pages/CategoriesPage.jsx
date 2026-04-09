import { useCallback, useEffect, useState } from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { Input } from '../components/common/Input';
import { PageHeader } from '../components/common/PageHeader';
import { Select } from '../components/common/Select';
import { categoriesApi } from '../services/resourceApi';
import { getApiErrorMessage } from '../utils/apiError';

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'expense' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await categoriesApi.list();
      setCategories(res.data || []);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Failed to load categories'));
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const reset = () => {
    setForm({ name: '', type: 'expense' });
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (editingId) {
        await categoriesApi.update(editingId, form);
      } else {
        await categoriesApi.create(form);
      }
      await load();
      reset();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Failed to save category'));
    }
  };

  const onEdit = (category) => {
    setEditingId(category._id);
    setForm({ name: category.name, type: category.type });
  };

  const onDelete = async (id) => {
    try {
      await categoriesApi.remove(id);
      await load();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, 'Failed to delete category'));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Categories" description="Organize income and expenses with reusable categories" />
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <Card title={editingId ? 'Edit Category' : 'Create Category'}>
        <form className="grid gap-3 md:grid-cols-3" onSubmit={submit}>
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
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
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

      <Card title="Category List">
        {categories.length === 0 ? (
          <EmptyState title="No categories found" message="Create categories to classify transactions." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <article key={category._id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-100">{category.name}</p>
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-xs capitalize text-slate-300">
                    {category.type}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" className="px-3 py-1" onClick={() => onEdit(category)}>
                    Edit
                  </Button>
                  <Button variant="danger" className="px-3 py-1" onClick={() => onDelete(category._id)}>
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
