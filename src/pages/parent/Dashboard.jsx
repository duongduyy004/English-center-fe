import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import SchoolIcon from '@mui/icons-material/School';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { commonStyles } from '../../utils/styles';
import StatCard from '../../components/common/StatCard';
import {
  getParentDashboardAPI,
  getStudentScheduleAPI,
} from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dashboardData, setDashboardData] = useState(null);
  const [childrenSchedules, setChildrenSchedules] = useState([]);
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalClasses: 0,
    totalFees: 0,
    paidFees: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    if (user) {
      console.log('User data loaded, fetching parent data');
      fetchParentData();
    } else {
      console.log('User data not yet loaded');
    }
  }, [user]);

  const fetchParentData = async () => {
    setLoading(true);
    setError('');

    console.log('Starting fetchParentData, user:', user);

    try {
      // Get parent ID from user data
      const parentId = user?.parentId || user?.id || localStorage.getItem('parent_id');
      console.log('Parent ID:', parentId);

      if (!parentId) {
        console.error('No parent ID found in user data or localStorage');
        setError('Không tìm thấy thông tin phụ huynh');
        setLoading(false);
        return;
      }

      // Call parent dashboard API
        const parentDashboardRes = await getParentDashboardAPI(parentId);
      const dashboardData = parentDashboardRes?.data?.data || parentDashboardRes?.data || {};
      setDashboardData(dashboardData);

      console.log('Dashboard data:', dashboardData);



      // Fetch schedules for each child
      const studentPayments = dashboardData.studentPayments || [];
      const schedulesPromises = studentPayments.map(async (studentPayment) => {
        try {
          const scheduleRes = await getStudentScheduleAPI(studentPayment.studentId);
          const scheduleData = scheduleRes?.data?.data || scheduleRes?.data || {};
                  return {
            ...studentPayment,
            schedules: scheduleData.schedules || [],
            totalActiveClasses: scheduleData.totalActiveClasses || 0,
                  };
                } catch (err) {
          console.error(`Error fetching schedule for student ${studentPayment.studentId}:`, err);
                  return {
            ...studentPayment,
            schedules: [],
            totalActiveClasses: 0,
          };
        }
      });

      const childrenWithSchedules = await Promise.all(schedulesPromises);
      setChildrenSchedules(childrenWithSchedules);

      // Calculate statistics from dashboard data
      const paymentInfo = dashboardData.paymentInfo || {};
      const calculatedStats = {
        totalChildren: dashboardData.totalChildren || 0,
        totalClasses: childrenWithSchedules.reduce((total, child) => total + (child.totalActiveClasses || 0), 0),
        totalFees: paymentInfo.totalRevenue || 0,
        paidFees: paymentInfo.totalPaidAmount || 0,
        pendingPayments: paymentInfo.totalUnPaidAmount || 0,
      };
      setStats(calculatedStats);

    } catch (err) {
      console.error('Error fetching parent dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');

      // Set fallback data
      setStats({
        totalChildren: 0,
        totalClasses: 0,
        totalFees: 0,
        paidFees: 0,
        pendingPayments: 0,
      });
      setChildrenSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };



  const formatDayOfWeek = (dayNumber) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[dayNumber] || '';
  };

  if (loading) {
    return (
      <DashboardLayout role="parent">
        <Box sx={{ py: 4 }}>
          <LinearProgress />
          <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải dữ liệu dashboard...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parent">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Dashboard Phụ huynh
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Xin chào {user?.name || user?.userId?.name || 'Phụ huynh'}, đây là thông tin học tập và thanh toán của con bạn
          </Typography>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Số con đang học"
              value={stats.totalChildren || 0}
              icon={<PersonIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Tổng số lớp"
              value={stats.totalClasses || 0}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Tổng học phí"
              value={formatCurrency(stats.totalFees || 0)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Đã thanh toán"
              value={formatCurrency(stats.paidFees || 0)}
              icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Còn thiếu"
              value={formatCurrency(stats.pendingPayments || 0)}
              icon={<WarningIcon sx={{ fontSize: 40 }} />}
              color="error"
            />
          </Grid>
          </Grid>

        {/* Additional Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Đã xoá StatCard 'Còn thiếu' duplicate ở đây */}
        </Grid>

          {/* Children Information with Schedules */}
        <Grid container spacing={3}>
            {childrenSchedules.map((child, childIndex) => (
              <Grid item xs={12} key={child.studentId}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {child.studentName?.charAt(0)?.toUpperCase() || 'N'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                        {child.studentName || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {child.studentEmail || 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                  {/* Child's Schedules */}
                  {child.schedules && child.schedules.length > 0 ? (
                  <TableContainer sx={commonStyles.tableContainer}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Lớp học</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Giáo viên</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Phòng học</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Lịch học</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Thời gian</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                          {child.schedules.map((scheduleItem, scheduleIndex) => (
                            <TableRow key={scheduleIndex} sx={commonStyles.tableRow}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                  {scheduleItem.class?.name || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Lớp {scheduleItem.class?.grade || ''} - Năm {scheduleItem.class?.year || ''}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                  {scheduleItem.teacher?.name || 'Chưa phân công'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                  {scheduleItem.class?.room || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                  {scheduleItem.schedule?.dayOfWeeks?.map(d => formatDayOfWeek(d)).join(', ')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">
                                  {scheduleItem.schedule?.timeSlots?.startTime} - {scheduleItem.schedule?.timeSlots?.endTime}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                    scheduleItem.class?.status === 'active'
                                    ? 'Đang học'
                                      : scheduleItem.class?.status === 'completed'
                                    ? 'Đã hoàn thành'
                                      : scheduleItem.class?.status || 'N/A'
                                }
                                color={
                                    scheduleItem.class?.status === 'active'
                                    ? 'success'
                                      : scheduleItem.class?.status === 'completed'
                                    ? 'default'
                                    : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      Chưa có lịch học nào
                  </Typography>
                )}

                {/* Payment Summary */}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Tóm tắt thanh toán
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                          Tổng học phí: <strong>{formatCurrency(child.totalAmount || 0)}</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                          Đã thanh toán: <strong style={{ color: 'green' }}>{formatCurrency(child.totalPaidAmount || 0)}</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                          Còn thiếu: <strong style={{ color: 'red' }}>{formatCurrency(child.totalUnPaidAmount || 0)}</strong>
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

          {childrenSchedules.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có con nào được đăng ký
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng liên hệ admin để thêm con vào hệ thống.
            </Typography>
          </Paper>
        )}
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
