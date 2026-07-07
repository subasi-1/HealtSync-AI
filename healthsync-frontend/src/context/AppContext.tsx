import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, Hospital, InventoryItem, Bed, Doctor, 
  PatientFootfall, LabTest, RedistributionRequest, 
  SystemAlert, ActivityLog, ChatMessage, Role, Toast, Patient
} from '../types';

interface AppContextType {
  currentUser: User | null;
  theme: 'light' | 'dark';
  hospitals: Hospital[];
  inventory: InventoryItem[];
  beds: Bed[];
  doctors: Doctor[];
  redistributionRequests: RedistributionRequest[];
  laboratoryTests: LabTest[];
  alerts: SystemAlert[];
  patients: Patient[];
  activityLogs: ActivityLog[];
  chatMessages: ChatMessage[];
  activeDistrictId: string;
  activeHospitalId: string;
  isChatOpen: boolean;
  toasts: Toast[];
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  addMedicine: (item: any) => void;
  editMedicine: (id: string, updates: any) => void;
  deleteMedicine: (id: string) => void;
  assignShift: (doctorId: string, shift: Doctor['shift'], department?: string) => void;
  requestLeave: (doctorId: string, isLeave: boolean) => void;
  registerPatient: (patient: any) => void;
  login: (email: string, role: Role, facilityId?: string) => Promise<boolean>;
  logout: () => void;
  toggleTheme: () => void;
  setActiveHospitalId: (id: string) => void;
  setChatOpen: (isOpen: boolean) => void;
  updateInventoryStock: (itemId: string, newStock: number) => void;
  transferBed: (bedId: string, updates: Partial<Bed>) => void;
  updateDoctorStatus: (doctorId: string, status: 'Active' | 'Standby' | 'Off-Duty') => void;
  approveRedistribution: (requestId: string) => void;
  shipRedistribution: (requestId: string) => void;
  receiveRedistribution: (requestId: string) => void;
  createRedistributionRequest: (medicineName: string, quantity: number, fromHospitalId: string, toHospitalId: string, urgency: 'High' | 'Medium' | 'Low') => void;
  addLabTest: (patientName: string, testType: LabTest['testType'], technician?: string) => void;
  updateCollectionStatus: (testId: string, status: LabTest['collectionStatus']) => void;
  completeLabTest: (testId: string, value: string, isCritical: boolean, reagentLevel: 'Critical' | 'Low' | 'Normal') => void;
  acknowledgeAlert: (alertId: string) => void;
  sendChatMessage: (text: string) => void;
  triggerMockSync: () => void;
  dispenseMedicine: (id: string, qty: number) => void;
  dischargePatient: (id: string) => void;
  seedDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Core Mock Data Setup
const mockHospitals: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Metro General District Hospital',
    district: 'District-A (Central)',
    type: 'District Hospital',
    bedsCount: { total: 120, occupied: 98, available: 22 },
    doctorCount: { total: 45, active: 32, standby: 8 },
    activeAlertsCount: 3,
    location: [12.9716, 77.5946]
  },
  {
    id: 'hosp-2',
    name: 'Valley Community Health Center',
    district: 'District-A (Central)',
    type: 'CHC',
    bedsCount: { total: 40, occupied: 15, available: 25 },
    doctorCount: { total: 12, active: 8, standby: 2 },
    activeAlertsCount: 1,
    location: [12.9816, 77.6046]
  },
  {
    id: 'hosp-3',
    name: 'Sunset Primary Health Center',
    district: 'District-A (Central)',
    type: 'PHC',
    bedsCount: { total: 15, occupied: 12, available: 3 },
    doctorCount: { total: 4, active: 3, standby: 1 },
    activeAlertsCount: 4,
    location: [12.9516, 77.5846]
  },
  {
    id: 'hosp-4',
    name: 'Apex Cardiac & Specialty Clinic',
    district: 'District-B (East)',
    type: 'Specialty',
    bedsCount: { total: 60, occupied: 54, available: 6 },
    doctorCount: { total: 20, active: 15, standby: 3 },
    activeAlertsCount: 0,
    location: [12.9916, 77.6246]
  }
];

const mockInventory: InventoryItem[] = [
  // Metro General Inventory
  {
    id: 'inv-1',
    name: 'Paracetamol 500mg Tablets',
    category: 'Medication',
    batchNumber: 'PR-2026-08',
    stockLevel: 1200,
    safetyStockThreshold: 1500,
    expiryDate: '2026-10-15',
    unit: 'Tablets',
    hospitalId: 'hosp-1',
    hospitalName: 'Metro General District Hospital',
    dailyConsumptionRate: 150,
    daysOfStockLeft: 8,
    demandForecastNextMonth: 4800
  },
  {
    id: 'inv-2',
    name: 'Oxygen Cylinders 40L',
    category: 'Equipment',
    batchNumber: 'OX-9912',
    stockLevel: 85,
    safetyStockThreshold: 30,
    expiryDate: '2029-12-01',
    unit: 'Cylinders',
    hospitalId: 'hosp-1',
    hospitalName: 'Metro General District Hospital',
    dailyConsumptionRate: 12,
    daysOfStockLeft: 7,
    demandForecastNextMonth: 400
  },
  {
    id: 'inv-3',
    name: 'Amoxicillin 250mg Capsules',
    category: 'Medication',
    batchNumber: 'AM-4022',
    stockLevel: 4500,
    safetyStockThreshold: 2000,
    expiryDate: '2026-07-28', // Expiring soon
    unit: 'Capsules',
    hospitalId: 'hosp-1',
    hospitalName: 'Metro General District Hospital',
    dailyConsumptionRate: 200,
    daysOfStockLeft: 22,
    demandForecastNextMonth: 6200
  },
  {
    id: 'inv-4',
    name: 'IV Fluids (Normal Saline 500ml)',
    category: 'Consumable',
    batchNumber: 'IV-8821',
    stockLevel: 180,
    safetyStockThreshold: 500,
    expiryDate: '2027-03-10',
    unit: 'Bottles',
    hospitalId: 'hosp-1',
    hospitalName: 'Metro General District Hospital',
    dailyConsumptionRate: 60,
    daysOfStockLeft: 3, // CRITICAL
    demandForecastNextMonth: 2000
  },

  // Sunset PHC (Deficit node)
  {
    id: 'inv-5',
    name: 'Paracetamol 500mg Tablets',
    category: 'Medication',
    batchNumber: 'PR-2026-09',
    stockLevel: 80, // High Deficit
    safetyStockThreshold: 300,
    expiryDate: '2026-11-20',
    unit: 'Tablets',
    hospitalId: 'hosp-3',
    hospitalName: 'Sunset Primary Health Center',
    dailyConsumptionRate: 25,
    daysOfStockLeft: 3,
    demandForecastNextMonth: 900
  },
  {
    id: 'inv-6',
    name: 'BCG Vaccine Vials',
    category: 'Vaccine',
    batchNumber: 'BCG-7711',
    stockLevel: 5, // Out of stock risk
    safetyStockThreshold: 25,
    expiryDate: '2026-08-01',
    unit: 'Vials',
    hospitalId: 'hosp-3',
    hospitalName: 'Sunset Primary Health Center',
    dailyConsumptionRate: 2,
    daysOfStockLeft: 2,
    demandForecastNextMonth: 80
  },
  {
    id: 'inv-7',
    name: 'Oxygen Cylinders 40L',
    category: 'Equipment',
    batchNumber: 'OX-9915',
    stockLevel: 2, // Deficit
    safetyStockThreshold: 5,
    expiryDate: '2030-01-01',
    unit: 'Cylinders',
    hospitalId: 'hosp-3',
    hospitalName: 'Sunset Primary Health Center',
    dailyConsumptionRate: 1,
    daysOfStockLeft: 2,
    demandForecastNextMonth: 30
  },

  // Valley CHC (Surplus node for paracetamol and oxygen)
  {
    id: 'inv-8',
    name: 'Paracetamol 500mg Tablets',
    category: 'Medication',
    batchNumber: 'PR-2026-10',
    stockLevel: 4200, // HIGH SURPLUS
    safetyStockThreshold: 1000,
    expiryDate: '2027-02-14',
    unit: 'Tablets',
    hospitalId: 'hosp-2',
    hospitalName: 'Valley Community Health Center',
    dailyConsumptionRate: 40,
    daysOfStockLeft: 105,
    demandForecastNextMonth: 1500
  },
  {
    id: 'inv-9',
    name: 'Oxygen Cylinders 40L',
    category: 'Equipment',
    batchNumber: 'OX-9917',
    stockLevel: 28, // SURPLUS
    safetyStockThreshold: 10,
    expiryDate: '2029-05-15',
    unit: 'Cylinders',
    hospitalId: 'hosp-2',
    hospitalName: 'Valley Community Health Center',
    dailyConsumptionRate: 2,
    daysOfStockLeft: 14,
    demandForecastNextMonth: 80
  }
];

