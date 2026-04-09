import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/useAuth';
import { getApiErrorMessage } from '../utils/apiError';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Manage your personal finances securely"
      footerText="New here?"
      footerLinkText="Create account"
      footerLinkTo="/register"
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />
        <Input
          label="Password"
          type="password"
          required
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
        />

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <Link to="/" className="block text-center text-xs text-slate-500 hover:text-slate-300">
        Back to app
      </Link>
    </AuthLayout>
  );
}
