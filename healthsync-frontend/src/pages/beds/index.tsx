import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Badge, Button, Modal, Input, Select } from '../../components/common';
import { useBedsQuery, useTransferBedMutation } from '../../hooks';
import { Bed } from '../../types';
import { 
  BedDouble, 
  UserPlus, 
  UserMinus, 
  Activity, 
  Trash2, 
  HelpCircle,
  ShieldAlert,
  Wind,
  Layers,
  Sparkles
} from 'lucide-react';
import { cn } from '../../utils';

export const BedManagement: React.FC = () => {
  useEffect(() => {
    document.title = "HealthSync AI | Bed Allocation";
  }, []);

  const { activeHospitalId } = useApp();
  const { data: beds = [], isLoading } = useBedsQuery(activeHospitalId);
  const transferBedMutation = useTransferBedMutation();

  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [filterWard, setFilterWard] = useState<string>('ALL');

  // Form states
  const [status, setStatus] = useState<Bed['status']>('Available');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number>(30);
  const [patientCondition, setPatientCondition] = useState<Bed['patientCondition']>('Stable');
  const [ventilatorAttached, setVentilatorAttached] = useState(false);

  const wardTypes = ['ALL', 'ICU', 'General', 'Emergency', 'Pediatric', 'Maternity'];

  const filteredBeds = beds.filter(b => filterWard === 'ALL' || b.wardType === filterWard);

  const handleOpenUpdate = (bed: Bed) => {
    setSelectedBed(bed);
    setStatus(bed.status);
    setPatientName(bed.patientName || '');
    setPatientAge(bed.patientAge || 35);
    setPatientCondition(bed.patientCondition || 'Stable');
    setVentilatorAttached(bed.ventilatorAttached);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = () => {
    if (!selectedBed) return;
    const updates: Partial<Bed> = {
      status,
      patientName: status === 'Occupied' ? patientName : undefined,
      patientAge: status === 'Occupied' ? patientAge : undefined,
      patientCondition: status === 'Occupied' ? patientCondition : undefined,
      ventilatorAttached: status === 'Occupied' ? ventilatorAttached : false
    };

    transferBedMutation.mutate(
      { bedId: selectedBed.id, updates },
      {
        onSuccess: () => {
          setIsUpdateModalOpen(false);
          setSelectedBed(null);
        }
      }
    );
  };

  // Telemetry indicators
  const totalCount = beds.length;
  const occupiedCount = beds.filter(b => b.status === 'Occupied').length;
  const availableCount = beds.filter(b => b.status === 'Available').length;
  const cleaningCount = beds.filter(b => b.status === 'Cleaning').length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Operational Bed Management Grid
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
            ICU capacity telemetry and real-time floor occupancy trackers
          </p>
        </div>
      </div>

      {/* Ward Filter & Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Filter Widget */}
        <Card variant="acrylic" className="p-3.5 flex flex-col justify-between md:col-span-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-2">
            Select Medical Ward
          </span>
          <div className="space-y-1">
            {wardTypes.map((ward) => (
              <button
                key={ward}
                onClick={() => setFilterWard(ward)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all",
                  filterWard === ward 
                    ? "bg-primary/10 text-primary font-bold" 
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <span>{ward === 'ALL' ? 'All Wards' : ward}</span>
                <Badge variant="outline">
                  {ward === 'ALL' ? beds.length : beds.filter(b => b.wardType === ward).length}
                </Badge>
              </button>
            ))}
          </div>
        </Card>

        {/* Counter cards (3 cards) */}
        <div className="md:col-span-3 grid grid-cols-3 gap-4">
          <Card className="p-4 flex flex-col justify-between border-primary/20 bg-primary/[0.01]">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Occupied Beds
            </span>
            <p className="text-3xl font-extrabold text-foreground mt-2">{occupiedCount}</p>
            <span className="text-[10px] text-muted-foreground mt-1">
              {Math.round((occupiedCount / (totalCount || 1)) * 100)}% utilization rate
            </span>
          </Card>

          <Card className="p-4 flex flex-col justify-between border-success/20 bg-success/[0.01]">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Clinically Ready
            </span>
            <p className="text-3xl font-extrabold text-foreground mt-2">{availableCount}</p>
            <span className="text-[10px] text-success font-semibold mt-1">
              Beds open for admissions
            </span>
          </Card>

          <Card className="p-4 flex flex-col justify-between border-warning/20 bg-warning/[0.01]">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Sanitation Pipeline
            </span>
            <p className="text-3xl font-extrabold text-foreground mt-2">{cleaningCount}</p>
            <span className="text-[10px] text-muted-foreground mt-1">
              Currently undergoing deep cleaning
            </span>
          </Card>
        </div>
      </div>

      {/* Grid structure of beds */}
      <Card className="p-6">
        <div className="mb-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
            Floor Grid Layout
          </span>
          <h3 className="text-sm font-bold text-foreground mt-0.5">
            Active Hospital Bed Registry
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBeds.map((bed) => {
            const isOccupied = bed.status === 'Occupied';
            const condition = bed.patientCondition;
            
            return (
              <div
                key={bed.id}
                onClick={() => handleOpenUpdate(bed)}
                className={cn(
                  "relative rounded-lg border p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:fluent-shadow-md select-none",
                  {
                    "border-success bg-success/[0.02] hover:border-success/60": bed.status === 'Available',
                    "border-warning bg-warning/[0.02] hover:border-warning/60": bed.status === 'Cleaning',
                    "border-primary bg-primary/[0.01] hover:border-primary/60": bed.status === 'Reserved',
                    "border-border bg-card": isOccupied && condition === 'Stable',
                    "border-orange-500 bg-orange-500/[0.02]": isOccupied && condition === 'Serious',
                    "border-destructive bg-destructive/[0.02] animate-pulse-slow": isOccupied && condition === 'Critical'
                  }
                )}
              >
                {/* Ward badge & bed number */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-extrabold text-foreground">{bed.roomNumber}</span>
                  <Badge variant={bed.status === 'Available' ? 'success' : bed.status === 'Cleaning' ? 'warning' : bed.status === 'Reserved' ? 'default' : 'outline'}>
                    {bed.status === 'Occupied' ? bed.patientCondition || 'Occupied' : bed.status}
                  </Badge>
                </div>

                {/* Patient details if occupied */}
                {isOccupied ? (
                  <div className="space-y-1.5 text-xs text-foreground/90">
                    <p className="font-bold truncate">{bed.patientName}</p>
                    <p className="text-[10px] text-muted-foreground">Age: {bed.patientAge} • {bed.wardType} Ward</p>
                    {bed.ventilatorAttached && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5">
                        <Wind className="h-3 w-3 animate-pulse" /> Ventilator Active
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col justify-center h-[52px] text-center text-muted-foreground text-xs font-semibold">
                    <span>{bed.wardType} Ward Bed</span>
                    <span className="text-[10px] text-muted-foreground/60 mt-0.5">Click to check-in</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Bed check-in / details Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Bed Registry Telemetry: ${selectedBed?.roomNumber}`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsUpdateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpdateSubmit} isLoading={transferBedMutation.isPending}>
              Apply Register Update
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Bed Allocation Status"
            options={[
              { value: 'Available', label: 'Available (Clinically Ready)' },
              { value: 'Occupied', label: 'Occupied (Patient Checked-In)' },
              { value: 'Cleaning', label: 'Cleaning (Sanitation Ledger)' },
              { value: 'Reserved', label: 'Reserved (Emergency Booking)' }
            ]}
            value={status}
            onChange={(e) => setStatus(e.target.value as Bed['status'])}
          />

          {status === 'Occupied' && (
            <div className="space-y-4 border-t border-border pt-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Patient Legal Name"
                  placeholder="E.g., Samantha Cross"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                />
                <Input
                  label="Patient Age"
                  type="number"
                  placeholder="45"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <Select
                  label="Clinical Condition"
                  options={[
                    { value: 'Stable', label: 'Stable (Observational)' },
                    { value: 'Observation', label: 'Under Observation' },
                    { value: 'Serious', label: 'Serious (Defibrillator standby)' },
                    { value: 'Critical', label: 'Critical ICU (Ventilator alert)' }
                  ]}
                  value={patientCondition}
                  onChange={(e) => setPatientCondition(e.target.value as Bed['patientCondition'])}
                />

                <label className="flex items-center gap-2 mb-3 cursor-pointer text-xs font-semibold text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    checked={ventilatorAttached}
                    onChange={(e) => setVentilatorAttached(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary/20"
                  />
                  Attach ICU Ventilator
                </label>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
export default BedManagement;
