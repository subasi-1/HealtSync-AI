import { API_KEYS } from '../constants/apiConstants';

export const AuthHelper = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(API_KEYS.ACCESS_TOKEN);
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem(API_KEYS.ACCESS_TOKEN, token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(API_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(API_KEYS.REFRESH_TOKEN, token);
  },

  clearAuth: (): void => {
    localStorage.removeItem(API_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(API_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(API_KEYS.USER_ROLE);
    localStorage.removeItem(API_KEYS.USER_FACILITY);
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return true;
      const decodedJson = atob(payloadBase64);
      const decoded = JSON.parse(decodedJson);
      const exp = decoded.exp;
      if (!exp) return false;
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  },

  getUserRole: (): string | null => {
    return localStorage.getItem(API_KEYS.USER_ROLE);
  },

  setUserRole: (role: string): void => {
    localStorage.setItem(API_KEYS.USER_ROLE, role);
  },

  getUserFacility: (): string | null => {
    return localStorage.getItem(API_KEYS.USER_FACILITY);
  },

  setUserFacility: (facilityId: string): void => {
    localStorage.setItem(API_KEYS.USER_FACILITY, facilityId);
  }
};
export default AuthHelper;
