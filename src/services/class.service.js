import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

// Class APIs
export const createClassAPI = (data) => axiosInstance.post(API_CONFIG.ENDPOINTS.CLASSES.CREATE, data);

export const updateClassAPI = (id, data) => axiosInstance.patch(API_CONFIG.ENDPOINTS.CLASSES.UPDATE(id), data);

export const getAllClassesAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.CLASSES.GET_ALL, { params });

export const getClassByIdAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.CLASSES.GET_BY_ID(id));

export const enrollStudentAPI = (classId, students) => axiosInstance.patch(API_CONFIG.ENDPOINTS.CLASSES.ENROLL_STUDENT(classId), students);

export const getStudentsInClassAPI = (classId, params) => axiosInstance.get(API_CONFIG.ENDPOINTS.CLASSES.GET_STUDENTS(classId), { params });

export const removeStudentFromClassAPI = (classId, studentId) => axiosInstance.delete(API_CONFIG.ENDPOINTS.CLASSES.REMOVE_STUDENT(classId), { data: { studentId } });

export const assignTeacherAPI = (classId, teacherId) => {
    const formData = new URLSearchParams();
    formData.append('teacherId', teacherId);
    return axiosInstance.patch(API_CONFIG.ENDPOINTS.CLASSES.ASSIGN_TEACHER(classId), formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
};

export const unassignTeacherAPI = (classId) => axiosInstance.delete(API_CONFIG.ENDPOINTS.CLASSES.UNASSIGN_TEACHER(classId));
