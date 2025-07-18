import React, { useState, useEffect, useRef } from 'react';
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
  Checkbox,
  FormControlLabel,
  Pagination,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import { commonStyles } from "../../utils/styles";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { validateParent } from '../../validations/parentValidation';
import { createParentAPI, getAllParentsAPI, deleteParentAPI, updateParentAPI, addChildAPI, removeChildAPI, getAllStudentsAPI } from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';

const ParentManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [parents, setParents] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedParentForView, setSelectedParentForView] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [parentToDelete, setParentToDelete] = useState(null);
  const [classEdits, setClassEdits] = useState([]);
  const [newChildId, setNewChildId] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [debouncedStudentSearch, setDebouncedStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    dayOfBirth: '',
    phone: '',
    address: '',
    gender: 'male',
    canSeeTeacherInfo: true,
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleOpenDialog = (parent = null) => {
    setSelectedParent(parent);
    if (parent) {
      setForm({
        name: parent.userId?.name || '',
        email: parent.userId?.email || '',
        password: '',
        dayOfBirth: parent.userId?.dayOfBirth || '',
        phone: parent.userId?.phone || '',
        address: parent.userId?.address || '',
        gender: parent.userId?.gender || 'male',
        canSeeTeacherInfo: parent.canSeeTeacherInfo !== undefined ? parent.canSeeTeacherInfo : true,
      });
      setClassEdits(
        (parent.classes || []).map(cls => ({
          classId: cls.classId?._id || cls.classId,
          className: cls.classId?.name || '',
          discountPercent: cls.discountPercent || 0,
          status: cls.status || 'active',
        }))
      );
    } else {
      setForm({
        name: '',
        email: '',
        password: '',
        dayOfBirth: '',
        phone: '',
        address: '',
        gender: 'male',
        canSeeTeacherInfo: true,
      });
      setClassEdits([]);
    }
    setError('');
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form after dialog is closed to avoid flash effect
    setTimeout(() => {
      setSelectedParent(null);
      setForm({
        name: '',
        email: '',
        password: '',
        dayOfBirth: '',
        phone: '',
        address: '',
        gender: 'male',
        canSeeTeacherInfo: true,
      });
      setClassEdits([]);
      setNewChildId('');
      setTabValue(0);
      setStudentSearchQuery('');
      setSearchResults([]);
      setError('');
      setFormErrors({});
    }, 100);
  };

  const handleOpenViewDialog = (parentData) => {
    setSelectedParentForView(parentData);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setSelectedParentForView(null);
    setOpenViewDialog(false);
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDeleteDialog = (parent) => {
    setParentToDelete(parent);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setParentToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleDeleteParent = async () => {
    if (!parentToDelete) return;

    setLoading(true);
    setError('');
    try {
      await deleteParentAPI(parentToDelete.id);
      setSnackbar({ open: true, message: 'Xóa phụ huynh thành công!', severity: 'success' });
      handleCloseDeleteDialog();
      fetchParents(page); // Refresh parent list
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Có lỗi xảy ra khi xóa phụ huynh',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleClassEditChange = (idx, field, value) => {
    setClassEdits(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Debounce student search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedStudentSearch(studentSearchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [studentSearchQuery]);

  const searchStudents = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchingStudents(true);
    try {
      const params = {
        page: 1,
        limit: 10,
        name: query.trim()
      };
      const res = await getAllStudentsAPI(params);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error('Error searching students:', err);
      setSearchResults([]);
    } finally {
      setSearchingStudents(false);
    }
  };

  useEffect(() => {
    if (debouncedStudentSearch.trim()) {
      searchStudents(debouncedStudentSearch);
    } else {
      setSearchResults([]);
    }
  }, [debouncedStudentSearch]);

  const handleStudentSearchChange = (e) => {
    const query = e.target.value;
    setStudentSearchQuery(query);
  };

  const handleAddChild = async (studentId, parentId) => {
    console.log('Dữ liệu gửi đi khi thêm con:', { studentId, parentId });
    try {
      await addChildAPI(studentId, parentId);
      setSnackbar({ open: true, message: 'Thêm con thành công!', severity: 'success' });
      setStudentSearchQuery(''); // Clear the search input
      setSearchResults([]); // Clear search results

      // Refresh parent list
      fetchParents(page);

      // Refresh selected parent data if dialog is open
      if (selectedParent && selectedParent.id === parentId) {
        try {
          const params = { page: 1, limit: 10 };
          const res = await getAllParentsAPI(params);
          const updatedParent = res.data?.find(p => p.id === parentId);
          if (updatedParent) {
            setSelectedParent(updatedParent);
            // Update form data with new parent data
            setForm({
              name: updatedParent.userId?.name || '',
              email: updatedParent.userId?.email || '',
              password: '',
              dayOfBirth: updatedParent.userId?.dayOfBirth || '',
              phone: updatedParent.userId?.phone || '',
              address: updatedParent.userId?.address || '',
              gender: updatedParent.userId?.gender || 'male',
              canSeeTeacherInfo: updatedParent.canSeeTeacherInfo !== undefined ? updatedParent.canSeeTeacherInfo : true,
            });
            setClassEdits(
              (updatedParent.classes || []).map(cls => ({
                classId: cls.classId?._id || cls.classId,
                className: cls.classId?.name || '',
                discountPercent: cls.discountPercent || 0,
                status: cls.status || 'active',
              }))
            );
          }
        } catch (error) {
          console.error('Error refreshing parent data:', error);
        }
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Có lỗi xảy ra khi thêm con',
        severity: 'error'
      });
    }
  };

  const handleRemoveChild = async (studentId, parentId) => {
    console.log('Dữ liệu gửi đi khi xóa con:', { studentId, parentId });
    try {
      await removeChildAPI(studentId, parentId);
      setSnackbar({ open: true, message: 'Xóa con thành công!', severity: 'success' });

      // Refresh parent list
      fetchParents(page);

      // Refresh selected parent data if dialog is open
      if (selectedParent && selectedParent.id === parentId) {
        try {
          const params = { page: 1, limit: 10 };
          const res = await getAllParentsAPI(params);
          const updatedParent = res.data?.find(p => p.id === parentId);
          if (updatedParent) {
            setSelectedParent(updatedParent);
            // Update form data with new parent data
            setForm({
              name: updatedParent.userId?.name || '',
              email: updatedParent.userId?.email || '',
              password: '',
              dayOfBirth: updatedParent.userId?.dayOfBirth || '',
              phone: updatedParent.userId?.phone || '',
              address: updatedParent.userId?.address || '',
              gender: updatedParent.userId?.gender || 'male',
              canSeeTeacherInfo: updatedParent.canSeeTeacherInfo !== undefined ? updatedParent.canSeeTeacherInfo : true,
            });
            setClassEdits(
              (updatedParent.classes || []).map(cls => ({
                classId: cls.classId?._id || cls.classId,
                className: cls.classId?.name || '',
                discountPercent: cls.discountPercent || 0,
                status: cls.status || 'active',
              }))
            );
          }
        } catch (error) {
          console.error('Error refreshing parent data:', error);
        }
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Có lỗi xảy ra khi xóa con',
        severity: 'error'
      });
    }
  };

  function toAPIDateFormat(dob) {
    // dob: "09/12/2004" => "12/09/2004"
    if (!dob) return '';
    const [d, m, y] = dob.split('/');
    return `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
  }

  const handleSubmit = async () => {
    // Validate form before submitting
    const errors = validateParent(form, !!selectedParent);
    // Chỉ submit khi không có lỗi thực sự
    const hasError = Object.values(errors).some(Boolean);
    setFormErrors(errors);
    if (hasError) {
      return; // Stop if there are validation errors
    }

    setLoading(true);
    setError('');

    try {
      if (selectedParent) {
        // UPDATE
        const body = {
          userData: {
            name: form.name,
            email: form.email,
            dayOfBirth: toAPIDateFormat(form.dayOfBirth),
            phone: form.phone,
            address: form.address,
            gender: form.gender,
          },
          parentData: {
            canSeeTeacherInfo: form.canSeeTeacherInfo,
          },
        };
        await updateParentAPI(selectedParent.id, body);
        setSnackbar({ open: true, message: 'Cập nhật phụ huynh thành công!', severity: 'success' });
      } else {
        // CREATE
        const requestData = {
          userData: {
            name: form.name,
            email: form.email,
            password: form.password,
            dayOfBirth: form.dayOfBirth,
            phone: form.phone,
            address: form.address,
            gender: form.gender,
          },
          parentData: {
            canSeeTeacherInfo: form.canSeeTeacherInfo,
          },
        };
        await createParentAPI(requestData);
        setSnackbar({ open: true, message: 'Thêm phụ huynh thành công!', severity: 'success' });
      }

      handleCloseDialog();
      fetchParents(page);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Có lỗi xảy ra khi lưu phụ huynh',
        severity: 'error'
      });
      console.error('API error:', err?.response?.data, err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch parents from API
  const fetchParents = async (pageNum = 1) => {
    setLoadingTable(true);
    try {
      const params = { page: pageNum, limit: 10 };
      if (debouncedSearch) params.name = debouncedSearch;
      const res = await getAllParentsAPI(params);
      console.log('API getAllParentsAPI response:', res);
      console.log('Parents data:', res.data);
      if (res.data && res.data.length > 0) {
        console.log('First parent data structure:', res.data[0]);
      }
      setParents(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.totalRecords || 0);
    } catch (err) {
      console.error('Error fetching parents:', err);
      setParents([]);
    } finally {
      setLoadingTable(false);
    }
  };

  // Helper function to get student names for a parent
  const getStudentNames = (studentIds) => {
    if (!studentIds || studentIds.length === 0) {
      return 'Chưa có con';
    }

    const names = studentIds.map(student => student.userId?.name || 'Không có tên');
    return names.join('\n');
  };

  // Fetch parents on component mount and when page or search changes
  useEffect(() => {
    fetchParents(page);
  }, [page, debouncedSearch]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Helper function to get gender label
  const getGenderLabel = (gender) => {
    return gender === 'male' ? 'Nam' : 'Nữ';
  };

  // Helper function to get teacher info permission label
  const getTeacherInfoLabel = (canSeeTeacherInfo) => {
    return canSeeTeacherInfo ? 'Có' : 'Không';
  };

  // Helper function to get teacher info permission color
  const getTeacherInfoColor = (canSeeTeacherInfo) => {
    return canSeeTeacherInfo ? 'success' : 'default';
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
          Quản lý phụ huynh
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
              sx={commonStyles.primaryButton}
        >
          Thêm phụ huynh
        </Button>
      </Box>

          <Paper sx={commonStyles.searchContainer}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm phụ huynh..."
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
        </Grid>
      </Paper>

          <TableContainer component={Paper} sx={commonStyles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
                  <TableCell width="15%">Họ và tên</TableCell>
                  <TableCell width="17%">Email</TableCell>
                  <TableCell width="15%">Số điện thoại</TableCell>
                  <TableCell width="15%">Con</TableCell>
                  <TableCell width="10%">Giới tính</TableCell>
                  <TableCell width="15%">Xem thông tin giáo viên</TableCell>
                  <TableCell width="13%" align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
                {loadingTable ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Đang tải...</TableCell>
                  </TableRow>
                ) : parents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Không có dữ liệu</TableCell>
                  </TableRow>
                ) : (
                  parents.map((parent) => (
                    <TableRow key={parent.id}>
                      <TableCell>{parent.userId?.name || '-'}</TableCell>
                      <TableCell>{parent.userId?.email || '-'}</TableCell>
                      <TableCell>{parent.userId?.phone || '-'}</TableCell>
                      <TableCell sx={{ whiteSpace: 'pre-line' }}>{getStudentNames(parent.studentIds)}</TableCell>
                      <TableCell>{getGenderLabel(parent.userId?.gender)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getTeacherInfoLabel(parent.canSeeTeacherInfo)}
                          color={getTeacherInfoColor(parent.canSeeTeacherInfo)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" title="Xem chi tiết" onClick={() => handleOpenViewDialog(parent)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" title="Chỉnh sửa" onClick={() => handleOpenDialog(parent)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" title="Xóa" color="error" onClick={() => handleOpenDeleteDialog(parent)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
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
          {selectedParent ? 'Chỉnh sửa thông tin phụ huynh' : 'Thêm phụ huynh mới'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedParent ? 'Cập nhật thông tin phụ huynh' : 'Thêm phụ huynh mới vào hệ thống'}
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
                {selectedParent ? (
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

              {selectedParent ? (
                // Tabs for editing parent
                <Box>
                    <Tabs
                      value={tabValue}
                      onChange={handleTabChange}
                      sx={{
                        mb: 3,
                        '& .MuiTab-root': {
                          color: '#2c3e50',
                          fontWeight: 600,
                          '&.Mui-selected': {
                            color: '#667eea',
                          }
                        },
                        '& .MuiTabs-indicator': {
                          backgroundColor: '#667eea',
                        }
                      }}
                    >
                    <Tab label="Thông tin cơ bản" />
                    <Tab label="Quản lý con cái" />
                  </Tabs>

                  {tabValue === 0 && (
                    // Tab 1: Basic Information
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
                          Thông tin cơ bản
                        </Typography>
                        <Box sx={{
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                          <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Họ và tên"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            error={!!formErrors.name}
                            helperText={formErrors.name}
                            required
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#667eea',
                                    },
                                  },
                                }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            error={!!formErrors.email}
                            helperText={formErrors.email}
                            required
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#667eea',
                                    },
                                  },
                                }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Ngày sinh"
                            name="dayOfBirth"
                            value={form.dayOfBirth}
                            onChange={handleChange}
                            placeholder="15/06/1975"
                            error={!!formErrors.dayOfBirth}
                            helperText={formErrors.dayOfBirth}
                            required
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#667eea',
                                    },
                                  },
                                }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Số điện thoại"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            error={!!formErrors.phone}
                            helperText={formErrors.phone}
                            required
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#667eea',
                                    },
                                  },
                                }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Địa chỉ"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            error={!!formErrors.address}
                            helperText={formErrors.address}
                            required
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#667eea',
                                    },
                                  },
                                }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                              <FormControl fullWidth sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#667eea',
                                  },
                                },
                              }}>
                            <InputLabel>Giới tính</InputLabel>
                            <Select
                              label="Giới tính"
                              name="gender"
                              value={form.gender}
                              onChange={handleChange}
                              error={!!formErrors.gender}
                              required
                            >
                              <MenuItem value="male">Nam</MenuItem>
                              <MenuItem value="female">Nữ</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                            <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                name="canSeeTeacherInfo"
                                checked={form.canSeeTeacherInfo}
                                onChange={(e) => setForm(prev => ({ ...prev, canSeeTeacherInfo: e.target.checked }))}
                                    sx={{
                                      color: '#667eea',
                                      '&.Mui-checked': {
                                        color: '#667eea',
                                      },
                                    }}
                              />
                            }
                            label="Quyền xem thông tin giáo viên"
                                sx={{ fontWeight: 500 }}
                          />
                        </Grid>
                      </Grid>
                        </Box>

                      {classEdits.length > 0 && (
                          <Paper sx={{
                            p: 3,
                            mt: 3,
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
                            Danh sách lớp đang học
                          </Typography>
                            <Box sx={{
                              p: 2,
                              bgcolor: 'white',
                              borderRadius: 2,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                          <Grid container spacing={2}>
                            {classEdits.map((cls, idx) => (
                              <React.Fragment key={cls.classId}>
                                <Grid item xs={12} sm={5}>
                                  <TextField
                                    label="Tên lớp"
                                    value={cls.className}
                                    InputProps={{ readOnly: true }}
                                    fullWidth
                                        sx={{
                                          '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                          },
                                        }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <TextField
                                    label="Giảm giá (%)"
                                    type="number"
                                    value={cls.discountPercent}
                                    onChange={(e) => handleClassEditChange(idx, 'discountPercent', e.target.value)}
                                    fullWidth
                                    inputProps={{ min: 0, max: 100 }}
                                        sx={{
                                          '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                              borderColor: '#667eea',
                                            },
                                          },
                                        }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                      <FormControl fullWidth sx={{
                                        '& .MuiOutlinedInput-root': {
                                          borderRadius: 2,
                                          '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#667eea',
                                          },
                                        },
                                      }}>
                                    <InputLabel>Trạng thái</InputLabel>
                                    <Select
                                      label="Trạng thái"
                                      value={cls.status}
                                      onChange={(e) => handleClassEditChange(idx, 'status', e.target.value)}
                                    >
                                      <MenuItem value="active">Đang hoạt động</MenuItem>
                                      <MenuItem value="inactive">Ngừng hoạt động</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                              </React.Fragment>
                            ))}
                          </Grid>
                        </Box>
                          </Paper>
                      )}
                      </Paper>
                  )}

                  {tabValue === 1 && (
                    // Tab 2: Children Management
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
                          Quản lý con cái
                        </Typography>
                        <Box sx={{
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                      <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                          Danh sách con hiện tại
                        </Typography>
                        {selectedParent.studentIds && selectedParent.studentIds.length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {selectedParent.studentIds.map((student, idx) => (
                              <Box key={student.id || idx} sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 2,
                                border: '1px solid #e0e0e0',
                                    borderRadius: 2,
                                    bgcolor: '#fafafa',
                                    '&:hover': { bgcolor: '#f0f0f0' }
                              }}>
                                <Box>
                                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                    {student.userId?.name || 'Không có tên'}
                                  </Typography>
                                </Box>
                                <Button
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  onClick={() => handleRemoveChild(student.id, selectedParent.id)}
                                      sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600
                                      }}
                                >
                                  Xóa
                                </Button>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center' }}>
                            Chưa có con nào
                          </Typography>
                        )}
                      </Box>

                      <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                          Thêm con mới
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            fullWidth
                            label="Tìm kiếm học sinh"
                            placeholder="Nhập tên hoặc email học sinh"
                            value={studentSearchQuery}
                            onChange={handleStudentSearchChange}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#667eea',
                                    },
                                  },
                                }}
                            InputProps={{
                              endAdornment: searchingStudents && (
                                <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                                  <Typography variant="caption" color="textSecondary">
                                    Đang tìm...
                                  </Typography>
                                </Box>
                              ),
                            }}
                          />
                        </Box>

                        {searchResults.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                              Kết quả tìm kiếm:
                            </Typography>
                            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                              {searchResults.map((student) => (
                                <Box
                                  key={student.id}
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1.5,
                                    border: '1px solid #e0e0e0',
                                        borderRadius: 2,
                                    mb: 1,
                                    bgcolor: '#fafafa',
                                    '&:hover': { bgcolor: '#f0f0f0' }
                                  }}
                                >
                                  <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                      {student.userId?.name || 'Không có tên'}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      Email: {student.userId?.email}
                                    </Typography>
                                  </Box>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleAddChild(student.id, selectedParent.id)}
                                        sx={{
                                          borderRadius: 2,
                                          textTransform: 'none',
                                          fontWeight: 600,
                                          bgcolor: '#667eea',
                                          '&:hover': { bgcolor: '#5a6fd8' }
                                        }}
                                  >
                                    Thêm
                                  </Button>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}

                        {studentSearchQuery && searchResults.length === 0 && !searchingStudents && (
                          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                            Không tìm thấy học sinh nào
                          </Typography>
                        )}
                      </Box>
                    </Box>
                      </Paper>
                  )}
                </Box>
              ) : (
                // Create new parent form (no tabs)
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
                      Thông tin phụ huynh mới
                    </Typography>
                    <Box sx={{
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                      required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#667eea',
                                },
                              },
                            }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#667eea',
                                },
                              },
                            }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mật khẩu"
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      error={!!formErrors.password}
                      helperText={formErrors.password}
                      required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#667eea',
                                },
                              },
                            }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ngày sinh"
                      name="dayOfBirth"
                      value={form.dayOfBirth}
                      onChange={handleChange}
                      placeholder="15/06/1975"
                      error={!!formErrors.dayOfBirth}
                      helperText={formErrors.dayOfBirth}
                      required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#667eea',
                                },
                              },
                            }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone}
                      required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#667eea',
                                },
                              },
                            }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      error={!!formErrors.address}
                      helperText={formErrors.address}
                      required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#667eea',
                                },
                              },
                            }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                          <FormControl fullWidth sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                              },
                            },
                          }}>
                      <InputLabel>Giới tính</InputLabel>
                      <Select
                        label="Giới tính"
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        error={!!formErrors.gender}
                        required
                      >
                        <MenuItem value="male">Nam</MenuItem>
                        <MenuItem value="female">Nữ</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                        <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="canSeeTeacherInfo"
                          checked={form.canSeeTeacherInfo}
                          onChange={(e) => setForm(prev => ({ ...prev, canSeeTeacherInfo: e.target.checked }))}
                                sx={{
                                  color: '#667eea',
                                  '&.Mui-checked': {
                                    color: '#667eea',
                                  },
                                }}
                        />
                      }
                      label="Quyền xem thông tin giáo viên"
                            sx={{ fontWeight: 500 }}
                    />
                  </Grid>
                </Grid>
                    </Box>
                  </Paper>
              )}
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
                  },
                  '&:disabled': {
                    borderColor: '#ccc',
                    color: '#ccc'
                  }
                }}
                disabled={loading}
              >
                Hủy
              </Button>
              {selectedParent && tabValue === 1 ? (
                // Tab 2: Children Management - no update button needed
                <Button
                  variant="contained"
                  onClick={handleCloseDialog}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#667eea',
                    '&:hover': { bgcolor: '#5a6fd8' }
                  }}
                >
                  Đóng
                </Button>
              ) : (
                // Tab 1 or Create new - show update/create button
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
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
                >
                  {loading ? 'Đang xử lý...' : (selectedParent ? 'Cập nhật' : 'Thêm mới')}
                </Button>
              )}
            </DialogActions>
          </Dialog>

          <ConfirmDialog
            open={openDeleteDialog}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleDeleteParent}
            title="Xác nhận xóa phụ huynh"
            message={parentToDelete ? `Bạn có chắc chắn muốn xóa phụ huynh "${parentToDelete.userId?.name}"? Hành động này không thể hoàn tác.` : ''}
            loading={loading}
          />

          {/* View Parent Details Dialog */}
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
                Chi tiết phụ huynh
              </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Thông tin chi tiết về phụ huynh và con cái
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
              {selectedParentForView && (
                <Box sx={{ p: 4 }}>
                  {/* Main Information Grid */}
                  <Grid container spacing={3}>
                    {/* Left Column - Personal Info */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        border: '1px solid #e0e6ed',
                        height: '100%'
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
                          Thông tin cá nhân
                        </Typography>
                        <Box sx={{
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Họ và tên
                            </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#667eea' }}>
                              {selectedParentForView.userId?.name}
                            </Typography>
                          </Box>

                          <Box>
                              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Email
                            </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {selectedParentForView.userId?.email}
                            </Typography>
                          </Box>

                          <Box>
                              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Số điện thoại
                            </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {selectedParentForView.userId?.phone}
                            </Typography>
                          </Box>

                          <Box>
                              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Ngày sinh
                            </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {selectedParentForView.userId?.dayOfBirth}
                            </Typography>
                          </Box>

                          <Box>
                              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Giới tính
                            </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {getGenderLabel(selectedParentForView.userId?.gender)}
                            </Typography>
                          </Box>

                          <Box>
                              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Địa chỉ
                            </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {selectedParentForView.userId?.address}
                            </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Right Column - Children Info */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        border: '1px solid #e0e6ed',
                        height: '100%'
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
                          Thông tin con cái
                        </Typography>
                          <Box sx={{
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{
                              p: 2,
                              borderRadius: 2,
                            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                            border: '1px solid #2196f3'
                          }}>
                              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Số lượng con
                            </Typography>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                              {selectedParentForView.studentIds ? selectedParentForView.studentIds.length : 0}
                            </Typography>
                          </Box>

                          <Box sx={{
                              p: 2,
                              borderRadius: 2,
                            background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                            border: '1px solid #9c27b0'
                          }}>
                              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                              Trạng thái
                            </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500, color: '#7b1fa2' }}>
                              {selectedParentForView.studentIds && selectedParentForView.studentIds.length > 0 ? 'Có con đang học' : 'Chưa có con'}
                            </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      {/* Permission Banner */}
                      <Paper sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        border: '1px solid #e0e6ed'
                      }}>
                      <Box sx={{
                          p: 2,
                          borderRadius: 2,
                        background: `linear-gradient(90deg, ${selectedParentForView.canSeeTeacherInfo ? '#e8f5e8' : '#fff3e0'}, transparent)`,
                          border: `1px solid ${selectedParentForView.canSeeTeacherInfo ? '#4caf50' : '#ff9800'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                      }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            Quyền xem thông tin giáo viên
                          </Typography>
                          <Chip
                            label={getTeacherInfoLabel(selectedParentForView.canSeeTeacherInfo)}
                            color={getTeacherInfoColor(selectedParentForView.canSeeTeacherInfo)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Full Width - Children List */}
                    {selectedParentForView.studentIds && selectedParentForView.studentIds.length > 0 && (
                      <Grid item xs={12}>
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
                            Danh sách con
                          </Typography>
                          <Box sx={{
                            p: 2,
                            bgcolor: 'white',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                          }}>
                          <Grid container spacing={2}>
                            {selectedParentForView.studentIds.map((student, index) => (
                              <Grid item xs={12} md={4} key={student.id}>
                                <Box sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                                    border: '2px solid #4caf50',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Con thứ {index + 1}
                                  </Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}>
                                    {student.userId?.name || 'Không có tên'}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
              <Button
                onClick={handleCloseViewDialog}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: '#667eea',
                  color: 'white',
                  '&:hover': { bgcolor: '#5a6fd8' }
                }}
              >
                Đóng
              </Button>
            </DialogActions>
          </Dialog>

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

export default ParentManagement;
