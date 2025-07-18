import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layouts/DashboardLayout';

// Import custom theme
import theme from './theme';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdvertisementManagement from './pages/admin/AdvertisementManagement';
import ClassManagement from './pages/admin/ClassManagement';
import StudentManagement from './pages/admin/StudentManagement';
import TeacherManagement from './pages/admin/TeacherManagement';
import ParentManagement from './pages/admin/ParentManagement';
import Statistics from './pages/admin/Statistics';
import AdminProfile from './pages/Profile/AdminProfile';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherMyClasses from './pages/teacher/MyClasses';
import TeacherSchedule from './pages/teacher/Schedule';
import TeacherProfile from './pages/Profile/TeacherProfile';
import Salary from './pages/teacher/Salary';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentMyClasses from './pages/student/MyClasses';
import StudentSchedule from './pages/student/Schedule';
import StudentProfile from './pages/Profile/StudentProfile';

// Parent Pages
import ParentDashboard from './pages/parent/Dashboard';
import ParentChildren from './pages/parent/Children';
import ParentPayments from './pages/parent/Payments';
import ParentProfile from './pages/Profile/ParentProfile';

// Payment Pages
import VNPayReturn from './pages/payment/VNPayReturn';

import { USER_ROLES } from './utils/constants';

function App() {
  const { user } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Trang chủ chung - hiển thị khác nhau tùy trạng thái đăng nhập */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/payment/vnpay-return" element={<VNPayReturn />} />
            <Route path="/profile" element={
              !user ? <Navigate to="/" replace /> : (
                <Navigate to={
                  user.role === USER_ROLES.ADMIN ? "/admin/profile" :
                    user.role === USER_ROLES.TEACHER ? "/teacher/profile" :
                      user.role === USER_ROLES.STUDENT ? "/student/profile" :
                        user.role === USER_ROLES.PARENT ? "/parent/profile" : "/"
                } replace />
              )
            } />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="advertisements" element={<AdvertisementManagement />} />
                    <Route path="classes" element={<ClassManagement />} />
                    <Route path="students" element={<StudentManagement />} />
                    <Route path="teachers" element={<TeacherManagement />} />
                    <Route path="parents" element={<ParentManagement />} />
                    <Route path="statistics" element={<Statistics />} />
                    <Route path="profile" element={<AdminProfile />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher/*"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.TEACHER}>
                  <Routes>
                    <Route path="dashboard" element={<TeacherDashboard />} />
                    <Route path="classes" element={<TeacherMyClasses />} />
                    <Route path="schedule" element={<TeacherSchedule />} />
                    <Route path="salary" element={<Salary />} />
                    <Route path="profile" element={<TeacherProfile />} />
                    <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/*"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.STUDENT}>
                  <Routes>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="classes" element={<StudentMyClasses />} />
                    <Route path="schedule" element={<StudentSchedule />} />
                    <Route path="profile" element={<StudentProfile />} />
                    <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Parent Routes */}
            <Route
              path="/parent/*"
              element={
                <ProtectedRoute requiredRole={USER_ROLES.PARENT}>
                  <Routes>
                    <Route path="dashboard" element={<ParentDashboard />} />
                    <Route path="children" element={<ParentChildren />} />
                    <Route path="payments" element={<ParentPayments />} />
                    <Route path="profile" element={<ParentProfile />} />
                    <Route path="*" element={<Navigate to="/parent/dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
