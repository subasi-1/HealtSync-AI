import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Badge, Button } from '../../components/common';
import { InteractiveMap } from '../../components/dashboard/InteractiveMap';
import { 
  useHospitalsQuery, 
  useInventoryQuery, 
  useRedistributionsQuery,
  useApproveRedistributionMutation
} from '../../hooks';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell 
} from 'recharts';
import { 
  Building2, 
  BedDouble, 
  Activity, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  CornerDownRight, 
  CheckCircle,
  Truck
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  useEffect(() => {
    document.title = "HealthSync AI | Dashboard";
  }, []);

  const { alerts, activityLogs } = useApp();
  const { data: hospitals = [] } = useHospitalsQuery();
  const { data: inventory = [] } = useInventoryQuery();
  const { data: redistributions = [] } = useRedistributionsQuery();
  const approveRedistributionMutation = useApproveRedistributionMutation();

  // 1. Calculate Aggregated Telemetry KPIs
  const totalFacilities = hospitals.length;
  
  const totalBeds = hospitals.reduce((sum, h) => sum + h.bedsCount.total, 0);
  const occupiedBeds = hospitals.reduce((sum, h) => sum + h.bedsCount.occupied, 0);
  const avgBedOccupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const lowStockThresholdItems = inventory.filter(item => item.stockLevel <= item.safetyStockThreshold).length;
  const supplyChainHealth = inventory.length > 0 ? Math.round(((inventory.length - lowStockThresholdItems) / inventory.length) * 100) : 100;

  const activeAlertsCount = alerts.filter(a => !a.acknowledged).length;

  // 2. Charts Mock Data
  const admissionsData = [
    { date: 'Mon', outpatient: 120, emergency: 45, icu: 10 },
    { date: 'Tue', outpatient: 140, emergency: 35, icu: 8 },
    { date: 'Wed', outpatient: 110, emergency: 55, icu: 12 },
    { date: 'Thu', outpatient: 165, emergency: 60, icu: 15 },
    { date: 'Fri', outpatient: 180, emergency: 40, icu: 14 },
    { date: 'Sat', outpatient: 95, emergency: 25, icu: 9 },
    { date: 'Sun', outpatient: 70, emergency: 30, icu: 11 }
  ];

  const diseaseDistribution = [
    { name: 'Influenza', count: 184, color: '#3b82f6' },
    { name: 'COVID-19', count: 42, color: '#6366f1' },
    { name: 'Malaria', count: 98, color: '#f59e0b' },
    { name: 'Dengue', count: 75, color: '#a855f7' },
    { name: 'Cardiac Cases', count: 64, color: '#ef4444' }
  ];

  // 3. Select pending redistribution request for AI recommendation panel
  const aiRecommendation = redistributions.find(r => r.status === 'Pending');

  const handleApproveRedistribution = (id: string) => {
    approveRedistributionMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* HUD Telemetry Top Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Sovereign Command Console
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
            SaaS Aggregated Health Operations Ledgers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 bg-muted/40 border border-border/80 px-2 py-1 rounded">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Central Data Synchronized
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Facilities */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Monitored Nodes
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{totalFacilities}</p>
            <span className="text-[10px] text-muted-foreground leading-none font-medium">
              4 hospitals active in district
            </span>
          </div>
        </Card>

        {/* KPI 2: Avg Beds occupancy */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-success/10 text-success">
            <BedDouble className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Bed Capacity Strain
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{avgBedOccupancy}%</p>
            <span className="text-[10px] text-warning font-semibold flex items-center gap-1 leading-none">
              {occupiedBeds}/{totalBeds} occupied beds
            </span>
          </div>
        </Card>

        {/* KPI 3: Supply Chain Health */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-warning/10 text-warning">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Supply Integrity
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{supplyChainHealth}%</p>
            <span className="text-[10px] text-destructive font-semibold leading-none">
              {lowStockThresholdItems} deficit items flagged
            </span>
          </div>
        </Card>

        {/* KPI 4: Active Alerts */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-destructive/10 text-destructive animate-pulse">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Active Alerts
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{activeAlertsCount}</p>
            <span className="text-[10px] text-muted-foreground font-medium leading-none">
              Unresolved alerts dispatched
            </span>
          </div>
        </Card>
      </div>

      {/* Interactive Map Section */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
            District Grid Telemetry
          </span>
        </div>
        <InteractiveMap />
      </div>

      {/* AI Recommendation ledger & Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Admissions Volume Trend */}
          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Telemetry Flow
                </span>
                <h3 className="text-sm font-bold text-foreground mt-0.5">
                  Admissions Trend by Triage Level
                </h3>
              </div>
              <Badge variant="info">Weekly Ledger</Badge>
            </div>
            
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={admissionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOutpatient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEmergency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorIcu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.06)" />
                  <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <Tooltip contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: '6px', fontSize: '11px' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" name="Outpatient" dataKey="outpatient" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOutpatient)" strokeWidth={2} />
                  <Area type="monotone" name="Emergency" dataKey="emergency" stroke="#f59e0b" fillOpacity={1} fill="url(#colorEmergency)" strokeWidth={2} />
                  <Area type="monotone" name="ICU" dataKey="icu" stroke="#ef4444" fillOpacity={1} fill="url(#colorIcu)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Disease admissions chart */}
          <Card className="p-4">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Clinical Diagnostics Risk
              </span>
              <h3 className="text-sm font-bold text-foreground mt-0.5">
                Active Epidemiological Outbreak Surveillance
              </h3>
            </div>
            
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diseaseDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(226, 232, 240, 0.06)" />
                  <XAxis type="number" tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <YAxis type="category" dataKey="name" tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} width={85} />
                  <Tooltip contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: '6px', fontSize: '11px' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
                    {diseaseDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Side: AI Redistribution Suggestions and Activity Logs */}
        <div className="space-y-6">
          {/* AI Supply Chain Redistribution Card */}
          <Card className="border-primary/20 bg-primary/[0.02] p-4 relative overflow-hidden">
            {/* Sparkle background glow */}
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/10 blur-xl" />
            
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4.5 w-4.5 text-primary shrink-0 animate-pulse" />
              <div>
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">
                  Google Health AI Optimizer
                </span>
                <h3 className="text-xs font-bold text-foreground leading-none mt-0.5">
                  Supply Chain Suggestion
                </h3>
              </div>
            </div>

            {aiRecommendation ? (
              <div className="space-y-4">
                <div className="rounded border border-primary/15 bg-card p-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">{aiRecommendation.medicineName}</span>
                    <Badge variant="destructive">{aiRecommendation.urgency} Urgency</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Deficit flagged at Sunset PHC. Safe supply critical margin breached.
                  </p>
                  
                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-[10px]">
                    <div>
                      <span className="text-muted-foreground">Source surplus node:</span>
                      <p className="font-semibold text-foreground truncate max-w-[120px]">{aiRecommendation.fromHospitalName}</p>
                    </div>
                    <CornerDownRight className="h-4 w-4 text-primary" />
                    <div className="text-right">
                      <span className="text-muted-foreground">Transfer Quantity:</span>
                      <p className="font-semibold text-foreground">{aiRecommendation.quantity} Units</p>
                    </div>
                  </div>
                </div>

                {approveRedistributionMutation.isSuccess ? (
                  <div className="flex items-center gap-1.5 text-xs text-success font-semibold justify-center py-2 bg-success/5 border border-success/15 rounded">
                    <CheckCircle className="h-4 w-4" /> Transfer Request Approved & Enqueued
                  </div>
                ) : (
                  <Button
                    onClick={() => handleApproveRedistribution(aiRecommendation.id)}
                    className="w-full text-xs font-bold shadow-md hover:fluent-shadow-lg"
                    isLoading={approveRedistributionMutation.isPending}
                  >
                    Approve & Route Logistics
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Truck className="h-10 w-10 text-muted-foreground/45 mb-2" />
                <p className="text-xs font-bold text-foreground/80">Logistics Lanes Balanced</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  AI has not detected drug safety margin breaches.
                </p>
              </div>
            )}
          </Card>

          {/* Real-time Activity Feed */}
          <Card className="p-4 flex flex-col h-[340px]">
            <div className="mb-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Operation Audit
              </span>
              <h3 className="text-xs font-bold text-foreground mt-0.5">
                Live Activity & Diagnostics Logs
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {activityLogs.slice(0, 7).map((log) => (
                <div key={log.id} className="flex gap-2 text-xs border-b border-border/30 pb-2.5 last:border-0 last:pb-0">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="font-medium text-foreground/90 leading-tight">
                      {log.action}
                    </p>
                    <div className="mt-1 flex gap-2 items-center text-[10px] text-muted-foreground">
                      <span className="font-semibold">{log.actor} ({log.role.replace('_', ' ')})</span>
                      <span>•</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
