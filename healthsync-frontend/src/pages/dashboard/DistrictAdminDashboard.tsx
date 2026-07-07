import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Badge, Button, Table } from '../../components/common';
import { InteractiveMap } from '../../components/dashboard/InteractiveMap';
import { useHospitalsQuery, useDoctorsQuery, useAlertsQuery } from '../../hooks';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend 
} from 'recharts';
import { 
  ShieldAlert, 
  Users, 
  BedDouble, 
  MapPin, 
  Sparkles, 
  Building2, 
  Activity, 
  ArrowUpRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DistrictAdminDashboard: React.FC = () => {
  const { alerts, activeDistrictId } = useApp();
  const { data: hospitals = [] } = useHospitalsQuery();
  const navigate = useNavigate();

  // Filter hospitals for current district
  const districtHospitals = hospitals.filter(h => h.district === activeDistrictId);
  const totalBeds = districtHospitals.reduce((sum, h) => sum + h.bedsCount.total, 0);
  const occupiedBeds = districtHospitals.reduce((sum, h) => sum + h.bedsCount.occupied, 0);
  const bedRatio = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalDoctors = districtHospitals.reduce((sum, h) => sum + h.doctorCount.total, 0);
  const activeDoctors = districtHospitals.reduce((sum, h) => sum + h.doctorCount.active, 0);
  const doctorRatio = totalDoctors > 0 ? Math.round((activeDoctors / totalDoctors) * 100) : 0;

  const districtAlerts = alerts.filter(a => a.acknowledged === false && districtHospitals.some(h => h.id === a.targetFacilityId)).length;

  // Chart data
  const hospitalPerformanceData = [
    { name: 'Mon', 'Metro General': 160, 'Valley CHC': 40, 'Sunset PHC': 25 },
    { name: 'Tue', 'Metro General': 185, 'Valley CHC': 35, 'Sunset PHC': 30 },
    { name: 'Wed', 'Metro General': 150, 'Valley CHC': 50, 'Sunset PHC': 20 },
    { name: 'Thu', 'Metro General': 210, 'Valley CHC': 62, 'Sunset PHC': 45 },
    { name: 'Fri', 'Metro General': 230, 'Valley CHC': 45, 'Sunset PHC': 38 },
    { name: 'Sat', 'Metro General': 120, 'Valley CHC': 30, 'Sunset PHC': 15 },
    { name: 'Sun', 'Metro General': 90, 'Valley CHC': 20, 'Sunset PHC': 12 }
  ];

  const columns = [
    {
      header: 'Hospital Name',
      accessor: (row: typeof hospitals[0]) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-[10px] text-muted-foreground uppercase">{row.type}</span>
        </div>
      )
    },
    {
      header: 'ICU / General Beds',
      accessor: (row: typeof hospitals[0]) => {
        const pct = Math.round((row.bedsCount.occupied / row.bedsCount.total) * 100);
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">{pct}%</span>
            <span className="text-xs text-muted-foreground">({row.bedsCount.occupied}/{row.bedsCount.total})</span>
          </div>
        );
      }
    },
    {
      header: 'Active Medical Staff',
      accessor: (row: typeof hospitals[0]) => (
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <span className="text-xs font-semibold">{row.doctorCount.active} active shifts</span>
        </div>
      )
    },
    {
      header: 'Incidents Logged',
      accessor: (row: typeof hospitals[0]) => (
        <Badge variant={row.activeAlertsCount > 2 ? 'destructive' : row.activeAlertsCount > 0 ? 'warning' : 'success'}>
          {row.activeAlertsCount} incidents
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            District Operations Command
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
            District Hub Operations Centre • {activeDistrictId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/redistribution')}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI Redistribution Engine
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Region Nodes */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Monitored Nodes
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{districtHospitals.length}</p>
            <span className="text-[10px] text-muted-foreground leading-none font-medium">
              3 active centers in sector
            </span>
          </div>
        </Card>

        {/* KPI 2: Beds ocupation */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-success/10 text-success">
            <BedDouble className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Sector Bed Load
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{bedRatio}%</p>
            <span className="text-[10px] text-warning font-semibold leading-none">
              {occupiedBeds}/{totalBeds} beds utilized
            </span>
          </div>
        </Card>

        {/* KPI 3: Doctor Shifts */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-info/10 text-info">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Shift Compliance
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{doctorRatio}%</p>
            <span className="text-[10px] text-success font-semibold leading-none">
              {activeDoctors}/{totalDoctors} doctors checked-in
            </span>
          </div>
        </Card>

        {/* KPI 4: District alerts */}
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-destructive/10 text-destructive">
            <ShieldAlert className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Sector Warnings
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{districtAlerts}</p>
            <span className="text-[10px] text-muted-foreground font-medium leading-none">
              Incidents needing resolution
            </span>
          </div>
        </Card>
      </div>

      {/* Map Widget */}
      <div>
        <div className="mb-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
            Spatial Outbreak & Supply Telemetry
          </span>
        </div>
        <InteractiveMap />
      </div>

      {/* District telemetry details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Hospital Table listing */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Node Registries
              </span>
              <h3 className="text-sm font-bold text-foreground mt-0.5">
                Hospital Telemetry Overview
              </h3>
            </div>
            
            <Table
              columns={columns}
              data={districtHospitals}
              emptyMessage="No hospitals found in this district directory."
              onRowClick={(row) => navigate('/inventory')}
            />
          </Card>
        </div>

        {/* Right Side: Charts */}
        <div className="space-y-6">
          <Card className="p-4">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Daily Load Telemetry
              </span>
              <h3 className="text-xs font-bold text-foreground mt-0.5">
                Daily Admissions Flow by Facility
              </h3>
            </div>
            
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hospitalPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.06)" />
                  <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <Tooltip contentStyle={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: '6px', fontSize: '11px' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" name="Metro General" dataKey="Metro General" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Valley CHC" dataKey="Valley CHC" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" name="Sunset PHC" dataKey="Sunset PHC" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
