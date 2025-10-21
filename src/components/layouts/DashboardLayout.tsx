import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
