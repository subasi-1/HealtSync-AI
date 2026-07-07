import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils';
import { Card, Badge, Button, Table } from '../../components/common';
import { DistrictMap } from '../../components/district/DistrictMap';
import { 
  useHospitalsQuery, 
  useInventoryQuery, 
  useBedsQuery, 
  useDoctorsQuery, 
  useAlertsQuery 
} from '../../hooks';
import { 
  ShieldAlert, 
  Building2, 
  BedDouble, 
  Users, 
  Pill, 
  Sparkles, 
  Play, 
  Activity, 
  Radio, 
  TrendingUp, 
  AlertTriangle,
  Award,
  Truck
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export const GovernmentCommandCenter: React.FC = () => {
  const { alerts, acknowledgeAlert, triggerMockSync } = useApp();
  const { data: hospitals = [] } = useHospitalsQuery();
  const { data: inventory = [] } = useInventoryQuery();
  const { data: beds = [] } = useBedsQuery();
  const { data: doctors = [] } = useDoctorsQuery();

  const [viewMode, setViewMode] = useState<'incidents' | 'medicine' | 'beds' | 'staff' | 'patients' | 'cargo'>('incidents');
  const [websocketConnected, setWebsocketConnected] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('hosp-1');

  // 1. Simulate WebSocket interval stream when active
  useEffect(() => {
    if (!websocketConnected) return;

    const timer = setInterval(() => {
      // Simulate packet arriving over WebSocket lanes
      triggerMockSync();
    }, 6000);

    return () => clearInterval(timer);
  }, [websocketConnected]);

  // 2. Dynamic Performance Score Calculator
  const districtPerformanceData = hospitals.map(hosp => {
    // Bed availability %
    const bedAvail = hosp.bedsCount.total > 0 
      ? (hosp.bedsCount.available / hosp.bedsCount.total) * 100 
      : 0;

    // Stock safety % (items with stock > safety limit)
    const hospItems = inventory.filter(item => item.hospitalId === hosp.id);
    const safeStockCount = hospItems.filter(item => item.stockLevel > item.safetyStockThreshold).length;
    const stockSafe = hospItems.length > 0 
      ? (safeStockCount / hospItems.length) * 100 
      : 100;

    // Doctor Turnout %
    const staffTurnout = hosp.doctorCount.total > 0 
      ? (hosp.doctorCount.active / hosp.doctorCount.total) * 100 
      : 0;

    // Weighted Score Formula: BedAvail (30%) + StockSafe (40%) + StaffTurnout (30%)
    const rawScore = (bedAvail * 0.3) + (stockSafe * 0.4) + (staffTurnout * 0.3);
    const performanceScore = Math.round(rawScore);

    return {
      id: hosp.id,
      name: hosp.name,
      type: hosp.type,
      bedAvail: Math.round(bedAvail),
      stockSafe: Math.round(stockSafe),
      staffTurnout: Math.round(staffTurnout),
      score: performanceScore
    };
  });

  // Sort by score to compute rankings
  const rankedHospitals = [...districtPerformanceData].sort((a, b) => b.score - a.score);
  const ranksMap = rankedHospitals.reduce((acc: any, h, index) => {
    acc[h.id] = index + 1;
    return acc;
  }, {});

  const selectedNode = hospitals.find(h => h.id === selectedNodeId);

  // Chart data: daily aggregated patient admissions in district
  const admissionsData = [
    { day: 'Mon', Admissions: 185 },
    { day: 'Tue', Admissions: 250 },
    { day: 'Wed', Admissions: 220 },
    { day: 'Thu', Admissions: 310 },
    { day: 'Fri', Admissions: 312 },
    { day: 'Sat', Admissions: 165 },
    { day: 'Sun', Admissions: 122 }
  ];

  const scoreboardColumns = [
    {
      header: 'Rank',
      accessor: (row: typeof districtPerformanceData[0]) => (
        <span className="font-bold text-foreground">#{ranksMap[row.id]}</span>
      )
    },
    {
      header: 'PHC / CHC Node',
      accessor: (row: typeof districtPerformanceData[0]) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-[9px] text-muted-foreground uppercase">{row.type}</span>
        </div>
      )
    },
    {
      header: 'Score Index',
      accessor: (row: typeof districtPerformanceData[0]) => {
        const score = row.score;
        const color = score > 80 ? 'text-success' : score > 50 ? 'text-warning' : 'text-destructive';
        return (
          <span className={`font-extrabold text-sm ${color}`}>{score} / 100</span>
        );
      }
    },
    {
      header: 'Bed Avail',
      accessor: (row: typeof districtPerformanceData[0]) => (
        <span className="text-xs text-muted-foreground font-medium">{row.bedAvail}%</span>
      )
    },
    {
      header: 'Stock Safe',
      accessor: (row: typeof districtPerformanceData[0]) => (
        <span className="text-xs text-muted-foreground font-medium">{row.stockSafe}%</span>
      )
    },
    {
      header: 'Turnout',
      accessor: (row: typeof districtPerformanceData[0]) => (
        <span className="text-xs text-muted-foreground font-medium">{row.staffTurnout}%</span>
      )
    }
  ];

  // 3. Telemetry KPIs
  const totalNodesCount = hospitals.length;
  const criticalAlertsCount = alerts.filter(a => a.type === 'Critical' && !a.acknowledged).length;
  const totalBedsCount = beds.length;
  const occupiedBedsCount = beds.filter(b => b.status === 'Occupied').length;
  const districtBedsOccupancy = totalBedsCount > 0 
    ? Math.round((occupiedBedsCount / totalBedsCount) * 100) 
    : 0;

  const totalInv = inventory.length;
  const lowInv = inventory.filter(i => i.stockLevel <= i.safetyStockThreshold).length;
  const supplyDeficitRatio = totalInv > 0 ? Math.round((lowInv / totalInv) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Dynamic Command Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Government Operations Command Center
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
            Sovereign Command Console • District Telemetry HUD
          </p>
        </div>

        {/* WebSocket Controller Switch */}
        <div className="flex items-center gap-3 bg-muted/40 border border-border/80 p-2.5 rounded-lg h-10 select-none">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "h-2 w-2 rounded-full",
              websocketConnected ? "bg-success animate-pulse" : "bg-muted-foreground"
            )} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {websocketConnected ? 'WS link Streaming' : 'WS Link Offline'}
            </span>
          </div>
          <Button
            onClick={() => setWebsocketConnected(!websocketConnected)}
            variant={websocketConnected ? 'destructive' : 'primary'}
            size="sm"
            className="h-7 text-[10px] font-bold"
          >
            {websocketConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      </div>

      {/* Telemetry Card Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Monitored Nodes */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Monitored Nodes
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{totalNodesCount}</p>
            <span className="text-[10px] text-muted-foreground font-medium leading-none">
              Active CHC/PHC clinics
            </span>
          </div>
        </Card>

        {/* Incident Alerts */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-destructive/10 text-destructive animate-pulse">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Incidents Logged
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{criticalAlertsCount}</p>
            <span className="text-[10px] text-destructive font-semibold leading-none font-bold">
              Requires immediate resolve
            </span>
          </div>
        </Card>

        {/* Bed Strain */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-success/10 text-success">
            <BedDouble className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Aggregated Bed Strain
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{districtBedsOccupancy}%</p>
            <span className="text-[10px] text-warning font-semibold leading-none">
              {occupiedBedsCount}/{totalBedsCount} utilized
            </span>
          </div>
        </Card>

        {/* Outages */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-warning/10 text-warning">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Stock Deficit Index
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{supplyDeficitRatio}%</p>
            <span className="text-[10px] text-destructive font-semibold leading-none">
              {lowInv} items under thresholds
            </span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Leaflet Map and Map Layers HUD switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Layer HUD Switcher SidePanel */}
        <Card variant="acrylic" className="p-4 flex flex-col justify-between h-fit lg:col-span-1">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-3 block">
              Map Overlay Telemetry
            </span>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => setViewMode('incidents')}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 font-semibold transition-all border border-transparent",
                  viewMode === 'incidents' 
                    ? "bg-primary text-primary-foreground font-bold" 
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <ShieldAlert className="h-4 w-4" /> Incident Warn Pins
              </button>

              <button
                onClick={() => setViewMode('medicine')}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 font-semibold transition-all border border-transparent",
                  viewMode === 'medicine' 
                    ? "bg-primary text-primary-foreground font-bold" 
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <Pill className="h-4 w-4" /> Medicine Deficit Heat
              </button>

              <button
                onClick={() => setViewMode('beds')}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 font-semibold transition-all border border-transparent",
                  viewMode === 'beds' 
                    ? "bg-primary text-primary-foreground font-bold" 
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <BedDouble className="h-4 w-4" /> Bed Strain Heat
              </button>

              <button
                onClick={() => setViewMode('staff')}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 font-semibold transition-all border border-transparent",
                  viewMode === 'staff' 
                    ? "bg-primary text-primary-foreground font-bold" 
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <Users className="h-4 w-4" /> Doctor Attendance Map
              </button>

              <button
                onClick={() => setViewMode('patients')}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 font-semibold transition-all border border-transparent",
                  viewMode === 'patients' 
                    ? "bg-primary text-primary-foreground font-bold" 
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <Activity className="h-4 w-4" /> Patient Traffic Density
              </button>

              <button
                onClick={() => setViewMode('cargo')}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 font-semibold transition-all border border-transparent",
                  viewMode === 'cargo' 
                    ? "bg-primary text-primary-foreground font-bold" 
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <Truck className="h-4 w-4" /> Cargo Transit Lanes
              </button>
            </div>
          </div>
          
          <div className="border-t border-border/80 pt-4 mt-4 text-[10px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <Radio className="h-4 w-4 text-primary shrink-0 animate-pulse" />
            <span>
              Real-time map updates automatically every 6s on simulated WebSocket ticks.
            </span>
          </div>
        </Card>

        {/* Leaflet Map Port Container */}
        <div className="lg:col-span-3 h-[400px]">
          <DistrictMap viewMode={viewMode} />
        </div>
      </div>

      {/* Performance Scoreboard & AI Executive Summary Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District score ranking Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Telemetry Ledger
                </span>
                <h3 className="text-sm font-bold text-foreground mt-0.5">
                  District Nodes Roster & Performance Scoreboard
                </h3>
              </div>
              <Badge variant="default" className="gap-1 font-semibold">
                <Award className="h-3.5 w-3.5 text-primary" /> Weighted Grading Index
              </Badge>
            </div>

            <Table
              columns={scoreboardColumns}
              data={districtPerformanceData}
              onRowClick={(row) => setSelectedNodeId(row.id as string)}
              emptyMessage="Nodes database registry is empty."
            />

            {selectedNode && (
              <div className="mt-5 border-t border-border/80 pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-primary" />
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Node Drill-down Telemetry: {selectedNode.name}
                  </h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-muted/40 p-2.5 rounded border border-border/60">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Beds Census</span>
                    <p className="font-extrabold text-foreground mt-0.5">{selectedNode.bedsCount.occupied} / {selectedNode.bedsCount.total} occupied</p>
                    <span className="text-[9px] text-muted-foreground font-semibold">{selectedNode.bedsCount.available} beds free</span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded border border-border/60">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Doctor Attendance</span>
                    <p className="font-extrabold text-foreground mt-0.5">{selectedNode.doctorCount.active} / {selectedNode.doctorCount.total} active</p>
                    <span className="text-[9px] text-muted-foreground font-semibold">{selectedNode.doctorCount.standby} on standby</span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded border border-border/60">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Low Stock Supplies</span>
                    <p className="font-extrabold text-foreground mt-0.5">
                      {inventory.filter(i => i.hospitalId === selectedNode.id && i.stockLevel <= i.safetyStockThreshold).length} items
                    </p>
                    <span className="text-[9px] text-muted-foreground font-semibold">Under safety buffer limits</span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded border border-border/60">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Outbreak Watch Score</span>
                    <p className="font-extrabold text-foreground mt-0.5">{selectedNode.activeAlertsCount * 12 + 10}%</p>
                    <span className="text-[9px] text-muted-foreground font-semibold">Triage load ratio</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* AI summary recommendation card */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/[0.01] p-4 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4.5 w-4.5 text-primary shrink-0 animate-pulse" />
                <div>
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">
                    Google Health Executive Agent
                  </span>
                  <h3 className="text-xs font-bold text-foreground leading-none mt-0.5">
                    District Telemetry Summary
                  </h3>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
                <p>
                  HealthSync AI ML model has consolidated telemetry logs for this region:
                </p>
                <ul className="space-y-2 text-foreground/80 list-none pl-0">
                  <li className="flex items-start gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                    <span>
                      **Deficit Alert:** Paracetamol levels at Sunset PHC are critically low (3 days remaining).
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                    <span>
                      **ICU Alert:** Metro General ICU occupancy remains at 75%, causing moderate load strain.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                    <span>
                      **Roster Alert:** Doctor shift compliance rate is at an optimal 91% turnout.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-border/80">
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">
                AI Action Plan:
              </span>
              <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                Authorize Paracetamol Cargo transfer **req-1** immediately to restore Sunset PHC stock safety levels above safety threshold bounds.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Emergency Incidents List & Admission Inflow Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Emergency logs
              </span>
              <h3 className="text-sm font-bold text-foreground mt-0.5">
                Active Incident Alerts Dispatch Ledger
              </h3>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
              {alerts.filter(a => !a.acknowledged).map((alert) => (
                <div key={alert.id} className="rounded border border-border/80 p-3 bg-card flex justify-between items-center transition-all hover:border-primary/20">
                  <div className="flex flex-col gap-1 pr-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.type === 'Critical' ? 'destructive' : 'warning'} className="text-[8px] scale-90 -translate-x-1">
                        {alert.type}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground font-semibold uppercase">{alert.category}</span>
                      <span className="text-[9px] text-muted-foreground">• {alert.timestamp}</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground/90 leading-tight mt-0.5">{alert.message}</p>
                    <span className="text-[10px] text-muted-foreground">{alert.targetFacilityName}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => acknowledgeAlert(alert.id)} className="h-8.5 font-semibold text-primary border-primary/35">
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* admissions bar */}
        <div className="space-y-6">
          <Card className="p-4">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Volume Metrics
              </span>
              <h3 className="text-xs font-bold text-foreground mt-0.5">
                District Admissions Inflow (Daily)
              </h3>
            </div>

            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={admissionsData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAdmit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.06)" />
                  <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                  <Area type="monotone" name="Inflow admissions" dataKey="Admissions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAdmit)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default GovernmentCommandCenter;
