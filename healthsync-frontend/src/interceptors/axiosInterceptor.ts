import { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AuthHelper } from '../auth/authHelper';
import { API_ROUTES } from '../constants/apiConstants';

// Queuing logic for concurrent requests during refresh token resolution
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Resilient request retry configuration
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

const MAX_RETRY_LIMIT = 3;

// Helper to extract CSRF tokens from cookies (standard Spring Security XSRF protection)
const getCookie = (name: string): string | null => {
  const matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : null;
};

export const setupAxiosInterceptors = (axiosInstance: AxiosInstance): void => {
  // Request Interceptor: Attach bearer token & CSRF header dynamically
  axiosInstance.interceptors.request.use(
    (config) => {
      // 1. Bearer JWT injection
      const token = AuthHelper.getAccessToken();
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      // 2. CSRF X-XSRF-TOKEN header injection for state-modifying requests (XSS/CSRF hardening)
      if (['post', 'put', 'delete', 'patch'].includes(config.method || '')) {
        const csrfToken = getCookie('XSRF-TOKEN');
        if (csrfToken && config.headers) {
          config.headers['X-XSRF-TOKEN'] = csrfToken;
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Manage JWT expiry retries, 429 Rate Limiting, and transient failure loops
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config as CustomAxiosRequestConfig;
      if (!originalRequest) return Promise.reject(error);

      // 1. JWT Access Token Renewal Flow
      if (error.response?.status === 401 && !originalRequest.url?.includes(API_ROUTES.AUTH.LOGIN)) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
              }
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        isRefreshing = true;
        const refreshToken = AuthHelper.getRefreshToken();

        if (refreshToken) {
          try {
            const response = await axiosInstance.post<any>(
              API_ROUTES.AUTH.REFRESH,
              { refreshToken }
            );

            const newAccessToken = response.data.data.accessToken;
            AuthHelper.setAccessToken(newAccessToken);
            processQueue(null, newAccessToken);
            isRefreshing = false;

            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            }
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;
            AuthHelper.clearAuth();
            if (window.location.pathname !== '/login') {
              window.location.href = '/login?expired=true';
            }
            return Promise.reject(refreshError);
          }
        } else {
          AuthHelper.clearAuth();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      }

      // 2. Rate Limiting (429 Too Many Requests) Backoff handling
      if (error.response?.status === 429) {
        console.warn('API Rate Limit triggered (429). Triggering backing off delay retry...');
        originalRequest._retryCount = originalRequest._retryCount || 0;
        
        if (originalRequest._retryCount < MAX_RETRY_LIMIT) {
          originalRequest._retryCount += 1;
          
          // Inject a rate limiting retry backoff (e.g. 3 seconds wait time)
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return axiosInstance(originalRequest);
        }
      }

      // 3. Resilient Retries for transient network/server glitches (502, 503, 504, or Network Errors)
      const isTransientError = 
        !error.response || 
        [502, 503, 504].includes(error.response.status);

      if (isTransientError) {
        originalRequest._retryCount = originalRequest._retryCount || 0;
        
        if (originalRequest._retryCount < MAX_RETRY_LIMIT) {
          originalRequest._retryCount += 1;
          
          // Exponential backoff delay
          const backoffDelay = Math.pow(2, originalRequest._retryCount) * 500;
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          
          return axiosInstance(originalRequest);
        }
      }

      return Promise.reject(error);
    }
  );
};
