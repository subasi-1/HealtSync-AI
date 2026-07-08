import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../context/AppContext';
import { 
  HospitalService, InventoryService, BedService, 
  DoctorService, LabService, RedistributionService,
  PatientService, AlertsService, ReportsService, AIService
} from '../services/api';
import { Bed, Doctor, LabTest, RedistributionRequest, Patient, Alert } from '../types/index';

export const useHospitalsQuery = (districtId?: string) => {
  const { hospitals } = useApp();
  return useQuery({
    queryKey: ['hospitals', districtId, hospitals],
    queryFn: async () => {
      if (import.meta.env.VITE_API_BASE_URL) {
        return HospitalService.getAll(districtId);
      }
      return districtId 
        ? hospitals.filter(h => h.district === districtId)
        : hospitals;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useInventoryQuery = (hospitalId?: string) => {
  const { inventory } = useApp();
  return useQuery({
    queryKey: ['inventory', hospitalId, inventory],
    queryFn: async () => {
      if (import.meta.env.VITE_API_BASE_URL) {
        return InventoryService.getAll(hospitalId);
      }
      return hospitalId
        ? inventory.filter(item => item.hospitalId === hospitalId)
        : inventory;
    },
  });
};

export const useBedsQuery = (hospitalId?: string) => {
  const { beds } = useApp();
  return useQuery({
    queryKey: ['beds', hospitalId, beds],
    queryFn: async () => {
      if (import.meta.env.VITE_API_BASE_URL) {
        return BedService.getAll(hospitalId);
      }
      return hospitalId
        ? beds.filter(b => b.hospitalId === hospitalId)
        : beds;
    },
  });
};

export const useDoctorsQuery = (hospitalId?: string) => {
  const { doctors } = useApp();
  return useQuery({
    queryKey: ['doctors', hospitalId, doctors],
    queryFn: async () => {
      if (import.meta.env.VITE_API_BASE_URL) {
        return DoctorService.getAll(hospitalId);
      }
      return hospitalId
        ? doctors.filter(d => d.hospitalId === hospitalId)
        : doctors;
    },
  });
};

export const usePatientsQuery = (hospitalId?: string) => {
  const { patients } = useApp();
  return useQuery({
    queryKey: ['patients', hospitalId, patients],
    queryFn: async () => {
      if (import.meta.env.VITE_API_BASE_URL) {
        return PatientService.getAll(hospitalId);
      }
      return hospitalId
        ? patients.filter(p => p.hospitalId === hospitalId)
        : patients;
    },
  });
};

export const useRedistributionsQuery = () => {
  const { redistributionRequests } = useApp();
  return useQuery({
    queryKey: ['redistributions', redistributionRequests],
    queryFn: async () => {
      if (import.meta.env.VITE_API_BASE_URL) {
        return RedistributionService.getAll();
      }
      return redistributionRequests;
    },
  });
};

export const useLabTestsQuery = (hospitalId?: string) => {
  const { laboratoryTests } = useApp();
  return useQuery({
    queryKey: ['labTests', hospitalId, laboratoryTests],
    queryFn: async () => {
      if (import.meta.env.VITE_API_BASE_URL) {
        return LabService.getAll(hospitalId);
      }
      return hospitalId
        ? laboratoryTests.filter(t => t.hospitalId === hospitalId)
        : laboratoryTests;
    },
  });
};

export const useAlertsQuery = (hospitalId?: string) => {
  const { alerts } = useApp();
  return useQuery({
    queryKey: ['alerts', hospitalId, alerts],
    queryFn: async () => {
      if (import.meta.env.VITE_API_BASE_URL) {
        return AlertsService.getAll();
      }
      return hospitalId
        ? alerts.filter(a => a.targetFacilityId === hospitalId)
        : alerts;
    },
  });
};

// Mutations with optimistic updates or cache invalidation loops
export const useUpdateStockMutation = () => {
  const { updateInventoryStock } = useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, newStock }: { itemId: string, newStock: number }) => {
      await InventoryService.updateStock(itemId, newStock);
      return { itemId, newStock };
    },
    onSuccess: (data) => {
      updateInventoryStock(data.itemId, data.newStock);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};

export const useTransferBedMutation = () => {
  const { transferBed } = useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bedId, updates }: { bedId: string, updates: Partial<Bed> }) => {
      await BedService.update(bedId, updates);
      return { bedId, updates };
    },
    onSuccess: (data) => {
      transferBed(data.bedId, data.updates);
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};

export const useUpdateDoctorMutation = () => {
  const { updateDoctorStatus } = useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ doctorId, status }: { doctorId: string, status: Doctor['status'] }) => {
      await DoctorService.updateStatus(doctorId, status);
      return { doctorId, status };
    },
    onSuccess: (data) => {
      updateDoctorStatus(data.doctorId, data.status);
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    },
  });
};

