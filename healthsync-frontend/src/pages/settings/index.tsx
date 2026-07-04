import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Badge, Button, Input, Select } from '../../components/common';
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
  Keyboard
} from 'lucide-react';
import { cn } from '../../utils';

export const Settings: React.FC = () => {
  const { theme, toggleTheme, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'thresholds' | 'alerts' | 'ai' | 'accessibility' | 'language'>('thresholds');
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

  const [highContrast, setHighContrast] = useState(() => {
    return document.documentElement.classList.contains('high-contrast');
  });
  const [screenReader, setScreenReader] = useState(false);
  const [kbdShortcuts, setKbdShortcuts] = useState(true);

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
        {/* Settings categories (left menu panel) */}
        <Card className="p-4 md:col-span-1 h-fit select-none">
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
            >
              <Sliders className="h-4 w-4" /> Threshold Calibration
            </button>
            <button
              onClick={() => setActiveTab('language')}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 font-semibold transition-all",
                activeTab === 'language' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Languages className="h-4 w-4" /> Language & Translation
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 font-semibold transition-all",
                activeTab === 'alerts' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Bell className="h-4 w-4" /> Push Alerts Checklist
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 font-semibold transition-all",
                activeTab === 'ai' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Brain className="h-4 w-4" /> AI Models Preferences
            </button>
            <button
              onClick={() => setActiveTab('accessibility')}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 font-semibold transition-all",
                activeTab === 'accessibility' ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Accessibility className="h-4 w-4" /> Accessibility (WCAG)
            </button>
          </div>
        </Card>

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
              <div className="space-y-4 animate-fade-in">
                <div className="mb-4">
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

            <div className="flex justify-end pt-4 border-t border-border/80 mt-4">
              <Button type="submit" className="text-xs font-bold shadow-md">
                Save Parameter Calibrations
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
export default Settings;
