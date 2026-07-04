import { apiClient } from '../api/client';
import { API_ROUTES } from '../constants/apiConstants';
import { Hospital, InventoryItem, Bed, Doctor, LabTest, RedistributionRequest, Patient, ActivityLog, Alert } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Delay helper to simulate network latency for realistic clinical UI loadings
const simulateLatency = <T>(data: T, delay = 300): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

// AuthService integration
export const AuthService = {
  login: async (credentials: { email: string; role: string; facilityId?: string }): Promise<{ accessToken: string; refreshToken: string; user: any }> => {
    if (API_BASE_URL) {
      const response = await apiClient.post(API_ROUTES.AUTH.LOGIN, credentials);
      return response.data;
    }
    return simulateLatency({
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      user: { email: credentials.email, role: credentials.role, name: 'Dr. Sarah Connor', facilityId: credentials.facilityId }
    });
  },

  register: async (user: any): Promise<any> => {
    if (API_BASE_URL) {
      const response = await apiClient.post(API_ROUTES.AUTH.REGISTER, user);
      return response.data;
    }
    return simulateLatency(user);
  }
};

// HospitalService integration
export const HospitalService = {
  getAll: async (districtId?: string): Promise<Hospital[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<Hospital[]>(`/hospitals`, { params: { districtId } });
      return response.data;
    }
    return simulateLatency([] as Hospital[]); 
  },
  
  getById: async (id: string): Promise<Hospital> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<Hospital>(`/hospitals/${id}`);
      return response.data;
    }
    return simulateLatency({} as Hospital);
  }
};

// InventoryService integration
export const InventoryService = {
  getAll: async (hospitalId?: string): Promise<InventoryItem[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<InventoryItem[]>(API_ROUTES.INVENTORY.BASE, { params: { hospitalId } });
      return response.data;
    }
    return simulateLatency([] as InventoryItem[]);
  },

  create: async (item: Partial<InventoryItem>): Promise<InventoryItem> => {
    if (API_BASE_URL) {
      const response = await apiClient.post<InventoryItem>(API_ROUTES.INVENTORY.BASE, item);
      return response.data;
    }
    return simulateLatency(item as InventoryItem);
  },

  update: async (itemId: string, item: Partial<InventoryItem>): Promise<InventoryItem> => {
    if (API_BASE_URL) {
      const response = await apiClient.put<InventoryItem>(`${API_ROUTES.INVENTORY.BASE}/${itemId}`, item);
      return response.data;
    }
    return simulateLatency(item as InventoryItem);
  },

  delete: async (itemId: string): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.delete<{ success: boolean }>(`${API_ROUTES.INVENTORY.BASE}/${itemId}`);
      return response.data.success;
    }
    return simulateLatency(true);
  },

  updateStock: async (itemId: string, newStock: number): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.put<{ success: boolean }>(API_ROUTES.INVENTORY.STOCK(itemId), { stockLevel: newStock });
      return response.data.success;
    }
    return simulateLatency(true);
  },

  exportCSV: async (): Promise<Blob> => {
    if (API_BASE_URL) {
      const response = await apiClient.get(API_ROUTES.INVENTORY.EXPORT, { responseType: 'blob' });
      return response.data;
    }
    return simulateLatency(new Blob(['id,name,batchNumber,stockLevel,supplier\nmed-1,Paracetamol,PA-102,80,Novartis'], { type: 'text/csv' }));
  }
};

// BedService integration
export const BedService = {
  getAll: async (hospitalId?: string): Promise<Bed[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<Bed[]>(API_ROUTES.BEDS.BASE, { params: { hospitalId } });
      return response.data;
    }
    return simulateLatency([] as Bed[]);
  },

  update: async (bedId: string, updates: Partial<Bed>): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.put<{ success: boolean }>(API_ROUTES.BEDS.TRANSFER(bedId), updates);
      return response.data.success;
    }
    return simulateLatency(true);
  }
};

// DoctorService integration
export const DoctorService = {
  getAll: async (hospitalId?: string): Promise<Doctor[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<Doctor[]>(API_ROUTES.DOCTORS.BASE, { params: { hospitalId } });
      return response.data;
    }
    return simulateLatency([] as Doctor[]);
  },

  updateStatus: async (doctorId: string, status: Doctor['status']): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.put<{ success: boolean }>(API_ROUTES.DOCTORS.STATUS(doctorId), { status });
      return response.data.success;
    }
    return simulateLatency(true);
  },

  assignShift: async (doctorId: string, shift: string, department: string): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.put<{ success: boolean }>(API_ROUTES.DOCTORS.SHIFT(doctorId), { shift, department });
      return response.data.success;
    }
    return simulateLatency(true);
  },

  requestLeave: async (doctorId: string, isLeave: boolean): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.put<{ success: boolean }>(API_ROUTES.DOCTORS.LEAVE(doctorId), { isLeave });
      return response.data.success;
    }
    return simulateLatency(true);
  }
};

