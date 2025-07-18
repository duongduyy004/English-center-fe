import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

// Attendance APIs
export const getTodayAttendanceAPI = (classId) => axiosInstance.get(API_CONFIG.ENDPOINTS.ATTENDANCES.GET_TODAY(classId));

export const getAttendanceListAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.ATTENDANCES.GET_LIST, { params });

export const updateAttendanceAPI = (id, data) => axiosInstance.patch(API_CONFIG.ENDPOINTS.ATTENDANCES.UPDATE(id), data);

export const getAttendanceByIdAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.ATTENDANCES.GET_BY_ID(id));
