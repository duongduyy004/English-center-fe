// Utility functions for English Center Application
import { USER_ROLES } from './constants';

// Format currency (VND)
export const formatCurrency = (amount, currency = 'VND') => {
  if (amount === null || amount === undefined) return '0 ₫';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date
export const formatDate = (date, format = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  switch (format) {
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`;
    case 'MM/yyyy':
      return `${month}/${year}`;
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    case 'dd/MM/yyyy HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'HH:mm':
      return `${hours}:${minutes}`;
    case 'relative':
      return formatRelativeTime(d);
    default:
      return d.toLocaleDateString('vi-VN');
  }
};

// Format relative time (e.g., "5 phút trước", "2 giờ trước")
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 30) return `${days} ngày trước`;
  
  return formatDate(date);
};

// Format time (HH:mm)
export const formatTime = (time) => {
  if (!time) return '';
  
  if (typeof time === 'string') {
    return time;
  }
  
  const date = new Date(time);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Get random color from predefined list
export const getRandomColor = () => {
  const colors = [
    '#1976d2', '#388e3c', '#f57c00', '#d32f2f', 
    '#7b1fa2', '#0288d1', '#00796b', '#689f38',
    '#fbc02d', '#f57c00', '#5d4037', '#455a64'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Get color by role
export const getRoleColor = (role) => {
  const roleColors = {
    admin: '#d32f2f',     // Red
    teacher: '#1976d2',   // Blue
    student: '#4caf50',   // Green
    parent: '#ff9800'     // Orange
  };
  return roleColors[role] || '#757575';
};

// Get status color
export const getStatusColor = (status) => {
  const statusColors = {
    active: '#4caf50',
    inactive: '#757575',
    pending: '#ff9800',
    blocked: '#f44336',
    completed: '#2196f3',
    cancelled: '#9e9e9e'
  };
  return statusColors[status] || '#757575';
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Debounce function
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Vietnamese format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+84|0)[1-9]\d{8,9}$/;
  return phoneRegex.test(phone);
};

// Validate password strength
export const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password);
  
  const score = [
    password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  ].filter(Boolean).length;
  
  return {
    isValid: score >= 3,
    score,
    feedback: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  };
};

// Download file
export const downloadFile = (data, filename, type = 'text/plain') => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Calculate age from birthday
export const calculateAge = (birthday) => {
  if (!birthday) return 0;
  
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Calculate grade from score
export const calculateGrade = (score, maxScore = 10) => {
  const percentage = (score / maxScore) * 10;
  
  if (percentage >= 9) return { grade: 'A+', color: '#4caf50', label: 'Xuất sắc' };
  if (percentage >= 8) return { grade: 'A', color: '#8bc34a', label: 'Giỏi' };
  if (percentage >= 7) return { grade: 'B+', color: '#ff9800', label: 'Khá' };
  if (percentage >= 6) return { grade: 'B', color: '#ff9800', label: 'Khá' };
  if (percentage >= 5) return { grade: 'C', color: '#ff5722', label: 'Trung bình' };
  return { grade: 'F', color: '#f44336', label: 'Yếu' };
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Check if file type is allowed
export const isFileTypeAllowed = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

// Generate random avatar color
export const getAvatarColor = (name) => {
  if (!name) return '#757575';
  
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Scroll to element
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

// Local storage helpers
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Get dashboard path based on user role
export const getDashboardPath = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
      return '/admin/dashboard';
    case USER_ROLES.TEACHER:
      return '/teacher/dashboard';
    case USER_ROLES.STUDENT:
      return '/student/dashboard';
    case USER_ROLES.PARENT:
      return '/parent/dashboard';
    default:
      return '/';
  }
};

export default {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatTime,
  getInitials,
  getRandomColor,
  getRoleColor,
  getStatusColor,
  truncateText,
  debounce,
  generateId,
  isValidEmail,
  isValidPhone,
  validatePassword,
  downloadFile,
  calculateAge,
  calculateGrade,
  formatFileSize,
  isFileTypeAllowed,
  getAvatarColor,
  scrollToElement,
  copyToClipboard,
  storage,
  getDashboardPath
};
