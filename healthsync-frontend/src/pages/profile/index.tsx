import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Badge, Button, Input, Table, Modal } from '../../components/common';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  Phone,
  FileCheck2,
  CheckCircle,
  FileText,
  Upload,
  Eye,
  Download,
  Trash2,
  Clock,
  History,
  Info
} from 'lucide-react';
import { cn } from '../../utils';

interface DocumentFile {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
}

export const UserProfile: React.FC = () => {
  const { currentUser, activityLogs, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'audit'>('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [contact, setContact] = useState('+91 98765 43210');

  // Document states
  const [uploadedFiles, setUploadedFiles] = useState<DocumentFile[]>([
    { id: 'doc-1', name: 'medical_officer_licensing.pdf', size: '1.4 MB', type: 'PDF', date: '2026-07-01 10:15 AM' },
    { id: 'doc-2', name: 'flu_inflow_prescription_template.docx', size: '420 KB', type: 'DOCX', date: '2026-07-03 04:30 PM' },
    { id: 'doc-3', name: 'sunset_phc_reagent_audit.xlsx', size: '2.1 MB', type: 'XLSX', date: '2026-07-04 11:00 AM' }
  ]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    addToast('Officer profile credentials updated successfully', 'success');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc: DocumentFile = {
      id: `doc-${Date.now()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.name.split('.').pop()?.toUpperCase() || 'PDF',
      date: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
    };

    setUploadedFiles(prev => [newDoc, ...prev]);
    addToast(`Document "${file.name}" uploaded successfully`, 'success');
  };

  const handleDeleteFile = (id: string, name: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    addToast(`Document "${name}" removed`, 'info');
  };

  const handleDownloadFile = (name: string) => {
    const element = document.createElement("a");
    const fileBlob = new Blob([`Mock content of ${name}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast(`Downloading document: ${name}`, 'success');
  };

  const handlePreviewFile = (doc: DocumentFile) => {
    setSelectedDoc(doc);
    setIsPreviewOpen(true);
  };

  // Activity logs table definition
  const auditColumns = [
    {
      header: 'Event Stamp',
      accessor: (row: typeof activityLogs[0]) => (
        <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> {row.timestamp}
        </span>
      )
    },
    {
      header: 'Audit Action / CRUD Details',
      accessor: (row: typeof activityLogs[0]) => (
        <span className="font-semibold text-foreground text-xs leading-relaxed">{row.action}</span>
      )
    },
    {
      header: 'Officer',
      accessor: (row: typeof activityLogs[0]) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{row.actor}</span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">{row.role}</span>
        </div>
      )
    },
    {
      header: 'Node Facility',
      accessor: (row: typeof activityLogs[0]) => (
        <Badge variant="outline" className="text-[10px]">
          {row.facilityName}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> User Account Directory
          </h2>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
            Access officer logs, credentials audits, activity registries, and files
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-muted/40 p-1.5 rounded-lg border border-border/80 w-fit select-none">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            "rounded px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all",
            activeTab === 'profile'
              ? 'bg-background text-foreground shadow-sm font-extrabold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Officer Profile
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={cn(
            "rounded px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all",
            activeTab === 'audit'
              ? 'bg-background text-foreground shadow-sm font-extrabold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          System Activity Logs
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* Left Side: Avatar Card */}
          <div className="space-y-6">
            <Card className="p-6 flex flex-col items-center text-center">
              <img
                src={currentUser.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                alt="Profile Avatar"
                className="h-24 w-24 rounded-full border border-border bg-muted object-cover mb-4"
              />
              <h3 className="text-base font-bold text-foreground truncate max-w-[200px]">
                {userName}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{currentUser.email}</p>
              
              <Badge variant="default" className="mt-3 capitalize">
                {currentUser.role.toLowerCase().replace('_', ' ')}
              </Badge>

              <div className="w-full border-t border-border/80 pt-4 mt-4 space-y-2.5 text-xs text-left">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Authority:
                  </span>
                  <span className="font-bold text-foreground">Active Roster</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-primary" /> Tenant Node:
                  </span>
                  <span className="font-bold text-foreground truncate max-w-[140px]">
                    {currentUser.facilityName || 'District HQ'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Simulated File Management Card */}
            <Card className="p-4 space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none block">
                Prescriptions & Reports
              </span>
              <div className="border-2 border-dashed border-border/80 rounded-lg p-4 text-center cursor-pointer hover:border-primary/55 transition-colors relative">
                <input
                  type="file"
                  onChange={handleUploadFile}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept=".pdf,.docx,.xlsx,.txt"
                />
                <Upload className="h-6 w-6 text-primary mx-auto mb-2 animate-bounce" />
                <span className="text-xs font-semibold text-foreground block">Upload Document File</span>
                <span className="text-[10px] text-muted-foreground block mt-1">PDF, DOCX, XLSX up to 5MB</span>
              </div>
            </Card>
          </div>

          {/* Right Side: Account Editor & File List */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-foreground">
                  Modify Officer Credentials
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update contact directories for administrative escalation grids.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Legal Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                  <Input
                    label="Clinical Phone Directory"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Registered Health Domain Email"
                    value={currentUser.email}
                    disabled
                    helperText="Domain authentication locked by department security."
                  />
                  <Input
                    label="District License / Registry Index"
                    value="SEC-HS-2026-99"
                    disabled
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" className="text-xs font-bold shadow-md">
                    Sync Profile Credentials
                  </Button>
                </div>
              </form>
            </Card>

            {/* Uploaded Files Table list */}
            <Card className="p-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none block mb-3">
                Repository Files Registry
              </span>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex justify-between items-center border border-border/50 rounded-md p-3 hover:bg-muted/10 transition-colors text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground truncate max-w-[200px] md:max-w-xs">{file.name}</p>
                        <span className="text-[9px] text-muted-foreground font-semibold">{file.size} • Uploaded: {file.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePreviewFile(file)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Preview Document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadFile(file.name)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        title="Remove Document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Activity Logs Audit Ledger */}
      {activeTab === 'audit' && (
        <Card className="p-4 animate-fade-in">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none block">
              Audit Trail
            </span>
            <h3 className="text-sm font-bold text-foreground mt-0.5">
              General Operations Action logs
            </h3>
          </div>

          <Table
            columns={auditColumns}
            data={activityLogs}
            emptyMessage="Activity log directory is empty."
          />
        </Card>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Preview Document: ${selectedDoc?.name}`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={() => { setIsPreviewOpen(false); handleDownloadFile(selectedDoc?.name || ''); }}>
              Download PDF File
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs leading-normal">
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded p-2.5 text-primary text-[10px] font-bold uppercase tracking-wider leading-none select-none">
            <Info className="h-4 w-4 shrink-0" />
            Decrypted under Sovereign Officer clearance token
          </div>
          <div className="bg-muted p-4 rounded border border-border/80 font-mono text-[10px] text-muted-foreground space-y-2 leading-relaxed">
            <p className="font-bold text-foreground text-xs uppercase border-b border-border/60 pb-1.5 mb-2">
              HealthSync AI Document Telemetry
            </p>
            <p>**Document ID:** {selectedDoc?.id}</p>
            <p>**File Name:** {selectedDoc?.name}</p>
            <p>**Payload Extension:** {selectedDoc?.type}</p>
            <p>**Registry Date:** {selectedDoc?.date}</p>
            <p className="text-foreground/90 font-bold border-t border-border/40 pt-2 mt-2">
              CLINICAL ADVISORY PREVIEW LOGS:
            </p>
            <p>
              This document indexes safety telemetry allocations for the central health node. All stock modifications, ICU admissions, and redistribution requests are audited under HIPAA rules.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default UserProfile;
