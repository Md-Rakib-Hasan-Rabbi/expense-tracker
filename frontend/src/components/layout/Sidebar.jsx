import { NavLink } from 'react-router-dom';
import { useAppState } from '../../context/useAppState';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/categories', label: 'Categories' },
  { to: '/accounts', label: 'Accounts' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppState();

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-30 flex h-screen w-72 flex-col border-r border-slate-700 bg-slate-950/95 p-4 backdrop-blur-md transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="gradient-frame rounded-2xl p-px">
          <div className="rounded-2xl bg-slate-950 p-4">
            <h2 className="text-lg font-bold text-slate-100">Expense Tracker</h2>
            <p className="text-xs text-slate-400">Personal Finance Command Center</p>
          </div>
        </div>

        <nav className="scrollbar-thin mt-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-200'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {sidebarOpen ? (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-950/60 md:hidden"
          aria-label="Close sidebar"
        />
      ) : null}
    </>
  );
}