export const useUpdateDoctorShiftMutation = () => {
  const { assignShift } = useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ doctorId, shift, department }: { doctorId: string; shift: Doctor['shift']; department: string }) => {
      await DoctorService.assignShift(doctorId, shift, department);
      return { doctorId, shift, department };
    },
    onSuccess: (data) => {
      assignShift(data.doctorId, data.shift, data.department);
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    }
  });
};

export const useRequestLeaveMutation = () => {
  const { requestLeave } = useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ doctorId, isLeave }: { doctorId: string; isLeave: boolean }) => {
      await DoctorService.requestLeave(doctorId, isLeave);
      return { doctorId, isLeave };
    },
    onSuccess: (data) => {
      requestLeave(data.doctorId, data.isLeave);
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    }
  });
};

export const useRegisterPatientMutation = () => {
  const { registerPatient } = useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: Partial<Patient>) => {
      return await PatientService.register(patient);
    },
    onSuccess: (data) => {
      registerPatient(data);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
    }
  });
};

export const useUpdateCollectionStatusMutation = () => {
  const { updateCollectionStatus } = useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ testId, status }: { testId: string; status: any }) => {
      await LabService.updateStage(testId, status);
      return { testId, status };
    },
    onSuccess: (data) => {
      updateCollectionStatus(data.testId, data.status);
      queryClient.invalidateQueries({ queryKey: ['labTests'] });
    }
  });
};

export const useRedistributionMutation = () => {
  const { createRedistributionRequest } = useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: { medicineName: string, quantity: number, fromHospitalId: string, toHospitalId: string, urgency: 'High' | 'Medium' | 'Low' }) => {
      await RedistributionService.create(request);
      return request;
    },
    onSuccess: (data) => {
      createRedistributionRequest(data.medicineName, data.quantity, data.fromHospitalId, data.toHospitalId, data.urgency);
      queryClient.invalidateQueries({ queryKey: ['redistributions'] });
    },
  });
};

export const useApproveRedistributionMutation = () => {
  const { approveRedistribution } = useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await RedistributionService.approve(id);
      return id;
    },
    onSuccess: (id) => {
      approveRedistribution(id);
      queryClient.invalidateQueries({ queryKey: ['redistributions'] });
    },
  });
};

export const useAcknowledgeAlertMutation = () => {
  const { acknowledgeAlert } = useApp();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await AlertsService.acknowledge(id);
      return id;
    },
    onSuccess: (id) => {
      acknowledgeAlert(id);
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
  });
};

export const useAiDashboardQuery = () => {
  return useQuery({
    queryKey: ['ai-dashboard'],
    queryFn: () => AIService.getDashboardMetrics(),
    retry: 3,
    refetchOnWindowFocus: false
  });
};

export const useAiDemandQuery = () => {
  return useQuery({
    queryKey: ['ai-demand'],
    queryFn: () => AIService.getMedicineDemand(),
    retry: 3,
    refetchOnWindowFocus: false
  });
};

export const useAiStockoutQuery = () => {
  return useQuery({
    queryKey: ['ai-stockout'],
    queryFn: () => AIService.getStockoutRisk(),
    retry: 3,
    refetchOnWindowFocus: false
  });
};

export const useAiFootfallQuery = () => {
  return useQuery({
    queryKey: ['ai-footfall'],
    queryFn: () => AIService.getPatientFootfall(),
    retry: 3,
    refetchOnWindowFocus: false
  });
};

export const useAiBedsQuery = () => {
  return useQuery({
    queryKey: ['ai-beds'],
    queryFn: () => AIService.getBedOccupancy(),
    retry: 3,
    refetchOnWindowFocus: false
  });
};

export const useAiDoctorsQuery = () => {
  return useQuery({
    queryKey: ['ai-doctors'],
    queryFn: () => AIService.getDoctorWorkload(),
    retry: 3,
    refetchOnWindowFocus: false
  });
};

export const useAiRecommendationsQuery = () => {
  return useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => AIService.getRecommendations(),
    retry: 3,
    refetchOnWindowFocus: false
  });
};
