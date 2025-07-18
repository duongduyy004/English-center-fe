import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { commonStyles } from '../../utils/styles';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { getAdminDashboardAPI } from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    totalStudent: 0,
    totalTeacher: 0,
    activeClasses: 0,
    upcomingClasses: 0,
    closedClasses: 0,
    paymentInfo: {},
    teacherPaymentInfo: {},
    recentlyPayment: [],
    recentlySalary: []
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
      const response = await getAdminDashboardAPI();
      const data = response?.data?.data || response?.data || {};

      setDashboardData({
        totalStudent: data.totalStudent || 0,
        totalTeacher: data.totalTeacher || 0,
        activeClasses: data.activeClasses || 0,
        upcomingClasses: data.upcomingClasses || 0,
        closedClasses: data.closedClasses || 0,
        paymentInfo: data.paymentInfo || {},
        teacherPaymentInfo: data.teacherPaymentInfo || {},
        recentlyPayment: data.recentlyPayment || [],
        recentlySalary: data.recentlySalary || []
      });

    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'pending': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'partial': return 'Thanh toán một phần';
      case 'pending': return 'Chờ thanh toán';
      default: return status;
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <Box sx={{ py: 4 }}>
            <LinearProgress />
            <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải dữ liệu dashboard...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Dashboard Quản trị
            </Typography>
          </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

          <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Xin chào <strong>{user?.name || 'Admin'}</strong>, đây là tổng quan hệ thống
          </Typography>

          {/* Stat Cards - First Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng số lớp học"
              value={dashboardData.activeClasses + dashboardData.upcomingClasses + dashboardData.closedClasses}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đang hoạt động"
                value={dashboardData.activeClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp sắp khai giảng"
                value={dashboardData.upcomingClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đã kết thúc"
                value={dashboardData.closedClasses}
              icon={<ClassIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
        </Grid>

          {/* Stat Cards - Second Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng giáo viên"
                value={dashboardData.totalTeacher}
              icon={<PersonIcon sx={{ fontSize: 40 }} />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng doanh thu"
                value={formatCurrency(dashboardData.paymentInfo.totalRevenue)}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đã thu"
                value={formatCurrency(dashboardData.paymentInfo.totalPaidAmount)}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Chưa thu"
                value={formatCurrency(dashboardData.paymentInfo.totalUnPaidAmount)}
              icon={<WarningIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
          </Grid>

          {/* Stat Cards - Third Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng học viên"
                  value={dashboardData.totalStudent}
                icon={<SchoolIcon sx={{ fontSize: 40 }} />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng lương giáo viên"
                value={formatCurrency(dashboardData.teacherPaymentInfo.totalSalary)}
              icon={<PaymentIcon sx={{ fontSize: 40 }} />}
              color="secondary"
            />
        </Grid>
            <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đã trả lương"
                value={formatCurrency(dashboardData.teacherPaymentInfo.totalPaidAmount)}
              icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Chưa trả lương"
                value={formatCurrency(dashboardData.teacherPaymentInfo.totalUnPaidAmount)}
              icon={<WarningIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
        </Grid>

          {/* Content Sections */}
          <Grid container spacing={3}>
            {/* Recent Payments */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Thanh toán học phí
                </Typography>
                {dashboardData.recentlyPayment.length > 0 ? (
                  <TableContainer sx={commonStyles.tableContainer}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Học viên</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Số tiền đã thanh toán</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData.recentlyPayment.map((payment, index) => (
                          <TableRow key={index} sx={commonStyles.tableRow}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {payment.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" align="center">
                                {formatCurrency(payment.paidAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(payment.status)}
                                color={getStatusColor(payment.status)}
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
                    Chưa có thanh toán nào gần đây
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Recent Salary Payments */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Thanh toán lương
                </Typography>
                {dashboardData.recentlySalary.length > 0 ? (
                  <TableContainer sx={commonStyles.tableContainer}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Giáo viên</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Số tiền đã thanh toán</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData.recentlySalary.map((salary, index) => (
                          <TableRow key={index} sx={commonStyles.tableRow}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {salary.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" align="center">
                                {formatCurrency(salary.paidAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(salary.status)}
                                color={getStatusColor(salary.status)}
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
                    Chưa có thanh toán lương nào gần đây
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
