import { NavLink } from 'react-router-dom';
import { Home, Users, ShieldCheck, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from './ui/Button';

const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`;

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-background flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Home className="text-primary" />
          <span>SmartHome</span>
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <NavLink to="/users" className={navLinkClasses}>
          <Users className="mr-3 h-5 w-5" />
          User Management
        </NavLink>
        <NavLink to="/access-management" className={navLinkClasses}>
          <ShieldCheck className="mr-3 h-5 w-5" />
          Access Management
        </NavLink>
        {/* Add other navigation links here */}
      </nav>
      <div className="p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start" onClick={logout}>
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
