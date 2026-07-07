import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Badge, Button, Input, Select, Table } from '../../components/common';
import { 
  Settings as SettingsIcon, 
  Bell, 
  ShieldCheck, 
  Volume2, 
  Moon, 
  Sliders,
  CheckCircle,
  Brain,
  Accessibility,
  Languages,
  Keyboard,
  Activity,
  Database,
  Cpu,
  Server,
  RefreshCw,
  Clock,
  Laptop,
  AlertTriangle,
  FolderDown,
  FolderUp,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { cn } from '../../utils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export const Settings: React.FC = () => {
  const { theme, toggleTheme, addToast, seedDemoData } = useApp();
  const [activeTab, setActiveTab] = useState<'thresholds' | 'alerts' | 'ai' | 'accessibility' | 'language' | 'monitoring' | 'security' | 'disaster' | 'intelligence'>('thresholds');
  const [isSaved, setIsSaved] = useState(false);
  
  // Settings States
  const [stockThreshold, setStockThreshold] = useState(15);
  const [bedThreshold, setBedThreshold] = useState(85);
  const [reagentThreshold, setReagentThreshold] = useState(20);

  const [activeLang, setActiveLang] = useState('English');
  const [voiceVolume, setVoiceVolume] = useState(70);

  const [alertsList, setAlertsList] = useState({
    stock: true,
    emerg: true,
    doctors: true,
    beds: false,
    labs: true
  });

  const [aiEngine, setAiEngine] = useState('Gemini 3.5 Flash');
  const [confidenceLimit, setConfidenceLimit] = useState(85);
  const [autoOrder, setAutoOrder] = useState(false);

  // Disaster Recovery states
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);

  const [highContrast, setHighContrast] = useState(() => {
    return document.documentElement.classList.contains('high-contrast');
  });
  const [screenReader, setScreenReader] = useState(false);
  const [kbdShortcuts, setKbdShortcuts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(15);

  // Apply High Contrast Mode class dynamically
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    addToast('System parameters re-calibrated successfully', 'success');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTriggerRestore = () => {
    setIsRestoring(true);
    setRestoreProgress(0);
    addToast('Disaster Recovery: Initiating DB restore simulation...', 'info');
    
    const interval = setInterval(() => {
      setRestoreProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRestoring(false);
          addToast('Operational DB restored successfully (Checkpoints synced).', 'success');
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  const handleExportDB = () => {
    const backupPayload = {
      timestamp: new Date().toISOString(),
      backupId: `HS-DB-BACKUP-${Date.now()}`,
      version: '1.0.4',
      status: 'production_ready'
    };
    const element = document.createElement("a");
    const fileBlob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `healthsync_db_backup_${Date.now()}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('Database backup downloaded successfully.', 'success');
  };

  const handleImportDB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addToast(`Restored layout configs from "${file.name}"`, 'success');
  };

  // Monitoring latency chart data
  const latencyData = [
    { hour: '18:00', latency: 42, activeUsers: 120 },
    { hour: '19:00', latency: 45, activeUsers: 145 },
    { hour: '20:00', latency: 48, activeUsers: 180 },
    { hour: '21:00', latency: 39, activeUsers: 210 },
    { hour: '22:00', latency: 44, activeUsers: 165 },
    { hour: '23:00', latency: 41, activeUsers: 110 }
  ];

  // Background jobs mock list
  const bgJobs = [
    { id: 'job-1', name: 'Stock Demand Predictor crawler', interval: 'Every 24h', lastRun: '2 hrs ago', status: 'Succeeded' },
    { id: 'job-2', name: 'District Outbreaks Heatmap aggregator', interval: 'Every 1h', lastRun: '15 mins ago', status: 'Succeeded' },
    { id: 'job-3', name: 'Expired Medicine batches scanner', interval: 'Every 12h', lastRun: '6 hrs ago', status: 'Active' }
  ];

  const bgJobsColumns: any[] = [
    { header: 'Background Job Service', accessor: (row: any) => <span className="font-semibold text-foreground text-xs">{row.name}</span> },
    { header: 'Frequency', accessor: (row: any) => <span className="text-muted-foreground">{row.interval}</span> },
    { header: 'Last Run Stamp', accessor: (row: any) => <span className="text-muted-foreground font-semibold flex items-center gap-1"><Clock className="h-3 w-3" /> {row.lastRun}</span> },
    { header: 'Health', accessor: (row: any) => <Badge variant={row.status === 'Succeeded' ? 'success' : 'info'}>{row.status}</Badge> }
  ];

  // Device management lists
  const devices = [
    { id: 'dev-1', name: 'Chrome 124 on Windows 11', ip: '192.168.1.104', location: 'District HQ Office', status: 'Active Session' },
    { id: 'dev-2', name: 'Safari 17 on iPad OS', ip: '10.0.4.52', location: 'Sunset PHC ICU Desk', status: 'Idle (4 hrs)' }
  ];

  const devicesColumns: any[] = [
    { header: 'Registered Browser/Client', accessor: (row: any) => <span className="font-semibold text-foreground text-xs flex items-center gap-1.5"><Laptop className="h-4 w-4 text-primary" /> {row.name}</span> },
    { header: 'IP Directory', accessor: (row: any) => <span className="text-muted-foreground font-mono">{row.ip}</span> },
    { header: 'Location Desk', accessor: (row: any) => <span className="text-muted-foreground font-semibold">{row.location}</span> },
    { header: 'Session Status', accessor: (row: any) => <Badge variant={row.status.includes('Active') ? 'success' : 'outline'}>{row.status}</Badge> }
  ];

  // Benchmark stats PHC vs CHC
  const benchmarks = [
    { id: 'bench-1', name: 'Sunset Primary Health Center', type: 'PHC', score: 78, efficiency: '82%', suggestions: 'Refill paracetamol stock level buffers' },
    { id: 'bench-2', name: 'Valley Community Health Center', type: 'CHC', score: 92, efficiency: '95%', suggestions: 'Secure General Bed turnover rate' },
    { id: 'bench-3', name: 'Metro District Hospital', type: 'Specialty', score: 85, efficiency: '89%', suggestions: 'Schedule extra General shift rotaries' }
  ];

  const benchmarkColumns: any[] = [
    { header: 'Health Facility Name', accessor: (row: any) => <span className="font-bold text-foreground text-xs">{row.name} ({row.type})</span> },
    { header: 'Weighted Score Index', accessor: (row: any) => <span className="font-black text-primary">{row.score}/100</span> },
    { header: 'Resource Efficiency', accessor: (row: any) => <Badge variant={Number(row.efficiency.replace('%','')) > 90 ? 'success' : 'warning'}>{row.efficiency}</Badge> },
    { header: 'Cost Optimization Suggestions', accessor: (row: any) => <span className="text-muted-foreground font-medium text-[11px] leading-snug">{row.suggestions}</span> }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary" /> System Configuration & Settings
        </h2>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
          Calibrate safety alerts thresholds, themes, and notification triggers
        </p>
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-1">
          {/* Settings categories (left menu panel) */}
          <Card className="p-4 h-fit select-none">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-3 block">
              System Parameters
            </span>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setActiveTab('thresholds')}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 font-semibold transition-all",
                  activeTab === 'thresholds' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
                type="button"
              >
                <Sliders className="h-4 w-4" /> Threshold Calibration
              </button>
              <button
                onClick={() => setActiveTab('language')}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 font-semibold transition-all",
                  activeTab === 'language' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
                type="button"
              >
                <Languages className="h-4 w-4" /> Language & Translation
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 font-semibold transition-all",
                  activeTab === 'alerts' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
                type="button"
              >
                <Bell className="h-4 w-4" /> Push Alerts Checklist
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 font-semibold transition-all",
                  activeTab === 'ai' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
                type="button"
              >
                <Brain className="h-4 w-4" /> AI Models & Quality
              </button>
              <button
                onClick={() => setActiveTab('accessibility')}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 font-semibold transition-all",
                  activeTab === 'accessibility' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
                type="button"
              >
                <Accessibility className="h-4 w-4" /> Accessibility (WCAG)
              </button>
              
              <div className="border-t border-border/50 my-2 pt-2" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5 block px-2.5">
                Enterprise Operations
              </span>

              <button
                onClick={() => setActiveTab('monitoring')}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 font-semibold transition-all",
                  activeTab === 'monitoring' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
                type="button"
              >
                <Activity className="h-4 w-4" /> Health & Latency
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 font-semibold transition-all",
                  activeTab === 'security' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
                type="button"
              >
                <ShieldCheck className="h-4 w-4" /> Security & Device Audits
              </button>
              <button
                onClick={() => setActiveTab('disaster')}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 font-semibold transition-all",
                  activeTab === 'disaster' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
                type="button"
              >
                <Database className="h-4 w-4" /> Disaster Recovery (DR)
              </button>
              <button
                onClick={() => setActiveTab('intelligence')}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 font-semibold transition-all",
                  activeTab === 'intelligence' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
                type="button"
              >
                <BarChart3 className="h-4 w-4" /> Benchmarking Index
              </button>
            </div>
          </Card>

          <Card className="p-4 bg-primary/5 border border-primary/20 space-y-3">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none block">
              Presentation Tool
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Instantly seed low-stock alerts, active patient ICU occupancy, and redistribution requests to demonstrate end-to-end operational workflows.
            </p>
            <Button
              type="button"
              onClick={seedDemoData}
              className="w-full text-xs font-bold shadow-md bg-primary hover:bg-primary/95 text-white py-2 animate-pulse"
            >
              Launch Hackathon Demo Data
            </Button>
          </Card>
        </div>

        {/* Configuration Panel Form (right side card) */}
        <Card className="p-6 md:col-span-2">
          <form onSubmit={handleSave} className="space-y-6">
            {isSaved && (
              <div className="rounded-md bg-success/10 border border-success/20 p-3 text-xs text-success font-semibold flex items-center gap-1.5 animate-fade-in">
                <CheckCircle className="h-4 w-4" /> Calibration profiles saved successfully.
              </div>
            )}

            {/* TAB 1: THRESHOLDS */}
            {activeTab === 'thresholds' && (
              <div className="space-y-4 animate-fade-in">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-foreground">Threshold Alarm Configurations</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Set safety buffers for central incidents dispatching.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Medicine Stockout Refill Warning (%)"
                    type="number"
                    value={stockThreshold}
                    onChange={(e) => setStockThreshold(Number(e.target.value))}
                    min={5}
                    max={50}
                  />
                  <Input
                    label="Bed Occupancy Alarm Threshold (%)"
                    type="number"
                    value={bedThreshold}
                    onChange={(e) => setBedThreshold(Number(e.target.value))}
                    min={50}
                    max={98}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Reagent Kit Outage Limit (%)"
                    type="number"
                    value={reagentThreshold}
                    onChange={(e) => setReagentThreshold(Number(e.target.value))}
                    min={5}
                    max={40}
                  />
                  <div className="flex flex-col justify-end pb-1">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interface Theme</span>
                    <Button type="button" variant="outline" onClick={toggleTheme} className="h-10 text-xs font-semibold gap-2 border-border/80 w-full">
                      <Moon className="h-4 w-4" /> Toggle System Dark/Light Mode
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LANGUAGE */}
            {activeTab === 'language' && (
              <div className="space-y-4 animate-fade-in">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-foreground">Language & Localization</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Translate system interfaces and telemetry summaries.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Active Portal Language"
                    options={[
                      { value: 'English', label: 'English (US)' },
                      { value: 'Hindi', label: 'Hindi (Standard)' },
                      { value: 'Spanish', label: 'Spanish (Castellano)' },
                      { value: 'French', label: 'French (Europe)' }
                    ]}
                    value={activeLang}
                    onChange={(e) => setActiveLang(e.target.value)}
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted-foreground">Voice Volume Indicator</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={voiceVolume}
                      onChange={(e) => setVoiceVolume(Number(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PUSH ALERTS */}
            {activeTab === 'alerts' && (
              <div className="space-y-4 animate-fade-in">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-foreground">Push Notifications Checklist</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Select triggers that dispatch instant notifications.</p>
                </div>
                <div className="space-y-3 text-xs font-semibold text-muted-foreground">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertsList.stock}
                      onChange={(e) => setAlertsList(prev => ({ ...prev, stock: e.target.checked }))}
                      className="rounded border-border text-primary focus:ring-primary/20"
                    />
                    Low Stock Refill Alerts
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertsList.emerg}
                      onChange={(e) => setAlertsList(prev => ({ ...prev, emerg: e.target.checked }))}
                      className="rounded border-border text-primary focus:ring-primary/20"
                    />
                    Emergency Code Red Alerts
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertsList.doctors}
                      onChange={(e) => setAlertsList(prev => ({ ...prev, doctors: e.target.checked }))}
                      className="rounded border-border text-primary focus:ring-primary/20"
                    />
                    Doctor Absence / Shift Void Alerts
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertsList.beds}
                      onChange={(e) => setAlertsList(prev => ({ ...prev, beds: e.target.checked }))}
                      className="rounded border-border text-primary focus:ring-primary/20"
                    />
                    Bed Over-Capacity Alerts
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertsList.labs}
                      onChange={(e) => setAlertsList(prev => ({ ...prev, labs: e.target.checked }))}
                      className="rounded border-border text-primary focus:ring-primary/20"
                    />
                    Diagnostics Lab Delay Alerts
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: AI PREFERENCES */}
            {activeTab === 'ai' && (
              <div className="space-y-6 animate-fade-in">
                <div className="mb-4 border-b border-border/40 pb-3">
                  <h3 className="text-sm font-bold text-foreground">AI Engine Model Configurations</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Toggle reasoning models and automated dispatch parameters.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="ML Operations Model"
                    options={[
                      { value: 'Gemini 3.5 Flash', label: 'Gemini 3.5 Flash (Default)' },
                      { value: 'Claude 3.5 Sonnet', label: 'Claude 3.5 Sonnet (Extended)' },
                      { value: 'GPT-4o', label: 'GPT-4o Reasoning' }
                    ]}
                    value={aiEngine}
                    onChange={(e) => setAiEngine(e.target.value)}
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted-foreground">Confidence Score Cut-off ({confidenceLimit}%)</label>
                    <input
                      type="range"
                      min="60"
                      max="98"
                      value={confidenceLimit}
                      onChange={(e) => setConfidenceLimit(Number(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/40">
                  <Card className="p-3 bg-muted/30 text-center space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Accuracy Index</span>
                    <p className="text-lg font-black text-success">94.2%</p>
                  </Card>
                  <Card className="p-3 bg-muted/30 text-center space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Response Latency</span>
                    <p className="text-lg font-black text-primary">120ms</p>
                  </Card>
                  <Card className="p-3 bg-muted/30 text-center space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Acceptance rate</span>
                    <p className="text-lg font-black text-primary">88.4%</p>
                  </Card>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={autoOrder}
                    onChange={(e) => setAutoOrder(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary/20"
                  />
                  Enable Auto-Purchase Orders when stock risk crosses 90%
                </label>
              </div>
            )}

            {/* TAB 5: ACCESSIBILITY (WCAG 2.1) */}
            {activeTab === 'accessibility' && (
              <div className="space-y-4 animate-fade-in">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-foreground">Accessibility & WCAG Configurations</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Ensure interface complies with global contrast and navigation guidelines.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3 text-xs font-semibold text-muted-foreground">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={highContrast}
                        onChange={(e) => setHighContrast(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary/20"
                      />
                      Enable High Contrast Mode
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={screenReader}
                        onChange={(e) => setScreenReader(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary/20"
                      />
                      Screen Reader Descriptive Text
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kbdShortcuts}
                        onChange={(e) => setKbdShortcuts(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary/20"
                      />
                      Enable Keyboard Shortcut Commands
                    </label>
                  </div>

                  {/* Shortcuts directory card */}
                  <Card className="p-3.5 space-y-2.5">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none block">
                      Keyboard Map Shortcuts
                    </span>
                    <div className="space-y-1.5 text-[10px] font-medium text-foreground/80 leading-normal">
                      <div className="flex justify-between border-b border-border/40 pb-1">
                        <span>Global Database Search:</span>
                        <kbd className="bg-muted px-1 rounded border">Ctrl + K</kbd>
                      </div>
                      <div className="flex justify-between border-b border-border/40 pb-1">
                        <span>Toggle AI chat:</span>
                        <kbd className="bg-muted px-1 rounded border">Alt + A</kbd>
                      </div>
                      <div className="flex justify-between border-b border-border/40 pb-1">
                        <span>Active Alerts Ledger:</span>
                        <kbd className="bg-muted px-1 rounded border">Alt + N</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Switch Dark/Light theme:</span>
                        <kbd className="bg-muted px-1 rounded border">Alt + T</kbd>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 6: ENTERPRISE HEALTH MONITORING */}
            {activeTab === 'monitoring' && (
              <div className="space-y-6 animate-fade-in">
                <div className="mb-4 border-b border-border/40 pb-3">
                  <h3 className="text-sm font-bold text-foreground">API Latency & Uptime indicator</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Real-time indicators verifying clinical gateway operations.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card className="p-3 bg-muted/20 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">API Gateway</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      <span className="text-xs font-bold text-foreground">Online</span>
                    </div>
                  </Card>
                  <Card className="p-3 bg-muted/20 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Database Connection</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      <span className="text-xs font-bold text-foreground">Connected</span>
                    </div>
                  </Card>
                  <Card className="p-3 bg-muted/20 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">AI Service</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      <span className="text-xs font-bold text-foreground">Available</span>
                    </div>
                  </Card>
                  <Card className="p-3 bg-muted/20 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Uptime Indicator</span>
                    <p className="text-xs font-bold text-foreground mt-1">99.98%</p>
                  </Card>
                </div>

                {/* API latency charts */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-foreground">Gateway Latency Telemetry (ms)</span>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={latencyData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.06)" />
                        <XAxis dataKey="hour" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Tooltip contentStyle={{ fontSize: '10px' }} />
                        <Area type="monotone" name="Latency (ms)" dataKey="latency" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Background crawler logs */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground">Background Services Scheduler</span>
                  <Table
                    columns={bgJobsColumns}
                    data={bgJobs}
                  />
                </div>
              </div>
            )}

            {/* TAB 7: SECURITY AUDITS */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-fade-in">
                <div className="mb-4 border-b border-border/40 pb-3">
                  <h3 className="text-sm font-bold text-foreground">Security Audits & Devices</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Control active sessions and check failed logins trails.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Failed Login Lockout Treshold"
                    type="number"
                    defaultValue={3}
                    helperText="Limits failed inputs before locking administrative accounts."
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-muted-foreground">Session Idle Timeout ({sessionTimeout} mins)</label>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(Number(e.target.value))}
                      className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                    />
                  </div>
                </div>

                {/* Active device log lists */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground block">Active Devices Registry</span>
                  <Table
                    columns={devicesColumns}
                    data={devices}
                  />
                </div>

                {/* Failed attempts alert card */}
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded flex items-start gap-2 text-xs text-destructive">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Failed Login Trace Logs:</span>
                    <p className="text-[10px] text-destructive/80 mt-0.5 font-mono">
                      Failed login attempt from IP 192.168.1.45 flagged yesterday, 10:14 PM (Role attempted: SUPER_ADMIN).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: DISASTER RECOVERY */}
            {activeTab === 'disaster' && (
              <div className="space-y-6 animate-fade-in">
                <div className="mb-4 border-b border-border/40 pb-3">
                  <h3 className="text-sm font-bold text-foreground">Disaster Recovery & Database Backups</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Export database JSON models or trigger a checkpoints restore simulation.</p>
                </div>

                {isRestoring && (
                  <div className="space-y-2 p-4 bg-primary/10 border border-primary/20 rounded animate-pulse">
                    <div className="flex justify-between items-center text-xs font-bold text-primary">
                      <span className="flex items-center gap-1.5"><RefreshCw className="h-4 w-4 animate-spin" /> Restoring Clinical Registry checkpoints...</span>
                      <span>{restoreProgress}%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-300" style={{ width: `${restoreProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Export */}
                  <Card className="p-4 space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Export Database Schema</span>
                      <p className="text-[11px] text-muted-foreground mt-1">Download local memory database variables as a backup file.</p>
                    </div>
                    <Button type="button" onClick={handleExportDB} variant="outline" className="text-xs font-semibold gap-1.5 w-full h-9 mt-2">
                      <FolderDown className="h-4 w-4" /> Download Backup JSON
                    </Button>
                  </Card>

                  {/* Import */}
                  <Card className="p-4 space-y-2 flex flex-col justify-between relative">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Upload Configurations File</span>
                      <p className="text-[11px] text-muted-foreground mt-1">Load and override active clinical threshold limits.</p>
                    </div>
                    <div className="relative w-full">
                      <input
                        type="file"
                        onChange={handleImportDB}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-9"
                        accept=".json"
                      />
                      <Button type="button" variant="outline" className="text-xs font-semibold gap-1.5 w-full h-9 mt-2 pointer-events-none">
                        <FolderUp className="h-4 w-4" /> Import Backup JSON
                      </Button>
                    </div>
                  </Card>
                </div>

                <div className="border-t border-border/40 pt-4 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-foreground">Operational DB Restore Simulation</span>
                    <p className="text-[10px] text-muted-foreground">Test backup integrity in safe staging environments.</p>
                  </div>
                  <Button type="button" disabled={isRestoring} onClick={handleTriggerRestore} className="text-xs font-bold shadow-md bg-destructive hover:bg-destructive/90 text-white h-9">
                    Trigger Staging Restore
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 9: BENCHMARKING INTELLIGENCE */}
            {activeTab === 'intelligence' && (
              <div className="space-y-6 animate-fade-in">
                <div className="mb-4 border-b border-border/40 pb-3">
                  <h3 className="text-sm font-bold text-foreground">District Benchmarking Index</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Compare operational performance scores between PHC and CHC nodes.</p>
                </div>

                {/* Efficiency metrics card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="p-4 bg-success/5 border border-success/20 space-y-1">
                    <span className="text-[9px] font-bold text-success uppercase">Resource Efficiency Score</span>
                    <p className="text-xl font-black text-foreground">92/100</p>
                    <p className="text-[10px] text-muted-foreground mt-1">District averages computed from doctor attendance & bed occupancy.</p>
                  </Card>
                  
                  <Card className="p-4 bg-primary/5 border border-primary/20 space-y-1">
                    <span className="text-[9px] font-bold text-primary uppercase">Cost Optimization Savings</span>
                    <p className="text-xl font-black text-foreground">$1,450 / month</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Savings suggestions compiled from medicine redistributions.</p>
                  </Card>
                </div>

                {/* Comparison benchmarking list */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground block">Facility Performance Comparison</span>
                  <Table
                    columns={benchmarkColumns}
                    data={benchmarks}
                  />
                </div>
              </div>
            )}

            {/* Default Save Button (Hidden for custom action tabs) */}
            {['thresholds', 'language', 'alerts', 'ai', 'accessibility'].includes(activeTab) && (
              <div className="flex justify-end pt-4 border-t border-border/80 mt-4">
                <Button type="submit" className="text-xs font-bold shadow-md">
                  Save Parameter Calibrations
                </Button>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};
export default Settings;
