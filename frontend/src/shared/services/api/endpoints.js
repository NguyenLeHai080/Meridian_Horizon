// Central API Endpoints Definition
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const ENDPOINTS = {
  // Auth Module
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  // Video Dubbing Studio Module
  DUBBING: {
    PROVIDERS: '/dubbing/providers',
    PROJECTS: '/dubbing/projects',
    PROJECT_DETAIL: (id) => `/dubbing/projects/${id}`,
    EXECUTE_STEP: (id) => `/dubbing/projects/${id}/execute-step`,
  },
  // System Health
  SYSTEM: {
    HEALTH: '/system/health',
  },
};
