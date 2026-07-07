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
  FileUp,
  History,
  Timer,
  Info
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '../../utils';

interface ScheduledReport {
  id: string;
  title: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  recipients: string;
  nextRun: string;
  status: 'Active' | 'Paused';
}

interface DownloadHistory {
  id: string;
  name: string;
  format: 'PDF' | 'CSV';
  user: string;
  timestamp: string;
  size: string;
}

export const Reports: React.FC = () => {
  const { 
    addToast, 
    inventory, 
    beds, 
    doctors, 
    patients, 
    activeHospitalId, 
    hospitals,
    currentUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'metrics' | 'scheduled' | 'downloads'>('metrics');
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const currentHospital = hospitals.find(h => h.id === activeHospitalId) || hospitals[0];

  // Scheduled reports list
  const [scheduledList, setScheduledList] = useState<ScheduledReport[]>([
    { id: 'sch-1', title: 'Daily Low Stock Supply alerts', frequency: 'Daily', recipients: 'district.officer@health.gov', nextRun: 'Tomorrow, 08:00 AM', status: 'Active' },
    { id: 'sch-2', title: 'Weekly Bed Occupancy Capacity review', frequency: 'Weekly', recipients: 'hospital.admin@health.gov', nextRun: 'Monday, 09:00 AM', status: 'Active' },
    { id: 'sch-3', title: 'Monthly District Performance scoring index', frequency: 'Monthly', recipients: 'super.admin@health.gov', nextRun: 'Aug 01, 12:00 AM', status: 'Paused' }
  ]);

  // Downloads history list
  const [downloadsHistory, setDownloadsHistory] = useState<DownloadHistory[]>([
    { id: 'dl-1', name: 'weekly_operational_report_Jul04.pdf', format: 'PDF', user: currentUser?.name || 'Dr. Amit', timestamp: '2026-07-04 04:30 PM', size: '1.2 MB' },
    { id: 'dl-2', name: 'daily_stock_inventory_ledger.csv', format: 'CSV', user: currentUser?.name || 'Dr. Amit', timestamp: '2026-07-04 11:00 AM', size: '420 KB' }
  ]);

  // Daily Operational Metrics
  const dailyMetrics = [
    { id: 'dm-1', indicator: 'Admissions Census (OPD/IPD)', val: `${patients.length} patients active`, status: 'Stable' },
    { id: 'dm-2', indicator: 'Critical ICU Bed Capacity', val: `${beds.filter(b => b.wardType === 'ICU' && b.status === 'Occupied').length} of ${beds.filter(b => b.wardType === 'ICU').length} occupied`, status: 'Optimal' },
    { id: 'dm-3', indicator: 'General Bed Availability', val: `${beds.filter(b => b.wardType === 'General' && b.status === 'Available').length} free beds`, status: 'Normal' },
    { id: 'dm-4', indicator: 'Safety Stock Outages', val: `${inventory.filter(item => item.stockLevel <= item.safetyStockThreshold).length} items flagged`, status: 'Low Risk' }
  ];

  // Weekly Operational Metrics
  const weeklyMetrics = [
    { id: 'wm-1', indicator: 'Aggregated Patient Inflow', val: `${patients.length * 7} admissions est.`, status: '+12% spike' },
    { id: 'wm-2', indicator: 'Roster Compliance Rating', val: `${doctors.filter(d => d.status === 'Active').length} of ${doctors.length} doctors online`, status: 'High' },
    { id: 'wm-3', indicator: 'Critical Safety alerts count', val: '2 items flagged', status: 'Stabilized' },
    { id: 'wm-4', indicator: 'Lab Test Output Release', val: '154 completed', status: 'Fast' }
  ];

  // Monthly Operational Metrics
  const monthlyMetrics = [
    { id: 'mm-1', indicator: 'Influenza-like Outbreak Watch', val: 'Yellow alert trigger', status: 'Active' },
    { id: 'mm-2', indicator: 'Average ICU Bed Utilization', val: '78.5% capacity', status: 'Safe bounds' },
    { id: 'mm-3', indicator: 'Total Chemical Reagents Used', val: '450 test-kits', status: 'Stable' },
    { id: 'mm-4', indicator: 'Sovereign Node Auditing Rating', val: '94.5 score index', status: 'Excellent' }
  ];

  const reportList = reportType === 'daily' 
    ? dailyMetrics 
    : reportType === 'weekly' 
      ? weeklyMetrics 
      : monthlyMetrics;

  const handlePrint = () => {
    window.print();
    addToast('Print friendly format opened', 'success');
  };

  const handleDownloadCSV = () => {
    addToast(`Compiling CSV operational metrics...`, 'info');
    const headers = ['Operational Indicator', 'Telemetry Value', 'Audit Status'];
    const rows = reportList.map(item => [item.indicator, item.val, item.status]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_operational_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Add to download history log
    const newDownload: DownloadHistory = {
      id: `dl-${Date.now()}`,
      name: `${reportType}_operational_report.csv`,
      format: 'CSV',
      user: currentUser?.name || 'Dr. Amit',
      timestamp: new Date().toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      size: '24 KB'
    };
    setDownloadsHistory(prev => [newDownload, ...prev]);
    addToast('CSV downloaded successfully', 'success');
  };

  const handleDownloadPDF = () => {
    addToast(`Generating professional PDF via jsPDF engine...`, 'info');

    // 1. Instantiate jsPDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width || 210;

    // 2. HealthSync AI Branding
    doc.setFillColor(59, 130, 246); // Primary Blue #3b82f6
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("HEALTHSYNC AI", 15, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Sovereign Health Intelligence Command Hub", 15, 24);

    // 3. Report metadata
    doc.setTextColor(51, 51, 51);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${reportType.toUpperCase()} OPERATIONS SUMMARY`, 15, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(119, 119, 119);
    doc.text(`Generated At: ${new Date().toLocaleString()}`, 15, 48);
    doc.text(`Facility Tenant: ${currentHospital?.name || 'District HQ Office'}`, 15, 53);

    // 4. Draw horizontal divider
    doc.setDrawColor(220, 220, 220);
    doc.line(15, 58, pageWidth - 15, 58);

    // 5. KPI Summary Cards (ICU occupancy, online doctors, low stocks)
    const icuOccupied = beds.filter(b => b.wardType === 'ICU' && b.status === 'Occupied').length;
    const icuTotal = beds.filter(b => b.wardType === 'ICU').length;
    const onlineDocs = doctors.filter(d => d.status === 'Active').length;
    const lowStockCount = inventory.filter(i => i.stockLevel <= i.safetyStockThreshold).length;

    doc.setFillColor(243, 244, 246); // Light gray
    doc.rect(15, 64, 55, 24, 'F');
    doc.setTextColor(51, 51, 51);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${icuOccupied}/${icuTotal}`, 20, 72);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("ICU Beds Occupancy", 20, 80);

    doc.setFillColor(243, 244, 246);
    doc.rect(78, 64, 55, 24, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${onlineDocs} Online`, 83, 72);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Rostered Doctors active", 83, 80);

    doc.setFillColor(243, 244, 246);
    doc.rect(140, 64, 55, 24, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${lowStockCount} Flagged`, 145, 72);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Medicine Outage Alerts", 145, 80);

    // 6. Main Data autoTable
    const tableHeaders = [['Operational Indicator', 'Current Value / Telemetry', 'Status']];
    const tableBody = reportList.map(item => [item.indicator, item.val, item.status]);

    autoTable(doc, {
      startY: 96,
      head: tableHeaders,
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 4 },
      margin: { left: 15, right: 15 }
    });

    // 7. AI Insights
    let finalY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(168, 85, 247); // AI Purple #a855f7
    doc.text("AI Generated Insights & Recommendations:", 15, finalY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(85, 85, 85);
    doc.text("- Recommendation: Redistribute paracetamol tablets from Valley CHC surplus inventory.", 15, finalY + 7);
    doc.text("- Operational Advisory: Shift General ward bed occupancy ratios to stabilize local strain.", 15, finalY + 13);

    // 8. Footer Page Numbers on each page
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(220, 220, 220);
      doc.line(15, doc.internal.pageSize.height - 18, pageWidth - 15, doc.internal.pageSize.height - 18);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("HealthSync AI • Secure Health Operations Portal Dashboard", 15, doc.internal.pageSize.height - 12);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, doc.internal.pageSize.height - 12);
    }

    // 9. Save PDF file
    doc.save(`${reportType}_operational_report.pdf`);

    // Add to download history
    const newDownload: DownloadHistory = {
      id: `dl-${Date.now()}`,
      name: `${reportType}_operational_report.pdf`,
      format: 'PDF',
      user: currentUser?.name || 'Dr. Amit',
      timestamp: new Date().toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      size: '1.2 MB'
    };
    setDownloadsHistory(prev => [newDownload, ...prev]);
    addToast('PDF downloaded successfully', 'success');
  };

  const handleToggleSchedule = (id: string) => {
    setScheduledList(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'Active' ? 'Paused' : 'Active';
        addToast(`Report schedule status toggled to ${nextStatus}`, 'info');
        return { ...s, status: nextStatus };
      }
      return s;
    }));
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
      header: 'Audit Status',
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

  const scheduledColumns = [
    {
      header: 'Automation Report Name',
      accessor: (row: ScheduledReport) => (
        <div className="flex items-center gap-2.5">
          <Timer className="h-4.5 w-4.5 text-primary shrink-0 animate-spin-slow" />
          <span className="font-bold text-foreground text-xs">{row.title}</span>
        </div>
      )
    },
    {
      header: 'Run Frequency',
      accessor: (row: ScheduledReport) => (
        <Badge variant="outline" className="text-[10px] font-bold tracking-wider">{row.frequency}</Badge>
      )
    },
    {
      header: 'Target Escalate Email',
      accessor: (row: ScheduledReport) => <span className="text-muted-foreground font-mono">{row.recipients}</span>
    },
    {
      header: 'Next Trigger Stamp',
      accessor: (row: ScheduledReport) => <span className="text-muted-foreground font-semibold flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {row.nextRun}</span>
    },
    {
      header: 'Status',
      accessor: (row: ScheduledReport) => (
        <Button
          type="button"
          variant="ghost"
          onClick={() => handleToggleSchedule(row.id)}
          className={cn(
            "text-[10px] py-1 px-2 font-bold h-7",
            row.status === 'Active' ? 'text-success hover:bg-success/10' : 'text-slate-400 hover:bg-slate-100'
          )}
        >
          {row.status}
        </Button>
      )
    }
  ];

  const downloadsColumns = [
    {
      header: 'Downloaded File Name',
      accessor: (row: DownloadHistory) => (
        <span className="font-bold text-foreground text-xs flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary shrink-0" /> {row.name}
        </span>
      )
    },
    {
      header: 'Format',
      accessor: (row: DownloadHistory) => <Badge variant={row.format === 'PDF' ? 'destructive' : 'success'}>{row.format}</Badge>
    },
    {
      header: 'User Session',
      accessor: (row: DownloadHistory) => <span className="text-muted-foreground font-semibold">{row.user}</span>
    },
    {
      header: 'Timestamp',
      accessor: (row: DownloadHistory) => <span className="text-muted-foreground">{row.timestamp}</span>
    },
    {
      header: 'File Size',
      accessor: (row: DownloadHistory) => <span className="text-muted-foreground font-bold">{row.size}</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Reports & Analytical Catalogs
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
            Download operational metrics and review historical inpatient trends
          </p>
        </div>
        
        {/* Actions bar */}
        {activeTab === 'metrics' && (
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="h-9 gap-1.5 text-xs font-semibold"
            >
              <Printer className="h-4 w-4" /> Print Report
            </Button>
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="h-9 gap-1.5 text-xs font-semibold border-red-500/20 text-red-500 hover:bg-red-500/5 animate-pulse"
            >
              <FileUp className="h-4 w-4" /> Export PDF
            </Button>
            <Button
              onClick={handleDownloadCSV}
              variant="outline"
              className="h-9 gap-1.5 text-xs font-semibold border-success/20 text-success hover:bg-success/5"
            >
              <FileSpreadsheet className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        )}
      </div>

      {/* Segment Navigation tabs */}
      <div className="flex gap-2 bg-muted/40 p-1.5 rounded-lg border border-border/80 w-fit select-none">
        <button
          onClick={() => setActiveTab('metrics')}
          className={cn(
            "rounded px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all",
            activeTab === 'metrics'
              ? 'bg-background text-foreground shadow-sm font-extrabold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Operational metrics
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={cn(
            "rounded px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all",
            activeTab === 'scheduled'
              ? 'bg-background text-foreground shadow-sm font-extrabold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Scheduled reports
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          className={cn(
            "rounded px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all",
            activeTab === 'downloads'
              ? 'bg-background text-foreground shadow-sm font-extrabold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Downloads history
        </button>
      </div>

      {/* TAB 1: OPERATIONAL METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-6 animate-fade-in">
          {/* Report type selection buttons */}
          <div className="flex gap-1.5 bg-muted/20 p-1 rounded-md border border-border/60 w-fit">
            {(['daily', 'weekly', 'monthly'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={cn(
                  "rounded px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all",
                  reportType === type
                    ? 'bg-primary text-primary-foreground font-extrabold shadow'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
      )}

      {/* TAB 2: SCHEDULED REPORTS */}
      {activeTab === 'scheduled' && (
        <Card className="p-4 animate-fade-in">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Automation scheduler
            </span>
            <h3 className="text-sm font-bold text-foreground mt-0.5">
              Scheduled Operations Reports
            </h3>
          </div>
          <Table
            columns={scheduledColumns}
            data={scheduledList}
            emptyMessage="No scheduled reports configured."
          />
        </Card>
      )}

      {/* TAB 3: DOWNLOADS HISTORY */}
      {activeTab === 'downloads' && (
        <Card className="p-4 animate-fade-in">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Audit log
            </span>
            <h3 className="text-sm font-bold text-foreground mt-0.5">
              Export and Download Histories
            </h3>
          </div>
          <Table
            columns={downloadsColumns}
            data={downloadsHistory}
            emptyMessage="No file exports history logged."
          />
        </Card>
      )}
    </div>
  );
};
export default Reports;
