import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

// Parent APIs
export const createParentAPI = (data) => axiosInstance.post(API_CONFIG.ENDPOINTS.PARENTS.CREATE, data);

export const getAllParentsAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.PARENTS.GET_ALL, { params });

export const getParentByIdAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.PARENTS.GET_BY_ID(id));

export const updateParentAPI = (id, data) => axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.UPDATE(id), data);

export const deleteParentAPI = (id) => axiosInstance.delete(API_CONFIG.ENDPOINTS.PARENTS.DELETE(id));

export const addChildAPI = (studentId, parentId) => {
    const formData = new URLSearchParams();
    formData.append('studentId', studentId);
    formData.append('parentId', parentId);
    return axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.ADD_CHILD, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
};

export const removeChildAPI = (studentId, parentId) => {
    const formData = new URLSearchParams();
    formData.append('studentId', studentId);
    formData.append('parentId', parentId);
    return axiosInstance.delete(API_CONFIG.ENDPOINTS.PARENTS.REMOVE_CHILD, {
        data: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
};

export const payTuitionAPI = (data) => axiosInstance.patch(API_CONFIG.ENDPOINTS.PARENTS.PAY_TUITION, data);
