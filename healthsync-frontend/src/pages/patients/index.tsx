import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Badge, Table, Button, Modal, Input, Select } from '../../components/common';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Heart, 
  ActivitySquare, 
  Sparkles,
  AlertOctagon,
  Plus,
  Search,
  UserCheck,
  Calendar,
  Clock,
  ClipboardList
} from 'lucide-react';

import { Patient } from '../../types/index';

export const PatientFootfall: React.FC = () => {
  useEffect(() => {
    document.title = "HealthSync AI | Patients";
  }, []);

  const { registerPatient, dischargePatient, patients: patientsList, activeHospitalId } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  React.useEffect(() => {
    if (!selectedPatient && patientsList.length > 0) {
      setSelectedPatient(patientsList[0]);
    }
  }, [patientsList, selectedPatient]);

  // Form states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState<number>(30);
  const [formGender, setFormGender] = useState('Male');
  const [formStatus, setFormStatus] = useState<'OPD' | 'IPD'>('OPD');
  const [formCondition, setFormCondition] = useState<Patient['condition']>('Stable');
  const [formWard, setFormWard] = useState<'ICU' | 'General' | 'Emergency'>('General');
  const [formEmergency, setFormEmergency] = useState(false);
  const [formHistory, setFormHistory] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredPatients = patientsList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.history.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formName.trim()) errs.name = 'Patient Name is required';
    if (formAge <= 0 || formAge > 120) errs.age = 'Provide a valid age (1-120)';
    if (!formHistory.trim()) errs.history = 'Basic medical history description is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterSubmit = () => {
    if (!validateForm()) return;
    
    const newPatient: Patient = {
      id: `pat-${Date.now().toString().slice(-4)}`,
      name: formName,
      age: formAge,
      gender: formGender,
      status: formStatus,
      condition: formCondition,
      emergency: formEmergency,
      history: formHistory,
      registeredAt: 'Today, Just now',
      wardType: formStatus === 'IPD' ? formWard : undefined,
      hospitalId: activeHospitalId,
      timeline: [
        { title: 'Admissions Desk', desc: `Registered as ${formStatus} status.`, date: 'Today, Just now' },
        { title: 'Triage Sort', desc: `Assigned ${formCondition} classification.`, date: 'Today, Just now' }
      ]
    };

    setSelectedPatient(newPatient);
    
    // Trigger global admissions sync for bed assignment
    registerPatient({
      id: newPatient.id,
      name: formName,
      age: formAge,
      gender: formGender,
      status: formStatus,
      condition: formCondition,
      wardType: formStatus === 'IPD' ? formWard : undefined,
      emergency: formEmergency,
      history: formHistory,
      timeline: newPatient.timeline
    });

    setIsRegisterOpen(false);
  };

  // Admissions Trends Charts
  const footfallTrend = [
    { date: 'Jul 01', Outpatient: 320, Emergency: 85, Pediatrics: 45, ICU: 12 },
    { date: 'Jul 02', Outpatient: 340, Emergency: 90, Pediatrics: 52, ICU: 14 },
    { date: 'Jul 03', Outpatient: 310, Emergency: 75, Pediatrics: 48, ICU: 10 },
    { date: 'Jul 04', Outpatient: 385, Emergency: 110, Pediatrics: 65, ICU: 15 },
    { date: 'Jul 05', Outpatient: 420, Emergency: 98, Pediatrics: 58, ICU: 16 },
    { date: 'Jul 06', Outpatient: 290, Emergency: 65, Pediatrics: 38, ICU: 8 },
    { date: 'Jul 07', Outpatient: 250, Emergency: 70, Pediatrics: 40, ICU: 11 }
  ];

  const columns = [
    {
      header: 'Patient Profile',
      accessor: (row: Patient) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-[10px] text-muted-foreground uppercase">{row.gender} • Age: {row.age}</span>
        </div>
      )
    },
    {
      header: 'Registry Status',
      accessor: (row: Patient) => (
        <Badge variant={row.status === 'IPD' ? 'info' : 'outline'}>
          {row.status === 'IPD' ? 'Admitted (IPD)' : 'Outpatient (OPD)'}
        </Badge>
      )
    },
    {
      header: 'Triage Priority',
      accessor: (row: Patient) => {
        const color = row.condition === 'Resuscitation' 
          ? 'destructive' 
          : row.condition === 'Urgent' 
            ? 'warning' 
            : 'success';
        return (
          <Badge variant={color}>
            {row.condition}
          </Badge>
        );
      }
    },
    {
      header: 'Emergency Flag',
      accessor: (row: Patient) => (
        <span className={`text-[10px] font-bold uppercase tracking-wider ${row.emergency ? 'text-destructive font-black' : 'text-slate-400'}`}>
          {row.emergency ? 'Critical Code Red' : 'Normal'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (row: Patient) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {row.status === 'IPD' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                dischargePatient(row.id);
              }}
              className="text-[10px] text-destructive border-destructive/20 hover:bg-destructive/10 py-1 px-2.5 font-bold h-7 animate-pulse"
            >
              Discharge
            </Button>
          ) : (
            <span className="text-[10px] text-muted-foreground font-semibold px-2">Discharged</span>
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
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Patient Footfall & Admission Analytics
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
            Epidemiological inflows, triage load ratios, and admissions trends
          </p>
        </div>
        
        <Button
          onClick={() => {
            setFormName('');
            setFormAge(30);
            setFormGender('Male');
            setFormStatus('OPD');
            setFormCondition('Stable');
            setFormWard('General');
            setFormEmergency(false);
            setFormHistory('');
            setFormErrors({});
            setIsRegisterOpen(true);
          }}
          className="h-9 gap-1.5 text-xs font-semibold shadow-md"
        >
          <Plus className="h-4 w-4" /> Register Patient
        </Button>
      </div>

      {/* Triage Count Grid (4 cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-destructive/10 text-destructive animate-pulse">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Resuscitation Code
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">5</p>
            <span className="text-[10px] text-destructive font-semibold leading-none">
              Requires immediate attention
            </span>
          </div>
        </Card>

        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-warning/10 text-warning">
            <ActivitySquare className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Urgent Priority
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">14</p>
            <span className="text-[10px] text-warning font-semibold leading-none">
              Triage urgency class 2
            </span>
          </div>
        </Card>

        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Outpatients (OPD)
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">185</p>
            <span className="text-[10px] text-muted-foreground font-medium leading-none">
              Daily outpatient queue
            </span>
          </div>
        </Card>

        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-success/10 text-success">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Admissions Total
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">651</p>
            <span className="text-[10px] text-success font-semibold leading-none font-bold">
              +12% spike observed
            </span>
          </div>
        </Card>
      </div>

      {/* Main Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Footfall Trend Area chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patients registration table */}
          <Card className="p-4">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Ward registry
                </span>
                <h3 className="text-sm font-bold text-foreground mt-0.5">
                  Admitted & Outpatient Log Ledger
                </h3>
              </div>

              {/* Search & Filter widgets */}
              <div className="flex gap-2">
                <div className="relative w-44">
                  <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground/60" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search logs..."
                    className="h-7.5 w-full rounded border border-input bg-background pl-7.5 pr-2.5 text-[11px] focus:outline-none"
                  />
                </div>
                <Select
                  options={[
                    { value: 'ALL', label: 'All Cases' },
                    { value: 'OPD', label: 'OPD Only' },
                    { value: 'IPD', label: 'IPD Only' }
                  ]}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-7 text-[10px] py-0.5"
                />
              </div>
            </div>
            
            <Table
              columns={columns}
              data={filteredPatients}
              onRowClick={(row) => setSelectedPatient(row as Patient)}
              emptyMessage="No registry records found."
            />
          </Card>

          {/* Footfall trend charts */}
          <Card className="p-4">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Admissions Telemetry
              </span>
              <h3 className="text-sm font-bold text-foreground mt-0.5">
                Weekly Admissions Flow by Ward Type
              </h3>
            </div>
            
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={footfallTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colEmerg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.06)" />
                  <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                  <Area type="monotone" name="Outpatient" dataKey="Outpatient" stroke="#3b82f6" fillOpacity={1} fill="url(#colOut)" strokeWidth={2} />
                  <Area type="monotone" name="Emergency" dataKey="Emergency" stroke="#ef4444" fillOpacity={1} fill="url(#colEmerg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Side: Timeline & Medical Profile Card */}
        <div className="space-y-6">
          {selectedPatient && (
            <Card className="p-4 flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardList className="h-4.5 w-4.5 text-primary shrink-0" />
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                      Active Case Roster
                    </span>
                    <h3 className="text-xs font-bold text-foreground mt-0.5">
                      {selectedPatient.name} (Age: {selectedPatient.age})
                    </h3>
                  </div>
                </div>

                <div className="text-xs space-y-3.5 leading-relaxed pt-2 border-t border-border/60">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Medical History Profile:</span>
                    <p className="text-foreground/90 font-medium mt-0.5">{selectedPatient.history}</p>
                  </div>
                  
                  {/* Timeline */}
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Clinical Operations Tracker:</span>
                    <div className="relative pl-4 border-l border-border/80 ml-2 space-y-4 text-[11px]">
                      {selectedPatient.timeline?.map((step: any, idx: number) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-5 top-1 h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground leading-none">{step.title}</span>
                            <span className="text-[9px] text-muted-foreground mt-0.5">{step.date}</span>
                            <p className="text-muted-foreground font-medium mt-1 leading-tight">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visit History */}
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mb-2 block">Historical Clinical Visits:</span>
                    <div className="space-y-2 text-[11px] leading-relaxed">
                      <div className="p-2 bg-muted/40 rounded border border-border/40">
                        <div className="flex justify-between items-center font-bold">
                          <span>General OPD Desk</span>
                          <span className="text-muted-foreground font-normal text-[9px]">June 12, 2026</span>
                        </div>
                        <p className="text-muted-foreground mt-0.5">Complained of acute migraine. Administered Ibuprofen and advised 24h rest schedule.</p>
                      </div>
                      <div className="p-2 bg-muted/40 rounded border border-border/40">
                        <div className="flex justify-between items-center font-bold">
                          <span>Diagnostics Lab Desk</span>
                          <span className="text-muted-foreground font-normal text-[9px]">May 05, 2026</span>
                        </div>
                        <p className="text-muted-foreground mt-0.5">Routine CBC blood counts and sugar profiles. Checked normal within bounds.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* AI Outbreak forecasting Alert Card */}
          <Card className="border-destructive/20 bg-destructive/[0.01] p-4 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <AlertOctagon className="h-5 w-5 text-destructive shrink-0 animate-bounce" />
              <div>
                <span className="text-[9px] font-bold text-destructive uppercase tracking-widest leading-none">
                  Google Health Epidemic Sensor
                </span>
                <h3 className="text-xs font-bold text-foreground mt-0.5">
                  Respiratory Outbreak Watch
                </h3>
              </div>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed">
              A **12% spike in influenza-like admissions** has triggered an epidemic warning alarm across District-A. Outbreak triggers active.
            </p>
          </Card>
        </div>
      </div>

      {/* Patient Registration Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register New Patient Admission"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsRegisterOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRegisterSubmit}>
              Complete Registry
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5">
          <Input
            label="Patient Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            error={formErrors.name}
            placeholder="E.g., John Connor"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Age"
              type="number"
              value={formAge}
              onChange={(e) => setFormAge(Number(e.target.value))}
              error={formErrors.age}
            />
            <Select
              label="Gender"
              value={formGender}
              onChange={(e) => setFormGender(e.target.value)}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Admission Status"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              options={[
                { value: 'OPD', label: 'Outpatient (OPD)' },
                { value: 'IPD', label: 'Admitted (IPD)' }
              ]}
            />
            <Select
              label="Triage Sorting"
              value={formCondition}
              onChange={(e) => setFormCondition(e.target.value as any)}
              options={[
                { value: 'Stable', label: 'Stable (Category 4)' },
                { value: 'Semi-Urgent', label: 'Semi-Urgent (Category 3)' },
                { value: 'Urgent', label: 'Urgent (Category 2)' },
                { value: 'Resuscitation', label: 'Resuscitation (Category 1)' }
              ]}
            />
          </div>
          {formStatus === 'IPD' && (
            <Select
              label="Target Ward Room"
              value={formWard}
              onChange={(e) => setFormWard(e.target.value as any)}
              options={[
                { value: 'General', label: 'General Ward Room' },
                { value: 'ICU', label: 'ICU Critical Ward' },
                { value: 'Emergency', label: 'Emergency Room' }
              ]}
            />
          )}
          
          <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-xs text-destructive border-y border-border/60 py-2">
            <input
              type="checkbox"
              checked={formEmergency}
              onChange={(e) => setFormEmergency(e.target.checked)}
              className="rounded text-destructive border-border focus:ring-destructive/20 h-4.5 w-4.5"
            />
            Flag as Code Red Emergency Admission
          </label>

          <Input
            label="Chief Medical History Notes"
            value={formHistory}
            onChange={(e) => setFormHistory(e.target.value)}
            error={formErrors.history}
            placeholder="Chief complaints, pre-existing symptoms, and drugs history..."
          />
        </div>
      </Modal>
    </div>
  );
};
export default PatientFootfall;
