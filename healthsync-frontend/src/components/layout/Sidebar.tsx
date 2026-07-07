import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils';
import { 
  LayoutDashboard, 
  Activity, 
  ShieldAlert, 
  FileText, 
  Settings, 
  User, 
  Pill, 
  BedDouble, 
  Users, 
  TrendingUp, 
  FlaskConical, 
  Shuffle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Hospital
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const role = currentUser.role;

  // Base navigation links
  const commonLinks = [
    { to: '/forecast', label: 'AI Operations Forecast', icon: TrendingUp },
    { to: '/alerts', label: 'Alerts Hub', icon: ShieldAlert, badge: true },
    { to: '/reports', label: 'Reports & Analytics', icon: FileText },
  ];

  const adminLinks = {
    SUPER_ADMIN: [
      { to: '/dashboard/super', label: 'Super Admin HQ', icon: LayoutDashboard },
      { to: '/redistribution', label: 'AI Supply Reallocation', icon: Shuffle },
      { to: '/inventory', label: 'Supply Ledger', icon: Pill },
    ],
    DISTRICT_ADMIN: [
      { to: '/dashboard/district', label: 'District Operations', icon: LayoutDashboard },
      { to: '/redistribution', label: 'Inter-Facility Transfer', icon: Shuffle },
      { to: '/inventory', label: 'District Stocks', icon: Pill },
    ],
    HOSPITAL_ADMIN: [
      { to: '/dashboard/hospital', label: 'Hospital Command', icon: LayoutDashboard },
      { to: '/inventory', label: 'Pharmacy Stock', icon: Pill },
      { to: '/beds', label: 'Beds Allocation', icon: BedDouble },
      { to: '/doctors', label: 'Staff Roster', icon: Users },
      { to: '/laboratory', label: 'Lab Diagnostics', icon: FlaskConical },
    ],
  };

  const currentRoleLinks = adminLinks[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'relative z-20 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out shadow-fluentSm',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Brand Section */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4 transition-colors duration-300 ease-in-out">
        <div className="flex items-center overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-active text-white transition-colors duration-300 ease-in-out">
            <Activity className="h-4.5 w-4.5" />
          </div>
          <span className={cn(
            "text-sm font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent transition-all duration-300 ease-in-out whitespace-nowrap",
            isOpen ? "opacity-100 max-w-[150px] ml-2.5" : "opacity-0 max-w-0 overflow-hidden ml-0 pointer-events-none"
          )}>
            HealthSync AI
          </span>
        </div>
        
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-4 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/80 shadow-fluentSm hover:text-sidebar-active hover:bg-sidebar-hover transition-all duration-300 ease-in-out active:scale-95"
        >
          {isOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Tenant Indicator */}
      {isOpen && (
        <div className="mx-4 mt-4 rounded-md bg-sidebar-hover/40 border border-sidebar-border p-2.5 transition-all duration-300 ease-in-out">
          <div className="flex items-center gap-2 text-xs">
            <Hospital className="h-3.5 w-3.5 text-sidebar-active transition-colors duration-300" />
            <div className="overflow-hidden">
              <p className="font-semibold text-sidebar-foreground leading-none truncate">
                {currentUser.facilityName || 'District HQ Office'}
              </p>
              <span className="text-[10px] text-sidebar-foreground/60 uppercase font-bold tracking-wider">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
        <div>
          <span className={cn(
            "block text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40 mb-2 px-1 transition-colors duration-300",
            !isOpen && "sr-only"
          )}>
            Core Dashboard
          </span>
          <div className="space-y-1">
            {currentRoleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out group relative',
                      isActive
                        ? 'bg-sidebar-active/15 text-sidebar-active font-semibold'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-sidebar-active" />
                      )}
                      <Icon className={cn('h-4 w-4 shrink-0 transition-all duration-300 group-hover:scale-105', isActive ? 'text-sidebar-active' : 'text-sidebar-foreground/65 group-hover:text-sidebar-foreground')} />
                      {isOpen && <span className="transition-colors duration-300">{link.label}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-sidebar-border/50 transition-colors duration-300">
          <span className={cn(
            "block text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40 mb-2 px-1 transition-colors duration-300",
            !isOpen && "sr-only"
          )}>
            Global Operations
          </span>
          <div className="space-y-1">
            {commonLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out group relative',
                      isActive
                        ? 'bg-sidebar-active/15 text-sidebar-active font-semibold'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-sidebar-active" />
                      )}
                      <Icon className={cn('h-4 w-4 shrink-0 transition-all duration-300 group-hover:scale-105', isActive ? 'text-sidebar-active' : 'text-sidebar-foreground/65 group-hover:text-sidebar-foreground')} />
                      {isOpen && <span className="flex-1 truncate transition-colors duration-300">{link.label}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer Section */}
      <div className="border-t border-sidebar-border p-3 space-y-1 transition-colors duration-300">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground',
              isActive && 'bg-sidebar-active/15 text-sidebar-active font-semibold'
            )}
        >
          <User className="h-4 w-4 shrink-0 transition-colors duration-300" />
          {isOpen && <span>My Profile</span>}
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground',
              isActive && 'bg-sidebar-active/15 text-sidebar-active font-semibold'
            )}
        >
          <Settings className="h-4 w-4 shrink-0 transition-colors duration-300" />
          {isOpen && <span>Settings</span>}
        </NavLink>
        
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-all duration-300 ease-in-out active:scale-95"
        >
          <LogOut className="h-4 w-4 shrink-0 transition-colors duration-300" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
