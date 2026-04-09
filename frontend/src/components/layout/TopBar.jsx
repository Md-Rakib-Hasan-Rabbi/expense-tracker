import { useAuth } from '../../context/useAuth';
import { useAppState } from '../../context/useAppState';
import { Button } from '../common/Button';

export function TopBar() {
  const { user, logout } = useAuth();
  const { setSidebarOpen } = useAppState();

  return (
    <header className="sticky top-0 z-10 mb-5 flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/80 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-200 md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          Menu
        </button>
        <div>
          <p className="text-xs text-slate-400">Welcome back</p>
          <p className="text-sm font-semibold text-slate-100">{user?.name || 'User'}</p>
        </div>
      </div>

      <Button variant="ghost" onClick={logout}>
        Logout
      </Button>
    </header>
  );
}
