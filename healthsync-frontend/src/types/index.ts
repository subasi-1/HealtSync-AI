export type Role = 'SUPER_ADMIN' | 'DISTRICT_ADMIN' | 'HOSPITAL_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  facilityId?: string;
  facilityName?: string;
  districtId?: string;
  avatar?: string;
}

export interface Hospital {
  id: string;
  name: string;
  district: string;
  type: 'PHC' | 'CHC' | 'District Hospital' | 'Specialty';
  bedsCount: {
    total: number;
    occupied: number;
    available: number;
  };
  doctorCount: {
    total: number;
    active: number;
    standby: number;
  };
  activeAlertsCount: number;
  location: [number, number]; // [lat, lng]
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Medication' | 'Vaccine' | 'Consumable' | 'Equipment';
  batchNumber: string;
  stockLevel: number;
  safetyStockThreshold: number;
  expiryDate: string;
  unit: string;
  hospitalId: string;
  hospitalName: string;
  dailyConsumptionRate: number;
  daysOfStockLeft: number;
  demandForecastNextMonth: number;
  supplier?: string;
  mfgDate?: string;
}

export interface Bed {
  id: string;
  roomNumber: string;
  wardType: 'ICU' | 'General' | 'Emergency' | 'Pediatric' | 'Maternity';
  status: 'Available' | 'Occupied' | 'Cleaning' | 'Reserved';
  patientName?: string;
  patientAge?: number;
  patientCondition?: 'Stable' | 'Critical' | 'Serious' | 'Observation';
  checkInDate?: string;
  ventilatorAttached: boolean;
  hospitalId: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  status: 'Active' | 'Standby' | 'Off-Duty';
  shift: 'Day' | 'Night' | 'On-Call';
  contact: string;
  checkInTime?: string;
  checkOutTime?: string;
  attendanceRate: number; // percentage
  satisfactionScore: number; // 1-5 scale
  hospitalId: string;
  hospitalName: string;
}

export interface PatientFootfall {
  id: string;
  date: string;
  count: number;
  triageLevel: {
    red: number; // Critical
    orange: number; // Urgent
    yellow: number; // Semi-urgent
    green: number; // Non-urgent
  };
  department: {
    emergency: number;
    outpatient: number;
    pediatric: number;
    icu: number;
  };
  hospitalId: string;
}

export interface LabTest {
  id: string;
  patientName: string;
  testType: 'CBC' | 'Renal Panel' | 'Cardiac Panel' | 'COVID-19' | 'Blood Culture' | 'Malaria Panel';
  status: 'Pending' | 'In-Progress' | 'Completed';
  reagentLevelStatus: 'Critical' | 'Low' | 'Normal';
  value: string;
  referenceRange: string;
  isCritical: boolean;
  requestedAt: string;
  completedAt?: string;
  hospitalId: string;
  technician?: string;
  collectionStatus?: 'Pending' | 'Collected' | 'Analyzing' | 'Ready';
}

export interface RedistributionRequest {
  id: string;
  medicineName: string;
  quantity: number;
  fromHospitalId: string;
  fromHospitalName: string;
  toHospitalId: string;
  toHospitalName: string;
  status: 'Pending' | 'Approved' | 'Shipped' | 'Received';
  urgency: 'High' | 'Medium' | 'Low';
  requestDate: string;
  estimatedDelivery?: string;
  trackingCode?: string;
}

export interface ForecastData {
  date: string;
  patientVolume: number;
  predictedVolume: number;
  supplyDemandIndex: number; // 0-100 score
  alertRisk: 'High' | 'Medium' | 'Low';
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  status: 'OPD' | 'IPD';
  condition: 'Resuscitation' | 'Urgent' | 'Semi-Urgent' | 'Stable';
  emergency: boolean;
  history: string;
  registeredAt: string;
  wardType?: 'ICU' | 'General' | 'Emergency';
  hospitalId: string;
  timeline?: { title: string; desc: string; date: string }[];
}

export interface SystemAlert {
  id: string;
  message: string;
  type: 'Critical' | 'Warning' | 'Info';
  category: 'Bed' | 'Medicine' | 'Staff' | 'Epidemic' | 'Lab';
  timestamp: string;
  targetFacilityName: string;
  targetFacilityId: string;
  acknowledged: boolean;
}

export type Alert = SystemAlert;

export interface ActivityLog {
  id: string;
  action: string;
  actor: string;
  role: string;
  facilityName: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
