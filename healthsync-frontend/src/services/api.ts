import { apiClient } from '../api/client';
import { API_ROUTES } from '../constants/apiConstants';
import { Hospital, InventoryItem, Bed, Doctor, LabTest, RedistributionRequest, Patient, Alert } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Delay helper to simulate network latency for realistic clinical UI loadings
const simulateLatency = <T>(data: T, delay = 150): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

// AuthService integration
export const AuthService = {
  login: async (credentials: { username: string; password: string }): Promise<{ accessToken: string; refreshToken: string; tokenType: string; username: string; role: string }> => {
    if (API_BASE_URL) {
      const response = await apiClient.post<any>(API_ROUTES.AUTH.LOGIN, credentials);
      // Backend response is wrapped in ApiResponse
      return response.data.data;
    }
    return simulateLatency({
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      tokenType: 'Bearer',
      username: credentials.username,
      role: 'SUPER_ADMIN'
    });
  },

  register: async (user: any): Promise<any> => {
    if (API_BASE_URL) {
      const response = await apiClient.post<any>(API_ROUTES.AUTH.REGISTER, user);
      // Backend response is wrapped in ApiResponse
      return response.data.data;
    }
    return simulateLatency(user);
  },

  getProfile: async (): Promise<any> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<any>(API_ROUTES.AUTH.ME);
      return response.data.data;
    }
    return simulateLatency({
      id: 'mock-user-1',
      username: 'director.rajesh',
      email: 'director.rajesh@healthsync.gov',
      fullName: 'Chief Director Rajesh',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    });
  }
};

// HospitalService integration
export const HospitalService = {
  getAll: async (districtId?: string): Promise<Hospital[]> => {
    if (API_BASE_URL) {
      // Query the dashboard health-centers list
      const response = await apiClient.get<any[]>(`/dashboard/health-centers`);
      const list = response.data || [];
      return list.map(dto => {
        // Parse bed occupancy: e.g. "15/40 occupied"
        let occupiedBeds = 0;
        let totalBeds = 0;
        if (dto.bedOccupancy) {
          const match = dto.bedOccupancy.match(/(\d+)\/(\d+)/);
          if (match) {
            occupiedBeds = parseInt(match[1], 10);
            totalBeds = parseInt(match[2], 10);
          }
        }
        
        // Parse doctor availability: e.g. "8/12 present"
        let activeDocs = 0;
        let totalDocs = 0;
        if (dto.doctorAvailability) {
          const match = dto.doctorAvailability.match(/(\d+)\/(\d+)/);
          if (match) {
            activeDocs = parseInt(match[1], 10);
            totalDocs = parseInt(match[2], 10);
          }
        }

        // Generate a deterministic coordinate offset based on the id
        const hash = dto.id.split('-').reduce((acc: number, val: string) => acc + val.charCodeAt(0), 0);
        const latOffset = (hash % 100) / 1000;
        const lonOffset = ((hash >> 2) % 100) / 1000;
        const latitude = 20.2724 + latOffset;
        const longitude = 85.8338 + lonOffset;

        return {
          id: dto.id,
          name: dto.name,
          district: dto.districtName || 'District Central',
          type: dto.type === 'PHC' ? 'PHC' : dto.type === 'CHC' ? 'CHC' : dto.type === 'SPECIALTY' ? 'Specialty' : 'District Hospital',
          bedsCount: {
            total: totalBeds || 30,
            occupied: occupiedBeds || 10,
            available: Math.max(0, (totalBeds || 30) - (occupiedBeds || 10))
          },
          doctorCount: {
            total: totalDocs || 15,
            active: activeDocs || 5,
            standby: Math.max(0, (totalDocs || 15) - (activeDocs || 5))
          },
          activeAlertsCount: dto.status === 'CRITICAL' ? 3 : 0,
          location: [latitude, longitude] as [number, number]
        };
      });
    }
    return simulateLatency([] as Hospital[]); 
  },
  
  getById: async (id: string): Promise<Hospital> => {
    if (API_BASE_URL) {
      const list = await HospitalService.getAll();
      const found = list.find(h => h.id === id);
      if (found) return found;
      throw new Error('Hospital not found');
    }
    return simulateLatency({} as Hospital);
  }
};

