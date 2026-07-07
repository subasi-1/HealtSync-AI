import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Badge, Button, Table, Modal, Input, Select } from '../../components/common';
import { useInventoryQuery } from '../../hooks';
import { 
  Pill, 
  Search, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  FileSpreadsheet,
  AlertOctagon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export const MedicineInventory: React.FC = () => {
  const { 
    activeHospitalId, 
    currentUser, 
    addMedicine, 
    editMedicine, 
    deleteMedicine,
    dispenseMedicine
  } = useApp();

  const { data: inventory = [], isLoading } = useInventoryQuery(
    currentUser?.role === 'SUPER_ADMIN' ? undefined : activeHospitalId
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Add Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Medication');
  const [formBatch, setFormBatch] = useState('');
  const [formStock, setFormStock] = useState<number>(0);
  const [formUnit, setFormUnit] = useState('vials');
  const [formThreshold, setFormThreshold] = useState<number>(0);
  const [formExpiry, setFormExpiry] = useState('');
  const [formMfg, setFormMfg] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Categories list
  const categories = ['ALL', 'Medication', 'Vaccine', 'Consumable', 'Equipment'];

  // Filter & Sort
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Paginated inventory
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenAdd = () => {
    setFormName('');
    setFormCategory('Medication');
    setFormBatch(`BAT-${Date.now().toString().slice(-6)}`);
    setFormStock(100);
    setFormUnit('vials');
    setFormThreshold(20);
    setFormExpiry('2027-08-30');
    setFormMfg('2026-01-10');
    setFormSupplier('Novartis Pharma');
    setErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setSelectedItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormBatch(item.batchNumber);
    setFormStock(item.stockLevel);
    setFormUnit(item.unit);
    setFormThreshold(item.safetyStockThreshold);
    setFormExpiry(item.expiryDate);
    setFormMfg(item.mfgDate || '2026-01-01');
    setFormSupplier(item.supplier || 'Pfizer Labs');
    setErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (item: any) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formName.trim()) newErrors.name = 'Medicine Name is required';
    if (!formBatch.trim()) newErrors.batch = 'Batch number is required';
    if (formStock < 0) newErrors.stock = 'Stock level cannot be negative';
    if (formThreshold < 0) newErrors.threshold = 'Safety limit cannot be negative';
    if (!formExpiry) newErrors.expiry = 'Expiry date is required';
    if (!formSupplier.trim()) newErrors.supplier = 'Supplier name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubmit = () => {
    if (!validateForm()) return;
    addMedicine({
      name: formName,
      category: formCategory,
      batchNumber: formBatch,
      stockLevel: formStock,
      unit: formUnit,
      safetyStockThreshold: formThreshold,
      expiryDate: formExpiry,
      mfgDate: formMfg,
      supplier: formSupplier,
      dailyConsumptionRate: 15,
      hospitalId: activeHospitalId
    });
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = () => {
    if (!validateForm() || !selectedItem) return;
    editMedicine(selectedItem.id, {
      name: formName,
      category: formCategory,
      batchNumber: formBatch,
      stockLevel: formStock,
      unit: formUnit,
      safetyStockThreshold: formThreshold,
      expiryDate: formExpiry,
      mfgDate: formMfg,
      supplier: formSupplier
    });
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteSubmit = () => {
    if (!selectedItem) return;
    deleteMedicine(selectedItem.id);
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Category', 'Batch', 'Stock Level', 'Unit', 'Safety Threshold', 'Expiry Date', 'Supplier'];
    const rows = filteredInventory.map(item => [
      item.name,
      item.category,
      item.batchNumber,
      item.stockLevel,
      item.unit,
      item.safetyStockThreshold,
      item.expiryDate,
      item.supplier || 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "medicine_inventory_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recharts simulated batch history and demand
  const chartData = selectedItem
    ? [
        { month: 'May', Actual: Math.round(selectedItem.stockLevel * 1.2), Forecast: Math.round(selectedItem.stockLevel * 1.1) },
        { month: 'Jun', Actual: Math.round(selectedItem.stockLevel * 1.0), Forecast: Math.round(selectedItem.stockLevel * 1.0) },
        { month: 'Jul', Actual: selectedItem.stockLevel, Forecast: selectedItem.demandForecastNextMonth || 100 },
        { month: 'Aug', Actual: null, Forecast: Math.round((selectedItem.demandForecastNextMonth || 100) * 1.1) },
        { month: 'Sep', Actual: null, Forecast: Math.round((selectedItem.demandForecastNextMonth || 100) * 1.25) }
      ]
    : [
        { month: 'May', Actual: 1500, Forecast: 1600 },
        { month: 'Jun', Actual: 1800, Forecast: 1750 },
        { month: 'Jul', Actual: 2100, Forecast: 2000 },
        { month: 'Aug', Actual: null, Forecast: 2300 },
        { month: 'Sep', Actual: null, Forecast: 2500 }
      ];

  const columns = [
    {
      header: 'Supply Item Detail',
      accessor: (row: typeof inventory[0]) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-[10px] text-muted-foreground uppercase">{row.category} • Batch: {row.batchNumber}</span>
        </div>
      )
    },
    {
      header: 'Available Stock',
      accessor: (row: typeof inventory[0]) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{row.stockLevel} {row.unit}</span>
          <span className="text-[10px] text-muted-foreground">Consumes {row.dailyConsumptionRate}/day</span>
        </div>
      )
    },
    {
      header: 'Safety Status',
      accessor: (row: typeof inventory[0]) => {
        const isLow = row.stockLevel <= row.safetyStockThreshold;
        return (
          <Badge variant={isLow ? 'destructive' : 'success'}>
            {isLow ? 'Low Stock Outage' : 'Safe Stock level'}
          </Badge>
        );
      }
    },
    {
      header: 'Expiry Warning',
      accessor: (row: typeof inventory[0]) => {
        const expiryDate = new Date(row.expiryDate);
        const daysToExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 3600 * 24));
        const isExpiring = daysToExpiry < 90;
        return (
          <Badge variant={isExpiring ? 'destructive' : 'outline'} className={isExpiring ? 'animate-pulse' : ''}>
            {isExpiring ? `Expiring: ${daysToExpiry}d` : row.expiryDate}
          </Badge>
        );
      }
    },
    {
      header: 'Actions',
      accessor: (row: typeof inventory[0]) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              dispenseMedicine(row.id, 10);
            }}
            className="h-8 w-8 text-success hover:bg-success/10 animate-pulse"
            title="Dispense 10 units to patient"
          >
            <Pill className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row);
            }}
            className="h-8 w-8 text-primary hover:bg-primary/10"
            title="Adjust details"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDelete(row);
            }}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            title="Delete drug record"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
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
            Supply Chain & Medicine Ledger
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
            Pharmacy registers and inventory demand forecasts
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export CSV
          </Button>
          
          <Button
            onClick={handleOpenAdd}
            className="h-9 gap-1.5 text-xs font-semibold shadow-md"
          >
            <Plus className="h-4 w-4" /> Add Supply Item
          </Button>
        </div>
      </div>

      {/* Categories & Search Panel */}
      <Card variant="acrylic" className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Toggles */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/70 text-muted-foreground'
              }`}
            >
              {cat === 'ALL' ? 'Show All' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/60" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by drug name or batch..."
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </Card>

      {/* Main ledger & Analytics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory List Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Stock Ledgers
              </span>
              <h3 className="text-sm font-bold text-foreground mt-0.5">
                Pharmacy Stock Catalog
              </h3>
            </div>

            <Table
              columns={columns}
              data={paginatedInventory}
              isLoading={isLoading}
              emptyMessage="No medicines matched the filter query."
              onRowClick={(row) => setSelectedItem(row)}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/80">
                <span className="text-xs text-muted-foreground">
                  Showing page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Demand Forecast Chart & Expiry details */}
        <div className="space-y-6">
          <Card className="p-4 flex flex-col">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
              <div>
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">
                  Google Health Predictive Model
                </span>
                <h3 className="text-xs font-bold text-foreground mt-0.5">
                  {selectedItem ? `${selectedItem.name} Demand` : 'District Aggregated Demand'}
                </h3>
              </div>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.06)" />
                  <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                  <Legend wrapperStyle={{ fontSize: '9px' }} />
                  <Area type="monotone" name="Actual Consumption" dataKey="Actual" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActual)" strokeWidth={2} connectNulls />
                  <Area type="monotone" name="AI Predicted Need" dataKey="Forecast" stroke="#a855f7" fillOpacity={1} fill="url(#colorForecast)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {selectedItem && (
              <div className="mt-4 pt-3 border-t border-border/80 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Batch Number:</span>
                  <span className="font-bold text-foreground">{selectedItem.batchNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Supplier Node:</span>
                  <span className="font-bold text-foreground">{selectedItem.supplier || 'Novartis Pharma'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Recommended Stockout Refill:</span>
                  <span className="font-bold text-primary flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> {selectedItem.demandForecastNextMonth || 240} units
                  </span>
                </div>
              </div>
            )}
          </Card>

          {selectedItem && (
            <Card className="p-4 space-y-3 animate-fade-in">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none block">
                Batch Registry History
              </span>
              <div className="space-y-2 text-[11px] leading-relaxed">
                <div className="flex justify-between border-b border-border/40 pb-1.5 font-bold text-foreground/80">
                  <span>Batch ID</span>
                  <span>Quantity</span>
                  <span>Status</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span className="font-mono text-primary font-bold">{selectedItem.batchNumber}</span>
                  <span className="font-bold text-foreground">{selectedItem.stockLevel} {selectedItem.unit}</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5 text-muted-foreground">
                  <span className="font-mono">BAT-REF-094</span>
                  <span>100 {selectedItem.unit}</span>
                  <Badge variant="outline">Distributed</Badge>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="font-mono">BAT-REF-012</span>
                  <span>250 {selectedItem.unit}</span>
                  <Badge variant="outline">Expired</Badge>
                </div>
              </div>
            </Card>
          )}

          {selectedItem && (
            <Card className="p-4 space-y-3 animate-fade-in">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none block">
                Stock Transaction Timeline
              </span>
              <div className="relative pl-4 border-l border-border/80 ml-2 space-y-4 text-[11px] leading-relaxed">
                <div className="relative">
                  <span className="absolute -left-5 top-1 h-2 w-2 rounded-full bg-success ring-4 ring-background" />
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">Dispensed 10 {selectedItem.unit}</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5">Today, 10:15 AM • OPD Pharmacy Desk</span>
                  </div>
                </div>
                <div className="relative text-muted-foreground">
                  <span className="absolute -left-5 top-1 h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground/80">Stock Received Refill</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5">Yesterday, 02:00 PM • Novartis Pharma</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add Stock Level Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Medicine/Supply Record"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddSubmit}>
              Save Ledger Item
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5">
          <Input
            label="Medicine/Supply Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            error={errors.name}
            placeholder="E.g., Paracetamol Infusion"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Supply Category"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              options={[
                { value: 'Medication', label: 'Medication' },
                { value: 'Vaccine', label: 'Vaccine' },
                { value: 'Consumable', label: 'Consumable' },
                { value: 'Equipment', label: 'Equipment' }
              ]}
            />
            <Input
              label="Batch Number"
              value={formBatch}
              onChange={(e) => setFormBatch(e.target.value)}
              error={errors.batch}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Initial Stock"
              type="number"
              value={formStock}
              onChange={(e) => setFormStock(Number(e.target.value))}
              error={errors.stock}
            />
            <Input
              label="Stock Unit"
              value={formUnit}
              onChange={(e) => setFormUnit(e.target.value)}
              placeholder="e.g., vials"
            />
            <Input
              label="Safety Limit"
              type="number"
              value={formThreshold}
              onChange={(e) => setFormThreshold(Number(e.target.value))}
              error={errors.threshold}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mfg Date"
              type="date"
              value={formMfg}
              onChange={(e) => setFormMfg(e.target.value)}
            />
            <Input
              label="Expiry Date"
              type="date"
              value={formExpiry}
              onChange={(e) => setFormExpiry(e.target.value)}
              error={errors.expiry}
            />
          </div>
          <Input
            label="Supplier Details"
            value={formSupplier}
            onChange={(e) => setFormSupplier(e.target.value)}
            error={errors.supplier}
            placeholder="E.g., Pfizer Distributors Inc"
          />
        </div>
      </Modal>

      {/* Edit Stock Level Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Supply Details: ${selectedItem?.name}`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleEditSubmit}>
              Update Ledger Item
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5">
          <Input
            label="Medicine/Supply Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            error={errors.name}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              options={[
                { value: 'Medication', label: 'Medication' },
                { value: 'Vaccine', label: 'Vaccine' },
                { value: 'Consumable', label: 'Consumable' },
                { value: 'Equipment', label: 'Equipment' }
              ]}
            />
            <Input
              label="Batch Number"
              value={formBatch}
              onChange={(e) => setFormBatch(e.target.value)}
              error={errors.batch}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Stock Quantity"
              type="number"
              value={formStock}
              onChange={(e) => setFormStock(Number(e.target.value))}
              error={errors.stock}
            />
            <Input
              label="Stock Unit"
              value={formUnit}
              onChange={(e) => setFormUnit(e.target.value)}
            />
            <Input
              label="Safety Limit"
              type="number"
              value={formThreshold}
              onChange={(e) => setFormThreshold(Number(e.target.value))}
              error={errors.threshold}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mfg Date"
              type="date"
              value={formMfg}
              onChange={(e) => setFormMfg(e.target.value)}
            />
            <Input
              label="Expiry Date"
              type="date"
              value={formExpiry}
              onChange={(e) => setFormExpiry(e.target.value)}
              error={errors.expiry}
            />
          </div>
          <Input
            label="Supplier Details"
            value={formSupplier}
            onChange={(e) => setFormSupplier(e.target.value)}
            error={errors.supplier}
          />
        </div>
      </Modal>

      {/* Delete Record Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Record Deletion"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteSubmit}>
              Remove Record
            </Button>
          </div>
        }
      >
        <div className="flex gap-3 items-center">
          <AlertOctagon className="h-10 w-10 text-destructive shrink-0" />
          <p className="text-xs text-muted-foreground">
            Warning: You are about to permanently delete **{selectedItem?.name}** (Batch: {selectedItem?.batchNumber}) from clinical ledger system audits. This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};
export default MedicineInventory;
