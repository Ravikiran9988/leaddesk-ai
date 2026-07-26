import { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const AdminLoginPage = () => {
  const { user, loading, login } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) {
    const from = location.state?.from || '/admin';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Admin Portal
          </p>
          <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Sign in to manage leads
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Use seeded admin account (`admin@aileaddesk.com` / `Password123@`) to sign in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-300">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" loading={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs">
          <Link to="/" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
            Return to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
