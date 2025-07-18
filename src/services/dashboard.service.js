import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

// Dashboard APIs
export const getAdminDashboardAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.ADMIN);

export const getTeacherDashboardAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.TEACHER(id));

export const getParentDashboardAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.PARENT(id));

export const getStudentDashboardAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.STUDENT(id));
