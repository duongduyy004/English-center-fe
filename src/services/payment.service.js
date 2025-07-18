import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

// Payment APIs
export const getPaymentsAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_ALL, { params });

export const getPaymentsByStudentAPI = (studentId, params) => axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_BY_STUDENT(studentId), { params });

export const getTotalPaymentsAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_TOTAL);

export const getTeacherPaymentsAPI = (params) => axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_TEACHER_PAYMENTS, { params });

export const payTeacherAPI = (id, data, params = {}) => {
    const formData = new URLSearchParams();
    formData.append('amount', String(Number(data.amount)));
    if (data.method) formData.append('method', data.method);
    if (data.note) formData.append('note', data.note);
    return axiosInstance.post(API_CONFIG.ENDPOINTS.PAYMENTS.PAY_TEACHER(id), formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        params
    });
};

export const getTeacherPaymentByIdAPI = (id) => axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_TEACHER_PAYMENT_BY_ID(id));

export const getReturnURLAPI = () => axiosInstance.get(API_CONFIG.ENDPOINTS.PAYMENTS.GET_RETURN_URL);

export const updatePaymentRecordAPI = (paymentId, data) => axiosInstance.patch(API_CONFIG.ENDPOINTS.PAYMENTS.UPDATE_RECORD(paymentId), data);