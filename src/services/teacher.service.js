import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

// Teacher APIs
export const createTeacherAPI = (data) => axiosInstance.post(API_CONFIG.ENDPOINTS.TEACHERS.CREATE, data);

export const getAllTeachersAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_ALL, { params });

export const getTeacherByIdAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_BY_ID(id));

export const updateTeacherAPI = (id, data) => axiosInstance.patch(API_CONFIG.ENDPOINTS.TEACHERS.UPDATE(id), data);

export const deleteTeacherAPI = (id) => axiosInstance.delete(API_CONFIG.ENDPOINTS.TEACHERS.DELETE(id));

export const getMyClassesAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_MY_CLASSES);

export const getTeacherScheduleAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.TEACHERS.GET_SCHEDULE(id));
