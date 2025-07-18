import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

// Student APIs
export const createStudentAPI = (data) => axiosInstance.post(API_CONFIG.ENDPOINTS.STUDENTS.CREATE, data);

export const getAllStudentsAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.GET_ALL, { params });

export const getStudentByIdAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.GET_BY_ID(id));

export const updateStudentAPI = (id, data) => axiosInstance.patch(API_CONFIG.ENDPOINTS.STUDENTS.UPDATE(id), data);

export const deleteStudentAPI = (id) => axiosInstance.delete(API_CONFIG.ENDPOINTS.STUDENTS.DELETE(id));

export const getStudentScheduleAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.SCHEDULE(id));

export const getStudentAttendanceAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.ATTENDANCE(id));

export const getMonthlyStudentChangeAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.STUDENTS.MONTHLY_CHANGES, { params });
