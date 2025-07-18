import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Class as ClassIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { getTeacherDashboardAPI } from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    totalStudent: 0,
    teachingClasses: 0,
    closedClasses: 0,
    upcomingClasses: 0,
    paymentInfo: [],
    activeClasses: [],
    recentlySalary: {}
  });

  useEffect(() => {
    if (user) {
    fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const teacherId = user?.teacherId || user?.id;
      if (!teacherId) {
        setError('Không tìm thấy thông tin giáo viên');
        setLoading(false);
        return;
      }

      const response = await getTeacherDashboardAPI(teacherId);
      const data = response?.data?.data || response?.data || {};

      setDashboardData({
        totalStudent: data.totalStudent || 0,
        teachingClasses: data.teachingClasses || 0,
        closedClasses: data.closedClasses || 0,
        upcomingClasses: data.upcomingClasses || 0,
        paymentInfo: data.paymentInfo || [],
        activeClasses: data.activeClasses || [],
        recentlySalary: data.recentlySalary || {}
      });

    } catch (err) {
      console.error('Error fetching teacher dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Get HH:MM format
  };

  const formatDayOfWeek = (dayNumber) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[dayNumber] || '';
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return { days: 'Chưa có lịch', time: '' };

    const days = schedule.dayOfWeeks || [];
    const timeSlots = schedule.timeSlots || {};

    const dayText = days.length > 0
      ? days.map(day => formatDayOfWeek(day)).join(', ')
      : 'Chưa có lịch';

    const timeText = timeSlots.startTime && timeSlots.endTime
      ? `${formatTime(timeSlots.startTime)} - ${formatTime(timeSlots.endTime)}`
      : '';

    return { days: dayText, time: timeText };
  };

  const formatMonthYear = (month, year) => {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return `${monthNames[month - 1] || 'Tháng'} ${year}`;
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <Box sx={{ py: 4 }}>
            <LinearProgress />
            <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải dữ liệu dashboard...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Dashboard Giáo viên
            </Typography>
          </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Xin chào <strong>{user?.name || 'Giáo viên'}</strong>, đây là thông tin giảng dạy của bạn
        </Typography>

        {/* Stat Cards - First Row */}
        <Grid container spacing={6} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lớp đang dạy"
                value={dashboardData.teachingClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lớp đã kết thúc"
                value={dashboardData.closedClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lớp sắp tới"
                value={dashboardData.upcomingClasses}
              icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
        </Grid>

          {/* Salary Stats */}
        <Grid container spacing={6} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Tổng lương"
                value={formatCurrency(dashboardData.paymentInfo[0]?.totalSalary)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lương đã nhận"
                value={formatCurrency(dashboardData.paymentInfo[0]?.totalPaidAmount)}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Lương chưa nhận"
                value={formatCurrency(dashboardData.paymentInfo[0]?.totalUnPaidAmount)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="error"
            />
          </Grid>
        </Grid>

        {/* Content Sections */}
        <Grid container spacing={4}>
          {/* Active Classes */}
          <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 6px 24px rgba(0,0,0,0.12)', bgcolor: '#fff', border: '1px solid #e0e0e0', mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Lớp học đang dạy
              </Typography>
                <Box mt={2} bgcolor="#f5f6fa" borderRadius={2} border="1px solid #e0e0e0" p={2}>
                  {dashboardData.activeClasses.length > 0 ? (
                    <TableContainer sx={commonStyles.tableContainer}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Lớp học</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Phòng học</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Lịch học</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Thời gian</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData.activeClasses.map((classItem, index) => {
                            const schedule = formatSchedule(classItem.schedule);
                            return (
                              <TableRow key={index} sx={commonStyles.tableRow}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="medium">
                                    {classItem.name}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {classItem.room || 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {schedule.days}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {schedule.time}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label="Đang dạy"
                                    color="success"
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      Chưa có lớp học nào đang dạy
                    </Typography>
                  )}
                </Box>
            </Paper>
            </Grid>

          {/* Recent Salary */}
          <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 6px 24px rgba(0,0,0,0.12)', bgcolor: '#fff', border: '1px solid #e0e0e0', mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Lương tháng gần đây
                </Typography>
                {dashboardData.recentlySalary && Object.keys(dashboardData.recentlySalary).length > 0 ? (
                  <Box mt={2} bgcolor="#f5f6fa" borderRadius={2} border="1px solid #e0e0e0" p={2}>
                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3} justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          <strong>Tháng/Năm:</strong> {formatMonthYear(dashboardData.recentlySalary.month, dashboardData.recentlySalary.year)}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          <strong>Tổng buổi:</strong> <span style={{ color: 'text.secondary', fontWeight: 600 }}>{dashboardData.recentlySalary.totalLessons || 0}</span>
                        </Typography>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          <strong>Lương/buổi:</strong> <span style={{ color: 'text.secondary', fontWeight: 600 }}>{formatCurrency(dashboardData.recentlySalary.salaryPerLesson)}</span>
                        </Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          <strong>Tổng lương:</strong> <span style={{ color: 'text.secondary', fontWeight: 600 }}>{formatCurrency((dashboardData.recentlySalary.totalLessons || 0) * (dashboardData.recentlySalary.salaryPerLesson || 0))}</span>
                        </Typography>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          <strong>Đã thanh toán:</strong> <span style={{ color: 'text.secondary', fontWeight: 600 }}>{formatCurrency(dashboardData.recentlySalary.paidAmount)}</span>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    Chưa có thông tin lương gần đây
                  </Typography>
                )}
            </Paper>
          </Grid>
        </Grid>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
