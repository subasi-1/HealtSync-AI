export const API_KEYS = {
  ACCESS_TOKEN: 'healthsync_access_token',
  REFRESH_TOKEN: 'healthsync_refresh_token',
  USER_ROLE: 'healthsync_user_role',
  USER_FACILITY: 'healthsync_user_facility',
};

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  INVENTORY: {
    BASE: '/inventory',
    STOCK: (id: string) => `/inventory/${id}/stock`,
    EXPORT: '/inventory/export-csv',
  },
  DOCTORS: {
    BASE: '/doctors',
    STATUS: (id: string) => `/doctors/${id}/status`,
    SHIFT: (id: string) => `/doctors/${id}/shift`,
    LEAVE: (id: string) => `/doctors/${id}/leave`,
  },
  PATIENTS: {
    BASE: '/patients',
    REGISTER: '/patients/register',
    TIMELINE: (id: string) => `/patients/${id}/timeline`,
  },
  BEDS: {
    BASE: '/beds',
    TRANSFER: (id: string) => `/beds/${id}/transfer`,
  },
  LABORATORY: {
    BASE: '/lab-tests',
    COMPLETE: (id: string) => `/lab-tests/${id}/complete`,
    STAGE: (id: string) => `/lab-tests/${id}/stage`,
  },
  ALERTS: {
    BASE: '/alerts',
    ACKNOWLEDGE: (id: string) => `/alerts/${id}/acknowledge`,
    THRESHOLDS: '/alerts/thresholds',
  },
  REPORTS: {
    DOWNLOAD: (type: string, format: string) => `/reports/download?type=${type}&format=${format}`,
  },
  AI: {
    DASHBOARD: '/ai/dashboard',
    DEMAND: '/ai/medicine-demand',
    STOCKOUT: '/ai/stockout-risk',
    FOOTFALL: '/ai/patient-footfall',
    BEDS: '/ai/bed-occupancy',
    DOCTORS: '/ai/doctor-workload',
    RECOMMENDATIONS: '/ai/recommendations',
  },
};
