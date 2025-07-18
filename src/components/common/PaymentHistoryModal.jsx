import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Grid,
  Alert
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import { COLORS } from '../../utils/colors';
import { commonStyles } from '../../utils/styles';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Helper function to get status color and icon
const getStatusInfo = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'paid':
      return {
        color: 'success',
        icon: <CheckCircleIcon />,
        label: 'Thành công'
      };
    case 'pending':
    case 'processing':
      return {
        color: 'warning',
        icon: <PendingIcon />,
        label: 'Đang xử lý'
      };
    case 'failed':
    case 'cancelled':
      return {
        color: 'error',
        icon: <CancelIcon />,
        label: 'Thất bại'
      };
    case 'partial':
      return {
        color: 'info',
        icon: <PaymentIcon />,
        label: 'Thanh toán một phần'
      };
    default:
      return {
        color: 'default',
        icon: <ScheduleIcon />,
        label: status || 'Không xác định'
      };
  }
};

// Helper function to get payment method label
const getPaymentMethodLabel = (method) => {
  switch (method?.toLowerCase()) {
    case 'cash':
      return 'Tiền mặt';
    case 'bank_transfer':
      return 'Chuyển khoản';
    default:
      return method || 'Không xác định';
  }
};

// Helper function to get payment status (different from transaction status)
const getPaymentStatusInfo = (paymentData) => {
  const totalAmount = paymentData.finalAmount || paymentData.totalAmount || 0;
  const paidAmount = paymentData.paidAmount || 0;
  const remainingAmount = paymentData.remainingAmount || 0;

  if (paidAmount >= totalAmount) {
    return {
      color: 'success',
      icon: <CheckCircleIcon />,
      label: 'Đã thanh toán'
    };
  } else if (paidAmount > 0) {
    return {
      color: 'warning',
      icon: <PaymentIcon />,
      label: 'Thanh toán một phần'
    };
  } else {
    return {
      color: 'error',
      icon: <CancelIcon />,
      label: 'Chưa thanh toán'
    };
  }
};

