import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppLayout() {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[18rem_1fr]">
      <Sidebar />
      <main className="p-4 md:p-6">
        <TopBar />
        <Outlet />
      </main>
    </div>
  );
}
