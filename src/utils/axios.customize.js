import axios from 'axios';
import { configDotenv } from 'dotenv';

// Tạo custom event để thông báo logout
const createLogoutEvent = () => {
    const event = new CustomEvent('auth:logout', {
        detail: { reason: 'token_expired' }
    });
    window.dispatchEvent(event);
};

const instance = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
    timeout: 60000
});

// Biến để tránh gọi refresh token nhiều lần
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Add a request interceptor
instance.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData requests
        // Let the browser set it automatically with boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
instance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response) {
            // Xử lý lỗi từ server
            if (error.response.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    // Nếu đang refresh, thêm request vào queue
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return instance(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                const refreshToken = localStorage.getItem('refresh_token');

                if (!refreshToken) {
                    // Không có refresh token, logout user
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('userData');
                    localStorage.removeItem('parent_id');
                    // Thông báo logout cho AuthContext
                    createLogoutEvent();
                    return Promise.reject(error);
                }

                try {
                    // Gọi API refresh token
                    const response = await instance.post(
                        '/auth/refresh-tokens',
                        new URLSearchParams({ refreshToken }),
                        {
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                        }
                    );

                    let newAccessToken = null;
                    let newRefreshToken = null;

                    // Xử lý response theo cấu trúc khác nhau
                    console.log('Refresh token response:', response);

                    if (response?.tokens?.access?.token) {
                        newAccessToken = response.tokens.access.token;
                        newRefreshToken = response.tokens.refresh?.token;
                    } else if (response?.data?.tokens?.access?.token) {
                        newAccessToken = response.data.tokens.access.token;
                        newRefreshToken = response.data.tokens.refresh?.token;
                    } else if (response?.access?.token) {
                        newAccessToken = response.access.token;
                        newRefreshToken = response.refresh?.token;
                    } else if (response?.data?.access?.token) {
                        newAccessToken = response.data.access.token;
                        newRefreshToken = response.data.refresh?.token;
                    } else if (response?.access_token) {
                        newAccessToken = response.access_token;
                        newRefreshToken = response.refresh_token;
                    } else if (response?.data?.access_token) {
                        newAccessToken = response.data.access_token;
                        newRefreshToken = response.data.refresh_token;
                    }

                    if (newAccessToken) {
                        localStorage.setItem('access_token', newAccessToken);
                        if (newRefreshToken) {
                            localStorage.setItem('refresh_token', newRefreshToken);
                        }

                        // Cập nhật header cho request gốc
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                        // Xử lý queue
                        processQueue(null, newAccessToken);

                        // Thực hiện lại request gốc
                        return instance(originalRequest);
                    } else {
                        throw new Error('Invalid refresh token response');
                    }
                } catch (refreshError) {
                    console.error('Refresh token failed:', refreshError);

                    // Xử lý queue với lỗi
                    processQueue(refreshError, null);

                    // Logout user
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('userData');
                    localStorage.removeItem('parent_id');
                    // Thông báo logout cho AuthContext
                    createLogoutEvent();
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
            // Trả về error object với response data để dễ xử lý
            return Promise.reject({
                response: {
                    status: error.response.status,
                    data: error.response.data
                }
            });
        }
        return Promise.reject(error);
    }
);

export default instance;