// InventoryService integration
export const InventoryService = {
  getAll: async (hospitalId?: string): Promise<InventoryItem[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<any>(API_ROUTES.INVENTORY.BASE, { params: { hospitalId } });
      const items = response.data.data || [];
      return items.map((inv: any) => ({
        id: inv.id,
        name: inv.medicine?.name || '',
        category: inv.medicine?.category || 'Medication',
        batchNumber: inv.batchNumber || '',
        stockLevel: inv.quantity || 0,
        safetyStockThreshold: inv.reorderLevel || 0,
        expiryDate: inv.expiryDate || '',
        unit: inv.unit || 'units',
        hospitalId: inv.healthCenter?.id || '',
        hospitalName: inv.healthCenter?.name || '',
        dailyConsumptionRate: inv.dailyConsumption || 1,
        daysOfStockLeft: Math.round((inv.quantity || 0) / (inv.dailyConsumption || 1)),
        demandForecastNextMonth: (inv.dailyConsumption || 1) * 30,
        supplier: inv.supplier || 'Generic Provider',
        mfgDate: inv.mfgDate || ''
      }));
    }
    return simulateLatency([] as InventoryItem[]);
  },

  create: async (item: Partial<InventoryItem>): Promise<InventoryItem> => {
    return simulateLatency(item as InventoryItem);
  },

  update: async (itemId: string, item: Partial<InventoryItem>): Promise<InventoryItem> => {
    return simulateLatency(item as InventoryItem);
  },

  delete: async (itemId: string): Promise<boolean> => {
    return simulateLatency(true);
  },

  updateStock: async (itemId: string, newStock: number): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.put<any>(API_ROUTES.INVENTORY.STOCK(itemId), { stockLevel: newStock });
      return response.data.success;
    }
    return simulateLatency(true);
  },

  exportCSV: async (): Promise<Blob> => {
    return simulateLatency(new Blob(['id,name,batchNumber,stockLevel,supplier\nmed-1,Paracetamol,PA-102,80,Novartis'], { type: 'text/csv' }));
  }
};

// BedService integration
export const BedService = {
  getAll: async (hospitalId?: string): Promise<Bed[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<any[]>(API_ROUTES.BEDS.BASE);
      const list = response.data || [];
      const mapped = list.map((b: any) => ({
        id: b.id,
        roomNumber: b.bedNumber,
        wardType: b.wardType as any,
        status: (b.availabilityStatus === 'AVAILABLE' ? 'Available' : b.availabilityStatus === 'OCCUPIED' ? 'Occupied' : b.availabilityStatus === 'CLEANING' ? 'Cleaning' : 'Reserved') as Bed['status'],
        ventilatorAttached: b.bedType === 'ICU',
        hospitalId: b.hospitalId || ''
      }));
      return hospitalId ? mapped.filter(b => b.hospitalId === hospitalId) : mapped;
    }
    return simulateLatency([] as Bed[]);
  },

  update: async (bedId: string, updates: Partial<Bed>): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<any>(`/beds/${bedId}`);
      const b = response.data;
      
      const requestBody = {
        bedNumber: b.bedNumber,
        bedType: b.bedType,
        availabilityStatus: (updates.status || b.availabilityStatus).toUpperCase(),
        cleaningStatus: b.cleaningStatus || 'CLEAN',
        maintenanceStatus: b.maintenanceStatus || 'OPERATIONAL',
        wardId: b.wardId
      };
      
      await apiClient.put(`/beds/${bedId}`, requestBody);
      return true;
    }
    return simulateLatency(true);
  }
};

// DoctorService integration
export const DoctorService = {
  getAll: async (hospitalId?: string): Promise<Doctor[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<any>(API_ROUTES.DOCTORS.BASE, { params: { hospitalId } });
      const list = response.data.data || [];
      return list.map((doc: any) => ({
        id: doc.id,
        name: doc.user?.fullName || 'Dr. Specialist',
        specialty: doc.specialization || 'General Practice',
        status: doc.user?.status === 'ACTIVE' ? 'Active' : 'Off-Duty',
        shift: doc.defaultShift?.name || 'Day',
        contact: doc.user?.email || 'escalations@healthsync.gov',
        attendanceRate: 95,
        satisfactionScore: 4.8,
        hospitalId: doc.healthCenter?.id || '',
        hospitalName: doc.healthCenter?.name || ''
      }));
    }
    return simulateLatency([] as Doctor[]);
  },

  updateStatus: async (doctorId: string, status: Doctor['status']): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.put<any>(API_ROUTES.DOCTORS.STATUS(doctorId), { status });
      return response.data.success;
    }
    return simulateLatency(true);
  },

  assignShift: async (doctorId: string, shift: string, department: string): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.put<any>(API_ROUTES.DOCTORS.SHIFT(doctorId), { shift, department });
      return response.data.success;
    }
    return simulateLatency(true);
  },

  requestLeave: async (doctorId: string, isLeave: boolean): Promise<boolean> => {
    if (API_BASE_URL) {
      const response = await apiClient.put<any>(API_ROUTES.DOCTORS.LEAVE(doctorId), { isLeave });
      return response.data.success;
    }
    return simulateLatency(true);
  }
};

