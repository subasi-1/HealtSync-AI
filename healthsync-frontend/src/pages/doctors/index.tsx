import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Badge, Button, Table, Modal, Select, Input } from '../../components/common';
import { useDoctorsQuery } from '../../hooks';
import { Doctor } from '../../types';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Phone, 
  Star,
  Search,
  Filter,
  UserCheck,
  Award,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export const DoctorAttendance: React.FC = () => {
  const { 
    activeHospitalId, 
    assignShift, 
    requestLeave, 
    updateDoctorStatus 
  } = useApp();
  
  const { data: doctors = [], isLoading } = useDoctorsQuery(activeHospitalId);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [previewDoctor, setPreviewDoctor] = useState<Doctor | null>(null);

  React.useEffect(() => {
    if (doctors.length > 0 && !previewDoctor) {
      setPreviewDoctor(doctors[0]);
    }
  }, [doctors]);
  
  // Modals
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Form states
  const [assignedShift, setAssignedShift] = useState<'Morning' | 'Night' | 'General'>('General');
  const [assignedDept, setAssignedDept] = useState('General Medicine');
  const [leaveChecked, setLeaveChecked] = useState(false);

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenRoster = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setAssignedShift((doc as any).shift || 'General');
    setAssignedDept((doc as any).department || 'General Medicine');
    setIsRosterModalOpen(true);
  };

  const handleOpenLeave = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setLeaveChecked(doc.status === 'Off-Duty');
    setIsLeaveModalOpen(true);
  };

  const handleRosterSubmit = () => {
    if (!selectedDoctor) return;
    assignShift(selectedDoctor.id, assignedShift as any);
    // Mimic saving department mapping in local session
    if ((selectedDoctor as any)) {
      (selectedDoctor as any).department = assignedDept;
    }
    setIsRosterModalOpen(false);
    setSelectedDoctor(null);
  };

  const handleLeaveSubmit = () => {
    if (!selectedDoctor) return;
    requestLeave(selectedDoctor.id, leaveChecked);
    setIsLeaveModalOpen(false);
    setSelectedDoctor(null);
  };

  // KPIs
  const totalCount = doctors.length;
  const activeCount = doctors.filter(d => d.status === 'Active').length;
  const standbyCount = doctors.filter(d => d.status === 'Standby').length;
  const complianceRate = Math.round(
    (doctors.reduce((sum, d) => sum + d.attendanceRate, 0) / (totalCount || 1))
  );

  // Specialty statistics for chart
  const specialtyCounts = doctors.reduce((acc: any, doc) => {
    acc[doc.specialty] = (acc[doc.specialty] || 0) + 1;
    return acc;
  }, {});

  const specialtyChartData = Object.keys(specialtyCounts).map(spec => ({
    specialty: spec,
    Doctors: specialtyCounts[spec]
  }));

  const columns = [
    {
      header: 'Medical Officer',
      accessor: (row: Doctor) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-[9px] text-muted-foreground uppercase">{row.specialty}</span>
        </div>
      )
    },
    {
      header: 'Shift Status',
      accessor: (row: Doctor) => (
        <Badge variant={row.status === 'Active' ? 'success' : row.status === 'Standby' ? 'warning' : 'outline'}>
          {row.status === 'Active' ? 'Active Shift' : row.status === 'Standby' ? 'Standby' : 'On Leave / Off'}
        </Badge>
      )
    },
    {
      header: 'Dept Mapping',
      accessor: (row: Doctor) => (
        <span className="text-xs text-foreground/80 font-medium">
          {(row as any).department || 'General Medicine'}
        </span>
      )
    },
    {
      header: 'Roster Shift',
      accessor: (row: Doctor) => (
        <Badge variant="outline" className="capitalize text-[10px] font-bold border-indigo-500/20 bg-indigo-500/[0.02] text-indigo-500">
          {(row as any).shift || 'General'}
        </Badge>
      )
    },
    {
      header: 'Duty Compliance',
      accessor: (row: Doctor) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">{row.attendanceRate}%</span>
          <div className="w-12 bg-muted rounded-full h-1">
            <div className="bg-primary h-1 rounded-full" style={{ width: `${row.attendanceRate}%` }} />
          </div>
        </div>
      )
    },
    {
      header: 'Roster Controls',
      accessor: (row: Doctor) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenRoster(row)}
            className="h-8 text-[10px] font-bold gap-1"
          >
            <Clock className="h-3 w-3" /> Shift
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenLeave(row)}
            className="h-8 text-[10px] font-bold gap-1 border-destructive/20 text-destructive hover:bg-destructive/5"
          >
            <Calendar className="h-3 w-3" /> Leave
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Doctor Shift & Attendance Registry
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
            Shift rotas, checked-in staff rosters, and specialty shares
          </p>
        </div>
      </div>

      {/* Roster counts (4 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
            Active Clinicians
          </span>
          <p className="text-3xl font-extrabold text-foreground mt-2">{activeCount}</p>
          <span className="text-[10px] text-success font-semibold mt-1">
            On active floor shifts
          </span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
            Standby Officers
          </span>
          <p className="text-3xl font-extrabold text-foreground mt-2">{standbyCount}</p>
          <span className="text-[10px] text-warning font-semibold mt-1">
            Ready for emergency rotation
          </span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
            Roster Compliance
          </span>
          <p className="text-3xl font-extrabold text-foreground mt-2">{complianceRate}%</p>
          <span className="text-[10px] text-muted-foreground mt-1">
            Average duty compliance score
          </span>
        </Card>

        {/* Search & Filters */}
        <Card variant="acrylic" className="p-3 flex flex-col gap-2 justify-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff..."
              className="h-8 w-full rounded border border-input bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Select
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'Active', label: 'Active Shift' },
              { value: 'Standby', label: 'Standby' },
              { value: 'Off-Duty', label: 'On Leave' }
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-7 text-xs py-0.5"
          />
        </Card>
      </div>

      {/* Main Ledger table & chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Medical Officer directory
              </span>
              <h3 className="text-sm font-bold text-foreground mt-0.5">
                Staff Roster Overview
              </h3>
            </div>

            <Table
              columns={columns}
              data={filteredDoctors}
              isLoading={isLoading}
              onRowClick={(row) => setPreviewDoctor(row)}
              emptyMessage="No medical officers matched search queries."
            />
          </Card>
        </div>

        {/* Specialty distribution bar chart */}
        <div className="space-y-6">
          {previewDoctor && (
            <Card className="p-4 space-y-3.5 animate-fade-in">
              <div className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(previewDoctor.name)}`}
                  alt={previewDoctor.name}
                  className="h-12 w-12 rounded-md bg-muted p-1"
                />
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none block">
                    {(previewDoctor as any).department || 'General Medicine'}
                  </span>
                  <h3 className="text-xs font-bold text-foreground mt-0.5">
                    {previewDoctor.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">{previewDoctor.specialty}</p>
                </div>
              </div>

              <div className="text-xs space-y-2 border-t border-border/40 pt-3">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Contact:</span>
                  <span className="font-semibold text-foreground">+91 9845 {previewDoctor.id.slice(-4)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3" /> Efficiency:</span>
                  <span className="font-bold text-primary">{previewDoctor.attendanceRate}% rating</span>
                </div>
              </div>
            </Card>
          )}

          {previewDoctor && (
            <Card className="p-4 space-y-3 animate-fade-in">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none block">
                Shift calendar
              </span>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                  const isWeekend = idx >= 5;
                  const shiftName = isWeekend ? 'Off' : (previewDoctor as any).shift || 'Gen';
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <span className="text-muted-foreground mb-1 block">{day}</span>
                      <Badge variant={isWeekend ? 'outline' : 'success'} className="px-1 text-[8px] h-6 flex items-center justify-center font-bold">
                        {shiftName.slice(0, 3)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {previewDoctor && (
            <Card className="p-4 space-y-3 animate-fade-in">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none block">
                Attendance logs (Last 4 Days)
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground">July 05, 2026:</span>
                  <span className="font-bold text-success flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Present</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/40 pb-1.5">
                  <span className="text-muted-foreground">July 04, 2026:</span>
                  <span className="font-bold text-success flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Present</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/40 pb-1.5 text-muted-foreground">
                  <span>July 03, 2026:</span>
                  <span className="font-bold">Excused Leave</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>July 02, 2026:</span>
                  <span className="font-bold">Excused Leave</span>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-4">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Roster Allocation
              </span>
              <h3 className="text-xs font-bold text-foreground mt-0.5">
                Staff Count by Specialization
              </h3>
            </div>
            
            <div className="h-[220px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={specialtyChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.06)" />
                  <XAxis dataKey="specialty" tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                  <Bar name="Officers" dataKey="Doctors" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Adjust Doctor Shift Modal */}
      <Modal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        title={`Designate Shift Assignment: ${selectedDoctor?.name}`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsRosterModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRosterSubmit}>
              Assign Shift Plan
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Map clinical staff to shift profiles and departments to balance standby and code coverage.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Shift Rota"
              options={[
                { value: 'Morning', label: 'Morning Shift' },
                { value: 'General', label: 'General Hours' },
                { value: 'Night', label: 'Night Duty Roster' }
              ]}
              value={assignedShift}
              onChange={(e) => setAssignedShift(e.target.value as any)}
            />
            <Select
              label="Department Mapping"
              options={[
                { value: 'General Medicine', label: 'General Medicine' },
                { value: 'Emergency Care', label: 'Emergency Care' },
                { value: 'Cardiology Node', label: 'Cardiology Specialty' },
                { value: 'ICU Critical Care', label: 'ICU Critical Care' }
              ]}
              value={assignedDept}
              onChange={(e) => setAssignedDept(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Adjust Doctor Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title={`Leave & Off-Duty Registry: ${selectedDoctor?.name}`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsLeaveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleLeaveSubmit}>
              Save Leave Registry
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-muted-foreground">
            Configure leave parameters. Flagging an officer as off-duty removes them from active dispatch standby pools.
          </p>
          
          <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-foreground py-2 border-y border-border/60">
            <input
              type="checkbox"
              checked={leaveChecked}
              onChange={(e) => setLeaveChecked(e.target.checked)}
              className="rounded text-primary border-border focus:ring-primary/20 h-4.5 w-4.5"
            />
            Flag as Authorized Leave (Off-Duty)
          </label>
        </div>
      </Modal>
    </div>
  );
};
export default DoctorAttendance;