const mockBeds: Bed[] = [
  // ICU Beds
  { id: 'bed-1', roomNumber: 'ICU-101', wardType: 'ICU', status: 'Occupied', patientName: 'John Doe', patientAge: 58, patientCondition: 'Critical', checkInDate: '2026-07-01', ventilatorAttached: true, hospitalId: 'hosp-1' },
  { id: 'bed-2', roomNumber: 'ICU-102', wardType: 'ICU', status: 'Occupied', patientName: 'Sarah Jenkins', patientAge: 64, patientCondition: 'Serious', checkInDate: '2026-07-02', ventilatorAttached: true, hospitalId: 'hosp-1' },
  { id: 'bed-3', roomNumber: 'ICU-103', wardType: 'ICU', status: 'Cleaning', ventilatorAttached: false, hospitalId: 'hosp-1' },
  { id: 'bed-4', roomNumber: 'ICU-104', wardType: 'ICU', status: 'Available', ventilatorAttached: false, hospitalId: 'hosp-1' },
  
  // Emergency Beds
  { id: 'bed-5', roomNumber: 'ER-01', wardType: 'Emergency', status: 'Occupied', patientName: 'Robert Lang', patientAge: 29, patientCondition: 'Observation', checkInDate: '2026-07-04', ventilatorAttached: false, hospitalId: 'hosp-1' },
  { id: 'bed-6', roomNumber: 'ER-02', wardType: 'Emergency', status: 'Occupied', patientName: 'Emily Watson', patientAge: 42, patientCondition: 'Critical', checkInDate: '2026-07-04', ventilatorAttached: true, hospitalId: 'hosp-1' },
  { id: 'bed-7', roomNumber: 'ER-03', wardType: 'Emergency', status: 'Available', ventilatorAttached: false, hospitalId: 'hosp-1' },
  { id: 'bed-8', roomNumber: 'ER-04', wardType: 'Emergency', status: 'Available', ventilatorAttached: false, hospitalId: 'hosp-1' },

  // General Ward Beds
  { id: 'bed-9', roomNumber: 'G-201', wardType: 'General', status: 'Occupied', patientName: 'David Miller', patientAge: 71, patientCondition: 'Stable', checkInDate: '2026-06-25', ventilatorAttached: false, hospitalId: 'hosp-1' },
  { id: 'bed-10', roomNumber: 'G-202', wardType: 'General', status: 'Occupied', patientName: 'Maria Garcia', patientAge: 35, patientCondition: 'Stable', checkInDate: '2026-06-29', ventilatorAttached: false, hospitalId: 'hosp-1' },
  { id: 'bed-11', roomNumber: 'G-203', wardType: 'General', status: 'Reserved', patientName: 'Alex Mercer', patientAge: 50, patientCondition: 'Observation', checkInDate: '2026-07-04', ventilatorAttached: false, hospitalId: 'hosp-1' },
  { id: 'bed-12', roomNumber: 'G-204', wardType: 'General', status: 'Available', ventilatorAttached: false, hospitalId: 'hosp-1' },
  
  // Pediatric Beds
  { id: 'bed-13', roomNumber: 'P-301', wardType: 'Pediatric', status: 'Occupied', patientName: 'Leo Smith', patientAge: 7, patientCondition: 'Stable', checkInDate: '2026-07-03', ventilatorAttached: false, hospitalId: 'hosp-1' },
  { id: 'bed-14', roomNumber: 'P-302', wardType: 'Pediatric', status: 'Available', ventilatorAttached: false, hospitalId: 'hosp-1' },
  
  // Sunset PHC Beds
  { id: 'bed-15', roomNumber: 'PHC-01', wardType: 'General', status: 'Occupied', patientName: 'Karan Singh', patientAge: 48, patientCondition: 'Serious', checkInDate: '2026-07-02', ventilatorAttached: false, hospitalId: 'hosp-3' },
  { id: 'bed-16', roomNumber: 'PHC-02', wardType: 'General', status: 'Occupied', patientName: 'Sita Ram', patientAge: 62, patientCondition: 'Stable', checkInDate: '2026-07-03', ventilatorAttached: false, hospitalId: 'hosp-3' },
  { id: 'bed-17', roomNumber: 'PHC-03', wardType: 'Emergency', status: 'Occupied', patientName: 'Ravi Verma', patientAge: 19, patientCondition: 'Critical', checkInDate: '2026-07-04', ventilatorAttached: false, hospitalId: 'hosp-3' }
];

