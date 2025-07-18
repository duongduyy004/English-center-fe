// Constants for English Center Application

// Application Info
export const APP_NAME = import.meta.env?.VITE_APP_NAME || 'English Center Management';
export const APP_VERSION = import.meta.env?.VITE_APP_VERSION || '1.0.0';
export const APP_DESCRIPTION = 'Hệ thống quản lý trung tâm tiếng Anh';

// API Configuration
export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3001/api';
export const API_TIMEOUT = 30000; // 30 seconds

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher', 
  STUDENT: 'student',
  PARENT: 'parent'
};

// Role Labels
export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Quản trị viên',
  [USER_ROLES.TEACHER]: 'Giáo viên',
  [USER_ROLES.STUDENT]: 'Học sinh', 
  [USER_ROLES.PARENT]: 'Phụ huynh'
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    CLASSES: '/admin/classes',
    STUDENTS: '/admin/students',
    TEACHERS: '/admin/teachers',
    PARENTS: '/admin/parents',
    FEES: '/admin/fees',
    ADVERTISEMENTS: '/admin/advertisements',
    STATISTICS: '/admin/statistics',
    ANNOUNCEMENTS: '/admin/announcements'
  },
  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
    CLASSES: '/teacher/classes',
    STUDENTS: '/teacher/students',
    ATTENDANCE: '/teacher/attendance',
    SCHEDULE: '/teacher/schedule'
  },
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    CLASSES: '/student/classes',
    SCHEDULE: '/student/schedule',
    GRADES: '/student/grades',
    ATTENDANCE: '/student/attendance'
  },
  PARENT: {
    DASHBOARD: '/parent/dashboard',
    CHILDREN: '/parent/children',
    FEES: '/parent/fees',
    SCHEDULE: '/parent/schedule',
    ATTENDANCE: '/parent/attendance'
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'english_center_user',
  TOKEN: 'english_center_token',
  THEME: 'english_center_theme',
  LANGUAGE: 'english_center_language'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_PAGE_SIZE: 100
};

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm'
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    EXCEL: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  }
};

// Class Status
export const CLASS_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const CLASS_STATUS_LABELS = {
  [CLASS_STATUS.ACTIVE]: 'Đang hoạt động',
  [CLASS_STATUS.INACTIVE]: 'Tạm dừng',
  [CLASS_STATUS.COMPLETED]: 'Đã hoàn thành',
  [CLASS_STATUS.CANCELLED]: 'Đã hủy'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Chờ thanh toán',
  [PAYMENT_STATUS.PAID]: 'Đã thanh toán',
  [PAYMENT_STATUS.OVERDUE]: 'Quá hạn',
  [PAYMENT_STATUS.CANCELLED]: 'Đã hủy'
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused'
};

export const ATTENDANCE_STATUS_LABELS = {
  [ATTENDANCE_STATUS.PRESENT]: 'Có mặt',
  [ATTENDANCE_STATUS.ABSENT]: 'Vắng mặt',
  [ATTENDANCE_STATUS.LATE]: 'Đi muộn',
  [ATTENDANCE_STATUS.EXCUSED]: 'Có phép'
};

// Grade Levels
export const GRADE_LEVELS = {
  BEGINNER: 'beginner',
  ELEMENTARY: 'elementary',
  INTERMEDIATE: 'intermediate',
  UPPER_INTERMEDIATE: 'upper_intermediate',
  ADVANCED: 'advanced',
  PROFICIENCY: 'proficiency'
};

export const GRADE_LEVEL_LABELS = {
  [GRADE_LEVELS.BEGINNER]: 'Sơ cấp',
  [GRADE_LEVELS.ELEMENTARY]: 'Cơ bản',
  [GRADE_LEVELS.INTERMEDIATE]: 'Trung cấp',
  [GRADE_LEVELS.UPPER_INTERMEDIATE]: 'Trung cấp cao',
  [GRADE_LEVELS.ADVANCED]: 'Nâng cao',
  [GRADE_LEVELS.PROFICIENCY]: 'Thành thạo'
};

// Days of Week
export const DAYS_OF_WEEK = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday'
};

export const DAY_LABELS = {
  [DAYS_OF_WEEK.MONDAY]: 'Thứ 2',
  [DAYS_OF_WEEK.TUESDAY]: 'Thứ 3',
  [DAYS_OF_WEEK.WEDNESDAY]: 'Thứ 4',
  [DAYS_OF_WEEK.THURSDAY]: 'Thứ 5',
  [DAYS_OF_WEEK.FRIDAY]: 'Thứ 6',
  [DAYS_OF_WEEK.SATURDAY]: 'Thứ 7',
  [DAYS_OF_WEEK.SUNDAY]: 'Chủ nhật'
};

// Time Slots
export const TIME_SLOTS = [
  { value: '06:00', label: '06:00' },
  { value: '07:00', label: '07:00' },
  { value: '08:00', label: '08:00' },
  { value: '09:00', label: '09:00' },
  { value: '10:00', label: '10:00' },
  { value: '11:00', label: '11:00' },
  { value: '13:00', label: '13:00' },
  { value: '14:00', label: '14:00' },
  { value: '15:00', label: '15:00' },
  { value: '16:00', label: '16:00' },
  { value: '17:00', label: '17:00' },
  { value: '18:00', label: '18:00' },
  { value: '19:00', label: '19:00' },
  { value: '20:00', label: '20:00' }
];

// Course Types
export const COURSE_TYPES = {
  GENERAL: 'general',
  IELTS: 'ielts',
  TOEIC: 'toeic',
  TOEFL: 'toefl',
  BUSINESS: 'business',
  KIDS: 'kids',
  CONVERSATION: 'conversation'
};

export const COURSE_TYPE_LABELS = {
  [COURSE_TYPES.GENERAL]: 'Tiếng Anh Tổng Quát',
  [COURSE_TYPES.IELTS]: 'IELTS',
  [COURSE_TYPES.TOEIC]: 'TOEIC',
  [COURSE_TYPES.TOEFL]: 'TOEFL',
  [COURSE_TYPES.BUSINESS]: 'Tiếng Anh Doanh Nghiệp',
  [COURSE_TYPES.KIDS]: 'Tiếng Anh Thiếu Nhi',
  [COURSE_TYPES.CONVERSATION]: 'Giao Tiếp'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

// Responsive Breakpoints
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536
};

// Animation Durations
export const ANIMATION_DURATION = {
  SHORT: 150,
  MEDIUM: 300,
  LONG: 500
};

// Default Avatar Colors
export const AVATAR_COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
];

export default {
  APP_NAME,
  APP_VERSION,
  USER_ROLES,
  ROLE_LABELS,
  ROUTES,
  STORAGE_KEYS,
  PAGINATION,
  DATE_FORMATS,
  FILE_UPLOAD,
  CLASS_STATUS,
  PAYMENT_STATUS,
  ATTENDANCE_STATUS,
  GRADE_LEVELS,
  DAYS_OF_WEEK,
  TIME_SLOTS,
  COURSE_TYPES,
  NOTIFICATION_TYPES,
  BREAKPOINTS,
  ANIMATION_DURATION,
  AVATAR_COLORS
};
