import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

// Auth APIs
export const registerAPI = (data) => axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);

export const registerAdminAPI = (data) => axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);

export const loginAPI = (data) => {
    const formData = new URLSearchParams();
    formData.append('email', data.email);
    formData.append('password', data.password);
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
};

export const changePasswordAPI = (oldPassword, newPassword) => {
    const formData = new URLSearchParams();
    formData.append('oldPassword', oldPassword);
    formData.append('newPassword', newPassword);
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
};

export const logoutAPI = (refreshToken) => {
    const formData = new URLSearchParams();
    formData.append('refreshToken', refreshToken);
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
};

export const forgotPasswordAPI = (email) => {
    const formData = new URLSearchParams();
    formData.append('email', email);
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
};

export const verifyCodeAPI = (code, email) => {
    const formData = new URLSearchParams();
    formData.append('code', code);
    formData.append('email', email);
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_CODE, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
};

export const resetPasswordAPI = (email, code, password) => {
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('code', code);
    formData.append('password', password);

    console.log('resetPasswordAPI debug:', {
        email,
        code,
        password,
        formDataString: formData.toString()
    });

    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
};

export const refreshTokenAPI = (refreshToken) => {
    const formData = new URLSearchParams();
    formData.append('refreshToken', refreshToken);
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
};

export const sendVerificationEmailAPI = () =>
    axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.SEND_VERIFICATION_EMAIL);

export const verifyEmailAPI = (token) =>
    axiosInstance.post(`${API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`);
