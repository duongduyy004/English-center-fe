import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  AccountBalanceWallet as WalletIcon,
  MoneyOff as MoneyOffIcon,
  ReceiptLong as ReceiptLongIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  AttachMoney as AttachMoneyIcon,
  Discount as DiscountIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import StatCard from '../../components/common/StatCard';
import PaymentHistoryModal from '../../components/common/PaymentHistoryModal';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import { getPaymentsByStudentAPI, getParentByIdAPI, payTuitionAPI } from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [paymentData, setPaymentData] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Payment history modal states
  const [paymentHistoryModalOpen, setPaymentHistoryModalOpen] = useState(false);
  const [selectedPaymentForHistory, setSelectedPaymentForHistory] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ConfirmDialog states for payment
  const [paymentConfirmOpen, setPaymentConfirmOpen] = useState(false);
  const [paymentConfirmData, setPaymentConfirmData] = useState(null);

  // Refactor fetchPaymentData để dùng useCallback, tránh closure
  const fetchPaymentData = useCallback(async () => {
    setLoading(true);
    try {
      const parentId = localStorage.getItem('parent_id');
      if (parentId) {
        const parentRes = await getParentByIdAPI(parentId);
        if (parentRes && parentRes.studentIds) {
          setChildren(parentRes.studentIds);
          const allPayments = [];
          for (const child of parentRes.studentIds) {
            try {
              const paymentRes = await getPaymentsByStudentAPI(child.id);
              if (paymentRes && paymentRes.data) {
                const paymentsWithChildInfo = paymentRes.data.map((payment) => {
                  const className = payment.classId?.name || `Lớp ${payment.classId?.id || payment.classId}`;
                  return {
                    ...payment,
                    childName: child.userId.name,
                    childId: child.id,
                    invoiceCode: `INV-${payment.month}/${payment.year}-${payment.id.slice(-6)}`,
                    className: className,
                    month: `${payment.month}/${payment.year}`,
                    originalAmount: payment.totalAmount,
                    finalAmount: payment.finalAmount,
                    dueDate: `${payment.month}/15/${payment.year}`,
                    createdAt: `${payment.month}/01/${payment.year}`,
                    description: `Học phí tháng ${payment.month}/${payment.year}`,
                  };
                });
                allPayments.push(...paymentsWithChildInfo);
              }
            } catch (err) {
              console.error('Error fetching payments for child:', child.id, err);
            }
          }
          setPaymentData(allPayments);
        }
      }
    } catch (err) {
      console.error('Error fetching payment data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Tính toán tổng quan
  const summary = useMemo(() => {
    let totalPaid = 0;
    let totalUnpaid = 0;
    let totalDiscount = 0;
    let unpaidInvoices = 0;
    let paidInvoices = 0;

    paymentData.forEach(invoice => {
      totalPaid += invoice.paidAmount ?? 0;
      totalUnpaid += invoice.remainingAmount ?? 0;
      totalDiscount += invoice.discountAmount ?? 0;
      if (invoice.status === 'paid') paidInvoices++;
      else unpaidInvoices++;
    });

    return {
      totalPaid,
      totalUnpaid,
      totalDiscount,
      unpaidInvoices,
      paidInvoices,
      totalInvoices: unpaidInvoices + paidInvoices
    };
  }, [paymentData]);

  // Lọc hóa đơn theo tab
  const allInvoices = paymentData;
  const filteredInvoices = allInvoices.filter((invoice) => {
    const matchesSearch = invoice.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.className.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedTab === 0) return matchesSearch; // Tất cả
    if (selectedTab === 1) return matchesSearch && invoice.status !== 'paid'; // Chưa thanh toán (pending, unpaid, etc.)
    if (selectedTab === 2) return matchesSearch && invoice.status === 'paid'; // Đã thanh toán

    return matchesSearch;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    return status === 'paid' ? 'success' : 'error';
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'partial':
        return 'Thanh toán một phần';
      case 'pending':
        return 'Chờ thanh toán';
      case 'unpaid':
        return 'Chưa thanh toán';
      default:
        return 'Chưa thanh toán';
    }
  };

  const handlePayment = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.remainingAmount.toString());
    setPaymentNote('');
    setPaymentMethod('cash');
    setPaymentError('');
    setPaymentSuccess('');
    setPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedInvoice(null);
    setPaymentAmount('');
    setPaymentNote('');
    setPaymentMethod('cash');
    setPaymentError('');
    setPaymentSuccess('');
  };

  const handleOpenPaymentHistory = (payment) => {
    setSelectedPaymentForHistory(payment);
    setPaymentHistoryModalOpen(true);
  };

  const handleClosePaymentHistory = () => {
    setSelectedPaymentForHistory(null);
    setPaymentHistoryModalOpen(false);
  };

  const handleConfirmPayment = async () => {
    if (!selectedInvoice || !paymentAmount) {
      setPaymentError('Vui lòng nhập số tiền thanh toán');
      return;
    }
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentError('Số tiền thanh toán không hợp lệ');
      return;
    }
    const maxAmount = selectedInvoice.remainingAmount;
    if (amount > maxAmount) {
      setPaymentError('Số tiền thanh toán không được vượt quá số tiền còn lại');
      return;
    }

    // Lưu dữ liệu thanh toán để xác nhận
    const paymentData = {
      paymentId: selectedInvoice.id,
      amount,
      method: paymentMethod,
      note: paymentNote || `Thanh toán học phí tháng ${selectedInvoice.month}`
    };

    setPaymentConfirmData({
      invoice: selectedInvoice,
      paymentData
    });
    setPaymentConfirmOpen(true);
  };

  const handleConfirmPaymentFinal = async () => {
    if (!paymentConfirmData) return;

    setPaymentLoading(true);
    setPaymentConfirmOpen(false);
    setPaymentError('');
    setPaymentSuccess('');

    try {
      const response = await payTuitionAPI(paymentConfirmData.paymentData);
      setPaymentSuccess('Thanh toán thành công!');
      setSnackbar({ open: true, message: 'Thanh toán thành công!', severity: 'success' });
      handleClosePaymentDialog();
      // Refetch dữ liệu thay vì reload trang
      await fetchPaymentData();
    } catch (error) {
      setPaymentError(error.response?.data?.message || 'Có lỗi xảy ra khi thanh toán');
      setSnackbar({ open: true, message: error.response?.data?.message || 'Có lỗi xảy ra khi thanh toán', severity: 'error' });
    } finally {
      setPaymentLoading(false);
      setPaymentConfirmData(null);
    }
  };

  return (
    <DashboardLayout role="parent">
      <Box sx={{ ...commonStyles.pageContainer, paddingLeft: '2%', paddingRight: '2%' }}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý học phí
            </Typography>
          </Box>

          <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Xem và quản lý hóa đơn học phí của con bạn
          </Typography>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng hóa đơn"
              value={summary.totalInvoices}
              icon={<ReceiptIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đã thanh toán"
              value={formatCurrency(summary.totalPaid)}
              icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Chưa thanh toán"
              value={formatCurrency(summary.totalUnpaid)}
              icon={<MoneyOffIcon sx={{ fontSize: 40 }} />}
              color="error"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng giảm giá"
              value={formatCurrency(summary.totalDiscount)}
              icon={<DiscountIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label={`Tất cả (${allInvoices.length})`} />
          <Tab label={`Chưa thanh toán (${summary.unpaidInvoices})`} />
          <Tab label={`Đã thanh toán (${summary.paidInvoices})`} />
        </Tabs>

        {/* Search */}
        <Paper sx={commonStyles.searchContainer}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên con hoặc tên lớp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={commonStyles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Invoices Table */}
        {loading ? (
          <LinearProgress />
        ) : (
          <TableContainer component={Paper} sx={commonStyles.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tên con</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Lớp học</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tháng</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Số buổi học</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Số tiền gốc</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Giảm giá</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Số tiền cuối</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Đã thanh toán</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Còn lại</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} sx={commonStyles.tableRow}>
                          <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {invoice.childName}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{invoice.className}</Typography>
                          </TableCell>
                    <TableCell align="center">{invoice.month}</TableCell>
                    <TableCell align="center"><Typography variant="body2" sx={{ fontWeight: 500 }}>{`${invoice.attendedLessons} buổi`}</Typography></TableCell>
                    <TableCell align="center"><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.originalAmount)}</Typography></TableCell>
                    <TableCell align="center">
                      {invoice.discountAmount > 0 ? (
                        <Chip
                          label={`-${formatCurrency(invoice.discountAmount)}`}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.finalAmount)}</Typography></TableCell>
                    <TableCell align="center"><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.paidAmount)}</Typography></TableCell>
                    <TableCell align="center"><Typography variant="body2" sx={{ fontWeight: 500 }}>{formatCurrency(invoice.remainingAmount)}</Typography></TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(invoice.status)}
                        color={getStatusColor(invoice.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="left">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'left' }}>
                        {invoice.status !== 'paid' ? (
                          <Button
                            variant="contained"
                        color="primary"
                        size="small"
                            onClick={() => handlePayment(invoice)}
                          >
                            Thanh toán
                          </Button>
                        ) : null}
                        {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleOpenPaymentHistory(invoice)}
                            title="Xem lịch sử thanh toán"
                          >
                            <HistoryIcon />
                      </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
              )}

        {filteredInvoices.length === 0 && !loading && (
          <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
            Không tìm thấy hóa đơn nào.
          </Typography>
        )}

        {/* Payment Dialog */}
          <Dialog
          open={paymentDialogOpen}
          onClose={handleClosePaymentDialog}
          maxWidth="sm"
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
                Thanh toán học phí
                </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Xác nhận thông tin thanh toán
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
            {selectedInvoice && (
              <Box sx={{ p: 4 }}>


                {/* Invoice Information */}
                <Paper sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <Typography variant="h6" sx={{
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
                      Thông tin hóa đơn
                    </Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Học sinh
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedInvoice.childName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Lớp học
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedInvoice.className}
                        </Typography>
                  </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Tháng
                    </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedInvoice.month}
                          </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Số tiền còn lại
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                          {formatCurrency(selectedInvoice.remainingAmount)}
                        </Typography>
                </Grid>
              </Grid>
                  </Box>
                </Paper>

                {/* Hiển thị lỗi ở giữa hóa đơn và form thanh toán */}
                {paymentError && (
                  <Alert severity="error" sx={{ mb: 3, textAlign: 'center' }}>
                    {paymentError}
                  </Alert>
                )}
                {paymentSuccess && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {paymentSuccess}
                  </Alert>
                )}

                {/* Payment Form */}
                <Paper sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <Typography variant="h6" sx={{
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
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Số tiền thanh toán"
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">VNĐ</InputAdornment>,
                          }}
                          helperText={`Tối đa: ${formatCurrency(selectedInvoice.remainingAmount)}`}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: '#667eea',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="Phương thức thanh toán"
                          value={paymentMethod}
                          onChange={e => setPaymentMethod(e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: '#667eea',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                        >
                          <MenuItem value="cash">Tiền mặt</MenuItem>
                          <MenuItem value="bank_transfer">Chuyển khoản</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Ghi chú (tuỳ chọn)"
                          value={paymentNote}
                          onChange={e => setPaymentNote(e.target.value)}
                          multiline
                          minRows={2}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: '#667eea',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
                </Box>
          )}
        </DialogContent>

          <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
            <Button
              onClick={handleClosePaymentDialog}
              disabled={paymentLoading}
              variant="outlined"
              sx={{
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#5a6fd8',
                  bgcolor: 'rgba(102, 126, 234, 0.04)'
                },
                px: 3,
                py: 1,
                borderRadius: 2
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmPayment}
              variant="contained"
              disabled={paymentLoading || !paymentAmount}
              sx={{
                bgcolor: '#667eea',
                '&:hover': { bgcolor: '#5a6fd8' },
                '&:disabled': { bgcolor: '#ccc' },
                px: 3,
                py: 1,
                borderRadius: 2
              }}
            >
              {paymentLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
            </Button>
        </DialogActions>
      </Dialog>

        {/* Payment History Modal */}
        <PaymentHistoryModal
          open={paymentHistoryModalOpen}
          onClose={handleClosePaymentHistory}
          paymentData={selectedPaymentForHistory}
          title="Lịch sử thanh toán học phí"
          showPaymentDetails={true}
        />
        {/* Notification Snackbar */}
        <NotificationSnackbar
          open={snackbar.open}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
          severity={snackbar.severity}
        />

        {/* Confirm Dialog for Payment */}
        <ConfirmDialog
          open={paymentConfirmOpen}
          onClose={() => setPaymentConfirmOpen(false)}
          onConfirm={handleConfirmPaymentFinal}
          title="Xác nhận thanh toán học phí"
          message={`Bạn có chắc chắn muốn thanh toán học phí cho ${paymentConfirmData?.invoice?.childName} - ${paymentConfirmData?.invoice?.className} tháng ${paymentConfirmData?.invoice?.month} với số tiền ${paymentConfirmData?.paymentData?.amount.toLocaleString()} ₫?`}
          confirmText="Xác nhận"
          cancelText="Hủy"
          loading={paymentLoading}
        />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Payments;