// PatientService integration
export const PatientService = {
  getAll: async (hospitalId?: string): Promise<Patient[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<any[]>(API_ROUTES.PATIENTS.BASE);
      const list = response.data || [];
      const mapped = list.map((pat: any) => ({
        id: pat.id,
        name: pat.fullName || '',
        age: pat.age || 30,
        gender: pat.gender || 'Male',
        status: pat.status || 'OPD',
        condition: 'Stable' as Patient['condition'],
        emergency: pat.status === 'EMERGENCY',
        history: pat.medicalRecordNumber || '',
        registeredAt: pat.dateOfBirth ? pat.dateOfBirth.toString() : '',
        hospitalId: pat.healthCenterId || ''
      }));
      
      return hospitalId ? mapped.filter(p => p.hospitalId === hospitalId) : mapped;
    }
    return simulateLatency([] as Patient[]);
  },

  register: async (patient: Partial<Patient>): Promise<Patient> => {
    if (API_BASE_URL) {
      const centersRes = await apiClient.get<any[]>('/dashboard/health-centers');
      const centers = centersRes.data || [];
      const match = centers.find(c => c.id === patient.hospitalId) || centers[0];
      
      const districtId = match ? match.districtId || '3fa85f64-5717-4562-b3fc-2c963f66afa6' : '3fa85f64-5717-4562-b3fc-2c963f66afa6';
      const healthCenterId = match ? match.id : patient.hospitalId;

      const birthYear = new Date().getFullYear() - (patient.age || 30);
      const dob = `${birthYear}-01-01`;

      const requestBody = {
        userId: null,
        medicalRecordNumber: patient.history || `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
        fullName: patient.name || 'Anonymous Patient',
        gender: patient.gender || 'Male',
        dateOfBirth: dob,
        bloodGroup: 'O+',
        mobileNumber: '+919999999999',
        address: 'Registered Center Address',
        status: patient.status || 'OPD',
        districtId: districtId,
        healthCenterId: healthCenterId,
        emergencyContact: {
          contactName: 'Emergency Contact',
          relation: 'Next of Kin',
          mobileNumber: '+919876543210'
        }
      };

      const response = await apiClient.post<any>('/patients', requestBody);
      const pat = response.data;
      return {
        id: pat.id,
        name: pat.fullName,
        age: pat.age,
        gender: pat.gender,
        status: pat.status,
        condition: 'Stable',
        emergency: pat.status === 'EMERGENCY',
        history: pat.medicalRecordNumber,
        registeredAt: pat.dateOfBirth ? pat.dateOfBirth.toString() : '',
        hospitalId: pat.healthCenterId || ''
      };
    }
    return simulateLatency(patient as Patient);
  },

  getTimeline: async (patientId: string): Promise<any[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<any[]>(`/visits`, { params: { patientId } });
      const visits = response.data || [];
      return visits.map((v: any) => ({
        title: v.visitType || 'Clinical Visit',
        description: `Admitted to ${v.department || 'General'} by Dr. ${v.doctorName || 'Staff'}. Diagnosis: ${v.diagnosis || 'None'}`,
        timestamp: v.visitDate ? new Date(v.visitDate).toLocaleString() : 'Recent'
      }));
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
      const [bookingsRes, resultsRes] = await Promise.all([
        apiClient.get<any[]>('/test-bookings'),
        apiClient.get<any[]>('/test-results').catch(() => ({ data: [] }))
      ]);
      
      const bookings = bookingsRes.data || [];
      const resultsList = resultsRes.data || [];
      const resultsMap = new Map(resultsList.map(r => [r.bookingId, r]));

      const mapped = bookings.map((b: any) => {
        const res = resultsMap.get(b.id) as any;
        return {
          id: b.id,
          patientName: b.patientName || b.patient?.fullName || 'Patient',
          testType: b.diagnosticTest?.testName || 'CBC',
          status: (b.status === 'COMPLETED' ? 'Completed' : b.status === 'IN_PROGRESS' ? 'In-Progress' : 'Pending') as LabTest['status'],
          reagentLevelStatus: 'Normal' as LabTest['reagentLevelStatus'],
          value: res?.result || '',
          referenceRange: 'Normal range',
          isCritical: b.priority === 'CRITICAL' || b.priority === 'URGENT',
          requestedAt: b.bookingDate || '',
          completedAt: res?.completedDate || '',
          hospitalId: b.doctor?.healthCenter?.id || '',
          technician: b.technician || 'Technician',
          collectionStatus: (b.status === 'COMPLETED' ? 'Ready' : b.status === 'COLLECTED' ? 'Collected' : 'Pending') as LabTest['collectionStatus']
        };
      });

      return hospitalId ? mapped.filter(t => t.hospitalId === hospitalId) : mapped;
    }
    return simulateLatency([] as LabTest[]);
  },

  create: async (test: Partial<LabTest>): Promise<LabTest> => {
    if (API_BASE_URL) {
      const [patientsRes, doctorsRes, testsRes] = await Promise.all([
        apiClient.get<any[]>('/patients'),
        apiClient.get<any>('/doctors'),
        apiClient.get<any[]>('/diagnostic-tests')
      ]);

      const patients = patientsRes.data || [];
      const doctors = doctorsRes.data.data || [];
      const tests = testsRes.data || [];

      if (patients.length === 0 || doctors.length === 0 || tests.length === 0) {
        throw new Error('Cannot book test: Missing patient, doctor, or test catalog in DB.');
      }

      const patient = patients.find(p => p.fullName.toLowerCase().includes((test.patientName || '').toLowerCase())) || patients[0];
      const doctor = doctors[0];
      const diagnosticTest = tests.find(t => t.testName.toLowerCase().includes((test.testType || '').toLowerCase())) || tests[0];

      const requestBody = {
        patientId: patient.id,
        doctorId: doctor.id,
        diagnosticTestId: diagnosticTest.id,
        bookingDate: new Date().toISOString().split('T')[0],
        status: 'PENDING',
        priority: test.isCritical ? 'CRITICAL' : 'ROUTINE'
      };

      const response = await apiClient.post<any>('/test-bookings', requestBody);
      const b = response.data;
      return {
        id: b.id,
        patientName: patient.fullName,
        testType: diagnosticTest.testName,
        status: 'Pending',
        reagentLevelStatus: 'Normal',
        value: '',
        referenceRange: 'Normal range',
        isCritical: test.isCritical || false,
        requestedAt: b.bookingDate || '',
        hospitalId: doctor.healthCenter?.id || '',
        technician: test.technician || 'Technician',
        collectionStatus: 'Pending'
      };
    }
    return simulateLatency(test as LabTest);
  },

  updateStage: async (testId: string, collectionStatus: string): Promise<boolean> => {
    if (API_BASE_URL) {
      const current = await apiClient.get<any>(`/test-bookings/${testId}`);
      const b = current.data;
      
      let newStatus = 'PENDING';
      if (collectionStatus === 'Collected' || collectionStatus === 'Analyzing') {
        newStatus = 'COLLECTED';
      } else if (collectionStatus === 'Ready') {
        newStatus = 'COMPLETED';
      }

      const requestBody = {
        patientId: b.patientId || b.patient?.id,
        doctorId: b.doctorId || b.doctor?.id,
        diagnosticTestId: b.diagnosticTestId || b.diagnosticTest?.id,
        bookingDate: b.bookingDate,
        status: newStatus,
        priority: b.priority
      };

      await apiClient.put(`/test-bookings/${testId}`, requestBody);
      return true;
    }
    return simulateLatency(true);
  },

  complete: async (testId: string, results: { value: string, isCritical: boolean, reagentLevelStatus: string }): Promise<boolean> => {
    if (API_BASE_URL) {
      const current = await apiClient.get<any>(`/test-bookings/${testId}`);
      const b = current.data;

      const bookingRequestBody = {
        patientId: b.patientId || b.patient?.id,
        doctorId: b.doctorId || b.doctor?.id,
        diagnosticTestId: b.diagnosticTestId || b.diagnosticTest?.id,
        bookingDate: b.bookingDate,
        status: 'COMPLETED',
        priority: results.isCritical ? 'CRITICAL' : b.priority
      };
      await apiClient.put(`/test-bookings/${testId}`, bookingRequestBody);

      const resultRequestBody = {
        bookingId: testId,
        result: results.value,
        remarks: `Reagent status: ${results.reagentLevelStatus || 'Normal'}`
      };
      await apiClient.post('/test-results', resultRequestBody);
      return true;
    }
    return simulateLatency(true);
  }
};

// RedistributionService integration
export const RedistributionService = {
  getAll: async (): Promise<RedistributionRequest[]> => {
    if (API_BASE_URL) {
      const centersRes = await apiClient.get<any[]>('/dashboard/health-centers');
      const centers = centersRes.data || [];
      if (centers.length === 0) return [];
      
      const transfersPromises = centers.map((c: any) => 
        apiClient.get<any[]>(`/ai/resource-transfer`, { params: { healthCenterId: c.id } })
          .then(res => res.data.map((t: any) => ({ ...t, id: `${c.id}-${t.medicineName}` })))
          .catch(() => [])
      );
      
      const allTransfersLists = await Promise.all(transfersPromises);
      const allTransfers = allTransfersLists.flat();

      return allTransfers.map((t: any) => ({
        id: t.id || `${t.sourceCenterId}-${t.medicineName}`,
        medicineName: t.medicineName,
        quantity: t.transferQty,
        fromHospitalId: t.sourceCenterId,
        fromHospitalName: t.sourceCenterName,
        toHospitalId: t.destinationCenterId,
        toHospitalName: t.destinationCenterName,
        status: 'Pending',
        urgency: t.urgency === 'HIGH' ? 'High' : t.urgency === 'MEDIUM' ? 'Medium' : 'Low',
        requestDate: new Date().toISOString().split('T')[0]
      }));
    }
    return simulateLatency([] as RedistributionRequest[]);
  },

  create: async (request: Partial<RedistributionRequest>): Promise<RedistributionRequest> => {
    return simulateLatency(request as RedistributionRequest);
  },

  approve: async (id: string): Promise<boolean> => {
    return simulateLatency(true);
  }
};

// AlertsService integration
export const AlertsService = {
  getAll: async (): Promise<Alert[]> => {
    if (API_BASE_URL) {
      const response = await apiClient.get<any[]>(`/dashboard/notifications`);
      const list = response.data || [];
      return list.map((dto: any) => ({
        id: dto.id,
        message: dto.message,
        type: dto.type === 'CRITICAL' || dto.message.includes('below safety') ? 'Critical' : 'Warning',
        category: dto.message.toLowerCase().includes('bed') ? 'Bed' 
                : dto.message.toLowerCase().includes('medicine') || dto.message.toLowerCase().includes('stock') ? 'Medicine'
                : dto.message.toLowerCase().includes('doctor') || dto.message.toLowerCase().includes('attendance') ? 'Staff'
                : dto.message.toLowerCase().includes('lab') ? 'Lab' : 'Epidemic',
        timestamp: dto.createdDate ? new Date(dto.createdDate).toLocaleTimeString() : 'Just now',
        targetFacilityName: dto.healthCenterName || 'District HQ',
        targetFacilityId: dto.healthCenterId || 'hosp-1',
        acknowledged: dto.status === 'READ'
      }));
    }
    return simulateLatency([] as Alert[]);
  },

  acknowledge: async (alertId: string): Promise<boolean> => {
    if (API_BASE_URL) {
      await apiClient.put(`/notifications/${alertId}/read`);
      return true;
    }
    return simulateLatency(true);
  },

  updateThresholds: async (thresholds: { stock: number; beds: number; doctors: number }): Promise<boolean> => {
    return simulateLatency(true);
  }
};

// ReportsService integration
export const ReportsService = {
  downloadReport: async (type: string, format: 'PDF' | 'Excel'): Promise<Blob> => {
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
