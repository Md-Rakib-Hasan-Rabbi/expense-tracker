import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-3xl font-bold text-slate-100">Page not found</h1>
      <p className="text-sm text-slate-400">The route you requested does not exist.</p>
      <Link to="/dashboard" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">
        Go to dashboard
      </Link>
    </div>
  );
}
