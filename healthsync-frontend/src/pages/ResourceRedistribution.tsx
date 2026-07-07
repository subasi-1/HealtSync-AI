import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Badge, Button, Table, Modal, Select, Input } from '../components/common';
import { 
  Shuffle, 
  Plus, 
  ArrowRight, 
  Truck, 
  PackageCheck, 
  CheckCircle,
  HelpCircle,
  Clock,
  MapPin,
  Sparkles
} from 'lucide-react';
import { cn } from '../utils';

export const ResourceRedistribution: React.FC = () => {
  const { 
    redistributionRequests, 
    hospitals, 
    inventory, 
    approveRedistribution, 
    shipRedistribution, 
    receiveRedistribution, 
    createRedistributionRequest,
    currentUser
  } = useApp();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  
  // Form states
  const [medicineName, setMedicineName] = useState('Paracetamol 500mg Tablets');
  const [quantity, setQuantity] = useState(500);
  const [fromHospitalId, setFromHospitalId] = useState('hosp-2'); // default surplus CHC
  const [toHospitalId, setToHospitalId] = useState('hosp-3'); // default deficit PHC
  const [urgency, setUrgency] = useState<'High' | 'Medium' | 'Low'>('High');

  const handleCreateSubmit = () => {
    if (!medicineName || !quantity) return;
    createRedistributionRequest(medicineName, quantity, fromHospitalId, toHospitalId, urgency);
    setIsNewModalOpen(false);
  };

  const medicineOptions = [
    { value: 'Paracetamol 500mg Tablets', label: 'Paracetamol 500mg Tablets' },
    { value: 'Oxygen Cylinders 40L', label: 'Oxygen Cylinders 40L' },
    { value: 'Amoxicillin 250mg Capsules', label: 'Amoxicillin 250mg Capsules' },
    { value: 'IV Fluids (Normal Saline 500ml)', label: 'IV Fluids (Normal Saline 500ml)' }
  ];

  const hospitalOptions = hospitals.map(h => ({
    value: h.id,
    label: h.name
  }));

  // Table columns
  const columns = [
    {
      header: 'Supply Item',
      accessor: (row: typeof redistributionRequests[0]) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.medicineName}</span>
          <span className="text-[10px] text-muted-foreground">Quantity: {row.quantity} units</span>
        </div>
      )
    },
    {
      header: 'Supply Route',
      accessor: (row: typeof redistributionRequests[0]) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-foreground/80 truncate max-w-[100px]">{row.fromHospitalName.split(' ')[0]}</span>
          <ArrowRight className="h-3 w-3 text-primary shrink-0" />
          <span className="font-semibold text-foreground/80 truncate max-w-[100px]">{row.toHospitalName.split(' ')[0]}</span>
        </div>
      )
    },
    {
      header: 'Urgency',
      accessor: (row: typeof redistributionRequests[0]) => (
        <Badge variant={row.urgency === 'High' ? 'destructive' : row.urgency === 'Medium' ? 'warning' : 'info'}>
          {row.urgency}
        </Badge>
      )
    },
    {
      header: 'Logistics State',
      accessor: (row: typeof redistributionRequests[0]) => (
        <Badge variant={row.status === 'Received' ? 'success' : row.status === 'Shipped' ? 'info' : row.status === 'Approved' ? 'warning' : 'default'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Tracking Index',
      accessor: (row: typeof redistributionRequests[0]) => (
        <span className="text-[10px] font-mono text-muted-foreground">
          {row.trackingCode || 'Pending dispatch'}
        </span>
      )
    },
    {
      header: 'Actions Ledger',
      accessor: (row: typeof redistributionRequests[0]) => {
        const canApprove = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'DISTRICT_ADMIN';
        const isFromHospital = currentUser?.facilityId === row.fromHospitalId;
        const isToHospital = currentUser?.facilityId === row.toHospitalId;
        
        return (
          <div className="flex gap-2">
            {row.status === 'Pending' && canApprove && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => approveRedistribution(row.id)}
                className="h-8 text-xs font-semibold shadow-sm"
              >
                Approve
              </Button>
            )}
            {row.status === 'Approved' && (isFromHospital || canApprove) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => shipRedistribution(row.id)}
                className="h-8 text-xs font-semibold gap-1"
              >
                <Truck className="h-3.5 w-3.5" /> Ship
              </Button>
            )}
            {row.status === 'Shipped' && (isToHospital || canApprove) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => receiveRedistribution(row.id)}
                className="h-8 text-xs font-semibold gap-1 text-success border-success/35 hover:bg-success/10"
              >
                <PackageCheck className="h-3.5 w-3.5" /> Acknowledge Receipt
              </Button>
            )}
            {row.status === 'Received' && (
              <span className="text-xs text-success font-semibold flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Received
              </span>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            AI Supply Chain & Resource Redistribution
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
            Inter-facility supply balancing, transit schedules, and logistics lanes
          </p>
        </div>
        <div>
          <Button
            onClick={() => setIsNewModalOpen(true)}
            className="h-9 gap-1.5 text-xs font-semibold shadow-md"
          >
            <Plus className="h-4 w-4" /> Suggest Supply Reallocation
          </Button>
        </div>
      </div>

      {/* Roster & Grid Ledger */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: LEDGER */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Logistics Lanes
              </span>
              <h3 className="text-sm font-bold text-foreground mt-0.5">
                Active Supply Reallocation Ledger
              </h3>
            </div>

            <Table
              columns={columns}
              data={redistributionRequests}
              emptyMessage="No reallocation processes are currently in the queue."
            />
          </Card>
        </div>

        {/* Right Side: AI Helper explanation */}
        <div className="space-y-6">
          {/* AI Helper */}
          <Card className="border-primary/20 bg-primary/[0.01] p-4 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4.5 w-4.5 text-primary shrink-0 animate-pulse" />
              <div>
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">
                  Operations Assistant
                </span>
                <h3 className="text-xs font-bold text-foreground leading-none mt-0.5">
                  How Redistribution Works
                </h3>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
              <p>
                HealthSync AI monitors safety stock margins at every node in the district. When a facility breaches its safety threshold (e.g. Paracetamol tablets under 300), the system scans nearby hospitals for surpluses.
              </p>
              <div className="rounded border border-border/80 bg-card p-3 space-y-2 text-foreground/80">
                <div className="flex gap-2 items-center">
                  <Badge variant="default" className="scale-90">1. Pending</Badge>
                  <span>Request created by AI recommendation.</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant="warning" className="scale-90">2. Approved</Badge>
                  <span>District Supervisor authorizes route details.</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant="info" className="scale-90">3. Shipped</Badge>
                  <span>Source hospital dispatches supply vehicle (deducts stock).</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant="success" className="scale-90">4. Received</Badge>
                  <span>Destination accepts package (increases stock ledger).</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Suggest Reallocation Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Propose AI Supply Reallocation"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateSubmit}>
              Queue Transfer Route
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Supply Medicine / Equipment"
            options={medicineOptions}
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
          />

          <Input
            label="Reallocation Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min={1}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Source Surplus Node"
              options={hospitalOptions}
              value={fromHospitalId}
              onChange={(e) => setFromHospitalId(e.target.value)}
            />
            <Select
              label="Destination Deficit Node"
              options={hospitalOptions}
              value={toHospitalId}
              onChange={(e) => setToHospitalId(e.target.value)}
            />
          </div>

          <Select
            label="Urgency Protocol"
            options={[
              { value: 'High', label: 'High Urgency (Emergency Courier)' },
              { value: 'Medium', label: 'Medium Urgency (Routine Truck)' },
              { value: 'Low', label: 'Low Urgency (Scheduled Replenishment)' }
            ]}
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as any)}
          />
        </div>
      </Modal>
    </div>
  );
};