const PaymentHistoryModal = ({
  open,
  onClose,
  paymentData, // Direct payment data instead of paymentId
  title = "Lịch sử thanh toán",
  showPaymentDetails = true, // Whether to show payment details at the top
  teacherInfo // thêm prop này
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    if (open && paymentData) {
      console.log('PaymentHistoryModal - paymentData:', paymentData);
      console.log('PaymentHistoryModal - teacherInfo:', teacherInfo);
      // Extract data from paymentData
      let history = paymentData.paymentHistory || [];
      if (history && !Array.isArray(history) && typeof history === 'object') {
        history = [history];
      }
      setPaymentHistory(history);

      if (showPaymentDetails) {
        setPaymentDetails({
          paymentCode: `INV-${paymentData.month}/${paymentData.year}-${paymentData.id?.slice(-6)}`,
          totalAmount: paymentData.totalAmount || 0,
          paidAmount: paymentData.paidAmount || 0,
          remainingAmount: paymentData.remainingAmount || 0,
          finalAmount: paymentData.finalAmount || 0,
          discountAmount: paymentData.discountAmount || 0,
          status: paymentData.status,
          month: paymentData.month,
          year: paymentData.year,
          className: paymentData.classId?.name || 'N/A',
          studentName: paymentData.studentId?.userId?.name || 'N/A'
        });
      }
    }
  }, [open, paymentData, showPaymentDetails, teacherInfo]);

  const handleClose = () => {
    setPaymentHistory([]);
    setPaymentDetails(null);
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          minHeight: '60vh'
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
            {title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Chi tiết lịch sử thanh toán
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
          <ReceiptIcon sx={{ fontSize: 28, color: 'white' }} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Box sx={{ p: 4, pb: 0 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Box>
        )}

        {loading ? (
          <Box sx={{ py: 4, px: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress />
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 4 }}>
            {/* Payment Details Section */}
            {showPaymentDetails && paymentDetails && (
              <Paper sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                border: '1px solid #e0e6ed',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
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
                  Thông tin thanh toán
                </Typography>
                <Box sx={{
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <Grid container spacing={2}>
                                        {paymentData.teacherId ? (
                      <>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Giáo viên: {paymentData.teacherId.userId?.name || paymentData.teacherId.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                              Email: {(() => {
                                console.log('Rendering email - teacherInfo:', teacherInfo);
                                console.log('Rendering email - paymentData.teacherId:', paymentData.teacherId);
                                // Dựa trên cấu trúc dữ liệu thực tế: teacherInfo.userId.email
                                const email = teacherInfo?.userId?.email ||
                                            teacherInfo?.email ||
                                            paymentData.teacherId?.userId?.email ||
                                            paymentData.teacherId?.email || '-';
                                console.log('Final email value:', email);
                                return email;
                              })()}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                              SĐT: {(() => {
                                console.log('Rendering phone - teacherInfo:', teacherInfo);
                                console.log('Rendering phone - paymentData.teacherId:', paymentData.teacherId);
                                // Dựa trên cấu trúc dữ liệu thực tế: teacherInfo.userId.phone
                                const phone = teacherInfo?.userId?.phone ||
                                            teacherInfo?.phone ||
                                            paymentData.teacherId?.userId?.phone ||
                                            paymentData.teacherId?.phone || '-';
                                console.log('Final phone value:', phone);
                                return phone;
                              })()}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                              Tháng/Năm: {paymentData.month}/{paymentData.year}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, mt: 1 }}>
                              Trạng thái: <Chip label={getPaymentStatusInfo(paymentData).label} color={getPaymentStatusInfo(paymentData).color} size="small" icon={getPaymentStatusInfo(paymentData).icon} variant="outlined" />
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Số buổi: {paymentData.classes && Array.isArray(paymentData.classes)
                                ? paymentData.classes.reduce((sum, cls) => sum + (cls.totalLessons || 0), 0)
                                : paymentData.totalLessons || '-'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                              Lương/buổi: {formatCurrency(paymentData.salaryPerLesson || 0)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                              Tổng lương: {formatCurrency(paymentData.totalAmount || 0)}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                              Đã thanh toán: {formatCurrency(paymentData.paidAmount || 0)}
                            </Typography>
                          </Box>
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Học sinh: {paymentDetails.studentName}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Lớp học: {paymentDetails.className}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Tháng/Năm: {paymentDetails.month}/{paymentDetails.year}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Số tiền gốc: {formatCurrency(paymentDetails.totalAmount || 0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Giảm giá: {formatCurrency(paymentDetails.discountAmount || 0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Số tiền cuối: {formatCurrency(paymentDetails.finalAmount || 0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Đã thanh toán: {formatCurrency(paymentDetails.paidAmount || 0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Còn lại: {formatCurrency(paymentDetails.remainingAmount || 0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              Trạng thái:
                              <Chip
                                label={getPaymentStatusInfo(paymentData).label}
                                color={getPaymentStatusInfo(paymentData).color}
                                size="small"
                                icon={getPaymentStatusInfo(paymentData).icon}
                                variant="outlined"
                              />
                            </Typography>
                          </Box>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              </Paper>
            )}

            {/* Payment History Table */}
            <Paper sx={{
              p: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              border: '1px solid #e0e6ed',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
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
                Lịch sử giao dịch
              </Typography>
              <Box sx={{
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                overflow: 'hidden'
              }}>
                {paymentHistory.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="textSecondary">
                      Chưa có lịch sử thanh toán
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            Thời gian
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            Số tiền
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            Phương thức
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            Trạng thái
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            Ghi chú
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paymentHistory.map((transaction, index) => {
                          const statusInfo = getStatusInfo(transaction.status || 'completed');
                          return (
                            <TableRow key={transaction.id || index} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                  {formatDate(transaction.date)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: transaction.amount > 0 ? 'success.main' : 'error.main'
                                  }}
                                >
                                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                                  {getPaymentMethodLabel(transaction.method)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={statusInfo.icon}
                                  label={statusInfo.label}
                                  color={statusInfo.color}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {transaction.note || '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Paper>

            {/* Summary Section */}
            {paymentHistory.length > 0 && (
              <Paper sx={{
                mt: 3,
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                border: '1px solid #e0e6ed',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
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
                  Tổng kết
                </Typography>
                <Box sx={{
                  p: 2,
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          Tổng giao dịch: <Typography variant="h6" component="span" sx={{ fontWeight: 600, color: '#667eea' }}>
                            {paymentHistory.length}
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          Tổng đã thanh toán: <Typography variant="h6" component="span" sx={{ fontWeight: 600, color: 'success.main' }}>
                            {formatCurrency(
                              paymentHistory.reduce((sum, t) => sum + (t.amount || 0), 0)
                            )}
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                          Giao dịch thành công: <Typography variant="h6" component="span" sx={{ fontWeight: 600, color: 'success.main' }}>
                            {paymentHistory.length}
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
        <Button
          onClick={handleClose}
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
  );
};

export default PaymentHistoryModal;
