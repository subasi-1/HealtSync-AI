import React, { useState } from 'react';
import { Card, Badge, Button, Table } from '../components/common';
import { useApp } from '../context/AppContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ComposedChart, Line
} from 'recharts';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Heart, 
  ShieldAlert,
  ChevronRight,
  TrendingDown,
  BrainCircuit,
  Activity,
  BedDouble,
  Users,
  Pill,
  Lightbulb,
  CheckCircle,
  Clock,
  ArrowRightLeft
} from 'lucide-react';
import { cn } from '../utils';

export const AIForecast: React.FC = () => {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'medicine' | 'stockout' | 'footfall' | 'beds' | 'doctors' | 'recommendations'>('dashboard');

  // Recommendation engine state
  const [recommendations, setRecommendations] = useState([
    { id: 'rec-1', type: 'transfer', text: 'Transfer paracetamol stocks (x400) from Valley CHC (surplus) to Sunset PHC (deficit).', status: 'Active' },
    { id: 'rec-2', type: 'doctor', text: 'Allocate standby doctor Dr. Julian Ross to ICU Critical Care shift.', status: 'Active' },
    { id: 'rec-3', type: 'beds', text: 'Increase ICU capacity by +5 beds at Metro General to match peak inflow forecast.', status: 'Active' },
    { id: 'rec-4', type: 'reorder', text: 'Reorder BCG Vaccine batch from Novartis Pharma (safety limit breached).', status: 'Active' },
    { id: 'rec-5', type: 'lab', text: 'Schedule standby lab technician Tech Anil to clear Blood Culture diagnostics backlog.', status: 'Active' }
  ]);

  const handleApproveRecommendation = (id: string, text: string) => {
    setRecommendations(prev => prev.map(rec => rec.id === id ? { ...rec, status: 'Executed' } : rec));
    addToast(`AI Recommendation Executed: ${text.slice(0, 45)}...`, 'success');
  };

  // 1. Tab Data Projections
  // Medicine forecasts
  const medicineForecastData = [
    { day: 'Jul 05', Actual: 120, Forecast: 125, UpperBound: 130, LowerBound: 120 },
    { day: 'Jul 06', Actual: 130, Forecast: 132, UpperBound: 138, LowerBound: 126 },
    { day: 'Jul 07', Actual: 110, Forecast: 118, UpperBound: 124, LowerBound: 112 },
    { day: 'Jul 08', Actual: null, Forecast: 145, UpperBound: 153, LowerBound: 137 },
    { day: 'Jul 09', Actual: null, Forecast: 150, UpperBound: 160, LowerBound: 140 },
    { day: 'Jul 10', Actual: null, Forecast: 168, UpperBound: 178, LowerBound: 158 },
    { day: 'Jul 11', Actual: null, Forecast: 175, UpperBound: 185, LowerBound: 165 }
  ];

  // Stock-out predictions
  const stockoutItems = [
    { id: 'so-1', name: 'Paracetamol Tablets', risk: 'High', daysLeft: 3, stock: 120, suggestedQty: 1000, supplier: 'Novartis' },
    { id: 'so-2', name: 'Oxygen Cylinders', risk: 'Medium', daysLeft: 6, stock: 45, suggestedQty: 250, supplier: 'BOC Gas' },
    { id: 'so-3', name: 'IV Fluids Saline', risk: 'High', daysLeft: 2, stock: 85, suggestedQty: 800, supplier: 'Baxter India' },
    { id: 'so-4', name: 'BCG Vaccine', risk: 'High', daysLeft: 4, stock: 15, suggestedQty: 300, supplier: 'Serum Institute' }
  ];

  // Patient Footfall hourly/daily
  const footfallProjections = [
    { time: '08:00', Outpatient: 45, Emergency: 15 },
    { time: '10:00', Outpatient: 120, Emergency: 38 },
    { time: '12:00', Outpatient: 95, Emergency: 25 },
    { time: '14:00', Outpatient: 60, Emergency: 18 },
    { time: '16:00', Outpatient: 75, Emergency: 22 },
    { time: '18:00', Outpatient: 110, Emergency: 34 },
    { time: '20:00', Outpatient: 85, Emergency: 28 },
    { time: '22:00', Outpatient: 40, Emergency: 12 }
  ];

  // Bed Occupancy Projections
  const bedProjections = [
    { day: 'Mon', Expected: 82, ICU_Demand: 12, Emergency_Demand: 28 },
    { day: 'Tue', Expected: 85, ICU_Demand: 14, Emergency_Demand: 30 },
    { day: 'Wed', Expected: 88, ICU_Demand: 15, Emergency_Demand: 34 },
    { day: 'Thu', Expected: 91, ICU_Demand: 16, Emergency_Demand: 42 },
    { day: 'Fri', Expected: 94, ICU_Demand: 18, Emergency_Demand: 48 },
    { day: 'Sat', Expected: 87, ICU_Demand: 14, Emergency_Demand: 30 },
    { day: 'Sun', Expected: 80, ICU_Demand: 11, Emergency_Demand: 22 }
  ];

  // Doctor workload expected
  const doctorWorkloadData = [
    { name: 'Dr. Julian', patients: 38, workload: 92, status: 'Overloaded' },
    { name: 'Dr. Sarah', patients: 22, workload: 65, status: 'Optimal' },
    { name: 'Dr. Anil', patients: 12, workload: 35, status: 'Underloaded' },
    { name: 'Dr. Maya', patients: 32, workload: 88, status: 'Overloaded' },
    { name: 'Dr. Priya', patients: 24, workload: 70, status: 'Optimal' }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" /> AI Intelligence Layer
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
            Machine learning forecasts, stockout predictions, and automated resource recommendation cards
          </p>
        </div>
      </div>

      {/* Selector Tabs (Microsoft Fluent Style / Google Cloud style navigation) */}
      <div className="flex flex-wrap gap-2 border-b border-border/80 pb-px select-none">
        {[
          { id: 'dashboard', label: 'AI Dashboard', icon: BrainCircuit },
          { id: 'medicine', label: 'Medicine Forecast', icon: Pill },
          { id: 'stockout', label: 'Stock-out Risk', icon: AlertTriangle },
          { id: 'footfall', label: 'Patient Census', icon: Activity },
          { id: 'beds', label: 'Bed Projections', icon: BedDouble },
          { id: 'doctors', label: 'Doctor Workload', icon: Users },
          { id: 'recommendations', label: 'Recommendations', icon: Lightbulb }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-all -mb-px",
                isActive 
                  ? "border-primary text-primary font-bold" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tabs Viewports */}
      <div className="space-y-6">
        {/* TAB 1: AI DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI grid dial indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="acrylic" className="p-4 flex flex-col justify-between min-h-[140px]">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  District Risk Score
                </span>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-3xl font-extrabold text-destructive">74 / 100</p>
                  <Badge variant="destructive" className="h-6">High Alert watch</Badge>
                </div>
                <span className="text-[10px] text-muted-foreground mt-2 font-medium">
                  Triggered by paracetamol outages and flu spikes.
                </span>
              </Card>

              <Card variant="acrylic" className="p-4 flex flex-col justify-between min-h-[140px]">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Resource Health Score
                </span>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-3xl font-extrabold text-success">82 / 100</p>
                  <Badge variant="success" className="h-6">Safe reserves</Badge>
                </div>
                <span className="text-[10px] text-success font-semibold mt-2">
                  Redistributions active and oxygen grids stabilized.
                </span>
              </Card>

              <Card variant="acrylic" className="p-4 flex flex-col justify-between min-h-[140px]">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Average Bed Strain
                </span>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-3xl font-extrabold text-warning">86% Occupancy</p>
                  <Badge variant="warning" className="h-6">ICU Load Strain</Badge>
                </div>
                <span className="text-[10px] text-muted-foreground mt-2 font-medium">
                  Expanded ward beds suggest mitigation.
                </span>
              </Card>
            </div>

            {/* AI Summary and hospital scorecard list */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Executive Summary */}
              <Card className="lg:col-span-2 p-5 border-primary/20 bg-primary/[0.01]">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <h3 className="text-sm font-bold text-foreground">AI Health Executive Summary</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Google Health ML engine has synthesized telemetry vectors across all PHC/CHC clinics. Overall district operations show stable bounds, with localized warnings:
                </p>
                <ul className="space-y-2 text-xs text-foreground/80 list-disc list-inside">
                  <li>**Depletion Risk:** Paracetamol stocks at Sunset PHC are below safety thresholds (3 days remaining). Redistribution cargo **req-102** is in transit.</li>
                  <li>**Inflow Surge:** Flu-like admissions spiked by **12%** Mon-Wed. Projections indicate a peak in **8 days**, causing high ICU strain.</li>
                  <li>**Roster Coverage:** Standby doctor assignments are stable, with 91% shift turnout compliance.</li>
                </ul>
              </Card>

              {/* Performance Scores */}
              <Card className="p-4">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none block mb-3">
                  Clinic Performance Index
                </span>
                <div className="space-y-3.5">
                  {[
                    { name: 'Valley CHC', score: 92, grade: 'Optimal' },
                    { name: 'Apex Specialty', score: 89, grade: 'Optimal' },
                    { name: 'Metro General', score: 81, grade: 'Medium Load' },
                    { name: 'Sunset PHC', score: 45, grade: 'Outage Risk' }
                  ].map((hosp, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-border/40 last:border-0">
                      <div>
                        <p className="font-semibold text-foreground">{hosp.name}</p>
                        <span className="text-[10px] text-muted-foreground">{hosp.grade}</span>
                      </div>
                      <Badge variant={hosp.score > 80 ? 'success' : hosp.score > 50 ? 'warning' : 'destructive'} className="font-bold">
                        {hosp.score}% Score
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: MEDICINE DEMAND FORECAST */}
        {activeTab === 'medicine' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="p-4 lg:col-span-3">
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                      7-Day & 30-Day ML Projections
                    </span>
                    <h3 className="text-sm font-bold text-foreground mt-0.5">
                      Consumption Demand Curve & Confidence Bounds (+/- 5%)
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-primary font-bold">Confidence: 94.2%</Badge>
                </div>

                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={medicineForecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.06)" />
                      <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                      <YAxis tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                      <Legend wrapperStyle={{ fontSize: '9px' }} />
                      <Area type="monotone" name="Confidence Margin" dataKey="UpperBound" stroke="none" fill="rgba(168, 85, 247, 0.06)" />
                      <Line type="monotone" name="Actual Consumption" dataKey="Actual" stroke="#3b82f6" strokeWidth={2.5} connectNulls />
                      <Line type="monotone" name="AI Forecast Peak" dataKey="Forecast" stroke="#a855f7" strokeWidth={2.5} strokeDasharray="5 5" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Forecast details sidepanel */}
              <div className="space-y-6">
                <Card className="p-4 flex flex-col justify-between h-full min-h-[300px]">
                  <div>
                    <div className="mb-3 flex items-center gap-1.5">
                      <Sparkles className="h-4.5 w-4.5 text-primary" />
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Seasonal Trends</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Summer humidity models suggest a **15% spike in IV saline and dehydration fluids** consumption over the next month. Outbreak index is optimal.
                    </p>
                  </div>
                  
                  <div className="border-t border-border/80 pt-4 mt-4 text-[10px] text-muted-foreground leading-relaxed flex items-start gap-1">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      Model is calculated daily using localized pharmacy ledger reports.
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STOCK-OUT RISK */}
        {activeTab === 'stockout' && (
          <div className="space-y-6">
            <Card className="p-4">
              <div className="mb-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Deficit Alerts
                </span>
                <h3 className="text-sm font-bold text-foreground mt-0.5">
                  Critical Stock-out Risk Predictor Ledger
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 text-muted-foreground uppercase font-bold text-[9px] tracking-wider">
                      <th className="py-2.5">Medicine Name</th>
                      <th className="py-2.5">Risk Level</th>
                      <th className="py-2.5">Stock Left</th>
                      <th className="py-2.5">Days Left</th>
                      <th className="py-2.5">Suggested Order</th>
                      <th className="py-2.5">Preferred Supplier</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockoutItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                        <td className="py-3 font-semibold text-foreground">{item.name}</td>
                        <td className="py-3">
                          <Badge variant={item.risk === 'High' ? 'destructive' : 'warning'}>
                            {item.risk} Risk
                          </Badge>
                        </td>
                        <td className="py-3 font-semibold">{item.stock} units</td>
                        <td className="py-3 text-destructive font-bold">{item.daysLeft} days</td>
                        <td className="py-3 font-semibold text-primary">{item.suggestedQty} units</td>
                        <td className="py-3 text-muted-foreground">{item.supplier}</td>
                        <td className="py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToast(`Purchase order generated for ${item.name} (x${item.suggestedQty})`, 'success')}
                            className="h-8 text-[10px] font-bold text-primary border-primary/35 hover:bg-primary/5"
                          >
                            Order Now
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: PATIENT CENSUS */}
        {activeTab === 'footfall' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-4 lg:col-span-2">
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                    Hourly Admissions Volume
                  </span>
                  <h3 className="text-sm font-bold text-foreground mt-0.5">
                    Expected Outpatient (OPD) & Emergency Inflow Patterns
                  </h3>
                </div>

                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={footfallProjections} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colOut" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colEmerg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.06)" />
                      <XAxis dataKey="time" tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                      <YAxis tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                      <Legend wrapperStyle={{ fontSize: '9px' }} />
                      <Area type="monotone" name="OPD Admissions" dataKey="Outpatient" stroke="#3b82f6" fillOpacity={1} fill="url(#colOut)" strokeWidth={2} />
                      <Area type="monotone" name="Emergency Inflow" dataKey="Emergency" stroke="#ef4444" fillOpacity={1} fill="url(#colEmerg)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Peak hours analytics card */}
              <Card className="p-5 border-destructive/20 bg-destructive/[0.01] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="h-5 w-5 text-destructive animate-bounce" />
                    <div>
                      <span className="text-[9px] font-bold text-destructive uppercase tracking-widest leading-none">
                        Peak Intake Alarm
                      </span>
                      <h4 className="text-xs font-bold text-foreground mt-0.5">Projected Traffic Spikes</h4>
                    </div>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed mb-4">
                    The admissions forecast model projects a severe **emergency traffic peak between 10:00 - 11:30 AM** and **6:00 - 7:30 PM** tomorrow.
                  </p>
                  <div className="p-3 bg-card border border-border rounded text-xs space-y-2 font-medium">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider block">Recommended Actions:</span>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Deploy 2 standby triage nurses.</li>
                      <li>Clear emergency holding beds.</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 5: BED PROJECTIONS */}
        {activeTab === 'beds' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="p-4 lg:col-span-3">
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                    14-Day Occupancy Projections
                  </span>
                  <h3 className="text-sm font-bold text-foreground mt-0.5">
                    Expected Bed Occupancy Rates & Ward Demands
                  </h3>
                </div>

                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bedProjections} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.06)" />
                      <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                      <YAxis tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                      <Legend wrapperStyle={{ fontSize: '9px' }} />
                      <Bar name="Occupancy %" dataKey="Expected" fill="#a855f7" radius={[2, 2, 0, 0]} />
                      <Bar name="ICU Demand Units" dataKey="ICU_Demand" fill="#ef4444" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-4 border-primary/20 bg-primary/[0.01] flex flex-col justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Expansion Advice</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    ICU beds occupancy is forecasted to cross **94%** by Friday. We suggest authorizing **+5 beds capacity expansion** inside Metro General Ward Room A to avoid patient transfers.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => addToast('ICU capacity expansion authorized successfully', 'success')}
                  className="w-full font-bold h-8.5 mt-4"
                >
                  Expand Bed Capacity
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 6: DOCTOR WORKLOAD */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-4 lg:col-span-2">
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                    Workload Indices
                  </span>
                  <h3 className="text-sm font-bold text-foreground mt-0.5">
                    Clinical Workload Distribution & Expected Patients (Shift)
                  </h3>
                </div>

                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={doctorWorkloadData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.06)" />
                      <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                      <YAxis tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                      <Legend wrapperStyle={{ fontSize: '9px' }} />
                      <Bar name="Expected Patients" dataKey="patients" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      <Bar name="Workload Score (0-100)" dataKey="workload" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Overload Alert card */}
              <Card className="p-5 border-warning/20 bg-warning/[0.01] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold text-warning uppercase tracking-widest leading-none">
                        Roster Strain
                      </span>
                      <h4 className="text-xs font-bold text-foreground mt-0.5">Overloaded Staff</h4>
                    </div>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed mb-4">
                    **Dr. Julian Ross** is flagged as overloaded (workload index **92%**, expected 38 patients in shift). 
                  </p>
                  <div className="p-3 bg-card border border-border rounded text-[11px] space-y-1.5 font-medium leading-normal">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider block">Redistribution Plan:</span>
                    Rotate Dr. Priya from Cardiology to general OPD emergency desk to absorb inflow.
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addToast('Shift roster rotated successfully', 'success')}
                  className="w-full font-bold h-8.5 mt-4 border-warning/30 text-warning hover:bg-warning/5"
                >
                  Execute Roster Redistribution
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 7: RECOMMENDATIONS ENGINE */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <Card className="p-4">
              <div className="mb-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Decision HQ
                </span>
                <h3 className="text-sm font-bold text-foreground mt-0.5">
                  AI Recommendation Cards Engine
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <Card 
                    key={rec.id} 
                    className={cn(
                      "p-4 border transition-all flex flex-col justify-between min-h-[140px]",
                      rec.status === 'Executed' 
                        ? "border-success/20 bg-success/[0.01] opacity-75" 
                        : "border-border hover:border-primary/20 bg-card"
                    )}
                  >
                    <div className="flex gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-primary shrink-0 animate-pulse mt-0.5" />
                      <div className="space-y-1 pr-6">
                        <span className="text-[8px] font-extrabold uppercase tracking-widest text-muted-foreground">
                          {rec.type} dispatch
                        </span>
                        <p className="text-xs font-bold text-foreground leading-normal">{rec.text}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-3">
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        SYSTEM ACTIONS: {rec.status}
                      </span>
                      {rec.status === 'Active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveRecommendation(rec.id, rec.text)}
                          className="h-8 text-[10px] font-bold text-primary border-primary/35"
                        >
                          Approve & Execute
                        </Button>
                      ) : (
                        <span className="text-success text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Executed
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
export default AIForecast;
