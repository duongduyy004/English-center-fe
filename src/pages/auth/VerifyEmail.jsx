import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Paper } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { verifyEmailAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';

const getProfilePath = (role) => {
  switch (role) {
    case 'admin': return '/admin/profile';
    case 'teacher': return '/teacher/profile';
    case 'student': return '/student/profile';
    case 'parent': return '/parent/profile';
    default: return '/';
  }
};

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    let timer;
    if (success) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            navigate(getProfilePath(user?.role), { state: { reload: true } });
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [success, navigate, user]);

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    setCountdown(5);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token') || localStorage.getItem('verify_email_token');
      if (!token) {
        setError('Không tìm thấy mã xác thực email.');
        setSnackbar({ open: true, message: 'Không tìm thấy mã xác thực email.', severity: 'error' });
        setLoading(false);
        return;
      }
      await verifyEmailAPI(token);
      setSuccess(true);
      setSnackbar({ open: true, message: 'Xác thực email thành công! Đang chuyển về trang cá nhân...', severity: 'success' });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Xác thực email thất bại.';
      setError(msg);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar(s => ({ ...s, open: false }));

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f5f6fa">
      <Paper elevation={3} sx={{ p: 5, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <MarkEmailReadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} mb={1}>
          Xác thực email
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Vui lòng nhấn nút bên dưới để xác thực email của bạn.
        </Typography>
        {success && (
          <Typography color="success.main" sx={{ mb: 2, fontWeight: 500 }}>
            Xác thực email thành công!<br />
            Đang chuyển về trang cá nhân sau {countdown} giây...
          </Typography>
        )}
        {error && !success && (
          <Typography color="error.main" sx={{ mb: 2, fontWeight: 500 }}>{error}</Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleVerify}
          disabled={loading || success}
          sx={{ minWidth: 180, fontWeight: 600 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Xác thực email'}
        </Button>
      </Paper>
      <NotificationSnackbar
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
        autoHideDuration={3000}
      />
    </Box>
  );
};

export default VerifyEmail;
