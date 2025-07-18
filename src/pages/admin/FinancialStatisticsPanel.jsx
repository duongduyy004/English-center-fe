import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Card, CardContent, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Pagination, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, InputAdornment, Tooltip
} from '@mui/material';
import { History as HistoryIcon, Visibility as VisibilityIcon, Edit as EditIcon, Payment as PaymentIcon } from '@mui/icons-material';
import { getPaymentsAPI, getTeacherPaymentsAPI, payTeacherAPI, getTotalPaymentsAPI, getTeacherByIdAPI, updatePaymentRecordAPI } from '../../services/api';
import PaymentHistoryModal from '../../components/common/PaymentHistoryModal';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const quarters = [1, 2, 3, 4];

const FinancialStatisticsPanel = () => {
  const [periodType, setPeriodType] = useState('year');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [tab, setTab] = useState(0);
  const [customStart, setCustomStart] = useState(new Date().toISOString().split('T')[0].substring(0, 8) + '01');
  const [customEnd, setCustomEnd] = useState(new Date().toISOString().split('T')[0]);
  const [studentPayments, setStudentPayments] = useState([]);
  const [teacherPayments, setTeacherPayments] = useState([]);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [loadingTeacher, setLoadingTeacher] = useState(false);
  const [studentPaymentsLoaded, setStudentPaymentsLoaded] = useState(false);
  const [studentPagination, setStudentPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalResults: 0
  });
  const [teacherPagination, setTeacherPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalResults: 0
  });
  const [totalStatistics, setTotalStatistics] = useState({
    totalStudentFees: 0,
    totalPaidAmount: 0,
    totalRemainingAmount: 0,
    totalTeacherSalary: 0
  });

  // Payment history modal states
  const [paymentHistoryModalOpen, setPaymentHistoryModalOpen] = useState(false);
  const [selectedPaymentForHistory, setSelectedPaymentForHistory] = useState(null);

  // Teacher payment detail modal states
  const [teacherDetailModalOpen, setTeacherDetailModalOpen] = useState(false);
  const [selectedTeacherForDetail, setSelectedTeacherForDetail] = useState(null);

  const [teacherPaymentDialogOpen, setTeacherPaymentDialogOpen] = useState(false);
  const [selectedTeacherPayment, setSelectedTeacherPayment] = useState(null);
  const [teacherPaymentAmount, setTeacherPaymentAmount] = useState('');
  const [teacherPaymentMethod, setTeacherPaymentMethod] = useState('cash');
  const [teacherPaymentNote, setTeacherPaymentNote] = useState('');
  const [teacherPaymentLoading, setTeacherPaymentLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ConfirmDialog states for teacher payment
  const [teacherPaymentConfirmOpen, setTeacherPaymentConfirmOpen] = useState(false);
  const [teacherPaymentConfirmData, setTeacherPaymentConfirmData] = useState(null);

  // Student payment update dialog states
  const [studentPaymentUpdateOpen, setStudentPaymentUpdateOpen] = useState(false);
  const [selectedStudentPayment, setSelectedStudentPayment] = useState(null);
  const [studentPaymentUpdateData, setStudentPaymentUpdateData] = useState({
    amount: '',
    method: 'cash',
    note: ''
  });
  const [studentPaymentUpdateLoading, setStudentPaymentUpdateLoading] = useState(false);

  // Helper: Lấy tháng đầu/cuối quý
  const getQuarterMonths = (quarter) => {
    switch (quarter) {
      case 1: return { startMonth: 1, endMonth: 3 };
      case 2: return { startMonth: 4, endMonth: 6 };
      case 3: return { startMonth: 7, endMonth: 9 };
      case 4: return { startMonth: 10, endMonth: 12 };
      default: return { startMonth: 1, endMonth: 3 };
    }
  };

  const [fixedTotalTeacherSalary, setFixedTotalTeacherSalary] = useState(0);

  const fetchTotalStatistics = async () => {
    try {
      // Sử dụng API mới để lấy tổng học phí và đã thu
      const totalPaymentsRes = await getTotalPaymentsAPI();
      const { total: totalStudentFees, paid: totalPaidAmount } = totalPaymentsRes.data;

      // Tính số tiền còn thiếu
      const totalRemainingAmount = totalStudentFees - totalPaidAmount;

      // Tính tổng lương giáo viên từ dữ liệu hiện tại
      const totalTeacherSalary = teacherPayments.reduce((total, p) => total + (p.totalAmount ?? 0), 0);

      setTotalStatistics({
        totalStudentFees,
        totalPaidAmount,
        totalRemainingAmount,
        totalTeacherSalary
      });
    } catch (err) {
      console.error('Error fetching total statistics:', err);
      // Fallback: sử dụng cách tính cũ nếu API mới lỗi
      try {
        const res = await getPaymentsAPI({ page: 1, limit: 1000 });
        const allStudentPayments = res.data || [];

        const totalStudentFees = allStudentPayments.reduce((total, p) => total + (p.finalAmount ?? 0), 0);
        const totalPaidAmount = allStudentPayments.reduce((total, p) => total + (p.paidAmount ?? 0), 0);
        const totalRemainingAmount = allStudentPayments.reduce((total, p) => total + (p.remainingAmount ?? 0), 0);

        const totalTeacherSalary = teacherPayments.reduce((total, p) => total + (p.totalAmount ?? 0), 0);

        setTotalStatistics({
          totalStudentFees,
          totalPaidAmount,
          totalRemainingAmount,
          totalTeacherSalary
        });
      } catch (fallbackErr) {
        console.error('Error in fallback calculation:', fallbackErr);
      }
    }
  };

  const paymentStatuses = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'paid', label: 'Đã thanh toán' },
    { value: 'partial', label: 'Đóng một phần' },
    { value: 'pending', label: 'Chờ thanh toán' },
  ];
  const [paymentStatus, setPaymentStatus] = useState('all');

  const fetchStudentPayments = async (page = 1) => {
    setLoadingStudent(true);
    try {
      let params = { page, limit: 10 };

      // Thêm filter trạng thái thanh toán nếu không phải "all"
      if (paymentStatus !== 'all') {
        params = { ...params, status: paymentStatus };
      }

      if (periodType === 'month') {
        params = { ...params, year: selectedYear, month: selectedMonth };
      } else if (periodType === 'quarter') {
        const { startMonth, endMonth } = getQuarterMonths(selectedQuarter);
        params = { ...params, year: selectedYear, startMonth, endMonth };
      } else if (periodType === 'year') {
        params = { ...params, year: selectedYear };
      } else if (periodType === 'custom') {
        const year = new Date(customStart).getFullYear();
        const startMonth = new Date(customStart).getMonth() + 1;
        const endMonth = new Date(customEnd).getMonth() + 1;
        params = { ...params, year, startMonth, endMonth };
      }
      const res = await getPaymentsAPI(params);
      setStudentPayments(res.data || []);
      setStudentPagination({
        page: page,
        limit: 10,
        totalPages: res.totalPages || 1,
        totalResults: res.totalResults || (res.data ? res.data.length : 0)
      });
      setStudentPaymentsLoaded(true);
    } catch (err) {
      setStudentPayments([]);
      setStudentPagination({ page: 1, limit: 10, totalPages: 1, totalResults: 0 });
    } finally {
      setLoadingStudent(false);
    }
  };

  const fetchTeacherPayments = async (page = 1) => {
    setLoadingTeacher(true);
    try {
      let params = { page, limit: 10 };

      // Thêm filter trạng thái thanh toán nếu không phải "all"
      if (paymentStatus !== 'all') {
        params = { ...params, status: paymentStatus };
      }

      if (periodType === 'month') {
        params = { ...params, year: selectedYear, month: selectedMonth };
      } else if (periodType === 'quarter') {
        const { startMonth, endMonth } = getQuarterMonths(selectedQuarter);
        params = { ...params, year: selectedYear, startMonth, endMonth };
      } else if (periodType === 'year') {
        params = { ...params, year: selectedYear };
      } else if (periodType === 'custom') {
        const year = new Date(customStart).getFullYear();
        const startMonth = new Date(customStart).getMonth() + 1;
        const endMonth = new Date(customEnd).getMonth() + 1;
        params = { ...params, year, startMonth, endMonth };
      }
      const res = await getTeacherPaymentsAPI(params);
      // API trả về: { data, totalPages, totalResults }
      setTeacherPayments(res.data || []);
      setTeacherPagination({
        page: page,
        limit: 10,
        totalPages: res.totalPages || 1,
        totalResults: res.totalResults || (res.data ? res.data.length : 0)
      });
    } catch (err) {
      setTeacherPayments([]);
      setTeacherPagination({ page: 1, limit: 10, totalPages: 1, totalResults: 0 });
    } finally {
      setLoadingTeacher(false);
    }
  };

  useEffect(() => {
    // Chỉ fetch teacher payments và total statistics khi filter thay đổi
    fetchTeacherPayments(1); // Reset về page 1
    fetchTotalStatistics();
    // Reset student payments loaded flag và pagination khi filter thay đổi
    setStudentPaymentsLoaded(false);
    setStudentPagination(prev => ({ ...prev, page: 1 }));
    setTeacherPagination(prev => ({ ...prev, page: 1 }));
  }, [periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd, paymentStatus]);

  // Fetch student payments chỉ khi vào tab chi tiết học sinh
  useEffect(() => {
    if (tab === 1 && !studentPaymentsLoaded) {
      fetchStudentPayments(1); // Reset về page 1
    }
  }, [tab, periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd, paymentStatus]);

  // Khi filter thay đổi, nếu đang ở tab chi tiết học sinh thì luôn fetch lại dữ liệu
  useEffect(() => {
    if (tab === 1) {
      fetchStudentPayments(1);
      setStudentPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [periodType, selectedYear, selectedMonth, selectedQuarter, customStart, customEnd, paymentStatus]);

  // Lấy tổng lương giáo viên cố định khi mount
  useEffect(() => {
    const fetchFixedTotalTeacherSalary = async () => {
      try {
        // Lấy tất cả bản ghi, không phân trang (limit lớn)
        const res = await getTeacherPaymentsAPI({ page: 1, limit: 10000 });
        const all = res.data || [];
        const total = all.reduce((sum, p) => sum + (p.totalAmount ?? 0), 0);
        setFixedTotalTeacherSalary(total);
      } catch (err) {
        setFixedTotalTeacherSalary(0);
      }
    };
    fetchFixedTotalTeacherSalary();
  }, []);

  useEffect(() => {
    if (paymentStatus !== 'all') {
      fetchStudentPayments(1);
      fetchTeacherPayments(1);
      setStudentPagination(prev => ({ ...prev, page: 1 }));
      setTeacherPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [paymentStatus]);

  const handleStudentPageChange = (event, newPage) => {
    fetchStudentPayments(newPage);
  };

  const handleTeacherPageChange = (event, newPage) => {
    fetchTeacherPayments(newPage);
  };

  const handleOpenPaymentHistory = async (payment) => {
    setSelectedPaymentForHistory(payment);
    setPaymentHistoryModalOpen(true);
    // Lấy id giáo viên
    const teacherId = payment.teacherId?.id || payment.teacherId?.userId?.id;
    console.log('Payment data:', payment);
    console.log('Teacher ID:', teacherId);
    if (teacherId) {
      try {
        const res = await getTeacherByIdAPI(teacherId);
        console.log('Teacher API response:', res);
        console.log('Teacher API response.data:', res.data);
        console.log('Teacher API response.data structure:', JSON.stringify(res.data, null, 2));

        // Đảm bảo set state đúng cách
        const teacherData = res.data || res;
        console.log('Setting teacherDetailInfo to:', teacherData);
        setTeacherDetailInfo(teacherData);

        // Debug: kiểm tra state sau khi set
        setTimeout(() => {
          console.log('teacherDetailInfo after timeout:', teacherData);
        }, 100);

      } catch (err) {
        console.error('Error fetching teacher info:', err);
        setTeacherDetailInfo(null);
      }
    } else {
      setTeacherDetailInfo(null);
    }
  };

  const handleClosePaymentHistory = () => {
    setSelectedPaymentForHistory(null);
    setPaymentHistoryModalOpen(false);
  };

  const handleOpenTeacherPaymentDialog = (payment) => {
    setSelectedTeacherPayment(payment);
    setTeacherPaymentAmount('');
    setTeacherPaymentMethod('cash');
    setTeacherPaymentNote('');
    setTeacherPaymentLoading(false);
    setTeacherPaymentDialogOpen(true);
  };

  const handleCloseTeacherPaymentDialog = () => {
    setTeacherPaymentDialogOpen(false);
    setSelectedTeacherPayment(null);
    setTeacherPaymentAmount('');
    setTeacherPaymentMethod('cash');
    setTeacherPaymentNote('');
  };

  const handleConfirmTeacherPayment = async () => {
    if (!selectedTeacherPayment || !teacherPaymentAmount) {
      setSnackbar({
        open: true,
        message: 'Vui lòng nhập số tiền thanh toán',
        severity: 'error'
      });
      return;
    }
    const amount = parseFloat(teacherPaymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setSnackbar({
        open: true,
        message: 'Số tiền thanh toán không hợp lệ',
        severity: 'error'
      });
      return;
    }
    const maxAmount = (selectedTeacherPayment.totalAmount ?? 0) - (selectedTeacherPayment.paidAmount ?? 0);
    if (amount > maxAmount) {
      setSnackbar({
        open: true,
        message: 'Số tiền thanh toán không được vượt quá số tiền còn lại',
        severity: 'error'
      });
      return;
    }

    // Lưu dữ liệu thanh toán để xác nhận
    const paymentData = {
      amount,
      method: teacherPaymentMethod,
      note: teacherPaymentNote || 'Thanh toán lương giáo viên'
    };

    setTeacherPaymentConfirmData({
      teacher: selectedTeacherPayment,
      paymentData
    });
    setTeacherPaymentConfirmOpen(true);
  };

  const handleConfirmTeacherPaymentFinal = async () => {
    if (!teacherPaymentConfirmData) return;

    setTeacherPaymentLoading(true);
    setTeacherPaymentConfirmOpen(false);

    try {
      await payTeacherAPI(
        teacherPaymentConfirmData.teacher.teacherId?.id || teacherPaymentConfirmData.teacher.teacherId?.userId?.id,
        teacherPaymentConfirmData.paymentData,
        { month: teacherPaymentConfirmData.teacher.month, year: teacherPaymentConfirmData.teacher.year }
      );
      setSnackbar({
        open: true,
        message: 'Thanh toán lương giáo viên thành công!',
        severity: 'success'
      });
      await fetchTeacherPayments();
      await fetchTotalStatistics();
      handleCloseTeacherPaymentDialog();
    } catch (error) {
      console.error('Lỗi thanh toán lương giáo viên:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi thanh toán lương giáo viên',
        severity: 'error'
      });
    } finally {
      setTeacherPaymentLoading(false);
      setTeacherPaymentConfirmData(null);
    }
  };

  const handleOpenTeacherDetail = async (payment) => {
    setSelectedTeacherForDetail(payment);
    setTeacherDetailModalOpen(true);
    // Lấy id giáo viên
    const teacherId = payment.teacherId?.id || payment.teacherId?.userId?.id;
    console.log('Payment data for detail:', payment);
    console.log('Teacher ID for detail:', teacherId);
    if (teacherId) {
      try {
        const res = await getTeacherByIdAPI(teacherId);
        console.log('Teacher API response for detail:', res);

        // Đảm bảo set state đúng cách
        const teacherData = res.data || res;
        console.log('Setting teacherDetailInfo for detail to:', teacherData);
        setTeacherDetailInfo(teacherData);

        // Debug: kiểm tra state sau khi set
        setTimeout(() => {
          console.log('teacherDetailInfo for detail after timeout:', teacherData);
        }, 100);

      } catch (err) {
        console.error('Error fetching teacher info for detail:', err);
        setTeacherDetailInfo(null);
      }
    } else {
      setTeacherDetailInfo(null);
    }
  };

  const handleCloseTeacherDetail = () => {
    setTeacherDetailModalOpen(false);
    setSelectedTeacherForDetail(null);
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Student payment update functions
  const handleOpenStudentPaymentUpdate = (payment) => {
    setSelectedStudentPayment(payment);
    setStudentPaymentUpdateData({
      amount: (payment.remainingAmount || 0).toString(),
      method: 'cash',
      note: ''
    });
    setStudentPaymentUpdateOpen(true);
  };

  const handleCloseStudentPaymentUpdate = () => {
    setStudentPaymentUpdateOpen(false);
    setSelectedStudentPayment(null);
    setStudentPaymentUpdateData({
      amount: '',
      method: 'cash',
      note: ''
    });
  };

  const handleUpdateStudentPayment = async () => {
    if (!selectedStudentPayment) return;

    const amount = parseFloat(studentPaymentUpdateData.amount);
    if (isNaN(amount) || amount <= 0) {
      setSnackbar({
        open: true,
        message: 'Số tiền thanh toán không hợp lệ',
        severity: 'error'
      });
      return;
    }

    const remainingAmount = selectedStudentPayment.remainingAmount || 0;
    if (amount > remainingAmount) {
      setSnackbar({
        open: true,
        message: 'Số tiền thanh toán không được vượt quá số tiền còn lại',
        severity: 'error'
      });
      return;
    }

    setStudentPaymentUpdateLoading(true);
    try {
      const paymentData = {
        amount,
        method: studentPaymentUpdateData.method,
        note: studentPaymentUpdateData.note || 'Thanh toán bằng tay bởi admin'
      };

      // Use the manual payment endpoint
      await updatePaymentRecordAPI(selectedStudentPayment.id, paymentData);

      setSnackbar({
        open: true,
        message: 'Thanh toán thành công!',
        severity: 'success'
      });

      // Refresh data
      await fetchStudentPayments(studentPagination.page);
      await fetchTotalStatistics();

      handleCloseStudentPaymentUpdate();
    } catch (error) {
      console.error('Error processing manual payment:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi thanh toán',
        severity: 'error'
      });
    } finally {
      setStudentPaymentUpdateLoading(false);
    }
  };  // Thông tin chi tiết giáo viên
  const [teacherDetailInfo, setTeacherDetailInfo] = useState(null);

  // Debug: theo dõi thay đổi teacherDetailInfo
  useEffect(() => {
    console.log('teacherDetailInfo changed:', teacherDetailInfo);
  }, [teacherDetailInfo]);

  // Bộ lọc thời gian
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Thống kê tài chính
      </Typography>
      {/* Cards tổng quan */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tổng lương giáo viên</Typography>
              <Typography variant="h5" color="error.main" fontWeight="bold">{fixedTotalTeacherSalary.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Tổng học phí</Typography>
              <Typography variant="h5" color="info.main" fontWeight="bold">{totalStatistics.totalStudentFees.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Đã thu</Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">{totalStatistics.totalPaidAmount.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Còn thiếu</Typography>
              <Typography variant="h5" color="warning.main" fontWeight="bold">{totalStatistics.totalRemainingAmount.toLocaleString()} ₫</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Bộ lọc thời gian */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}>
            <TextField select fullWidth label="Loại thống kê" value={periodType} onChange={e => setPeriodType(e.target.value)}>
              <MenuItem value="month">Tháng</MenuItem>
              <MenuItem value="quarter">Quý</MenuItem>
              <MenuItem value="year">Năm</MenuItem>
              <MenuItem value="custom">Tùy chỉnh</MenuItem>
            </TextField>
          </Grid>
          {periodType !== 'custom' && (
            <Grid item xs={12} sm={2}>
              <TextField select fullWidth label="Năm" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                {years.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {periodType === 'month' && (
            <Grid item xs={12} sm={2}>
              <TextField select fullWidth label="Tháng" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {periodType === 'quarter' && (
            <Grid item xs={12} sm={2}>
              <TextField select fullWidth label="Quý" value={selectedQuarter} onChange={e => setSelectedQuarter(Number(e.target.value))}>
                {quarters.map(q => <MenuItem key={q} value={q}>Quý {q}</MenuItem>)}
              </TextField>
            </Grid>
          )}
          {periodType === 'custom' && (
            <>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Từ ngày"
                  type="date"
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{
                    input: { color: 'text.primary', background: 'background.paper' },
                    '.MuiInputBase-root': { bgcolor: 'background.paper' },
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Đến ngày"
                  type="date"
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{
                    input: { color: 'text.primary', background: 'background.paper' },
                    '.MuiInputBase-root': { bgcolor: 'background.paper' },
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                  }}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={2}>
            <TextField select fullWidth label="Trạng thái thanh toán" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
              {paymentStatuses.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs bảng chi tiết */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Chi tiết giáo viên" />
          <Tab label="Chi tiết học sinh" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Giáo viên</TableCell>
                      <TableCell align="center">Tháng/Năm</TableCell>
                      <TableCell align="right">Lương/buổi</TableCell>
                      <TableCell align="right">Số buổi dạy</TableCell>
                      <TableCell align="right">Tổng lương</TableCell>
                      <TableCell align="right">Đã trả</TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teacherPayments.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {p.teacherId?.userId?.name || p.teacherId?.name || 'Chưa có tên'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{p.month || 0}/{p.year || 0}</TableCell>
                        <TableCell align="right">{(p.salaryPerLesson ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="right">
                          {p.classes && Array.isArray(p.classes)
                            ? p.classes.reduce((sum, classItem) => sum + (classItem.totalLessons || 0), 0)
                            : 0
                          }
                        </TableCell>
                        <TableCell align="right">{(p.totalAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="right">{(p.paidAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={p.status === 'paid' ? 'Đã thanh toán' : p.status === 'partial' ? 'Nhận một phần' : p.status === 'pending' ? 'Chờ thanh toán' : 'Chưa thanh toán'}
                            color={p.status === 'paid' ? 'success' : p.status === 'partial' ? 'warning' : p.status === 'pending' ? 'info' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Xem chi tiết">
                              <IconButton size="small" color="primary" onClick={() => handleOpenTeacherDetail(p)}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Lịch sử thanh toán">
                              <IconButton size="small" color="info" onClick={() => handleOpenPaymentHistory(p)}>
                                <HistoryIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              disabled={((p.totalAmount ?? 0) - (p.paidAmount ?? 0) <= 0)}
                              onClick={() => handleOpenTeacherPaymentDialog(p)}
                              sx={{ whiteSpace: 'nowrap' }}
                            >
                              Thanh toán
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Pagination for Teacher */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={teacherPagination.totalPages}
                  page={teacherPagination.page}
                  onChange={handleTeacherPageChange}
                  color="primary"
                />
              </Box>
            </>
          )}
          {tab === 1 && (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Học sinh</TableCell>
                      <TableCell>Lớp</TableCell>
                      <TableCell align="center">Tháng</TableCell>
                      <TableCell align="center">Số buổi học</TableCell>
                      <TableCell align="center">Số tiền gốc</TableCell>
                      <TableCell align="center">Giảm giá</TableCell>
                      <TableCell align="center">Số tiền cuối</TableCell>
                      <TableCell align="center">Đã đóng</TableCell>
                      <TableCell align="center">Còn thiếu</TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentPayments.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>{p.studentId?.userId?.name || p.studentId?.name || 'Chưa có tên'}</TableCell>
                        <TableCell>{p.classId?.name || 'Chưa có tên lớp'}</TableCell>
                        <TableCell align="center">{p.month || 0}/{p.year || 0}</TableCell>
                        <TableCell align="center">{p.attendedLessons || 0}</TableCell>
                        <TableCell align="center">{(p.totalAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="center">{(p.discountAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="center">{(p.finalAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="center">{(p.paidAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="center">{(p.remainingAmount ?? 0).toLocaleString()} ₫</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={p.status === 'paid' ? 'Đã đóng đủ' : p.status === 'partial' ? 'Đóng một phần' : 'Chưa đóng'}
                            color={p.status === 'paid' ? 'success' : p.status === 'partial' ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="Lịch sử thanh toán">
                              <IconButton size="small" color="info" onClick={() => handleOpenPaymentHistory(p)}>
                                <HistoryIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              disabled={p.remainingAmount <= 0}
                              onClick={() => handleOpenStudentPaymentUpdate(p)}
                              sx={{ whiteSpace: 'nowrap' }}
                            >
                              Thanh toán
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={studentPagination.totalPages}
                  page={studentPagination.page}
                  onChange={handleStudentPageChange}
                  color="primary"
                />
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {/* Payment History Modal */}
      <PaymentHistoryModal
        open={paymentHistoryModalOpen}
        onClose={handleClosePaymentHistory}
        paymentData={selectedPaymentForHistory}
        title="Lịch sử thanh toán học phí"
        showPaymentDetails={true}
        teacherInfo={teacherDetailInfo}
      />

      {/* Teacher Payment Dialog */}
      <Dialog
        open={teacherPaymentDialogOpen}
        onClose={handleCloseTeacherPaymentDialog}
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
              Thanh toán lương giáo viên
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Xác nhận thanh toán lương cho giáo viên tháng {selectedTeacherPayment?.month}/{selectedTeacherPayment?.year}
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
            <VisibilityIcon sx={{ fontSize: 28, color: 'white' }} />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 4 }}>
            {selectedTeacherPayment && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thông tin lương
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Giáo viên:</strong> {selectedTeacherPayment.teacherId?.userId?.name || selectedTeacherPayment.teacherId?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                      Bạn có thể thanh toán một phần hoặc toàn bộ số tiền còn lại
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Số tiền thanh toán"
                    type="number"
                    value={teacherPaymentAmount}
                    onChange={e => setTeacherPaymentAmount(e.target.value)}
                    placeholder={`Tối đa: ${((selectedTeacherPayment.totalAmount ?? 0) - (selectedTeacherPayment.paidAmount ?? 0)).toLocaleString()} ₫`}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">VNĐ</InputAdornment>,
                    }}
                    helperText="Nhập số tiền muốn thanh toán (có thể thanh toán từng phần)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Phương thức thanh toán"
                    value={teacherPaymentMethod}
                    onChange={e => setTeacherPaymentMethod(e.target.value)}
                    sx={{ mt: 2 }}
                  >
                    <MenuItem value="cash">Tiền mặt</MenuItem>
                    <MenuItem value="bank_transfer">Chuyển khoản</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ghi chú (tuỳ chọn)"
                    value={teacherPaymentNote}
                    onChange={e => setTeacherPaymentNote(e.target.value)}
                    multiline
                    minRows={2}
                    sx={{ mt: 2 }}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={handleCloseTeacherPaymentDialog}
            disabled={teacherPaymentLoading}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              border: '2px solid #667eea',
              color: '#667eea',
              bgcolor: 'white',
              '&:hover': {
                background: '#667eea',
                color: 'white',
              }
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmTeacherPayment}
            variant="contained"
            color="primary"
            disabled={teacherPaymentLoading || !teacherPaymentAmount}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 2px 8px rgba(102,126,234,0.15)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #764ba2 100%)',
              },
              '&:disabled': {
                background: '#ccc',
              }
            }}
          >
            {teacherPaymentLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Teacher Detail Modal */}
      {selectedTeacherForDetail && (
        <Dialog
          open={teacherDetailModalOpen}
          onClose={handleCloseTeacherDetail}
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
                Chi tiết lương tháng {selectedTeacherForDetail.month}/{selectedTeacherForDetail.year}
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
              <VisibilityIcon sx={{ fontSize: 28, color: 'white' }} />
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
                          {selectedTeacherForDetail.teacherId?.userId?.name || selectedTeacherForDetail.teacherId?.name}
                        </span>
                      </Typography>
                      {/* Thêm email và số điện thoại nếu có */}
                      {teacherDetailInfo && (
                        <>
                          {console.log('Teacher Detail Modal - teacherDetailInfo:', teacherDetailInfo)}
                          {console.log('Teacher Detail Modal - teacherDetailInfo.userId:', teacherDetailInfo.userId)}
                          <Typography variant="body2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666' }}>Email:</span>
                            <span style={{ fontWeight: 500, color: '#2c3e50' }}>
                              {(() => {
                                const email = teacherDetailInfo.userId?.email || teacherDetailInfo.email || '-';
                                console.log('Teacher Detail Modal - Final email:', email);
                                return email;
                              })()}
                            </span>
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666' }}>SĐT:</span>
                            <span style={{ fontWeight: 500, color: '#2c3e50' }}>
                              {(() => {
                                const phone = teacherDetailInfo.userId?.phone || teacherDetailInfo.phone || '-';
                                console.log('Teacher Detail Modal - Final phone:', phone);
                                return phone;
                              })()}
                            </span>
                          </Typography>
                        </>
                      )}
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
                          {selectedTeacherForDetail.month}/{selectedTeacherForDetail.year}
                        </span>
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Lương/buổi:</span>
                        <span style={{ fontWeight: 600, color: '#27ae60' }}>
                          {(selectedTeacherForDetail.salaryPerLesson ?? 0).toLocaleString()} ₫
                        </span>
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Tổng lương:</span>
                        <span style={{ fontWeight: 600, color: '#e74c3c' }}>
                          {(selectedTeacherForDetail.totalAmount ?? 0).toLocaleString()} ₫
                        </span>
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#666' }}>Đã nhận:</span>
                        <span style={{ fontWeight: 600, color: '#27ae60' }}>
                          {(selectedTeacherForDetail.paidAmount ?? 0).toLocaleString()} ₫
                        </span>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Chi tiết từng lớp */}
              {selectedTeacherForDetail.classes && Array.isArray(selectedTeacherForDetail.classes) && (
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
                  <TableContainer>
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
                        {selectedTeacherForDetail.classes.map((classItem, index) => (
                          <TableRow
                            key={index}
                            hover
                            sx={{
                              '&:nth-of-type(odd)': { bgcolor: '#fafbfc' },
                              '&:hover': { bgcolor: '#f0f4ff' }
                            }}
                          >
                            <TableCell sx={{ fontWeight: 500, color: '#2c3e50' }}>
                              {classItem.classId?.name || 'N/A'}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                              {classItem.totalLessons || 0}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 500, color: '#27ae60' }}>
                              {(selectedTeacherForDetail.salaryPerLesson ?? 0).toLocaleString()} ₫
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: '#e74c3c' }}>
                              {((classItem.totalLessons || 0) * (selectedTeacherForDetail.salaryPerLesson ?? 0)).toLocaleString()} ₫
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
              onClick={handleCloseTeacherDetail}
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

      <NotificationSnackbar
        open={snackbar.open}
        onClose={handleCloseNotification}
        message={snackbar.message}
        severity={snackbar.severity}
      />

      {/* Confirm Dialog for Teacher Payment */}
      <ConfirmDialog
        open={teacherPaymentConfirmOpen}
        onClose={() => setTeacherPaymentConfirmOpen(false)}
        onConfirm={handleConfirmTeacherPaymentFinal}
        title="Xác nhận thanh toán lương giáo viên"
        message={`Bạn có chắc chắn muốn thanh toán lương cho giáo viên ${teacherPaymentConfirmData?.teacher?.teacherId?.userId?.name || teacherPaymentConfirmData?.teacher?.name} tháng ${teacherPaymentConfirmData?.teacher?.month}/${teacherPaymentConfirmData?.teacher?.year} với số tiền ${teacherPaymentConfirmData?.paymentData?.amount.toLocaleString()} ₫?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        loading={teacherPaymentLoading}
      />

      {/* Student Payment Update Dialog */}
      <Dialog
        open={studentPaymentUpdateOpen}
        onClose={handleCloseStudentPaymentUpdate}
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
              Thanh toán bằng tay
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Thực hiện thanh toán học phí cho học sinh
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
            {selectedStudentPayment && (
              <Grid container spacing={3}>
                {/* Student Info */}
                <Grid item xs={12}>
                  <Paper sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    border: '1px solid #e0e6ed'
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
                      Thông tin học sinh
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Tên học sinh:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedStudentPayment.studentId?.userId?.name || selectedStudentPayment.studentId?.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Lớp học:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedStudentPayment.classId?.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Tháng/Năm:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedStudentPayment.month}/{selectedStudentPayment.year}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Số tiền còn lại:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#e74c3c' }}>
                          {(selectedStudentPayment.remainingAmount || 0).toLocaleString()} ₫
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Update Form */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Số tiền thanh toán"
                    type="number"
                    value={studentPaymentUpdateData.amount}
                    onChange={(e) => setStudentPaymentUpdateData({
                      ...studentPaymentUpdateData,
                      amount: e.target.value
                    })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">VNĐ</InputAdornment>,
                    }}
                    helperText={`Tối đa: ${(selectedStudentPayment.remainingAmount || 0).toLocaleString()} ₫`}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Phương thức thanh toán"
                    value={studentPaymentUpdateData.method}
                    onChange={(e) => setStudentPaymentUpdateData({
                      ...studentPaymentUpdateData,
                      method: e.target.value
                    })}
                  >
                    <MenuItem value="cash">Tiền mặt</MenuItem>
                    <MenuItem value="bank_transfer">Chuyển khoản</MenuItem>
                    <MenuItem value="card">Thẻ</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ghi chú"
                    multiline
                    rows={3}
                    value={studentPaymentUpdateData.note}
                    onChange={(e) => setStudentPaymentUpdateData({
                      ...studentPaymentUpdateData,
                      note: e.target.value
                    })}
                    placeholder="Ghi chú về việc thanh toán..."
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={handleCloseStudentPaymentUpdate}
            disabled={studentPaymentUpdateLoading}
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
            onClick={handleUpdateStudentPayment}
            variant="contained"
            disabled={studentPaymentUpdateLoading}
            sx={{
              bgcolor: '#667eea',
              '&:hover': { bgcolor: '#5a6fd8' },
              '&:disabled': { bgcolor: '#ccc' },
              px: 3,
              py: 1,
              borderRadius: 2
            }}
          >
            {studentPaymentUpdateLoading ? 'Đang xử lý...' : 'Thanh toán'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancialStatisticsPanel;
