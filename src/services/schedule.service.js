import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

// Schedule APIs
export const getLoggedInStudentSchedule = () => axiosInstance.get(API_CONFIG.ENDPOINTS.SCHEDULES.GET_STUDENT_SCHEDULE);
