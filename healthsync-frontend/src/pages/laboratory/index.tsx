import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Badge, Button, Table, Modal, Input, Select } from '../../components/common';
import { useLabTestsQuery } from '../../hooks';
import { LabTest } from '../../types';
import { 
  FlaskConical, 
  Plus, 
  Activity, 
  Clock, 
  AlertTriangle,
  Beaker,
  CheckCircle,
  FileCheck2,
  Users
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export const LaboratoryManagement: React.FC = () => {
  useEffect(() => {
    document.title = "HealthSync AI | Laboratory";
  }, []);

  const { 
    activeHospitalId, 
    addLabTest, 
    completeLabTest, 
    updateCollectionStatus 
  } = useApp();

  const { data: tests = [], isLoading } = useLabTestsQuery(activeHospitalId);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);

  // Add form state
  const [patientName, setPatientName] = useState('');
  const [testType, setTestType] = useState<LabTest['testType']>('CBC');
  const [technician, setTechnician] = useState('Tech Sarah');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Complete form state
  const [testValue, setTestValue] = useState('');
  const [isCritical, setIsCritical] = useState(false);
  const [reagentStatus, setReagentStatus] = useState<'Critical' | 'Low' | 'Normal'>('Normal');

  const testTypesList: { value: LabTest['testType']; label: string }[] = [
    { value: 'CBC', label: 'Complete Blood Count (CBC)' },
    { value: 'Renal Panel', label: 'Renal Function Panel' },
    { value: 'Cardiac Panel', label: 'Cardiac Enzymes Panel' },
    { value: 'COVID-19', label: 'COVID-19 Rapid Test' },
    { value: 'Blood Culture', label: 'Blood Culture & Sensitivity' },
    { value: 'Malaria Panel', label: 'Malaria Smear Panel' }
  ];

  const handleAddSubmit = () => {
    const errs: Record<string, string> = {};
    if (!patientName.trim()) errs.name = 'Patient Name is required';
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    
    addLabTest(patientName, testType, technician);
    setIsAddModalOpen(false);
    setPatientName('');
    setFormErrors({});
  };

  const handleOpenComplete = (test: LabTest) => {
    setSelectedTest(test);
    setTestValue('');
    setIsCritical(false);
    setReagentStatus(test.reagentLevelStatus);
    setIsCompleteModalOpen(true);
  };

  const handleCompleteSubmit = () => {
    if (!selectedTest || !testValue) return;
    completeLabTest(selectedTest.id, testValue, isCritical, reagentStatus);
    updateCollectionStatus(selectedTest.id, 'Ready');
    setIsCompleteModalOpen(false);
    setSelectedTest(null);
  };

  const handleAdvanceStatus = (test: LabTest) => {
    const currentStage = test.collectionStatus || 'Pending';
    if (currentStage === 'Pending') {
      updateCollectionStatus(test.id, 'Collected');
    } else if (currentStage === 'Collected') {
      updateCollectionStatus(test.id, 'Analyzing');
    } else if (currentStage === 'Analyzing') {
      handleOpenComplete(test);
    }
  };

  // KPIs
  const totalCount = tests.length;
  const pendingCount = tests.filter(t => t.status === 'Pending').length;
  const inProgressCount = tests.filter(t => t.status === 'In-Progress').length;
  const criticalCount = tests.filter(t => t.isCritical).length;

  // Chart
  const statusData = [
    { name: 'CBC', Completed: tests.filter(t => t.testType === 'CBC' && t.status === 'Completed').length, Pending: tests.filter(t => t.testType === 'CBC' && t.status !== 'Completed').length },
    { name: 'Cardiac', Completed: tests.filter(t => t.testType === 'Cardiac Panel' && t.status === 'Completed').length, Pending: tests.filter(t => t.testType === 'Cardiac Panel' && t.status !== 'Completed').length },
    { name: 'Malaria', Completed: tests.filter(t => t.testType === 'Malaria Panel' && t.status === 'Completed').length, Pending: tests.filter(t => t.testType === 'Malaria Panel' && t.status !== 'Completed').length },
    { name: 'Culture', Completed: tests.filter(t => t.testType === 'Blood Culture' && t.status === 'Completed').length, Pending: tests.filter(t => t.testType === 'Blood Culture' && t.status !== 'Completed').length }
  ];

  const columns = [
    {
      header: 'Patient Name',
      accessor: (row: LabTest) => <span className="font-semibold text-foreground">{row.patientName}</span>
    },
    {
      header: 'Diagnostic Test',
      accessor: (row: LabTest) => <span className="font-medium text-foreground/80">{row.testType}</span>
    },
    {
      header: 'Technician Assigned',
      accessor: (row: LabTest) => <span className="text-xs text-muted-foreground font-semibold">{row.technician || 'Tech Sarah'}</span>
    },
    {
      header: 'Pipeline Stage',
      accessor: (row: LabTest) => {
        const stage = row.collectionStatus || 'Pending';
        const color = stage === 'Ready' 
          ? 'success' 
          : stage === 'Analyzing' 
            ? 'warning' 
            : stage === 'Collected' 
              ? 'info' 
              : 'default';
        return (
          <Badge variant={color}>
            {stage === 'Pending' ? 'Pending Collection' : stage === 'Collected' ? 'Sample Collected' : stage === 'Analyzing' ? 'Under Analysis' : 'Results Released'}
          </Badge>
        );
      }
    },
    {
      header: 'Value / Reference',
      accessor: (row: LabTest) => (
        <div className="flex flex-col">
          <span className={`text-xs font-bold ${row.isCritical ? 'text-destructive font-black' : 'text-foreground'}`}>{row.value}</span>
          <span className="text-[10px] text-muted-foreground">Range: {row.referenceRange}</span>
        </div>
      )
    },
    {
      header: 'Action',
      accessor: (row: LabTest) => {
        const stage = row.collectionStatus || 'Pending';
        return (
          <div className="flex gap-2">
            {stage !== 'Ready' && row.status !== 'Completed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAdvanceStatus(row)}
                className="h-8.5 text-[10px] font-bold"
              >
                {stage === 'Pending' && 'Collect Sample'}
                {stage === 'Collected' && 'Analyze'}
                {stage === 'Analyzing' && 'Log Results'}
              </Button>
            )}
            {row.status === 'Completed' && (
              <Badge variant="outline" className="text-success gap-1 border-success/35">
                <CheckCircle className="h-3 w-3" /> Released
              </Badge>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Diagnostics & Laboratory Pipeline
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
            Lab test queues, result entries, and reagent chemical inventories
          </p>
        </div>
        <div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 gap-1.5 text-xs font-semibold shadow-md"
          >
            <Plus className="h-4 w-4" /> Order Diagnostic Test
          </Button>
        </div>
      </div>

      {/* Counter Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Diagnostics Ordered
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{totalCount}</p>
            <span className="text-[10px] text-muted-foreground font-medium leading-none">
              Total tests cataloged
            </span>
          </div>
        </Card>

        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-warning/10 text-warning">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              In Pipeline
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{pendingCount + inProgressCount}</p>
            <span className="text-[10px] text-warning font-semibold leading-none">
              {pendingCount} pending, {inProgressCount} in progress
            </span>
          </div>
        </Card>

        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Critical Values
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">{criticalCount}</p>
            <span className="text-[10px] text-destructive font-semibold leading-none font-bold">
              Urgent physician call-backs
            </span>
          </div>
        </Card>

        <Card variant="acrylic" className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-success/10 text-success">
            <Beaker className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Reagent Security
            </span>
            <p className="text-2xl font-bold text-foreground mt-0.5">85%</p>
            <span className="text-[10px] text-success font-semibold leading-none">
              Chemical reserves safe
            </span>
          </div>
        </Card>
      </div>

      {/* Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lab Tests Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Lab Queues
              </span>
              <h3 className="text-sm font-bold text-foreground mt-0.5">
                Clinical Test Ledger
              </h3>
            </div>

            <Table
              columns={columns}
              data={tests}
              isLoading={isLoading}
              emptyMessage="No diagnostic requests found."
            />
          </Card>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          <Card className="p-4">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Pipeline Ratios
              </span>
              <h3 className="text-xs font-bold text-foreground mt-0.5">
                Completed vs Pending Diagnostics
              </h3>
            </div>
            
            <div className="h-[220px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.06)" />
                  <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                  <Legend wrapperStyle={{ fontSize: '9px' }} />
                  <Bar name="Completed" dataKey="Completed" fill="#10b981" stackId="a" radius={[2, 2, 0, 0]} />
                  <Bar name="Pending/Progress" dataKey="Pending" fill="#a855f7" stackId="a" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Order Test Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Order New Diagnostic Test"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddSubmit}>
              Log Diagnostic Request
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Patient Name"
            placeholder="E.g., Julian Ross"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            error={formErrors.name}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Diagnostic Panel"
              options={testTypesList}
              value={testType}
              onChange={(e) => setTestType(e.target.value as LabTest['testType'])}
            />
            <Select
              label="Assigned Technician"
              options={[
                { value: 'Tech Sarah', label: 'Tech Sarah' },
                { value: 'Tech Anil', label: 'Tech Anil' },
                { value: 'Tech Maya', label: 'Tech Maya' }
              ]}
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Complete Test Result Modal */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title={`Complete Diagnostic: ${selectedTest?.patientName} (${selectedTest?.testType})`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsCompleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCompleteSubmit}>
              Release Test Results
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Diagnostic Value Output"
            placeholder="E.g., Hemoglobin 9.2 g/dL"
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Reagent Kit Level (After test)"
              options={[
                { value: 'Normal', label: 'Normal (Reserves stable)' },
                { value: 'Low', label: 'Low (Refill alert warning)' },
                { value: 'Critical', label: 'Critical Outage Alert!' }
              ]}
              value={reagentStatus}
              onChange={(e) => setReagentStatus(e.target.value as any)}
            />

            <label className="flex items-center gap-2 mb-3 cursor-pointer text-xs font-semibold text-muted-foreground select-none">
              <input
                type="checkbox"
                checked={isCritical}
                onChange={(e) => setIsCritical(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary/20"
              />
              Flag Critical Value Alert
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default LaboratoryManagement;
