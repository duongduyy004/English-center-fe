import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import { commonStyles } from "../../utils/styles";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AddClassForm from './AddClassForm';
import { createClassAPI, getAllClassesAPI, updateClassAPI, getClassByIdAPI, getStudentsInClassAPI, getAllTeachersAPI } from '../../services/api';
import ClassTeacherManagement from './ClassTeacherManagement';
import ClassStudentManagement from './ClassStudentManagement';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const CustomTabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const ClassManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedClassForView, setSelectedClassForView] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [classStudents, setClassStudents] = useState([]);
  const [classStudentsLoading, setClassStudentsLoading] = useState(false);
  const [classStudentsError, setClassStudentsError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [refreshKey, setRefreshKey] = useState(0);
  const [openCloseClassDialog, setOpenCloseClassDialog] = useState(false);
  const [classToClose, setClassToClose] = useState(null);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleOpenDialog = (classData = null) => {
    setSelectedClass(classData);
    setOpenDialog(true);
    setError('');
    setCurrentTab(0); // Reset to the first tab whenever dialog opens
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form after dialog is closed to avoid flash effect
    setTimeout(() => {
      setSelectedClass(null);
      setError('');
    }, 100);
  };

  const handleOpenViewDialog = (classData) => {
    setSelectedClassForView(classData);
    setOpenViewDialog(true);
    // Fetch students for this specific class only
    fetchClassStudents(classData.id);
  };

  const handleCloseViewDialog = () => {
    setSelectedClassForView(null);
    setOpenViewDialog(false);
    setClassStudents([]);
    setClassStudentsError('');
  };

  const handleAddClass = async (data) => {
    setLoading(true);
    setError('');

    try {
      console.log('Dữ liệu gửi lên API:', data);
      await createClassAPI(data);
      showSnackbar('Thêm lớp học thành công!', 'success');
      handleCloseDialog();
      setPage(1); // Go back to first page to see the new class
      fetchClasses(1); // Refresh class list from first page
    } catch (err) {
      showSnackbar(err?.response?.data?.message || 'Có lỗi xảy ra khi thêm lớp học', 'error');
    } finally {
      setLoading(false);
    }
  };

    const handleForceRefresh = async () => {
    // Refresh danh sách lớp học
    await fetchClasses(page);

    // Nếu đang mở dialog chỉnh sửa, refresh dữ liệu của class hiện tại
    if (selectedClass && openDialog) {
      try {
        const updatedClass = await getClassByIdAPI(selectedClass.id);
        setSelectedClass(updatedClass.data);
        // Force re-render của component
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error('Error refreshing class data:', error);
      }
    }
  };

  const fetchClassStudents = async (classId) => {
    setClassStudentsLoading(true);
    setClassStudentsError('');
    try {
      const params = { page: 1, limit: 100 }; // Get all students
      const res = await getStudentsInClassAPI(classId, params);
      console.log('Class students response:', res);

      if (res.data && res.data.students) {
        setClassStudents(res.data.students);
      } else {
        setClassStudents([]);
      }
    } catch (err) {
      console.error('Error fetching class students:', err);
      setClassStudentsError(err?.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách học sinh');
      setClassStudents([]);
    } finally {
      setClassStudentsLoading(false);
    }
  };

  const handleUpdateClass = async (data) => {
    console.log('handleUpdateClass called with data:', data);
    console.log('selectedClass:', selectedClass);
    if (!selectedClass) return;
    setLoading(true);
    setError('');
    try {
      console.log('Calling updateClassAPI with:', selectedClass.id, data);
      await updateClassAPI(selectedClass.id, data);
      console.log('Update successful');
      showSnackbar('Cập nhật lớp học thành công!', 'success');
      handleCloseDialog();
      fetchClasses(page); // Refresh class list
    } catch (err) {
      console.error('Update error:', err);
      showSnackbar(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật lớp học', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseClass = async (classData) => {
    if (!classData) return;

    try {
      const closeData = {
        status: 'closed'
      };

      await updateClassAPI(classData.id, closeData);
      showSnackbar('Đóng lớp học thành công!', 'success');
      fetchClasses(page); // Refresh class list
    } catch (err) {
      console.error('Close class error:', err);
      showSnackbar(err?.response?.data?.message || 'Có lỗi xảy ra khi đóng lớp học', 'error');
    }
  };

  // Fetch classes from API
  const fetchClasses = async (pageNum = 1) => {
    setLoadingTable(true);
    try {
      const params = { page: pageNum, limit: 10 };
      if (yearFilter) params.year = yearFilter;
      if (gradeFilter) params.grade = gradeFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await getAllClassesAPI(params);
      console.log('API getAllClassesAPI response:', res);
      console.log('Classes data:', res.data);
      if (res.data && res.data.length > 0) {
        console.log('First class data structure:', res.data[0]);
      }
      setClasses(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.totalRecords || 0);

      // Remove automatic student count fetching - only fetch when needed
    } catch (err) {
      console.error('Error fetching classes:', err);
      setClasses([]);
    } finally {
      setLoadingTable(false);
    }
  };

  // Fetch classes on component mount and when page, year, grade, or status changes
  useEffect(() => {
    fetchClasses(page);
  }, [page, yearFilter, gradeFilter, statusFilter]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Helper function to format schedule display
  const formatSchedule = (schedule) => {
    if (!schedule) return '-';

    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Order: T2, T3, T4, T5, T6, T7, CN

    // Sort the selected days according to the dayOrder
    const sortedDays = schedule.dayOfWeeks?.sort((a, b) => {
      const indexA = dayOrder.indexOf(a);
      const indexB = dayOrder.indexOf(b);
      return indexA - indexB;
    }) || [];

    const selectedDays = sortedDays.map(day => daysOfWeek[day]).join(', ');
    const timeSlot = schedule.timeSlots ?
      `${schedule.timeSlots.startTime} - ${schedule.timeSlots.endTime}` : '';

    return (
      <>
        <div style={{ fontWeight: 500, color: '#2c3e50' }}>{selectedDays}</div>
        <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '2px' }}>{timeSlot}</div>
      </>
    );
  };

  // Helper function to get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      'active': 'Đang hoạt động',
      'upcoming': 'Sắp khai giảng',
      'closed': 'Đã đóng'
    };
    return statusMap[status] || status;
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    const colorMap = {
      'active': 'success',
      'upcoming': 'warning',
      'closed': 'error'
    };
    return colorMap[status] || 'default';
  };

  // Helper: lấy object giáo viên từ id
  const getTeacherObj = (teacherId) => {
    if (!teacherId || !allTeachers.length) return null;
    return allTeachers.find(t => String(t.id || t._id) === String(teacherId));
  };

  // Hàm show snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
          Quản lý lớp học
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
              sx={commonStyles.primaryButton}
        >
          Thêm lớp học
        </Button>
      </Box>

          <Paper sx={commonStyles.searchContainer}>
        <Grid container spacing={2}>
              <Grid item xs={12} md={4.5}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm lớp học..."
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
          </Grid>
              <Grid item xs={12} md={2.5}>
            <TextField
              select
              fullWidth
              label="Năm học"
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
                    sx={commonStyles.filterSelect}
                  >
                <MenuItem value="">Tất cả</MenuItem>
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return <MenuItem key={year} value={year}>{year}</MenuItem>;
              })}
            </TextField>
          </Grid>
              <Grid item xs={12} md={2.5}>
            <TextField
              select
              fullWidth
              label="Khối"
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
              sx={commonStyles.filterSelect}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                <MenuItem key={grade} value={grade}>{`Khối ${grade}`}</MenuItem>
              ))}
            </TextField>
          </Grid>
              <Grid item xs={12} md={2.5}>
            <TextField
              select
              fullWidth
              label="Trạng thái"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              sx={commonStyles.filterSelect}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="active">Đang hoạt động</MenuItem>
              <MenuItem value="upcoming">Sắp khai giảng</MenuItem>
              <MenuItem value="closed">Đã đóng</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

          <TableContainer component={Paper} sx={commonStyles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="10%">Tên lớp</TableCell>
              <TableCell width="12">Giáo viên</TableCell>
              <TableCell width="10%">Năm học</TableCell>
              <TableCell width="15%">Học phí mỗi buổi</TableCell>
              <TableCell width="15%">Lịch học</TableCell>
              <TableCell width="10%">Phòng học</TableCell>
              <TableCell width="13%">Trạng thái</TableCell>
              <TableCell width="10%" align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingTable ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Đang tải...</TableCell>
              </TableRow>
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Không có dữ liệu</TableCell>
              </TableRow>
            ) : (
              classes.map((cls) => {
                let teacherObj = null;
                if (typeof cls.teacherId === 'string') {
                  teacherObj = getTeacherObj(cls.teacherId);
                } else if (typeof cls.teacherId === 'object' && cls.teacherId) {
                  teacherObj = cls.teacherId;
                }
                return (
                <TableRow key={String(cls.id || cls._id || Math.random())}>
                  <TableCell>{cls.name}</TableCell>
                  <TableCell>
                      {teacherObj ? (
                        <>
                          {teacherObj.userId?.name || teacherObj.name}
                          <br />
                          <span style={{ color: '#888', fontSize: 12 }}>{teacherObj.userId?.email}</span>
                        </>
                      ) : 'Chưa gán giáo viên'}
                  </TableCell>
                  <TableCell>{cls.year}</TableCell>
                  <TableCell>
                    {cls.feePerLesson ? `${cls.feePerLesson.toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật'}
                  </TableCell>
                  <TableCell>{formatSchedule(cls.schedule)}</TableCell>
                  <TableCell>{cls.room || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(cls.status)}
                      color={getStatusColor(cls.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="left">
                    <IconButton size="small" title="Xem chi tiết" onClick={() => handleOpenViewDialog(cls)}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title="Chỉnh sửa" onClick={() => handleOpenDialog(cls)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {cls.status !== 'closed' && (
                      <IconButton
                        size="small"
                        title="Đóng lớp học"
                        onClick={() => { setClassToClose(cls); setOpenCloseClassDialog(true); }}
                        sx={{ color: 'error.main' }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>

          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
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
          {selectedClass ? 'Chỉnh sửa thông tin lớp học' : 'Thêm lớp học mới'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedClass ? 'Cập nhật thông tin lớp học' : 'Thêm lớp học mới vào hệ thống'}
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
                {selectedClass ? (
                  <EditIcon sx={{ fontSize: 28, color: 'white' }} />
                ) : (
                  <AddIcon sx={{ fontSize: 28, color: 'white' }} />
                )}
              </Box>
        </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ p: 4 }}>
                {error && (
                  <Box sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                    border: '1px solid #f44336'
                  }}>
                    <Typography color="error" sx={{ fontWeight: 600, textAlign: 'center' }}>
                      {error}
                    </Typography>
                  </Box>
                )}
                <Paper sx={{
                  p: 3,
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
                    Thông tin lớp học
                  </Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
            {selectedClass ? (
              // EDIT MODE: Show Tabs
              <>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={currentTab} onChange={handleTabChange} aria-label="class details tabs" centered>
                    <Tab label="Thông tin chung" key="tab-general" />
                    <Tab label="Giáo viên" key="tab-teacher" />
                    <Tab label="Học sinh" key="tab-student" />
                  </Tabs>
                </Box>
                  <CustomTabPanel value={currentTab} index={0} key="general-info">
                    <AddClassForm
                      key={`edit-form-${selectedClass?.id || 'new'}`}
                      classData={selectedClass}
                      onSubmit={handleUpdateClass}
                      loading={loading}
                      id="class-form"
                    />
                  </CustomTabPanel>
                  <CustomTabPanel value={currentTab} index={1} key="teacher-management">
                    <ClassTeacherManagement
                      key={`teacher-mgmt-${selectedClass?.id}-${refreshKey}`}
                      classData={selectedClass}
                      onUpdate={handleForceRefresh}
                      onClose={handleCloseDialog}
                      onSuccessMessage={showSnackbar}
                    />
                  </CustomTabPanel>
                  <CustomTabPanel value={currentTab} index={2} key="student-management">
                    <ClassStudentManagement
                      key={`student-mgmt-${selectedClass?.id}`}
                      classData={selectedClass}
                      onUpdate={handleForceRefresh}
                      onClose={handleCloseDialog}
                    />
                  </CustomTabPanel>
              </>
            ) : (
              // ADD MODE: Show only the form
                <AddClassForm
                  key="add-form-new"
                  classData={null}
                  onSubmit={handleAddClass}
                  loading={loading}
                  id="class-form"
                />
                    )}
                  </Box>
                </Paper>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
                <Button
                  onClick={handleCloseDialog}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    border: '2px solid #667eea',
                    color: '#667eea',
                    '&:hover': {
                      background: '#667eea',
                      color: 'white',
                    }
                  }}
                >
                    Hủy
                </Button>
                {/* Show button only for General Info tab in Edit mode, or always in Add mode */}
                {(currentTab === 0 || !selectedClass) && (
                    <Button
                    type="submit"
                    form="class-form"
                    variant="contained"
                    sx={{
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      bgcolor: '#667eea',
                      '&:hover': { bgcolor: '#5a6fd8' },
                      '&:disabled': {
                        background: '#ccc',
                      }
                    }}
                    disabled={loading}
                    >
                    {loading ? 'Đang xử lý...' : (selectedClass ? 'Lưu thay đổi' : 'Thêm mới')}
                    </Button>
                )}
            </DialogActions>
      </Dialog>

      {/* View Class Details Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            maxHeight: '90vh'
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
            Chi tiết lớp học
          </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Thông tin chi tiết về lớp học và học sinh
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
            <ViewIcon sx={{ fontSize: 28, color: 'white' }} />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 4 }}>
          {selectedClassForView && (
              <Box>
              <Grid container spacing={3}>
                {/* Left Column - Basic Info */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{
                      p: 3,
                      borderRadius: 2,
                      height: '100%',
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
                      Thông tin cơ bản
                    </Typography>
                      <Box sx={{
                        p: 2,
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Tên lớp
                        </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedClassForView.name}
                        </Typography>
                      </Box>

                      <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Giáo viên phụ trách
                        </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {(() => {
                            let teacherObj = null;
                            if (typeof selectedClassForView.teacherId === 'string') {
                              teacherObj = getTeacherObj(selectedClassForView.teacherId);
                            } else if (typeof selectedClassForView.teacherId === 'object' && selectedClassForView.teacherId) {
                              teacherObj = selectedClassForView.teacherId;
                            }
                            return teacherObj ? `${teacherObj.userId?.name || teacherObj.name} (${teacherObj.userId?.email || ''})` : 'Chưa gán giáo viên';
                          })()}
                        </Typography>
                      </Box>

                      <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Năm học
                        </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedClassForView.year}
                        </Typography>
                      </Box>

                      <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Khối
                        </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          Khối {selectedClassForView.grade}
                        </Typography>
                      </Box>

                      <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Phòng học
                        </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedClassForView.room || 'Chưa có'}
                        </Typography>
                          </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Right Column - Statistics */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{
                      p: 3,
                      borderRadius: 2,
                      height: '100%',
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
                      Thống kê lớp học
                    </Typography>
                      <Box sx={{
                        p: 2,
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Số lượng học sinh
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                          {classStudentsLoading ? 'Đang tải...' : classStudents.length}/{selectedClassForView.maxStudents || 30}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Tối đa {selectedClassForView.maxStudents || 30} học sinh
                        </Typography>
                      </Box>

                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Học phí mỗi buổi
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#7b1fa2' }}>
                          {selectedClassForView.feePerLesson ? `${selectedClassForView.feePerLesson.toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật'}
                        </Typography>
                      </Box>

                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Thời gian học
                        </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2e7d32' }}>
                          {formatSchedule(selectedClassForView.schedule)}
                        </Typography>
                          </Box>
                      </Box>
                    </Box>
                  </Paper>
            </Grid>

              {/* Status Banner */}
              <Grid item xs={12}>
                    <Paper sx={{
                      p: 3,
                      borderRadius: 2,
                    background: `linear-gradient(90deg, ${getStatusColor(selectedClassForView.status) === 'success' ? '#e8f5e8' : getStatusColor(selectedClassForView.status) === 'warning' ? '#fff3e0' : '#ffebee'}, transparent)`,
                      border: `2px solid ${getStatusColor(selectedClassForView.status) === 'success' ? '#4caf50' : getStatusColor(selectedClassForView.status) === 'warning' ? '#ff9800' : '#f44336'}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: getStatusColor(selectedClassForView.status) === 'success' ? '#2e7d32' : getStatusColor(selectedClassForView.status) === 'warning' ? '#e65100' : '#c62828' }}>
                        Trạng thái lớp học
                      </Typography>
                      <Chip
                        label={getStatusLabel(selectedClassForView.status)}
                        color={getStatusColor(selectedClassForView.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    </Paper>
                </Grid>

                {/* Full Width - Schedule Details */}
                {selectedClassForView.schedule && (
                  <Grid item xs={12}>
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
                        Lịch học chi tiết
                      </Typography>
                        <Box sx={{
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={2.8}>
                          <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, bgcolor: '#fff3e0', border: '1px solid #ff9800' }}>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Ngày bắt đầu
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#e65100' }}>
                              {selectedClassForView.schedule.startDate ? new Date(selectedClassForView.schedule.startDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                            </Typography>
                          </Box>
            </Grid>

                        <Grid item xs={12} md={2.8}>
                          <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Ngày kết thúc
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                              {selectedClassForView.schedule.endDate ? new Date(selectedClassForView.schedule.endDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                            </Typography>
                          </Box>
            </Grid>

                        <Grid item xs={12} md={3.4}>
                          <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, bgcolor: '#e3f2fd', border: '1px solid #2196f3' }}>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Thời gian
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2' }}>
                              {selectedClassForView.schedule.timeSlots ? `${selectedClassForView.schedule.timeSlots.startTime} - ${selectedClassForView.schedule.timeSlots.endTime}` : 'Chưa có'}
                            </Typography>
                          </Box>
            </Grid>

                        <Grid item xs={12} md={3}>
                          <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, bgcolor: '#f3e5f5', border: '1px solid #9c27b0' }}>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Ngày trong tuần
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#7b1fa2' }}>
                              {selectedClassForView.schedule.dayOfWeeks ? selectedClassForView.schedule.dayOfWeeks.map(day => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day]).join(', ') : 'Chưa có'}
                            </Typography>
                          </Box>
            </Grid>
            </Grid>
                        </Box>
                    </Paper>
            </Grid>
                )}

                {/* Description */}
                {selectedClassForView.description && (
            <Grid item xs={12}>
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
                        Mô tả lớp học
                      </Typography>
                        <Box sx={{
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                          <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#2c3e50' }}>
                        {selectedClassForView.description}
                      </Typography>
                        </Box>
                    </Paper>
            </Grid>
                )}

                {/* Students List */}
                <Grid item xs={12}>
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
                      Danh sách học sinh ({classStudents.length})
                    </Typography>
                      <Box sx={{
                        p: 2,
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                    {classStudentsLoading ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body2" color="textSecondary">
                          Đang tải danh sách học sinh...
                        </Typography>
                      </Box>
                    ) : classStudentsError ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body2" color="error">
                          {classStudentsError}
                        </Typography>
                      </Box>
                    ) : classStudents.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body2" color="textSecondary">
                          Chưa có học sinh nào trong lớp này
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                        <Grid container spacing={1}>
                          {classStudents.map((student, index) => (
                            <Grid item xs={12} sm={6} md={4} key={String(student.id || student._id || `student-${index}`)}>
                              <Box sx={{
                                p: 1.5,
                                borderRadius: 1,
                                border: '1px solid #e0e0e0',
                                background: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                  borderColor: '#2196f3'
                                }
                              }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976d2' }}>
                                  {index + 1}. {student.name}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                      </Box>
                  </Paper>
                </Grid>
          </Grid>
              </Box>
          )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={handleCloseViewDialog}
            variant="contained"
            sx={{
              bgcolor: '#667eea',
              '&:hover': { bgcolor: '#5a6fd8' },
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={openCloseClassDialog}
        onClose={() => { setOpenCloseClassDialog(false); setClassToClose(null); }}
        onConfirm={() => { if (classToClose) handleCloseClass(classToClose); setOpenCloseClassDialog(false); setClassToClose(null); }}
        title="Xác nhận đóng lớp học"
        message={classToClose ? `Bạn có chắc chắn muốn đóng lớp học "${classToClose.name}"? Hành động này không thể hoàn tác.` : ''}
        loading={loading}
      />
      <NotificationSnackbar
        open={snackbar.open}
        onClose={handleCloseNotification}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
      </Box>
    </DashboardLayout>
  );
};

export default ClassManagement;
