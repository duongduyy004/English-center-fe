import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

// Announcement APIs (Quản lý quảng cáo)
export const createAnnouncementAPI = (data) =>
    axiosInstance.post(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.CREATE, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const getAllAnnouncementsAPI = (params) =>
    axiosInstance.get(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.GET_ALL, { params });

export const getAnnouncementByIdAPI = (id) =>
    axiosInstance.get(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.GET_BY_ID(id));

export const updateAnnouncementAPI = (id, data) =>
    axiosInstance.patch(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.UPDATE(id), data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const deleteAnnouncementAPI = (id) =>
    axiosInstance.delete(API_CONFIG.ENDPOINTS.ANNOUNCEMENTS.DELETE(id));
