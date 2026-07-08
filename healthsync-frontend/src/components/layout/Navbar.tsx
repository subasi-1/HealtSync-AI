import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ThemeToggle, Badge, Button, Modal, Logo } from '../common';
import { 
  Bell, 
  MessageSquareCode, 
  Search, 
  Menu, 
  User, 
  LogOut, 
  Sparkles,
  ShieldCheck,
  Command,
  Heart,
  Pill,
  Users,
  BedDouble,
  Building2
} from 'lucide-react';
import { cn } from '../../utils';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { 
    currentUser, 
    alerts, 
    acknowledgeAlert, 
    isChatOpen, 
    setChatOpen, 
    logout, 
    addToast,
    inventory,
    doctors,
    beds,
    patients
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const activeAlerts = alerts.filter(a => !a.acknowledged);

  const getDashboardRoute = () => {
    if (!currentUser) return '/';
    if (currentUser.role === 'SUPER_ADMIN') return '/super-admin/dashboard';
    if (currentUser.role === 'DISTRICT_ADMIN') return '/district/dashboard';
    return '/hospital/dashboard';
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    
    // Add command+k keyboard shortcut for search portal (Accessibility & Power User)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleAcknowledgeAlert = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    acknowledgeAlert(id);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResultClick = (targetPath: string, message: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(targetPath);
    addToast(message, 'info');
  };

  // Global Search Filtering logic
  const queryLower = searchQuery.toLowerCase().trim();
  
  const searchResults = {
    medicines: queryLower ? inventory.filter(m => m.name.toLowerCase().includes(queryLower)).slice(0, 3) : [],
    patients: queryLower ? patients.filter(p => p.name.toLowerCase().includes(queryLower)).slice(0, 3) : [],
    doctors: queryLower ? doctors.filter(d => d.name.toLowerCase().includes(queryLower)).slice(0, 3) : [],
    beds: queryLower ? beds.filter(b => b.roomNumber.toLowerCase().includes(queryLower) || b.wardType.toLowerCase().includes(queryLower)).slice(0, 3) : []
  };

  const hasResults = 
    searchResults.medicines.length > 0 ||
    searchResults.patients.length > 0 ||
    searchResults.doctors.length > 0 ||
    searchResults.beds.length > 0;

  return (
    <header className="sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b border-border bg-card/85 backdrop-blur-md px-4 shadow-fluentSm">
      {/* Left side: Hamburger & Navigation breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/40 hover:text-foreground active:scale-95 md:hidden"
          aria-label="Toggle Navigation Sidebar Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Navbar brand & Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 cursor-pointer hover:scale-[1.03] active:scale-95 transition-all duration-300 ease-in-out select-none"
          aria-label="Go to HealthSync AI Home"
        >
          <Logo size={22} className="transition-transform duration-300" />
          <span className="text-sm font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent transition-colors duration-300">
            HealthSync AI
          </span>
        </Link>
        <span className="hidden md:inline text-muted-foreground text-xs font-normal select-none">|</span>

        {/* Dynamic Context Header */}
        <div className="hidden items-center gap-1.5 text-sm md:flex select-none">
          <span className="text-muted-foreground capitalize">
            {currentUser?.role.toLowerCase().replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Right side: Operations controls */}
      <div className="flex items-center gap-2">
        {/* AI Assistant Quick Toggle */}
        <Button
          variant={isChatOpen ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setChatOpen(!isChatOpen)}
          className="h-9 px-3 gap-1.5 hover:fluent-shadow-md text-xs font-semibold"
          aria-label="Open AI Operations Chat Assistant"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">AI Operations Chat</span>
        </Button>

        {/* Global Command-K Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="relative flex items-center justify-between h-9 w-48 border border-border bg-muted/20 hover:bg-muted/30 rounded-md pl-3 pr-2 text-[11px] text-muted-foreground transition-all duration-150 active:scale-98 select-none lg:w-56 xl:w-64"
          aria-label="Open global databases search portal"
          title="Press Ctrl+K to query"
        >
          <span className="flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" />
            <span>Search databases...</span>
          </span>
          <kbd className="hidden lg:flex h-5 items-center gap-0.5 rounded border border-border bg-muted/65 px-1 font-mono text-[9px] font-bold text-muted-foreground">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Alert Notifications Center */}
        <div className="relative" ref={notificationRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
            title="System alerts ledger"
            aria-label="View Active Alerts Center notifications"
          >
            <Bell className="h-5 w-5" />
            {activeAlerts.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {activeAlerts.length}
              </span>
            )}
          </Button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border bg-card shadow-fluentLg p-1 z-30 animate-fade-in max-h-[400px] flex flex-col">
              <div className="flex items-center justify-between border-b border-border px-3.5 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  System Alerts ({activeAlerts.length})
                </span>
                {activeAlerts.length > 0 && (
                  <button
                    onClick={() => { setShowNotifications(false); navigate('/alerts'); }}
                    className="text-[10px] font-semibold text-primary hover:underline"
                  >
                    View All
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto py-1 divide-y divide-border/60">
                {activeAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                    <ShieldCheck className="h-8 w-8 text-success mb-1" />
                    <p className="text-xs font-semibold text-foreground/80">All systems secure</p>
                    <p className="text-[10px] text-muted-foreground">No active operation alerts</p>
                  </div>
                ) : (
                  activeAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/alerts');
                      }}
                      className="flex flex-col items-start gap-1 p-3 hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <div className="flex w-full items-center justify-between">
                        <Badge
                          variant={
                            alert.type === 'Critical' ? 'destructive' : 'warning'
                          }
                          className="text-[9px] scale-90 -translate-x-1"
                        >
                          {alert.type}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground">{alert.timestamp}</span>
                      </div>
                      <p className="text-xs font-medium text-foreground/90 line-clamp-2 leading-tight">
                        {alert.message}
                      </p>
                      <div className="mt-1 flex w-full justify-between items-center text-[10px] text-muted-foreground">
                        <span className="truncate max-w-[140px]">{alert.targetFacilityName}</span>
                        <button
                          onClick={(e) => handleAcknowledgeAlert(alert.id, e)}
                          className="text-primary font-semibold hover:underline"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Controls Dropdown */}
        <div className="relative border-l border-border/80 pl-2 ml-1" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 hover:opacity-90 active:scale-[0.98]"
            aria-label="Open User Profile Panel"
          >
            <img
              src={currentUser?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin'}
              alt="Profile"
              className="h-8 w-8 rounded-full border border-border bg-muted object-cover"
            />
            <div className="hidden flex-col items-start text-left xl:flex">
              <span className="text-xs font-semibold text-foreground/90 max-w-[120px] truncate leading-none">
                {currentUser?.name}
              </span>
              <span className="text-[10px] text-muted-foreground leading-none mt-0.5 capitalize">
                {currentUser?.role.toLowerCase().replace('_', ' ')}
              </span>
            </div>
          </button>

          {/* Profile Dropdown Panel */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-card shadow-fluentLg p-1 z-30 animate-fade-in">
              <div className="px-3.5 py-2 border-b border-border text-xs">
                <p className="font-semibold text-foreground truncate">{currentUser?.name}</p>
                <p className="text-muted-foreground truncate">{currentUser?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfile(false);
                    navigate('/profile');
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-destructive" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Command Overlay Modal */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Global Clinical Database Search"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type medicine name, patient name, doctor specialty..."
              className="h-10 w-full rounded-md border border-input bg-muted/20 pl-9 pr-3 text-xs focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring font-semibold text-foreground"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1 divide-y divide-border/40 select-none">
            {!searchQuery && (
              <p className="text-xs text-muted-foreground text-center py-6 font-medium leading-normal">
                Begin typing to scan drug inventory batches, clinical TIMELINE records, shift rosters, and bed counts.
              </p>
            )}

            {searchQuery && !hasResults && (
              <p className="text-xs text-muted-foreground text-center py-6 font-semibold">
                No matching telemetry records found.
              </p>
            )}

            {/* Medicines matched */}
            {searchResults.medicines.length > 0 && (
              <div className="pt-2.5 first:pt-0">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                  Medicine Inventory
                </span>
                <div className="space-y-1">
                  {searchResults.medicines.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleResultClick('/inventory', `Viewing stock details for ${item.name}`)}
                      className="flex w-full items-center justify-between rounded p-2 text-left hover:bg-primary/5 text-xs text-foreground font-semibold"
                    >
                      <span className="flex items-center gap-1.5">
                        <Pill className="h-3.5 w-3.5 text-primary" /> {item.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Qty: {item.stockLevel} • Batch: {item.batchNumber}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Patients matched */}
            {searchResults.patients.length > 0 && (
              <div className="pt-2.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                  Registered Patients
                </span>
                <div className="space-y-1">
                  {searchResults.patients.map((pat) => (
                    <button
                      key={pat.id}
                      onClick={() => handleResultClick('/patients', `Viewing clinical record for ${pat.name}`)}
                      className="flex w-full items-center justify-between rounded p-2 text-left hover:bg-primary/5 text-xs text-foreground font-semibold"
                    >
                      <span className="flex items-center gap-1.5">
                        <Heart className="h-3.5 w-3.5 text-primary" /> {pat.name} ({pat.status})
                      </span>
                      <span className="text-[10px] text-muted-foreground">Age: {pat.age} • Triage: {pat.condition}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Doctors matched */}
            {searchResults.doctors.length > 0 && (
              <div className="pt-2.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                  Shift Doctors Directory
                </span>
                <div className="space-y-1">
                  {searchResults.doctors.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleResultClick('/doctors', `Viewing availability for ${doc.name}`)}
                      className="flex w-full items-center justify-between rounded p-2 text-left hover:bg-primary/5 text-xs text-foreground font-semibold"
                    >
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" /> {doc.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{doc.specialty} • Roster: {doc.status}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Beds matched */}
            {searchResults.beds.length > 0 && (
              <div className="pt-2.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                  Observed Beds Census
                </span>
                <div className="space-y-1">
                  {searchResults.beds.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleResultClick('/beds', `Viewing occupancy layout for Bed ${b.roomNumber}`)}
                      className="flex w-full items-center justify-between rounded p-2 text-left hover:bg-primary/5 text-xs text-foreground font-semibold"
                    >
                      <span className="flex items-center gap-1.5">
                        <BedDouble className="h-3.5 w-3.5 text-primary" /> Room: {b.roomNumber} ({b.wardType})
                      </span>
                      <span className="text-[10px] text-muted-foreground">{b.status} {b.patientName ? `• ${b.patientName}` : ''}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </header>
  );
};
export default Navbar;
