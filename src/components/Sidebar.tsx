import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from './ui/Button';

const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const homeIdMatch = location.pathname.match(/\/homes\/([a-fA-F0-9-]+)/);
  const homeId = homeIdMatch ? homeIdMatch[1] : null;

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
          <LayoutDashboard className="text-primary" />
          <span>AuraHome</span>
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <NavLink to="/homes" className={navLinkClasses} end>
          <Home className="mr-3 h-5 w-5" />
          Home Management
        </NavLink>
        {homeId && (
           <div className="pl-5 border-l-2 border-border ml-5 space-y-2 py-2">
             <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Home</span>
             <NavLink to={`/homes/${homeId}`} className={navLinkClasses} end>
               <LayoutDashboard className="mr-3 h-5 w-5" />
               Dashboard
             </NavLink>
             {/* Future links for the current home can go here */}
           </div>
        )}
        <div className="pt-4 mt-4 border-t border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4">System Settings</span>
            <div className="mt-2 space-y-2">
                <NavLink to="/users" className={navLinkClasses}>
                <Users className="mr-3 h-5 w-5" />
                User Management
                </NavLink>
                <NavLink to="/access-management" className={navLinkClasses}>
                <ShieldCheck className="mr-3 h-5 w-5" />
                Access Management
                </NavLink>
            </div>
        </div>
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
