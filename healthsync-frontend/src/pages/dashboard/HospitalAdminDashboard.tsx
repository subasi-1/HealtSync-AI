import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Badge, Button, Table } from '../../components/common';
import { 
  useBedsQuery, 
  useDoctorsQuery, 
  useInventoryQuery, 
  useAlertsQuery,
  useLabTestsQuery
} from '../../hooks';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  BedDouble, 
  Users, 
  FlaskConical, 
  Pill, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HospitalAdminDashboard: React.FC = () => {
  useEffect(() => {
    document.title = "HealthSync AI | Dashboard";
  }, []);

  const { currentUser, activeHospitalId, hospitals, acknowledgeAlert } = useApp();
  const navigate = useNavigate();

  // Load facility specific data
  const currentHospital = hospitals.find(h => h.id === activeHospitalId) || hospitals[0];
  const { data: inventory = [] } = useInventoryQuery(activeHospitalId);
  const { data: beds = [] } = useBedsQuery(activeHospitalId);
  const { data: doctors = [] } = useDoctorsQuery(activeHospitalId);
  const { data: alerts = [] } = useAlertsQuery(activeHospitalId);
  const { data: labTests = [] } = useLabTestsQuery(activeHospitalId);

  // 1. Telemetry Calculations
  const bedsCount = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
  const bedRatio = bedsCount > 0 ? Math.round((occupiedBeds / bedsCount) * 100) : 0;

  const activeDocs = doctors.filter(d => d.status === 'Active').length;
  const totalDocs = doctors.length;

  const lowStockCount = inventory.filter(i => i.stockLevel <= i.safetyStockThreshold).length;
  const pendingLabs = labTests.filter(t => t.status !== 'Completed').length;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  // 2. Department loads chart data
  const departmentLoad = [
    { name: 'Emergency', value: beds.filter(b => b.wardType === 'Emergency' && b.status === 'Occupied').length + 12, color: '#ef4444' },
    { name: 'ICU', value: beds.filter(b => b.wardType === 'ICU' && b.status === 'Occupied').length, color: '#3b82f6' },
    { name: 'General', value: beds.filter(b => b.wardType === 'General' && b.status === 'Occupied').length + 35, color: '#f59e0b' },
    { name: 'Pediatric', value: beds.filter(b => b.wardType === 'Pediatric' && b.status === 'Occupied').length + 8, color: '#10b981' }
  ];

  // 3. Stock forecast countdown
  const stockExpiryLevels = inventory.slice(0, 4).map(i => ({
    name: i.name.split(' ')[0],
    Stock: i.stockLevel,
    Forecast: i.demandForecastNextMonth
  }));

  const handleAcknowledge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    acknowledgeAlert(id);
  };

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Hospital Command Center
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
            Real-Time Node telemetry • {currentHospital.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/beds')}
            className="h-9 gap-1 text-xs font-semibold"
          >
            Manage Beds Grid <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Bed occupancy */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
            <BedDouble className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Bed Occupancy
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{bedRatio}%</p>
            <span className="text-[10px] text-warning font-semibold leading-none">
              {occupiedBeds}/{bedsCount} active beds occupied
            </span>
          </div>
        </Card>

        {/* KPI 2: Checked-in staff */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-success/10 text-success">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Shift Operations
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{activeDocs}/{totalDocs}</p>
            <span className="text-[10px] text-muted-foreground font-medium leading-none">
              Active medical staff checked-in
            </span>
          </div>
        </Card>

        {/* KPI 3: Reagents & Out-of-Stock */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-warning/10 text-warning">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Critical Stocks
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{lowStockCount}</p>
            <span className="text-[10px] text-destructive font-semibold leading-none">
              Items under safety threshold
            </span>
          </div>
        </Card>

        {/* KPI 4: Pending lab results */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-info/10 text-info">
            <FlaskConical className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Lab Pipeline
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{pendingLabs}</p>
            <span className="text-[10px] text-muted-foreground font-medium leading-none">
              Pending diagnostic releases
            </span>
          </div>
        </Card>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left & Middle columns: charts & reports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department breakdown pie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Facility Census
                </span>
                <h3 className="text-xs font-bold text-foreground mt-0.5">
                  Admissions Load by Ward Type
                </h3>
              </div>
              <div className="h-[180px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentLoad}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {departmentLoad.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center text-[10px] font-semibold text-muted-foreground">
                {departmentLoad.map((entry) => (
                  <span key={entry.name} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name}: {entry.value}
                  </span>
                ))}
              </div>
            </Card>

            {/* Reagents & Medicine stocks comparisons */}
            <Card className="p-4">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  AI Supply Chain Forecast
                </span>
                <h3 className="text-xs font-bold text-foreground mt-0.5">
                  Current Stock vs Recommended Forecast
                </h3>
              </div>
              <div className="h-[200px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockExpiryLevels} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.06)" />
                    <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                    <YAxis tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                    <Legend wrapperStyle={{ fontSize: '9px' }} />
                    <Bar name="In-Stock" dataKey="Stock" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    <Bar name="Recommended" dataKey="Forecast" fill="#a855f7" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Diagnostic releases in progress */}
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Laboratory Ledger
                </span>
                <h3 className="text-sm font-bold text-foreground mt-0.5">
                  Active Clinical Diagnostics Pipeline
                </h3>
              </div>
              <Badge variant="info">{pendingLabs} Pending Tests</Badge>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Order</th>
                    <th className="py-2.5 px-3">Requested At</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Reagent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {labTests.slice(0, 4).map((test) => (
                    <tr key={test.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground">{test.patientName}</td>
                      <td className="py-3 px-3 font-medium text-foreground/80">{test.testType}</td>
                      <td className="py-3 px-3 text-muted-foreground">{test.requestedAt}</td>
                      <td className="py-3 px-3">
                        <Badge variant={test.status === 'Completed' ? 'success' : test.status === 'In-Progress' ? 'warning' : 'default'}>
                          {test.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={test.reagentLevelStatus === 'Critical' ? 'destructive' : test.reagentLevelStatus === 'Low' ? 'warning' : 'outline'}>
                          {test.reagentLevelStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right column: Facility Alerts Acknowledgement */}
        <div className="space-y-6">
          <Card className="p-4 flex flex-col h-full min-h-[400px]">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Safety Alerts Center
              </span>
              <h3 className="text-xs font-bold text-foreground mt-0.5">
                Active Node Warnings & Incidents
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {unacknowledgedAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <CheckCircle className="h-10 w-10 text-success mb-2" />
                  <p className="text-xs font-bold text-foreground/80">Systems Secure</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">No unresolved incident alerts.</p>
                </div>
              ) : (
                unacknowledgedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded border border-border/80 bg-card p-3 flex flex-col gap-2 transition-all hover:border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant={alert.type === 'Critical' ? 'destructive' : 'warning'} className="text-[8px] scale-90 -translate-x-1">
                        {alert.type}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground">{alert.timestamp}</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground/80 leading-tight">
                      {alert.message}
                    </p>
                    <div className="flex justify-end pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleAcknowledge(alert.id, e)}
                        className="h-7 px-2.5 text-[10px] font-bold text-primary hover:bg-primary/10"
                      >
                        Dismiss Alert
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
