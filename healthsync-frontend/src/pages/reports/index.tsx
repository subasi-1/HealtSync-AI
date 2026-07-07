import React, { useState } from 'react';
import { Card, Badge, Button, Table } from '../../components/common';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle,
  Sparkles,
  Printer,
  FileSpreadsheet,
  FileUp
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export const Reports: React.FC = () => {
  const { addToast } = useApp();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  // Daily Operational Metrics
  const dailyMetrics = [
    { id: 'dm-1', indicator: 'Admissions Census (OPD/IPD)', val: '185 patients', status: 'Stable' },
    { id: 'dm-2', indicator: 'Critical ICU Bed Capacity', val: '75% occupancy', status: 'Optimal' },
    { id: 'dm-3', indicator: 'Pending Diagnostics Queue', val: '14 orders', status: 'Normal' },
    { id: 'dm-4', indicator: 'Safety Stock Outages', val: '2 items flagged', status: 'Low Risk' }
  ];

  // Weekly Operational Metrics
  const weeklyMetrics = [
    { id: 'wm-1', indicator: 'Aggregated Patient Inflow', val: '1,280 admissions', status: '+12% spike' },
    { id: 'wm-2', indicator: 'Roster Compliance Rating', val: '91% attendance', status: 'High' },
    { id: 'wm-3', indicator: 'Medicine Redistributions', val: '4 shipments', status: 'Stabilized' },
    { id: 'wm-4', indicator: 'Lab Test Output Release', val: '154 completed', status: 'Fast' }
  ];

  // Monthly Operational Metrics
  const monthlyMetrics = [
    { id: 'mm-1', indicator: 'Influenza-like Outbreak Watch', val: 'Yellow alert trigger', status: 'Active' },
    { id: 'mm-2', indicator: 'Average ICU Bed Utilization', val: '78.5% capacity', status: 'Safe bounds' },
    { id: 'mm-3', indicator: 'Total Chemical Reagents Used', val: '450 test-kits', status: 'Stable' },
    { id: 'mm-4', indicator: 'Sovereign Node Auditing Rating', val: '94.5 score index', status: 'Excellent' }
  ];

  const handleDownloadReport = (format: 'PDF' | 'Excel') => {
    addToast(`Bundling ${reportType} report into ${format} format...`, 'info');
    setTimeout(() => {
      // Simulate file download
      const link = document.createElement("a");
      link.setAttribute("href", "#");
      link.setAttribute("download", `${reportType}_report.${format === 'PDF' ? 'pdf' : 'xlsx'}`);
      addToast(`${format} Report downloaded successfully`, 'success');
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
    addToast('Print command sent to browser spooler', 'success');
  };

  const trendData = [
    { month: 'Jan', Cases: 400 },
    { month: 'Feb', Cases: 650 },
    { month: 'Mar', Cases: 520 },
    { month: 'Apr', Cases: 800 },
    { month: 'May', Cases: 920 },
    { month: 'Jun', Cases: 1100 },
    { month: 'Jul', Cases: 1300 }
  ];

  const reportList = reportType === 'daily' 
    ? dailyMetrics 
    : reportType === 'weekly' 
      ? weeklyMetrics 
      : monthlyMetrics;

  const columns = [
    {
      header: 'Operational Indicator',
      accessor: (row: typeof dailyMetrics[0]) => (
        <div className="flex items-center gap-2.5">
          <FileText className="h-4.5 w-4.5 text-primary shrink-0" />
          <span className="font-semibold text-foreground">{row.indicator}</span>
        </div>
      )
    },
    {
      header: 'Telemetry Value',
      accessor: (row: typeof dailyMetrics[0]) => (
        <span className="text-xs text-foreground/80 font-bold">{row.val}</span>
      )
    },
    {
      header: 'Audit status',
      accessor: (row: typeof dailyMetrics[0]) => {
        const isSpike = row.status.includes('spike') || row.status.includes('Active');
        return (
          <Badge variant={isSpike ? 'destructive' : 'success'}>
            {row.status}
          </Badge>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Reports & Analytical Catalogs
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
            Download operational metrics and review historical inpatient trends
          </p>
        </div>
        
        {/* Actions bar */}
        <div className="flex gap-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Printer className="h-4 w-4" /> Print Report
          </Button>
          <Button
            onClick={() => handleDownloadReport('PDF')}
            variant="outline"
            className="h-9 gap-1.5 text-xs font-semibold border-red-500/20 text-red-500 hover:bg-red-500/5"
          >
            <FileUp className="h-4 w-4" /> Export PDF
          </Button>
          <Button
            onClick={() => handleDownloadReport('Excel')}
            variant="outline"
            className="h-9 gap-1.5 text-xs font-semibold border-success/20 text-success hover:bg-success/5"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </Button>
        </div>
      </div>

      {/* Report Segment selection */}
      <div className="flex gap-2 bg-muted/40 p-1.5 rounded-lg border border-border/80 w-fit select-none">
        {(['daily', 'weekly', 'monthly'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              reportType === type
                ? 'bg-background text-foreground shadow-sm font-extrabold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {type} Report
          </button>
        ))}
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports ledger */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Summary details
              </span>
              <h3 className="text-sm font-bold text-foreground mt-0.5 capitalize">
                {reportType} Health Operations Ledger
              </h3>
            </div>
            
            <Table
              columns={columns}
              data={reportList}
              emptyMessage="No historical logs found."
            />
          </Card>
        </div>

        {/* Chart representation */}
        <div className="space-y-6">
          <Card className="p-4">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Long-Term Census
              </span>
              <h3 className="text-xs font-bold text-foreground mt-0.5">
                Annual Patient admissions flow
              </h3>
            </div>

            <div className="h-[220px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.06)" />
                  <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                  <Area type="monotone" name="Inflow Cases" dataKey="Cases" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCases)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Reports;