const mockDoctors: Doctor[] = [
  { id: 'doc-1', name: 'Dr. Alok Sharma', specialty: 'Cardiology', status: 'Active', shift: 'Day', contact: '+91 98765 43210', checkInTime: '08:00 AM', attendanceRate: 98, satisfactionScore: 4.8, hospitalId: 'hosp-1', hospitalName: 'Metro General District Hospital' },
  { id: 'doc-2', name: 'Dr. Priya Nair', specialty: 'Pediatrics', status: 'Active', shift: 'Day', contact: '+91 98765 43211', checkInTime: '08:15 AM', attendanceRate: 95, satisfactionScore: 4.7, hospitalId: 'hosp-1', hospitalName: 'Metro General District Hospital' },
  { id: 'doc-3', name: 'Dr. George Kutty', specialty: 'Pulmonology', status: 'Standby', shift: 'On-Call', contact: '+91 98765 43212', attendanceRate: 92, satisfactionScore: 4.5, hospitalId: 'hosp-1', hospitalName: 'Metro General District Hospital' },
  { id: 'doc-4', name: 'Dr. Sneha Patil', specialty: 'General Medicine', status: 'Off-Duty', shift: 'Night', contact: '+91 98765 43213', attendanceRate: 88, satisfactionScore: 4.2, hospitalId: 'hosp-1', hospitalName: 'Metro General District Hospital' },
  { id: 'doc-5', name: 'Dr. Rajesh Khanna', specialty: 'Anesthesiology', status: 'Active', shift: 'Day', contact: '+91 98765 43214', checkInTime: '07:45 AM', attendanceRate: 97, satisfactionScore: 4.6, hospitalId: 'hosp-1', hospitalName: 'Metro General District Hospital' },
  
  // Sunset PHC
  { id: 'doc-6', name: 'Dr. Amit Roy', specialty: 'General Medicine', status: 'Active', shift: 'Day', contact: '+91 98765 43220', checkInTime: '09:00 AM', attendanceRate: 91, satisfactionScore: 4.4, hospitalId: 'hosp-3', hospitalName: 'Sunset Primary Health Center' },
  { id: 'doc-7', name: 'Dr. Meera Sen', specialty: 'Gynecology', status: 'Off-Duty', shift: 'On-Call', contact: '+91 98765 43221', attendanceRate: 94, satisfactionScore: 4.5, hospitalId: 'hosp-3', hospitalName: 'Sunset Primary Health Center' }
];

const mockRedistributionRequests: RedistributionRequest[] = [
  {
    id: 'req-1',
    medicineName: 'Paracetamol 500mg Tablets',
    quantity: 1000,
    fromHospitalId: 'hosp-2',
    fromHospitalName: 'Valley Community Health Center',
    toHospitalId: 'hosp-3',
    toHospitalName: 'Sunset Primary Health Center',
    status: 'Pending',
    urgency: 'High',
    requestDate: '2026-07-04'
  },
  {
    id: 'req-2',
    medicineName: 'Oxygen Cylinders 40L',
    quantity: 8,
    fromHospitalId: 'hosp-2',
    fromHospitalName: 'Valley Community Health Center',
    toHospitalId: 'hosp-1',
    toHospitalName: 'Metro General District Hospital',
    status: 'Approved',
    urgency: 'Medium',
    requestDate: '2026-07-03',
    estimatedDelivery: '2026-07-05',
    trackingCode: 'TX-882910'
  }
];

const mockLabTests: LabTest[] = [
  { id: 'lab-1', patientName: 'John Doe', testType: 'Cardiac Panel', status: 'Completed', reagentLevelStatus: 'Normal', value: 'Troponin I: 0.04 ng/mL', referenceRange: '< 0.04 ng/mL', isCritical: false, requestedAt: '2026-07-04 09:15 AM', completedAt: '2026-07-04 10:30 AM', hospitalId: 'hosp-1' },
  { id: 'lab-2', patientName: 'Ravi Verma', testType: 'Malaria Panel', status: 'In-Progress', reagentLevelStatus: 'Low', value: '-', referenceRange: 'Negative', isCritical: false, requestedAt: '2026-07-04 10:00 AM', hospitalId: 'hosp-1' },
  { id: 'lab-3', patientName: 'Sarah Jenkins', testType: 'Blood Culture', status: 'Pending', reagentLevelStatus: 'Normal', value: '-', referenceRange: 'No growth', isCritical: false, requestedAt: '2026-07-04 10:45 AM', hospitalId: 'hosp-1' },
  { id: 'lab-4', patientName: 'Jane Smith', testType: 'CBC', status: 'Completed', reagentLevelStatus: 'Critical', value: 'WBC Count: 22,000 /uL', referenceRange: '4,500 - 11,000 /uL', isCritical: true, requestedAt: '2026-07-04 08:30 AM', completedAt: '2026-07-04 09:45 AM', hospitalId: 'hosp-1' }
];

const mockAlerts: SystemAlert[] = [
  { id: 'alt-1', message: 'ICU Bed Occupancy is above 90% (3/4 occupied)', type: 'Warning', category: 'Bed', timestamp: '2026-07-04 08:00 AM', targetFacilityName: 'Metro General District Hospital', targetFacilityId: 'hosp-1', acknowledged: false },
  { id: 'alt-2', message: 'IV Fluids (Normal Saline) running out in 3 days. Demand spike observed.', type: 'Critical', category: 'Medicine', timestamp: '2026-07-04 09:30 AM', targetFacilityName: 'Metro General District Hospital', targetFacilityId: 'hosp-1', acknowledged: false },
  { id: 'alt-3', message: 'Sunset PHC has only 3 days left of Paracetamol stock.', type: 'Critical', category: 'Medicine', timestamp: '2026-07-04 10:15 AM', targetFacilityName: 'Sunset Primary Health Center', targetFacilityId: 'hosp-3', acknowledged: false },
  { id: 'alt-4', message: 'Malaria reagent kit levels are low in Metro General Lab.', type: 'Warning', category: 'Lab', timestamp: '2026-07-04 10:20 AM', targetFacilityName: 'Metro General District Hospital', targetFacilityId: 'hosp-1', acknowledged: false },
  { id: 'alt-5', message: 'Epidemic Risk Alert: 12% surge in flu-like symptoms detected across District-A PHCs.', type: 'Critical', category: 'Epidemic', timestamp: '2026-07-04 07:15 AM', targetFacilityName: 'Sunset Primary Health Center', targetFacilityId: 'hosp-3', acknowledged: false }
];