// PatientService integration
export const PatientService = {
  getAll: async (hospitalId?: string): Promise<Patient[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<Patient[]>(API_ROUTES.PATIENTS.BASE, { params: { hospitalId } });
      return response.data;
    }
    return simulateLatency([] as Patient[]);
  },

  register: async (patient: Partial<Patient>): Promise<Patient> => {
    if (API_BASE_URL) {
      const response = await apiClient.post<Patient>(API_ROUTES.PATIENTS.REGISTER, patient);
      return response.data;
    }
    return simulateLatency(patient as Patient);
  },

  getTimeline: async (patientId: string): Promise<any[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<any[]>(API_ROUTES.PATIENTS.TIMELINE(patientId));
      return response.data;
    }
    return simulateLatency([
      { title: 'Admitted', description: 'Patient registered', timestamp: '10:00 AM' }
    ]);
  }
};

// LabService integration
export const LabService = {
  getAll: async (hospitalId?: string): Promise<LabTest[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<LabTest[]>(API_ROUTES.LABORATORY.BASE, { params: { hospitalId } });
      return response.data;
    }
    return simulateLatency([] as LabTest[]);
  },

  create: async (test: Partial<LabTest>): Promise<LabTest> => {
    if (API_BASE_URL) {
      const response = await apiClient.post<LabTest>(API_ROUTES.LABORATORY.BASE, test);
      return response.data;
    }
    return simulateLatency(test as LabTest);
  },

  updateStage: async (testId: string, collectionStatus: string): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.put<{ success: boolean }>(API_ROUTES.LABORATORY.STAGE(testId), { collectionStatus });
      return response.data.success;
    }
    return simulateLatency(true);
  },

  complete: async (testId: string, results: { value: string, isCritical: boolean, reagentLevelStatus: string }): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.put<{ success: boolean }>(API_ROUTES.LABORATORY.COMPLETE(testId), results);
      return response.data.success;
    }
    return simulateLatency(true);
  }
};

// RedistributionService integration
export const RedistributionService = {
  getAll: async (): Promise<RedistributionRequest[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<RedistributionRequest[]>(`/redistribution`);
      return response.data;
    }
    return simulateLatency([] as RedistributionRequest[]);
  },

  create: async (request: Partial<RedistributionRequest>): Promise<RedistributionRequest> => {
    if (API_BASE_URL) {
      const response = await apiClient.post<RedistributionRequest>(`/redistribution`, request);
      return response.data;
    }
    return simulateLatency(request as RedistributionRequest);
  },

  approve: async (id: string): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.post<{ success: boolean }>(`/redistribution/${id}/approve`);
      return response.data.success;
    }
    return simulateLatency(true);
  }
};

// AlertsService integration
export const AlertsService = {
  getAll: async (): Promise<Alert[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<Alert[]>(API_ROUTES.ALERTS.BASE);
      return response.data;
    }
    return simulateLatency([] as Alert[]);
  },

  acknowledge: async (alertId: string): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.post<{ success: boolean }>(API_ROUTES.ALERTS.ACKNOWLEDGE(alertId));
      return response.data.success;
    }
    return simulateLatency(true);
  },

  updateThresholds: async (thresholds: { stock: number; beds: number; doctors: number }): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.put<{ success: boolean }>(API_ROUTES.ALERTS.THRESHOLDS, thresholds);
      return response.data.success;
    }
    return simulateLatency(true);
  }
};

// ReportsService integration
export const ReportsService = {
  downloadReport: async (type: string, format: 'PDF' | 'Excel'): Promise<Blob> => {
    if (API_BASE_URL) {
      const response = await apiClient.get(API_ROUTES.REPORTS.DOWNLOAD(type, format), { responseType: 'blob' });
      return response.data;
    }
    return simulateLatency(new Blob([`Mock ${type} report content`], { type: format === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  }
};

// AIService integration
export const AIService = {
  getDashboardMetrics: async (): Promise<any> => {
    if (API_BASE_URL) {
      const response = await apiClient.get(API_ROUTES.AI.DASHBOARD);
      return response.data;
    }
    return simulateLatency({ districtRisk: 74, resourceHealth: 82, bedStrain: 86 });
  },

  getMedicineDemand: async (): Promise<any[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<any[]>(API_ROUTES.AI.DEMAND);
      return response.data;
    }
    return simulateLatency([]);
  },

  getStockoutRisk: async (): Promise<any[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<any[]>(API_ROUTES.AI.STOCKOUT);
      return response.data;
    }
    return simulateLatency([]);
  },

  getPatientFootfall: async (): Promise<any[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<any[]>(API_ROUTES.AI.FOOTFALL);
      return response.data;
    }
    return simulateLatency([]);
  },

  getBedOccupancy: async (): Promise<any[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<any[]>(API_ROUTES.AI.BEDS);
      return response.data;
    }
    return simulateLatency([]);
  },

  getDoctorWorkload: async (): Promise<any[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<any[]>(API_ROUTES.AI.DOCTORS);
      return response.data;
    }
    return simulateLatency([]);
  },

  getRecommendations: async (): Promise<any[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<any[]>(API_ROUTES.AI.RECOMMENDATIONS);
      return response.data;
    }
    return simulateLatency([]);
  }
};
