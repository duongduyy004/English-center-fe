import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

// User APIs
export const uploadAvatarAPI = (formData) => axiosInstance.post(API_CONFIG.ENDPOINTS.USERS.UPLOAD_AVATAR, formData);

export const getUserByIdAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.USERS.GET_BY_ID(id));

export const updateUserAPI = (userId, data) => {
    const formData = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
    });
    return axiosInstance.patch(API_CONFIG.ENDPOINTS.USERS.UPDATE(userId), formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
};
