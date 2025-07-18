import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Grid, Button, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { getTeacherPaymentByIdAPI } from '../../services/api';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { commonStyles } from '../../utils/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HistoryIcon from '@mui/icons-material/History';
import { useAuth } from '../../contexts/AuthContext';
import PaymentHistoryModal from '../../components/common/PaymentHistoryModal';

const Salary = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      const teacherId = user?.teacherId;
      if (!teacherId) return;
      setLoading(true);
      try {
        const res = await getTeacherPaymentByIdAPI(teacherId);
        console.log('API getTeacherPaymentByIdAPI response:', res);

        // Handle the response structure - it's an array of payment objects
        if (res && res.data && Array.isArray(res.data)) {
          setPayments(res.data);
        } else if (res && Array.isArray(res)) {
          setPayments(res);
        } else if (res && res.data && !Array.isArray(res.data)) {
          // If it's a single object, wrap it in an array
          setPayments([res.data]);
        } else {
          setPayments([]);
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user]);

  // Tính toán số liệu thống kê
  const totalSalary = payments.reduce((sum, payment) => sum + (payment.totalAmount ?? 0), 0);
  const totalPaid = payments.reduce((sum, payment) => sum + (payment.paidAmount ?? 0), 0);
  const totalUnpaid = totalSalary - totalPaid;
  const totalLessons = payments.reduce((sum, payment) => {
    if (payment.classes && Array.isArray(payment.classes)) {
      return sum + payment.classes.reduce((classSum, classItem) => classSum + (classItem.totalLessons || 0), 0);
    }
    return sum;
  }, 0);

  // Log state payments để kiểm tra dữ liệu render
  console.log('Payments state:', payments);

  const handleViewDetail = (payment) => {
    setSelectedPayment(payment);
    setDetailModalOpen(true);
  };

  const handleViewHistory = (payment) => {
    setSelectedPayment(payment);
    setHistoryModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedPayment(null);
  };

  const handleCloseHistoryModal = () => {
    setHistoryModalOpen(false);
    setSelectedPayment(null);
  };

  return (
    <DashboardLayout role="teacher">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Lương của tôi
            </Typography>
          </Box>
        {/* Stat Cards */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Số tháng có lương"
                value={payments.length}
                icon={<PaymentIcon sx={{ fontSize: 40 }} />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng lương"
                value={totalSalary.toLocaleString() + ' ₫'}
                icon={<PaymentIcon sx={{ fontSize: 40 }} />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Đã nhận"
                value={totalPaid.toLocaleString() + ' ₫'}
                icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Còn lại"
                value={totalUnpaid.toLocaleString() + ' ₫'}
                icon={<MoneyOffIcon sx={{ fontSize: 40 }} />}
                color="warning"
              />
            </Grid>
          </Grid>
        </Box>
        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={commonStyles.tableContainer}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Tháng/Năm</TableCell>
                    <TableCell align="right">Số buổi</TableCell>
                    <TableCell align="right">Lương/buổi</TableCell>
                    <TableCell align="right">Tổng lương</TableCell>
                    <TableCell align="right">Đã nhận</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">Không có dữ liệu lương</TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id} hover sx={commonStyles.tableRow}>
                        <TableCell align="center">{payment.month}/{payment.year}</TableCell>
                        <TableCell align="right">
                          {payment.classes && Array.isArray(payment.classes)
                            ? payment.classes.reduce((sum, classItem) => sum + (classItem.totalLessons || 0), 0)
                            : 0
                          }
                        </TableCell>
                        <TableCell align="right">{(payment.salaryPerLesson ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="right">{(payment.totalAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="right">{(payment.paidAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              payment.status === 'paid' ? 'Đã nhận' :
                              payment.status === 'partial' ? 'Nhận một phần' :
                              payment.status === 'pending' ? 'Chờ nhận' :
                              'Chưa nhận'
                            }
                            color={
                              payment.status === 'paid' ? 'success' :
                              payment.status === 'partial' ? 'warning' :
                              payment.status === 'pending' ? 'info' :
                              'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Xem chi tiết">
                            <IconButton size="small" color="primary" onClick={() => handleViewDetail(payment)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Lịch sử thanh toán">
                            <IconButton size="small" color="info" onClick={() => handleViewHistory(payment)}>
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Detail Modal */}
        {selectedPayment && (
          <Dialog
            open={detailModalOpen}
            onClose={handleCloseDetailModal}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }
            }}
          >
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              py: 3,
              px: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Chi tiết lương tháng {selectedPayment.month}/{selectedPayment.year}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Thông tin chi tiết về lương và các lớp đã dạy
                </Typography>
              </Box>
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PaymentIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ p: 4 }}>
                {/* Thông tin chung */}
                <Paper sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed'
                }}>
                  <Typography variant="h6" gutterBottom sx={{
                    color: '#2c3e50',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}>
                    <Box sx={{
                      width: 4,
                      height: 20,
                      bgcolor: '#667eea',
                      borderRadius: 2
                    }} />
                    Thông tin chung
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{
                        p: 2,
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 600 }}>
                          Thông tin giáo viên
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666' }}>Tên:</span>
                          <span style={{ fontWeight: 500, color: '#2c3e50' }}>
                            {selectedPayment.teacherId?.userId?.name || selectedPayment.teacherId?.name}
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666' }}>Email:</span>
                          <span style={{ fontWeight: 500, color: '#2c3e50' }}>
                            {selectedPayment.teacherId?.userId?.email || '-'}
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666' }}>SĐT:</span>
                          <span style={{ fontWeight: 500, color: '#2c3e50' }}>
                            {selectedPayment.teacherId?.userId?.phone || '-'}
                          </span>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{
                        p: 2,
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 600 }}>
                          Thông tin lương
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666' }}>Tháng/Năm:</span>
                          <span style={{ fontWeight: 500, color: '#2c3e50' }}>
                            {selectedPayment.month}/{selectedPayment.year}
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666' }}>Lương/buổi:</span>
                          <span style={{ fontWeight: 600, color: '#27ae60' }}>
                            {(selectedPayment.salaryPerLesson ?? 0).toLocaleString()} ₫
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666' }}>Tổng lương:</span>
                          <span style={{ fontWeight: 600, color: '#e74c3c' }}>
                            {(selectedPayment.totalAmount ?? 0).toLocaleString()} ₫
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#666' }}>Đã nhận:</span>
                          <span style={{ fontWeight: 600, color: '#27ae60' }}>
                            {(selectedPayment.paidAmount ?? 0).toLocaleString()} ₫
                          </span>
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Chi tiết từng lớp */}
                {selectedPayment.classes && Array.isArray(selectedPayment.classes) && (
                  <Paper sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <Box sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white'
                    }}>
                      <Typography variant="h6" sx={{
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Box sx={{
                          width: 4,
                          height: 20,
                          bgcolor: 'white',
                          borderRadius: 2
                        }} />
                        Chi tiết từng lớp
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                        Thông tin chi tiết về số buổi dạy và lương từng lớp
                      </Typography>
                    </Box>
                    <TableContainer sx={commonStyles.tableContainer}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                            <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Tên lớp</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#2c3e50' }}>Số buổi</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#2c3e50' }}>Lương/buổi</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#2c3e50' }}>Tổng lương</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedPayment.classes.map((classItem, index) => (
                            <TableRow
                              key={index}
                              hover
                              sx={commonStyles.tableRow}
                            >
                              <TableCell sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {classItem.classId?.name || 'N/A'}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {classItem.totalLessons || 0}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 500, color: '#27ae60' }}>
                                {(selectedPayment.salaryPerLesson ?? 0).toLocaleString()} ₫
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, color: '#e74c3c' }}>
                                {((classItem.totalLessons || 0) * (selectedPayment.salaryPerLesson ?? 0)).toLocaleString()} ₫
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
              <Button
                onClick={handleCloseDetailModal}
                variant="contained"
                sx={{
                  bgcolor: '#667eea',
                  '&:hover': { bgcolor: '#5a6fd8' },
                  px: 3,
                  py: 1,
                  borderRadius: 2
                }}
              >
                Đóng
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Payment History Modal */}
        <PaymentHistoryModal
          open={historyModalOpen}
          onClose={handleCloseHistoryModal}
          paymentData={selectedPayment}
          title="Lịch sử thanh toán lương"
          showPaymentDetails={true}
        />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Salary;
