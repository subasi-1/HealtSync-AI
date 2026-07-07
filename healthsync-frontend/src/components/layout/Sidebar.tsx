import React, { useState } from 'react';
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
        'relative z-20 flex flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 shadow-fluentSm',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Brand Section */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="h-4.5 w-4.5" />
          </div>
          {isOpen && (
            <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              HealthSync AI
            </span>
          )}
        </div>
        
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-4 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-fluentSm hover:text-foreground active:scale-95"
        >
          {isOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Tenant Indicator */}
      {isOpen && (
        <div className="mx-4 mt-4 rounded-md bg-muted/30 border border-border/50 p-2.5">
          <div className="flex items-center gap-2 text-xs">
            <Hospital className="h-3.5 w-3.5 text-primary" />
            <div className="overflow-hidden">
              <p className="font-semibold text-foreground/80 leading-none truncate">
                {currentUser.facilityName || 'District HQ Office'}
              </p>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
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
            "block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2 px-1",
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
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all group relative',
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-primary" />
                      )}
                      <Icon className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-105', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                      {isOpen && <span>{link.label}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <span className={cn(
            "block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2 px-1",
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
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all group relative',
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-primary" />
                      )}
                      <Icon className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-105', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                      {isOpen && <span className="flex-1 truncate">{link.label}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer Section */}
      <div className="border-t border-border p-3 space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all text-muted-foreground hover:bg-muted/40 hover:text-foreground',
              isActive && 'bg-primary/10 text-primary font-semibold'
            )}
        >
          <User className="h-4 w-4 shrink-0" />
          {isOpen && <span>My Profile</span>}
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all text-muted-foreground hover:bg-muted/40 hover:text-foreground',
              isActive && 'bg-primary/10 text-primary font-semibold'
            )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {isOpen && <span>Settings</span>}
        </NavLink>
        
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all active:scale-95"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