const mockPatients: Patient[] = [
  {
    id: 'pat-101',
    name: 'Sarah Connor',
    age: 42,
    gender: 'Female',
    status: 'IPD',
    condition: 'Urgent',
    emergency: true,
    history: 'Cardiorespiratory strain, pneumonia watch.',
    registeredAt: 'Today, 09:15 AM',
    wardType: 'ICU',
    hospitalId: 'hosp-1',
    timeline: [
      { title: 'Registered Node', desc: 'Registered in Metro General central gate admissions.', date: 'Today, 09:15 AM' },
      { title: 'Triage Sorting', desc: 'Assigned Orange Urgent classification.', date: 'Today, 09:20 AM' },
      { title: 'Bed Allocated', desc: 'Transferred to ICU Room Bed-12B.', date: 'Today, 09:40 AM' }
    ]
  },
  {
    id: 'pat-102',
    name: 'Julian Ross',
    age: 28,
    gender: 'Male',
    status: 'OPD',
    condition: 'Stable',
    emergency: false,
    history: 'Routine hypertension consultation.',
    registeredAt: 'Today, 10:00 AM',
    hospitalId: 'hosp-1',
    timeline: [
      { title: 'Registered Node', desc: 'Outpatient slip created at desk.', date: 'Today, 10:00 AM' }
    ]
  }
];

