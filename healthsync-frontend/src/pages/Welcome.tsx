import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, Button, Badge, Logo } from '../components/common';
import { 
  useHospitalsQuery, 
  useInventoryQuery, 
  useBedsQuery, 
  useDoctorsQuery, 
  useAlertsQuery,
  useRedistributionsQuery
} from '../hooks';
import { 
  ShieldAlert, Sparkles, Building2, BedDouble, 
  Users, Pill, Shuffle, ArrowRight, Sun, Calendar, Clock, Handshake, CheckCircle2
} from 'lucide-react';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, alerts } = useApp();
  const { data: hospitals = [] } = useHospitalsQuery();
  const { data: inventory = [] } = useInventoryQuery();
  const { data: beds = [] } = useBedsQuery();
  const { data: doctors = [] } = useDoctorsQuery();
  const { data: redistributions = [] } = useRedistributionsQuery();

  const [timeOfDay, setTimeOfDay] = useState('Day');
  const [dateTimeStr, setDateTimeStr] = useState('');

  useEffect(() => {
    document.title = "HealthSync AI | Welcome";
    const hr = new Date().getHours();
    if (hr < 12) setTimeOfDay('Morning');
    else if (hr < 17) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');

    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setDateTimeStr(new Date().toLocaleDateString(undefined, options));
  }, []);

  if (!currentUser) return null;

  const role = currentUser.role;

  // Handle CTA routing to role-specific dashboard
  const handleOpenDashboard = () => {
    if (role === 'SUPER_ADMIN') {
      navigate('/super-admin/dashboard');
    } else if (role === 'DISTRICT_ADMIN') {
      navigate('/district/dashboard');
    } else {
      navigate('/hospital/dashboard');
    }
  };

  // 1. Calculations for Super Admin Summary
  const activeAlerts = alerts.filter(a => !a.acknowledged).length;
  const totalBeds = hospitals.reduce((sum, h) => sum + h.bedsCount.total, 0);
  const occupiedBeds = hospitals.reduce((sum, h) => sum + h.bedsCount.occupied, 0);
  const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const lowStockCount = inventory.filter(item => item.stockLevel <= item.safetyStockThreshold).length;

  // 2. Calculations for District Admin Summary
  const pendingTransfers = redistributions.filter(r => r.status === 'Pending').length;
  const activeFacilityCount = hospitals.length;
  const criticalSupplyAlerts = alerts.filter(a => !a.acknowledged && a.category === 'Medicine').length;

  // 3. Calculations for Hospital Admin Summary
  const hospitalBeds = beds.filter(b => b.hospitalId === currentUser.facilityId);
  const availableHospBeds = hospitalBeds.filter(b => b.status === 'Available').length;
  const hospitalDoctors = doctors.filter(d => d.hospitalId === currentUser.facilityId);
  const activeDoctors = hospitalDoctors.filter(d => d.status === 'Active').length;
  const hospInventory = inventory.filter(i => i.hospitalId === currentUser.facilityId);
  const hospLowStock = hospInventory.filter(i => i.stockLevel <= i.safetyStockThreshold).length;

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-15">
        <div className="absolute -top-[10%] left-[20%] h-[450px] w-[450px] rounded-full bg-primary/25 blur-[100px]" />
        <div className="absolute -bottom-[10%] right-[20%] h-[450px] w-[450px] rounded-full bg-teal-500/20 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl space-y-6">
        {/* Greetings Section */}
        <div className="text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <Link 
                to="/" 
                className="flex items-center justify-center md:justify-start gap-2 mb-1.5 cursor-pointer hover:scale-[1.03] active:scale-95 transition-all duration-300 ease-in-out select-none"
                aria-label="Go to HealthSync AI Home"
              >
                <Logo size={32} className="transition-transform duration-300" />
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent transition-colors duration-300">
                  HealthSync AI
                </span>
              </Link>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary uppercase tracking-wider">
                <Sun className="h-3.5 w-3.5" /> Good {timeOfDay}, Officer
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Welcome back, {currentUser.name}!
              </h1>
            </div>
            
            <div className="flex flex-col md:items-end text-xs text-muted-foreground font-semibold bg-muted/40 border border-border/80 p-2.5 rounded-lg w-fit mx-auto md:mx-0">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>{dateTimeStr}</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wide mt-1 text-teal-600 dark:text-teal-400">
                System Context: {currentUser.facilityName || 'District HQ Office'}
              </span>
            </div>
          </div>
        </div>

        {/* Personalized Cards based on Authorization Roles */}
        <Card variant="acrylic" className="p-6 md:p-8 space-y-6 shadow-fluentXl border-primary/20">
          <div className="border-b border-border pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block leading-none">
                Role Context
              </span>
              <span className="text-sm font-bold text-foreground mt-1 block">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            <Badge variant={role === 'SUPER_ADMIN' ? 'destructive' : role === 'DISTRICT_ADMIN' ? 'info' : 'success'}>
              Authorization Level {role === 'SUPER_ADMIN' ? '01' : role === 'DISTRICT_ADMIN' ? '02' : '03'}
            </Badge>
          </div>

          {/* Role Summary Layouts */}
          {role === 'SUPER_ADMIN' && (
            <div className="space-y-6">
              <p className="text-xs text-muted-foreground leading-relaxed">
                As a **Super Admin**, you have global operational oversight. Below is the state health index telemetry summary compiled for today:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/50 border border-border/70 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">State Facilities</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{hospitals.length} Active</p>
                  <span className="text-[9px] text-muted-foreground block">Nodes synchronized</span>
                </div>

                <div className="bg-background/50 border border-border/70 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <BedDouble className="h-4 w-4 text-success" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Bed Capacity</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{bedOccupancyRate}% Occupied</p>
                  <span className="text-[9px] text-warning font-semibold block">{occupiedBeds}/{totalBeds} total beds</span>
                </div>

                <div className="bg-background/50 border border-border/70 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ShieldAlert className="h-4 w-4 text-destructive animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Critical Alerts</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{activeAlerts} Warning{activeAlerts !== 1 && 's'}</p>
                  <span className="text-[9px] text-destructive font-semibold block">Requires attention</span>
                </div>
              </div>

              {/* Quick Advisory Panel */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 flex gap-3 text-xs leading-normal">
                <Sparkles className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-foreground">AI Intelligence Advisory:</strong>
                  <p className="text-muted-foreground mt-0.5">
                    State supply chains are at <strong>92% efficiency</strong>. There are {lowStockCount} localized medication stockouts predicted within 7 days. Log into the console to audit reallocation transfers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {role === 'DISTRICT_ADMIN' && (
            <div className="space-y-6">
              <p className="text-xs text-muted-foreground leading-relaxed">
                As a **District Admin**, you manage local center clusters. Below is your aggregated regional audit:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/50 border border-border/70 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Shuffle className="h-4 w-4 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Pending Transfers</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{pendingTransfers} Requests</p>
                  <span className="text-[9px] text-muted-foreground block">Requires approval</span>
                </div>

                <div className="bg-background/50 border border-border/70 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="h-4 w-4 text-teal-500" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Region Hubs</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{activeFacilityCount} CHCs / PHCs</p>
                  <span className="text-[9px] text-muted-foreground block">Active sandboxes</span>
                </div>

                <div className="bg-background/50 border border-border/70 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ShieldAlert className="h-4 w-4 text-rose-500" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Supply Deficits</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{criticalSupplyAlerts} Alerts</p>
                  <span className="text-[9px] text-rose-600 font-semibold block">Under safety threshold</span>
                </div>
              </div>

              <div className="rounded-lg bg-teal-500/5 border border-teal-500/20 p-4 flex gap-3 text-xs leading-normal">
                <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-foreground">District Coordinator Action Points:</strong>
                  <p className="text-muted-foreground mt-0.5">
                    District Central reports a performance score of <strong>84%</strong>. Bed strain is stable. A medicine transfer suggestion is queued for Paracetamol.
                  </p>
                </div>
              </div>
            </div>
          )}

          {role === 'HOSPITAL_ADMIN' && (
            <div className="space-y-6">
              <p className="text-xs text-muted-foreground leading-relaxed">
                As a **Hospital Admin**, you oversee the operations, rosters, and pharmacy ledgers of **{currentUser.facilityName}**:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background/50 border border-border/70 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <BedDouble className="h-4 w-4 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Ward Beds</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{availableHospBeds} Free</p>
                  <span className="text-[9px] text-muted-foreground block">Out of {hospitalBeds.length} ward slots</span>
                </div>

                <div className="bg-background/50 border border-border/70 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4 text-success" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Staffing On-Duty</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{activeDoctors} Active</p>
                  <span className="text-[9px] text-muted-foreground block">{hospitalDoctors.length} doctors total rostered</span>
                </div>

                <div className="bg-background/50 border border-border/70 p-4 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Pill className="h-4 w-4 text-warning" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Deficit Items</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{hospLowStock} Items</p>
                  <span className="text-[9px] text-destructive font-semibold block">Below warning threshold</span>
                </div>
              </div>

              <div className="rounded-lg bg-success/5 border border-success/20 p-4 flex gap-3 text-xs leading-normal">
                <Handshake className="h-4.5 w-4.5 text-success shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-foreground">Local Facility Message:</strong>
                  <p className="text-muted-foreground mt-0.5">
                    Your facility sync logs are up-to-date. Roster shifts are fully configured.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Open Console Call-To-Action */}
          <div className="pt-4 border-t border-border flex justify-end">
            <Button
              onClick={handleOpenDashboard}
              className="flex items-center gap-2 font-bold shadow-md hover:fluent-shadow-lg active:scale-95 py-3 px-6 text-xs uppercase tracking-wider"
            >
              Open Command Center <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Welcome;
