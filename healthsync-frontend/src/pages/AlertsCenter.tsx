import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Badge, Button, Table, Input } from '../components/common';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  RefreshCw,
  Sparkles,
  Play,
  Settings,
  BellRing
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export const AlertsCenter: React.FC = () => {
  const { alerts, acknowledgeAlert, triggerMockSync, addToast } = useApp();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Config threshold states
  const [stockThreshold, setStockThreshold] = useState(5);
  const [bedThreshold, setBedThreshold] = useState(90);
  const [doctorThreshold, setDoctorThreshold] = useState(2);

  const activeAlerts = alerts.filter(a => {
    const matchesType = filterType === 'ALL' || a.type === filterType;
    const matchesCat = filterCategory === 'ALL' || a.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesType && matchesCat;
  });

  const handleAcknowledge = (id: string) => {
    acknowledgeAlert(id);
  };

  const handleTriggerSync = () => {
    triggerMockSync();
    addToast('Simulated real-time WebSocket sync packet injected', 'info');
  };

  const handleSaveConfig = () => {
    addToast('Incident warning thresholds re-calibrated successfully', 'success');
  };

  // Calculate count metrics for chart
  const categories = ['Bed', 'Medicine', 'Staff', 'Epidemic', 'Lab'];
  const chartData = categories.map(cat => ({
    category: cat,
    Critical: alerts.filter(a => a.category === cat && a.type === 'Critical' && !a.acknowledged).length,
    Warning: alerts.filter(a => a.category === cat && a.type === 'Warning' && !a.acknowledged).length
  }));

  const columns = [
    {
      header: 'Severity',
      accessor: (row: typeof alerts[0]) => (
        <Badge variant={row.type === 'Critical' ? 'destructive' : row.type === 'Warning' ? 'warning' : 'info'}>
          {row.type}
        </Badge>
      )
    },
    {
      header: 'Incident Alert Message',
      accessor: (row: typeof alerts[0]) => (
        <span className={`font-semibold text-xs ${row.acknowledged ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
          {row.message}
        </span>
      )
    },
    {
      header: 'Sector Category',
      accessor: (row: typeof alerts[0]) => (
        <Badge variant="outline" className="uppercase text-[9px] font-bold">
          {row.category}
        </Badge>
      )
    },
    {
      header: 'Target Facility',
      accessor: (row: typeof alerts[0]) => (
        <span className="text-xs text-foreground/80 font-medium truncate max-w-[150px] block">
          {row.targetFacilityName}
        </span>
      )
    },
    {
      header: 'Dispatched Stamp',
      accessor: (row: typeof alerts[0]) => (
        <span className="text-xs text-muted-foreground">
          {row.timestamp}
        </span>
      )
    },
    {
      header: 'Registry Status',
      accessor: (row: typeof alerts[0]) => (
        <Badge variant={row.acknowledged ? 'success' : 'outline'}>
          {row.acknowledged ? 'Acknowledged' : 'Active Alarm'}
        </Badge>
      )
    },
    {
      header: 'Actions Ledger',
      accessor: (row: typeof alerts[0]) => (
        <div className="flex gap-2">
          {!row.acknowledged && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAcknowledge(row.id)}
              className="h-8 text-xs font-semibold text-primary border-primary/35 hover:bg-primary/5"
            >
              Acknowledge
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Operations & Incidents Center
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
            Active warnings, clinical alarms, and real-time state synchronization
          </p>
        </div>
        
        {/* Real-time simulation trigger */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleTriggerSync}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold border-primary/35 text-primary hover:bg-primary/5 shadow-sm active:scale-95"
            title="Inject simulated patient/stock updates into operational grids"
          >
            <Play className="h-3.5 w-3.5 fill-primary" /> Inject Simulated Alarms
          </Button>
        </div>
      </div>

      {/* Triage buttons & KPI grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Filter Widget */}
        <Card variant="acrylic" className="p-3.5 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-2">
            Filter Triage Class
          </span>
          <div className="space-y-1">
            {['ALL', 'Critical', 'Warning', 'Info'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  filterType === type 
                    ? "bg-primary/10 text-primary font-bold" 
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <span>{type === 'ALL' ? 'Show All' : type}</span>
                <Badge variant={type === 'Critical' ? 'destructive' : type === 'Warning' ? 'warning' : type === 'Info' ? 'info' : 'outline'}>
                  {type === 'ALL' ? alerts.length : alerts.filter(a => a.type === type).length}
                </Badge>
              </button>
            ))}
          </div>
        </Card>

        {/* Counter cards (3 cards) */}
        <div className="md:col-span-3 grid grid-cols-3 gap-4">
          <Card className="p-4 flex flex-col justify-between border-destructive/25 bg-destructive/[0.01]">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Critical Outages
            </span>
            <p className="text-3xl font-extrabold text-foreground mt-2">
              {alerts.filter(a => a.type === 'Critical' && !a.acknowledged).length}
            </p>
            <span className="text-[10px] text-destructive font-semibold mt-1">
              High danger thresholds breached
            </span>
          </Card>

          <Card className="p-4 flex flex-col justify-between border-warning/25 bg-warning/[0.01]">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              System Warnings
            </span>
            <p className="text-3xl font-extrabold text-foreground mt-2">
              {alerts.filter(a => a.type === 'Warning' && !a.acknowledged).length}
            </p>
            <span className="text-[10px] text-warning font-semibold mt-1">
              Safety buffers compromised
            </span>
          </Card>

          <Card className="p-4 flex flex-col justify-between border-success/25 bg-success/[0.01]">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Incidents Resolved
            </span>
            <p className="text-3xl font-extrabold text-foreground mt-2">
              {alerts.filter(a => a.acknowledged).length}
            </p>
            <span className="text-[10px] text-success font-semibold mt-1">
              Dismissed alarms cataloged
            </span>
          </Card>
        </div>
      </div>

      {/* Main layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Table with category tabs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Tabs */}
          <div className="flex gap-2 bg-muted/40 p-1.5 rounded-lg border border-border/80 w-fit">
            {['ALL', 'Bed', 'Medicine', 'Staff', 'Lab'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`rounded px-3 py-1.5 text-xs font-semibold transition-all ${
                  filterCategory === cat
                    ? 'bg-background text-foreground shadow-sm font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat === 'ALL' ? 'All Classes' : cat}
              </button>
            ))}
          </div>

          <Card className="p-4">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Incident logs
              </span>
              <h3 className="text-sm font-bold text-foreground mt-0.5">
                Central Operations Alert Ledger
              </h3>
            </div>

            <Table
              columns={columns}
              data={activeAlerts}
              emptyMessage="No incidents match the filter parameters."
            />
          </Card>
        </div>

        {/* Configuration thresholds card & Sector breakdown chart */}
        <div className="space-y-6">
          {/* Config card */}
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-primary animate-spin-slow" />
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Triage Tuning
                </span>
                <h3 className="text-xs font-bold text-foreground mt-0.5">
                  Incident Warning Thresholds
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Medicine Safety Buffer:</span>
                  <span className="text-foreground">{stockThreshold} Days</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={stockThreshold}
                  onChange={(e) => setStockThreshold(Number(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Bed Full Alarm:</span>
                  <span className="text-foreground">{bedThreshold}% Occupancy</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="98"
                  value={bedThreshold}
                  onChange={(e) => setBedThreshold(Number(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Standby Doctor Alarm:</span>
                  <span className="text-foreground">&lt; {doctorThreshold} back-ups</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={doctorThreshold}
                  onChange={(e) => setDoctorThreshold(Number(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveConfig}
                className="w-full font-bold h-8.5 mt-2"
              >
                Re-Calibrate Thresholds
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Alarms breakdown
              </span>
              <h3 className="text-xs font-bold text-foreground mt-0.5">
                Unresolved Alerts by Sector Category
              </h3>
            </div>

            <div className="h-[220px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.06)" />
                  <XAxis dataKey="category" tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                  <Legend wrapperStyle={{ fontSize: '9px' }} />
                  <Bar name="Criticals" dataKey="Critical" fill="#ef4444" radius={[2, 2, 0, 0]} />
                  <Bar name="Warnings" dataKey="Warning" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default AlertsCenter;