const mockActivityLogs: ActivityLog[] = [
  { id: 'log-1', action: 'Approved Paracetamol transfer request req-1', actor: 'District Admin Priya', role: 'DISTRICT_ADMIN', facilityName: 'Valley Community Health Center', timestamp: '10 mins ago' },
  { id: 'log-2', action: 'Updated Stock: Oxygen Cylinders adjusted +10', actor: 'Super Admin Rajesh', role: 'SUPER_ADMIN', facilityName: 'Metro General District Hospital', timestamp: '25 mins ago' },
  { id: 'log-3', action: 'Checked in Doctor Dr. Alok Sharma', actor: 'Hospital Staff', role: 'HOSPITAL_ADMIN', facilityName: 'Metro General District Hospital', timestamp: '2 hours ago' },
  { id: 'log-4', action: 'Assigned ICU Bed 101 to patient John Doe', actor: 'Admissions Dept', role: 'HOSPITAL_ADMIN', facilityName: 'Metro General District Hospital', timestamp: '3 hours ago' }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hs-theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hs-user');
    return saved ? JSON.parse(saved) : null;
  });

  // Global Mock Database
  const [hospitals, setHospitals] = useState<Hospital[]>(mockHospitals);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [beds, setBeds] = useState<Bed[]>(mockBeds);
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [redistributionRequests, setRedistributionRequests] = useState<RedistributionRequest[]>(mockRedistributionRequests);
  const [laboratoryTests, setLaboratoryTests] = useState<LabTest[]>(mockLabTests);
  const [alerts, setAlerts] = useState<SystemAlert[]>(mockAlerts);
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'msg-1', sender: 'ai', text: 'Hello! I am your AI Operations Coordinator. How can I assist you with clinical flows, bed occupancy, or supply redistributions today?', timestamp: 'Just now' }
  ]);

  // Context Navigation Focus
  const [activeDistrictId, setActiveDistrictId] = useState<string>('District-A (Central)');
  const [activeHospitalId, setActiveHospitalId] = useState<string>('hosp-1');
  const [isChatOpen, setChatOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync state to local storage occasionally for state retention
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('hs-theme', theme);
  }, [theme]);

  // User synchronizer
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hs-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hs-user');
    }
  }, [currentUser]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addMedicine = (item: any) => {
    const matchedHosp = hospitals.find(h => h.id === item.hospitalId);
    const newItem: InventoryItem = {
      ...item,
      id: `med-${Date.now()}`,
      hospitalName: matchedHosp ? matchedHosp.name : 'Unknown Node',
      daysOfStockLeft: Math.ceil(item.stockLevel / (item.dailyConsumptionRate || 10)),
      demandForecastNextMonth: Math.round(item.stockLevel * 1.1)
    };
    setInventory(prev => [newItem, ...prev]);
    addToast(`Successfully added medicine: ${item.name}`, 'success');
  };

  const editMedicine = (id: string, updates: any) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const nextStock = updates.stockLevel !== undefined ? updates.stockLevel : item.stockLevel;
        const daysLeft = Math.ceil(nextStock / (updates.dailyConsumptionRate || item.dailyConsumptionRate || 10));
        return {
          ...item,
          ...updates,
          daysOfStockLeft: isFinite(daysLeft) ? daysLeft : 999
        };
      }
      return item;
    }));
    addToast('Successfully updated medicine ledger', 'success');
  };

  const deleteMedicine = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
    addToast('Successfully deleted item from inventory', 'success');
  };

  const assignShift = (doctorId: string, shift: Doctor['shift'], department?: string) => {
    setDoctors(prev => prev.map(doc => {
      if (doc.id === doctorId) {
        return { ...doc, shift, specialty: department || doc.specialty };
      }
      return doc;
    }));
    addToast('Successfully re-assigned doctor shift roster', 'success');
  };

  const requestLeave = (doctorId: string, isLeave: boolean) => {
    setDoctors(prev => prev.map(doc => {
      if (doc.id === doctorId) {
        return { ...doc, status: isLeave ? 'Off-Duty' : 'Active' };
      }
      return doc;
    }));
    addToast(isLeave ? 'Doctor marked as Leave (Off-Duty)' : 'Doctor checked in active', 'success');
  };

  const registerPatient = (patient: any) => {
    const newPatient: Patient = {
      id: patient.id || `pat-${Date.now().toString().slice(-4)}`,
      name: patient.name,
      age: Number(patient.age) || 30,
      gender: patient.gender || 'Male',
      status: patient.status,
      condition: patient.condition,
      emergency: patient.emergency || false,
      history: patient.history || '',
      registeredAt: patient.registeredAt || 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wardType: patient.wardType,
      hospitalId: activeHospitalId,
      timeline: patient.timeline || [
        { title: 'Registered Node', desc: `Registered as ${patient.status}.`, date: 'Today' }
      ]
    };
    setPatients(prev => [newPatient, ...prev]);

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      action: `Registered patient ${patient.name} (${patient.status} - Triage: ${patient.condition})`,
      actor: currentUser?.name || 'System Admissions',
      role: currentUser?.role || 'HOSPITAL_ADMIN',
      facilityName: currentUser?.facilityName || 'District Center',
      timestamp: 'Just now'
    };
    setActivityLogs(l => [newLog, ...l]);

    if (patient.status === 'IPD') {
      const targetBed = beds.find(b => b.hospitalId === activeHospitalId && b.wardType === patient.wardType && b.status === 'Available');
      if (targetBed) {
        setBeds(prev => prev.map(b => {
          if (b.id === targetBed.id) {
            return {
              ...b,
              status: 'Occupied',
              patientName: patient.name,
              patientCondition: patient.condition
            };
          }
          return b;
        }));
        addToast(`Patient registered & assigned to Bed ${targetBed.roomNumber} (${patient.wardType})`, 'success');
      } else {
        addToast(`Patient registered. Warning: No available beds in ${patient.wardType}!`, 'info');
      }
    } else {
      addToast(`Patient registered as Outpatient (OPD) successfully`, 'success');
    }
  };

  // Business logic actions simulating a server sync
  const login = async (email: string, role: Role, facilityId?: string): Promise<boolean> => {
    // Artificial latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let userName = 'Administrator';
    let facilityName = undefined;
    if (role === 'SUPER_ADMIN') {
      userName = 'Chief Director Rajesh';
    } else if (role === 'DISTRICT_ADMIN') {
      userName = 'District Coordinator Priya';
    } else {
      const matchedHosp = hospitals.find(h => h.id === facilityId);
      facilityName = matchedHosp ? matchedHosp.name : 'Metro General District Hospital';
      userName = `Hosp Admin ${facilityName.split(' ')[0]}`;
    }

    const newUser: User = {
      id: `usr-${role.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      name: userName,
      email,
      role,
      facilityId: facilityId || (role === 'HOSPITAL_ADMIN' ? 'hosp-1' : undefined),
      facilityName,
      districtId: role === 'DISTRICT_ADMIN' ? 'District-A (Central)' : undefined,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${role}`
    };

    setCurrentUser(newUser);
    if (newUser.facilityId) {
      setActiveHospitalId(newUser.facilityId);
    }
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // 1. Inventory Updates
  const updateInventoryStock = (itemId: string, newStock: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const daysLeft = Math.ceil(newStock / item.dailyConsumptionRate);
        const updated = {
          ...item,
          stockLevel: newStock,
          daysOfStockLeft: isFinite(daysLeft) ? daysLeft : 999
        };
        
        // Log action
        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          action: `Adjusted stock of ${item.name} to ${newStock} ${item.unit}`,
          actor: currentUser?.name || 'System',
          role: currentUser?.role || 'HOSPITAL_ADMIN',
          facilityName: item.hospitalName,
          timestamp: 'Just now'
        };
        setActivityLogs(l => [newLog, ...l]);

        // Dynamically create or clear alerts
        if (newStock <= item.safetyStockThreshold) {
          const alertExists = alerts.some(a => a.targetFacilityId === item.hospitalId && a.message.includes(item.name));
          if (!alertExists) {
            const newAlert: SystemAlert = {
              id: `alt-${Date.now()}`,
              message: `Inventory Alert: ${item.name} stock level (${newStock}) is below safety threshold.`,
              type: newStock === 0 ? 'Critical' : 'Warning',
              category: 'Medicine',
              timestamp: 'Just now',
              targetFacilityName: item.hospitalName,
              targetFacilityId: item.hospitalId,
              acknowledged: false
            };
            setAlerts(a => [newAlert, ...a]);
          }
        } else {
          setAlerts(a => a.filter(al => !(al.targetFacilityId === item.hospitalId && al.message.includes(item.name))));
        }

        return updated;
      }
      return item;
    }));
  };

  // 2. Bed Occupancy Management
  const transferBed = (bedId: string, updates: Partial<Bed>) => {
    setBeds(prev => prev.map(bed => {
      if (bed.id === bedId) {
        const originalStatus = bed.status;
        const newBed = { ...bed, ...updates };

        // Recalculate hospital stats
        setHospitals(hospPrev => hospPrev.map(h => {
          if (h.id === bed.hospitalId) {
            let occupiedDiff = 0;
            let availableDiff = 0;

            if (originalStatus !== 'Occupied' && newBed.status === 'Occupied') {
              occupiedDiff = 1;
              availableDiff = -1;
            } else if (originalStatus === 'Occupied' && newBed.status !== 'Occupied') {
              occupiedDiff = -1;
              availableDiff = 1;
            }

            return {
              ...h,
              bedsCount: {
                ...h.bedsCount,
                occupied: h.bedsCount.occupied + occupiedDiff,
                available: h.bedsCount.available + availableDiff
              }
            };
          }
          return h;
        }));

        // Log Action
        const facilityName = hospitals.find(h => h.id === bed.hospitalId)?.name || 'Health Facility';
        const logMsg = updates.status === 'Occupied' 
          ? `Admitted patient ${updates.patientName} into Bed ${bed.roomNumber} (${bed.wardType})`
          : `Checked out / cleared Bed ${bed.roomNumber} (${bed.wardType}) - Status: ${updates.status}`;
        
        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          action: logMsg,
          actor: currentUser?.name || 'System',
          role: currentUser?.role || 'HOSPITAL_ADMIN',
          facilityName,
          timestamp: 'Just now'
        };
        setActivityLogs(l => [newLog, ...l]);
        addToast(logMsg, 'success');

        return newBed;
      }
      return bed;
    }));
  };

  // 3. Doctor Roster Shift Update
  const updateDoctorStatus = (doctorId: string, status: 'Active' | 'Standby' | 'Off-Duty') => {
    setDoctors(prev => prev.map(doc => {
      if (doc.id === doctorId) {
        const originalStatus = doc.status;
        const updated = {
          ...doc,
          status,
          checkInTime: status === 'Active' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
        };

        // Recalculate hospital active count
        setHospitals(hospPrev => hospPrev.map(h => {
          if (h.id === doc.hospitalId) {
            let activeDiff = 0;
            let standbyDiff = 0;

            if (originalStatus !== 'Active' && status === 'Active') activeDiff = 1;
            else if (originalStatus === 'Active' && status !== 'Active') activeDiff = -1;

            if (originalStatus !== 'Standby' && status === 'Standby') standbyDiff = 1;
            else if (originalStatus === 'Standby' && status !== 'Standby') standbyDiff = -1;

            return {
              ...h,
              doctorCount: {
                ...h.doctorCount,
                active: Math.max(0, h.doctorCount.active + activeDiff),
                standby: Math.max(0, h.doctorCount.standby + standbyDiff)
              }
            };
          }
          return h;
        }));

        // Log Action
        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          action: `Set status of ${doc.name} (${doc.specialty}) to ${status}`,
          actor: currentUser?.name || 'System',
          role: currentUser?.role || 'HOSPITAL_ADMIN',
          facilityName: doc.hospitalName,
          timestamp: 'Just now'
        };
        setActivityLogs(l => [newLog, ...l]);

        return updated;
      }
      return doc;
    }));
  };

  // 4. Redistribution Request Workflow
  const createRedistributionRequest = (
    medicineName: string, 
    quantity: number, 
    fromHospitalId: string, 
    toHospitalId: string,
    urgency: 'High' | 'Medium' | 'Low'
  ) => {
    const fromHosp = hospitals.find(h => h.id === fromHospitalId);
    const toHosp = hospitals.find(h => h.id === toHospitalId);

    const newReq: RedistributionRequest = {
      id: `req-${Date.now().toString().slice(-4)}`,
      medicineName,
      quantity,
      fromHospitalId,
      fromHospitalName: fromHosp?.name || 'Surplus Center',
      toHospitalId,
      toHospitalName: toHosp?.name || 'Deficit Center',
      status: 'Pending',
      urgency,
      requestDate: new Date().toISOString().split('T')[0]
    };

    setRedistributionRequests(prev => [newReq, ...prev]);

    // Log Action
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      action: `Created AI redistribution request for ${quantity}x ${medicineName} from ${newReq.fromHospitalName} to ${newReq.toHospitalName}`,
      actor: currentUser?.name || 'AI Assistant',
      role: currentUser?.role || 'SUPER_ADMIN',
      facilityName: newReq.toHospitalName,
      timestamp: 'Just now'
    };
    setActivityLogs(l => [newLog, ...l]);
  };

  const approveRedistribution = (requestId: string) => {
    setRedistributionRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        // Log Action
        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          action: `Approved redistribution of ${req.quantity}x ${req.medicineName} (ID: ${requestId})`,
          actor: currentUser?.name || 'Operations Coordinator',
          role: currentUser?.role || 'DISTRICT_ADMIN',
          facilityName: req.fromHospitalName,
          timestamp: 'Just now'
        };
        setActivityLogs(l => [newLog, ...l]);

        return {
          ...req,
          status: 'Approved',
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          trackingCode: `TX-${Math.floor(100000 + Math.random() * 900000)}`
        };
      }
      return req;
    }));
  };

  const shipRedistribution = (requestId: string) => {
    setRedistributionRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        // Deduct from Source Hospital stock
        setInventory(invPrev => invPrev.map(item => {
          if (item.hospitalId === req.fromHospitalId && item.name.toLowerCase().includes(req.medicineName.toLowerCase())) {
            const deductStock = Math.max(0, item.stockLevel - req.quantity);
            return {
              ...item,
              stockLevel: deductStock,
              daysOfStockLeft: Math.ceil(deductStock / item.dailyConsumptionRate)
            };
          }
          return item;
        }));

        // Log Action
        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          action: `Dispatched supply truck for ${req.medicineName} (QTY: ${req.quantity})`,
          actor: 'Supply Chain Agent',
          role: 'HOSPITAL_ADMIN',
          facilityName: req.fromHospitalName,
          timestamp: 'Just now'
        };
        setActivityLogs(l => [newLog, ...l]);

        return { ...req, status: 'Shipped' };
      }
      return req;
    }));
  };

  const receiveRedistribution = (requestId: string) => {
    setRedistributionRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        // Add to Destination Hospital stock
        setInventory(invPrev => {
          let found = false;
          const nextInv = invPrev.map(item => {
            if (item.hospitalId === req.toHospitalId && item.name.toLowerCase().includes(req.medicineName.toLowerCase())) {
              found = true;
              const addStock = item.stockLevel + req.quantity;
              return {
                ...item,
                stockLevel: addStock,
                daysOfStockLeft: Math.ceil(addStock / item.dailyConsumptionRate)
              };
            }
            return item;
          });

          // If destination doesn't have this item card in database, generate one!
          if (!found) {
            const newItem: InventoryItem = {
              id: `inv-${Date.now()}`,
              name: req.medicineName,
              category: 'Medication',
              batchNumber: `RE-${Date.now().toString().slice(-4)}`,
              stockLevel: req.quantity,
              safetyStockThreshold: Math.ceil(req.quantity * 0.3),
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              unit: 'Units',
              hospitalId: req.toHospitalId,
              hospitalName: req.toHospitalName,
              dailyConsumptionRate: Math.ceil(req.quantity / 30),
              daysOfStockLeft: 30,
              demandForecastNextMonth: req.quantity
            };
            return [...nextInv, newItem];
          }
          return nextInv;
        });

        // Log Action
        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          action: `Received and cataloged ${req.quantity}x ${req.medicineName}`,
          actor: currentUser?.name || 'Receiving Staff',
          role: 'HOSPITAL_ADMIN',
          facilityName: req.toHospitalName,
          timestamp: 'Just now'
        };
        setActivityLogs(l => [newLog, ...l]);

        // Remove inventory alerts for this medicine at the destination hospital
        setAlerts(a => a.filter(al => !(al.targetFacilityId === req.toHospitalId && al.message.toLowerCase().includes(req.medicineName.toLowerCase()))));

        return { ...req, status: 'Received' };
      }
      return req;
    }));
  };

  // 5. Diagnostics / Laboratory Pipeline
  const addLabTest = (patientName: string, testType: LabTest['testType'], technician?: string) => {
    const newTest: LabTest = {
      id: `lab-${Date.now().toString().slice(-4)}`,
      patientName,
      testType,
      status: 'Pending',
      reagentLevelStatus: 'Normal',
      value: '-',
      referenceRange: testType === 'CBC' ? '4.5 - 11.0 /uL' : testType === 'Cardiac Panel' ? '< 0.04 ng/mL' : 'Negative',
      isCritical: false,
      requestedAt: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      hospitalId: activeHospitalId,
      technician: technician || 'Tech Sarah',
      collectionStatus: 'Pending'
    };

    setLaboratoryTests(prev => [newTest, ...prev]);

    // Log Action
    const facilityName = hospitals.find(h => h.id === activeHospitalId)?.name || 'Hospital Lab';
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      action: `Ordered diagnostic test (${testType}) for patient ${patientName} (Assigned: ${newTest.technician})`,
      actor: currentUser?.name || 'Physician',
      role: 'HOSPITAL_ADMIN',
      facilityName,
      timestamp: 'Just now'
    };
    setActivityLogs(l => [newLog, ...l]);
    addToast(`Ordered diagnostic: ${testType} for ${patientName}`, 'success');
  };

  const updateCollectionStatus = (testId: string, status: LabTest['collectionStatus']) => {
    setLaboratoryTests(prev => prev.map(test => {
      if (test.id === testId) {
        const updatedStatus = status === 'Ready' ? 'Completed' : status === 'Analyzing' ? 'In-Progress' : 'Pending';
        return {
          ...test,
          collectionStatus: status,
          status: updatedStatus as any
        };
      }
      return test;
    }));
    addToast('Updated lab test collection stage', 'success');
  };

  const completeLabTest = (
    testId: string, 
    value: string, 
    isCritical: boolean, 
    reagentLevel: 'Critical' | 'Low' | 'Normal'
  ) => {
    setLaboratoryTests(prev => prev.map(test => {
      if (test.id === testId) {
        const updated = {
          ...test,
          status: 'Completed' as const,
          value,
          isCritical,
          reagentLevelStatus: reagentLevel,
          completedAt: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit' })
        };

        const facilityName = hospitals.find(h => h.id === test.hospitalId)?.name || 'Hospital Lab';
        
        // Log Action
        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          action: `Completed test: ${test.testType} for ${test.patientName}. Value: ${value}. ${isCritical ? 'CRITICAL VALUE ALERT TRIGGERED' : ''}`,
          actor: 'Laboratory Specialist',
          role: 'HOSPITAL_ADMIN',
          facilityName,
          timestamp: 'Just now'
        };
        setActivityLogs(l => [newLog, ...l]);

        // Critical value Alert
        if (isCritical) {
          const newAlert: SystemAlert = {
            id: `alt-${Date.now()}`,
            message: `Lab Alert: Critical diagnostics returned for ${test.patientName} (${test.testType}: ${value})`,
            type: 'Critical',
            category: 'Lab',
            timestamp: 'Just now',
            targetFacilityName: facilityName,
            targetFacilityId: test.hospitalId,
            acknowledged: false
          };
          setAlerts(a => [newAlert, ...a]);
        }

        // Reagent Low Warning Alert
        if (reagentLevel === 'Critical' || reagentLevel === 'Low') {
          const newAlert: SystemAlert = {
            id: `alt-reag-${Date.now()}`,
            message: `Lab Alert: Reagent kit levels for ${test.testType} are ${reagentLevel.toUpperCase()}`,
            type: reagentLevel === 'Critical' ? 'Critical' : 'Warning',
            category: 'Lab',
            timestamp: 'Just now',
            targetFacilityName: facilityName,
            targetFacilityId: test.hospitalId,
            acknowledged: false
          };
          setAlerts(a => [newAlert, ...a]);
        }

        return updated;
      }
      return test;
    }));
  };

  // 6. Alert Acknowledgement
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(al => al.id === alertId ? { ...al, acknowledged: true } : al));
  };

  // 7. Interactive AI LLM Assistant Response Simulation
  const sendChatMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now'
    };

    setChatMessages(prev => [...prev, userMsg]);

    // Simple delay for AI response streamer
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = "I'm reviewing the state healthcare directories to assist. Can you clarify if you need a report on bed capacities, drug supply chains, or lab reagent stock levels?";
      
      if (lower.includes('oxygen') || lower.includes('cylinders')) {
        reply = `**Oxygen Cylinders Status (District-A):**
* **Valley CHC:** has a surplus of **28 cylinders** (only consumes 2/day, 14 days of supply safety).
* **Sunset PHC:** has a critical deficit with only **2 cylinders** left.
* **Metro General:** is stable with **85 cylinders** (consuming 12/day).

**AI Recommendation:** Transfer **8 cylinders** from Valley CHC to Sunset PHC to secure reserves for the next 8 days. [Initiate Transfer Command: Approvereq-1]`;
      } else if (lower.includes('paracetamol') || lower.includes('stock')) {
        reply = `**Paracetamol 500mg Supply Status:**
* **Sunset PHC:** Alert! Only **80 tablets** remaining (approx. 3 days of stock left). Consumption is 25 tablets/day.
* **Valley CHC:** holds a massive surplus of **4,200 tablets** (105 days of supply).
* **AI Action Taken:** I have generated a pending transfer recommendation (**req-1**) to ship **1,000 tablets** from Valley CHC to Sunset PHC. Click **"Approve"** on the redistribution ledger to launch dispatch logistics.`;
      } else if (lower.includes('bed') || lower.includes('icu') || lower.includes('occupancy')) {
        reply = `**ICU Bed Capacity Alert (District Central):**
* **Metro General:** ICU is at **75% capacity** (3 of 4 occupied). Ventilator attachments: 2 active, 2 available. Bed ICU-103 is currently undergoing deep sanitation.
* **Sunset PHC:** 3 general ward beds are occupied, 0 ICU beds available.
* **Apex Cardiac Clinic:** ICU is currently at **90% capacity** (severe strain due to specialized surgeries).
* **Action plan:** Divert cardiac emergencies in District-A to Metro General ICU until Apex capacity falls below 80%.`;
      } else if (lower.includes('epidemic') || lower.includes('outbreak') || lower.includes('forecast') || lower.includes('dengue')) {
        reply = `**AI Infectious Outbreak Forecast:**
* **Influenza/Flu:** Machine learning trends indicate a **12% spike** in respiratory admissions in District-A over the next 14 days. 
* **Recommendation:** Pre-allocate **500 bottles of Cough Expectorants** and **2,000 tablets of Paracetamol** to Sunset PHC and Valley CHC immediately.
* **Dengue:** Warm humidity indicates vector-borne infection risk will rise in 3 weeks. Recommend activating mosquito fogging protocols near CHC boundaries.`;
      } else if (lower.includes('reagent') || lower.includes('lab') || lower.includes('test')) {
        reply = `**Diagnostics Reagents Inventory:**
* **Malaria Kits:** Low stock warning at Metro General (only 12 tests left in clinical reserve).
* **CBC Kits:** Normal status, 400 reactions left.
* **Urgent Action:** Lab test order for Ravi Verma (Malaria Panel) is in progress but flagged due to low reagent kit alert. Recommend ordering reagent shipment replenishment from Central Supply Depository.`;
      } else if (lower.includes('help') || lower.includes('hi') || lower.includes('hello')) {
        reply = `I am HealthSync's **Clinical Operations Assistant**. You can ask me query commands such as:
1. *"Which hospitals have oxygen surpluses?"*
2. *"Predict paracetamol stockout timeline for Sunset PHC"*
3. *"Summarize ICU Bed status"*
4. *"Show epidemic infection forecasts"*`;
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: 'Just now'
      };

      setChatMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  // Simulating live real-time state alerts periodically (e.g. mock server events)
  const triggerMockSync = () => {
    // Randomize a small data metric to show reactive real-time dashboard updates
    setInventory(prev => prev.map(item => {
      if (item.id === 'inv-1') {
        const rate = Math.floor(Math.random() * 5) + 1;
        const nextStock = Math.max(10, item.stockLevel - rate);
        return {
          ...item,
          stockLevel: nextStock,
          daysOfStockLeft: Math.ceil(nextStock / item.dailyConsumptionRate)
        };
      }
      return item;
    }));

    // Trigger random activity log
    const randomHospital = mockHospitals[Math.floor(Math.random() * mockHospitals.length)].name;
    const randomAdmissions = ['Admitted patient with high fever', 'Completed emergency pharmacy stock check-out', 'Dispatched outpatient lab reports', 'Rotated medical officer shifts'];
    const selectedAction = randomAdmissions[Math.floor(Math.random() * randomAdmissions.length)];
    
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      action: selectedAction,
      actor: 'System Sensor',
      role: 'HOSPITAL_ADMIN',
      facilityName: randomHospital,
      timestamp: 'Just now'
    };
    
    setActivityLogs(l => [newLog, ...l.slice(0, 19)]);
  };

  const dispenseMedicine = (itemId: string, qty: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const nextStock = Math.max(0, item.stockLevel - qty);
        const daysLeft = Math.ceil(nextStock / item.dailyConsumptionRate);
        const updated = {
          ...item,
          stockLevel: nextStock,
          daysOfStockLeft: daysLeft
        };

        const facilityName = hospitals.find(h => h.id === item.hospitalId)?.name || 'Health Facility';
        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          action: `Dispensed ${qty} units of ${item.name} (Remaining stock: ${nextStock} units)`,
          actor: currentUser?.name || 'System Staff',
          role: currentUser?.role || 'HOSPITAL_ADMIN',
          facilityName,
          timestamp: 'Just now'
        };
        setActivityLogs(l => [newLog, ...l]);

        if (nextStock <= item.safetyStockThreshold) {
          const alertId = `alt-${Date.now()}`;
          const newAlert: SystemAlert = {
            id: alertId,
            message: `Low Stock Alert: ${item.name} drops below safety limit (${nextStock} units remaining).`,
            type: 'Critical',
            category: 'Medicine',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            targetFacilityName: facilityName,
            targetFacilityId: item.hospitalId,
            acknowledged: false
          };
          setAlerts(a => [newAlert, ...a]);
          addToast(`Low Stock Alert: ${item.name} is running out!`, 'error');

          const randomRequest: RedistributionRequest = {
            id: `req-${Date.now().toString().slice(-4)}`,
            medicineName: item.name,
            quantity: Math.max(100, item.safetyStockThreshold * 5),
            fromHospitalId: 'hosp-2',
            fromHospitalName: 'Valley Community Health Center',
            toHospitalId: item.hospitalId,
            toHospitalName: facilityName,
            status: 'Pending',
            urgency: 'High',
            requestDate: 'Just now'
          };
          setRedistributionRequests(r => [randomRequest, ...r]);
        } else {
          addToast(`Successfully dispensed ${qty} units of ${item.name}`, 'success');
        }

        return updated;
      }
      return item;
    }));
  };

  const dischargePatient = (patientId: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        setBeds(bedPrev => bedPrev.map(b => {
          if (b.patientName === p.name) {
            const facilityName = hospitals.find(h => h.id === b.hospitalId)?.name || 'Health Facility';
            const cleanLog: ActivityLog = {
              id: `log-${Date.now()}-clean`,
              action: `Patient ${p.name} discharged. Bed ${b.roomNumber} (${b.wardType}) set to Cleaning status.`,
              actor: currentUser?.name || 'System Staff',
              role: currentUser?.role || 'HOSPITAL_ADMIN',
              facilityName,
              timestamp: 'Just now'
            };
            setActivityLogs(l => [cleanLog, ...l]);
            return {
              ...b,
              status: 'Cleaning' as const,
              patientName: undefined,
              patientCondition: undefined
            };
          }
          return b;
        }));

        const facilityName = hospitals.find(h => h.id === p.hospitalId)?.name || 'Health Facility';
        const newLog: ActivityLog = {
          id: `log-${Date.now()}`,
          action: `Discharged patient ${p.name} (Status: Discharged)`,
          actor: currentUser?.name || 'System Staff',
          role: currentUser?.role || 'HOSPITAL_ADMIN',
          facilityName,
          timestamp: 'Just now'
        };
        setActivityLogs(l => [newLog, ...l]);
        addToast(`Patient ${p.name} discharged successfully`, 'success');

        return {
          ...p,
          status: 'OPD' as const,
          timeline: [
            ...(p.timeline || []),
            { title: 'Discharged', desc: 'Patient discharged. Bed cleaning schedule initiated.', date: 'Today' }
          ]
        };
      }
      return p;
    }));
  };

  const seedDemoData = () => {
    setInventory(prev => prev.map(item => {
      if (item.name === 'Paracetamol Tablets') {
        return { ...item, stockLevel: 25, daysOfStockLeft: 1 };
      }
      return item;
    }));

    setBeds(prev => prev.map(b => {
      if (b.roomNumber === 'ICU-102') {
        return { ...b, status: 'Occupied' as const, patientName: 'John Connor', patientCondition: 'Critical' };
      }
      return b;
    }));

    const demoAlert: SystemAlert = {
      id: `alt-demo-${Date.now()}`,
      message: 'Critical Stock-out Threat: Paracetamol tablets drop to 25 units in Sunset PHC.',
      type: 'Critical',
      category: 'Medicine',
      timestamp: 'Just now',
      targetFacilityName: 'Sunset Primary Health Center',
      targetFacilityId: 'hosp-3',
      acknowledged: false
    };
    setAlerts(a => [demoAlert, ...a]);

    const demoRequest: RedistributionRequest = {
      id: 'req-demo-102',
      medicineName: 'Paracetamol Tablets',
      quantity: 500,
      fromHospitalId: 'hosp-2',
      fromHospitalName: 'Valley Community Health Center',
      toHospitalId: 'hosp-3',
      toHospitalName: 'Sunset Primary Health Center',
      status: 'Pending',
      urgency: 'High',
      requestDate: 'Just now'
    };
    setRedistributionRequests(r => [demoRequest, ...r]);

    const demoLog: ActivityLog = {
      id: `log-demo-${Date.now()}`,
      action: 'Launched Hackathon Live Simulation Data Suite',
      actor: currentUser?.name || 'System Admin',
      role: currentUser?.role || 'SUPER_ADMIN',
      facilityName: 'District HQ Office',
      timestamp: 'Just now'
    };
    setActivityLogs(l => [demoLog, ...l]);

    addToast('Hackathon Live Demo Simulation seeder launched!', 'success');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      theme,
      hospitals,
      inventory,
      beds,
      doctors,
      redistributionRequests,
      laboratoryTests,
      alerts,
      patients,
      activityLogs,
      chatMessages,
      activeDistrictId,
      activeHospitalId,
      isChatOpen,
      toasts,
      addToast,
      removeToast,
      addMedicine,
      editMedicine,
      deleteMedicine,
      assignShift,
      requestLeave,
      registerPatient,
      login,
      logout,
      toggleTheme,
      setActiveHospitalId,
      setChatOpen,
      updateInventoryStock,
      transferBed,
      updateDoctorStatus,
      approveRedistribution,
      shipRedistribution,
      receiveRedistribution,
      createRedistributionRequest,
      addLabTest,
      updateCollectionStatus,
      completeLabTest,
      acknowledgeAlert,
      sendChatMessage,
      triggerMockSync,
      dispenseMedicine,
      dischargePatient,
      seedDemoData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
