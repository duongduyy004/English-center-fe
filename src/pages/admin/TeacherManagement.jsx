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
  Chip,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { createTeacherAPI, getAllTeachersAPI, deleteTeacherAPI, updateTeacherAPI } from '../../services/api';
import { validateTeacher } from '../../validations/teacherValidation';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';

function formatDateDDMMYYYY(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const TeacherManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedTeacherForView, setSelectedTeacherForView] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    gender: 'female',
    dayOfBirth: '',
    salaryPerLesson: '',
    qualifications: '',
    specialization: '',
    description: '',
    isActive: true,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleOpenDialog = (teacher = null) => {
    setSelectedTeacher(teacher);
    if (teacher) {
      let dayOfBirth = teacher.userId?.dayOfBirth || '';
      if (dayOfBirth && dayOfBirth.includes('GMT')) {
        const date = new Date(dayOfBirth);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        dayOfBirth = `${day}/${month}/${year}`;
      } else if (dayOfBirth && dayOfBirth.match(/^\d{4}-\d{2}-\d{2}/)) {
        const [year, month, day] = dayOfBirth.split('T')[0].split('-');
        dayOfBirth = `${day}/${month}/${year}`;
      }
      setForm({
        name: teacher.userId?.name || '',
        email: teacher.userId?.email || '',
        phone: teacher.userId?.phone || '',
        address: teacher.userId?.address || '',
        gender: teacher.userId?.gender || 'female',
        dayOfBirth: dayOfBirth,
        salaryPerLesson: teacher.salaryPerLesson || '',
        qualifications: teacher.qualifications?.join(', ') || '',
        specialization: teacher.specialization?.join(', ') || '',
        description: teacher.description || '',
        isActive: teacher.isActive !== undefined ? teacher.isActive : true,
      });
    } else {
    setForm({
      name: '',
      email: '',
      password: '',
      phone: '',
        address: '',
        gender: 'female',
      dayOfBirth: '',
      salaryPerLesson: '',
      qualifications: '',
      specialization: '',
      description: '',
      isActive: true,
    });
    }
    setError('');
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form after dialog is closed to avoid flash effect
    setTimeout(() => {
      setSelectedTeacher(null);
      setForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        gender: 'female',
        dayOfBirth: '',
        salaryPerLesson: '',
        qualifications: '',
        specialization: '',
        description: '',
        isActive: true,
      });
      setError('');
      setFormErrors({});
    }, 100);
  };

  const handleOpenViewDialog = (teacherData) => {
    setSelectedTeacherForView(teacherData);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setSelectedTeacherForView(null);
    setOpenViewDialog(false);
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDeleteDialog = (teacher) => {
    setTeacherToDelete(teacher);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setTeacherToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;

    setLoading(true);
    setError('');
    try {
      await deleteTeacherAPI(teacherToDelete.id);
      setSnackbar({ open: true, message: 'Xóa giáo viên thành công!', severity: 'success' });
      handleCloseDeleteDialog();
      fetchTeachers(page); // Refresh teacher list
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Có lỗi xảy ra khi xóa giáo viên',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dayOfBirth') {
      let val = value.replace(/[^0-9/]/g, '');
      if (val.length === 2 && form.dayOfBirth.length === 1) val += '/';
      if (val.length === 5 && form.dayOfBirth.length === 4) val += '/';
      setForm((prev) => ({ ...prev, [name]: val }));
      if (formErrors.dayOfBirth) {
        setFormErrors((prev) => ({ ...prev, dayOfBirth: '' }));
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
    // Validate form before submitting
    const errors = validateTeacher(form, !!selectedTeacher);
    // Chỉ submit khi không có lỗi thực sự
    const hasError = Object.values(errors).some(Boolean);
    setFormErrors(errors);
    if (hasError) {
      return; // Stop if there are validation errors
    }

    setLoading(true);
    setError('');

    try {
      if (selectedTeacher) {
        // UPDATE
        const body = {
          userData: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            dayOfBirth: form.dayOfBirth,
            address: form.address,
            gender: form.gender,
          },
          teacherData: {
            salaryPerLesson: Number(form.salaryPerLesson),
            qualifications: form.qualifications.split(',').map(q => q.trim()).filter(q => q),
            specialization: form.specialization.split(',').map(s => s.trim()).filter(s => s),
            description: form.description,
          },
        };
        await updateTeacherAPI(selectedTeacher.id, body);
        setSnackbar({ open: true, message: 'Cập nhật giáo viên thành công!', severity: 'success' });
      } else {
        // CREATE (gửi đúng body backend yêu cầu)
        const body = {
          userData: {
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone,
            dayOfBirth: form.dayOfBirth,
            address: form.address,
            gender: form.gender,
          },
          teacherData: {
            salaryPerLesson: Number(form.salaryPerLesson),
            qualifications: form.qualifications.split(',').map(q => q.trim()).filter(q => q),
            specialization: form.specialization.split(',').map(s => s.trim()).filter(s => s),
            description: form.description,
            isActive: form.isActive,
          },
        };
        await createTeacherAPI(body);
        setSnackbar({ open: true, message: 'Thêm giáo viên thành công!', severity: 'success' });
      }

      handleCloseDialog();
      fetchTeachers(page);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Có lỗi xảy ra khi lưu giáo viên',
        severity: 'error'
      });
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

  // Fetch teachers from API
  const fetchTeachers = async (pageNum = 1) => {
    setLoadingTable(true);
    try {
      const params = { page: pageNum, limit: 10 };
      if (isActiveFilter !== '') params.isActive = isActiveFilter;
      if (debouncedSearch) params.name = debouncedSearch;
      const res = await getAllTeachersAPI(params);
      console.log('API getAllTeachersAPI response:', res);
      setTeachers(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.totalRecords || 0);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setTeachers([]);
    } finally {
      setLoadingTable(false);
    }
  };

  // Fetch teachers on component mount and when page, filter, or search changes
  useEffect(() => {
    fetchTeachers(page);
  }, [page, isActiveFilter, debouncedSearch]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Quản lý giáo viên
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
                sx={{ bgcolor: COLORS.primary }}
        >
          Thêm giáo viên
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm giáo viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          </Grid>
          <Grid item xs={12} md={4}>
          <TextField
            select
            label="Trạng thái"
            value={isActiveFilter}
            onChange={e => setIsActiveFilter(e.target.value)}
              fullWidth
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value={true}>Đang hoạt động</MenuItem>
            <MenuItem value={false}>Ngừng hoạt động</MenuItem>
          </TextField>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
                    <TableCell width="15%">Họ và tên</TableCell>
                    <TableCell width="15%">Email</TableCell>
                    <TableCell width="11%">Số điện thoại</TableCell>
                    <TableCell width="10%">Lương/buổi</TableCell>
                    <TableCell width="15%">Bằng cấp</TableCell>
                    <TableCell width="13%">Chuyên môn</TableCell>
                    <TableCell width="8%">Trạng thái</TableCell>
                    <TableCell width="13%" align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
                  {loadingTable ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">Đang tải...</TableCell>
                    </TableRow>
                  ) : teachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">Không có dữ liệu</TableCell>
                    </TableRow>
                  ) : (
                    teachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell>{teacher.userId?.name || '-'}</TableCell>
                        <TableCell>{teacher.userId?.email || '-'}</TableCell>
                        <TableCell>{teacher.userId?.phone || '-'}</TableCell>
                        <TableCell>{teacher.salaryPerLesson ? `${teacher.salaryPerLesson.toLocaleString()} VNĐ` : '-'}</TableCell>
                        <TableCell>
                          {teacher.qualifications && teacher.qualifications.length > 0
                            ? teacher.qualifications.join(', ')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {teacher.specialization && teacher.specialization.length > 0
                            ? teacher.specialization.join(', ')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={teacher.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                            color={teacher.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" title="Xem chi tiết" onClick={() => handleOpenViewDialog(teacher)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" title="Chỉnh sửa" onClick={() => handleOpenDialog(teacher)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" title="Xóa" color="error" onClick={() => handleOpenDeleteDialog(teacher)}>
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
          {selectedTeacher ? 'Chỉnh sửa thông tin giáo viên' : 'Thêm giáo viên mới'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {selectedTeacher ? 'Cập nhật thông tin giáo viên' : 'Thêm giáo viên mới vào hệ thống'}
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
            {selectedTeacher ? (
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
                Thông tin giáo viên
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
            {selectedTeacher == null ? (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mật khẩu"
                    name="password"
                    type="password"
                    value={form.password || ''}
                    onChange={handleChange}
                    required
                    error={!!formErrors.password}
                    helperText={formErrors.password}
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
            ) : null}
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
                      label="Ngày sinh"
                      name="dayOfBirth"
                      value={form.dayOfBirth}
                      onChange={handleChange}
                      placeholder="15/03/1990"
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
              <FormControl fullWidth>
                      <InputLabel>Giới tính</InputLabel>
                      <Select
                        label="Giới tính"
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        required
                            sx={{
                              borderRadius: 2,
                              '& .MuiOutlinedInput-notchedOutline': {
                                '&:hover': {
                                  borderColor: '#667eea',
                                },
                              },
                            }}
                      >
                        <MenuItem value="male">Nam</MenuItem>
                        <MenuItem value="female">Nữ</MenuItem>
                </Select>
              </FormControl>
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
                    <TextField
                      fullWidth
                      label="Lương/buổi (VND)"
                      type="number"
                      name="salaryPerLesson"
                      value={form.salaryPerLesson}
                      onChange={handleChange}
                      error={!!formErrors.salaryPerLesson}
                      helperText={formErrors.salaryPerLesson}
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
                    <FormControl fullWidth>
                      <InputLabel>Trạng thái</InputLabel>
                      <Select
                        label="Trạng thái"
                        name="isActive"
                        value={form.isActive}
                        onChange={handleChange}
                        required
                            sx={{
                              borderRadius: 2,
                              '& .MuiOutlinedInput-notchedOutline': {
                                '&:hover': {
                                  borderColor: '#667eea',
                                },
                              },
                            }}
                      >
                        <MenuItem value={true}>Đang hoạt động</MenuItem>
                        <MenuItem value={false}>Ngừng hoạt động</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Bằng cấp (phân tách bởi dấu phẩy)"
                      name="qualifications"
                      value={form.qualifications}
                      onChange={handleChange}
                      placeholder="Bachelor of Education, TESOL"
                      error={!!formErrors.qualifications}
                      helperText={formErrors.qualifications}
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
                      label="Chuyên môn (phân tách bởi dấu phẩy)"
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      placeholder="IELTS, TOEFL"
                      error={!!formErrors.specialization}
                      helperText={formErrors.specialization}
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
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mô tả *"
                      multiline
                      rows={3}
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Mô tả về kinh nghiệm giảng dạy..."
                      error={!!formErrors.description}
                      helperText={formErrors.description}
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
              </Grid>
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
                  {selectedTeacher ? 'Cập nhật' : loading ? 'Đang thêm...' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteTeacher}
        title="Xác nhận xóa giáo viên"
        message={teacherToDelete ? `Bạn có chắc chắn muốn xóa giáo viên "${teacherToDelete.userId?.name}"? Hành động này không thể hoàn tác.` : ''}
        loading={loading}
      />

      {/* View Teacher Details Dialog */}
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
            Chi tiết giáo viên
          </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Thông tin chi tiết về giáo viên và chuyên môn
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
          {selectedTeacherForView && (
            <Box>
              {/* Main Information Grid */}
              <Grid container spacing={3}>
                {/* Left Column - Personal Info */}
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
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Họ và tên
                        </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedTeacherForView.userId?.name}
                        </Typography>
                      </Box>

                      <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Email
                        </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedTeacherForView.userId?.email}
                        </Typography>
                      </Box>

                      <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Số điện thoại
                        </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedTeacherForView.userId?.phone}
                        </Typography>
                      </Box>

                      <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Ngày sinh
                        </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {formatDateDDMMYYYY(selectedTeacherForView.userId?.dayOfBirth)}
                        </Typography>
                      </Box>

                      <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Giới tính
                        </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedTeacherForView.userId?.gender === 'male' ? 'Nam' : 'Nữ'}
                        </Typography>
                      </Box>

                      <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Địa chỉ
                        </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedTeacherForView.userId?.address}
                        </Typography>
                          </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Right Column - Professional Info */}
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
                      Thông tin chuyên môn
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
                          Lương mỗi buổi
                        </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#27ae60' }}>
                          {selectedTeacherForView.salaryPerLesson ? `${selectedTeacherForView.salaryPerLesson.toLocaleString()} VNĐ` : 'Chưa có'}
                        </Typography>
                      </Box>

                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Bằng cấp
                        </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedTeacherForView.qualifications && selectedTeacherForView.qualifications.length > 0
                            ? selectedTeacherForView.qualifications.join(', ')
                            : 'Chưa có'}
                        </Typography>
                      </Box>

                          <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Chuyên môn
                        </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedTeacherForView.specialization && selectedTeacherForView.specialization.length > 0
                            ? selectedTeacherForView.specialization.join(', ')
                            : 'Chưa có'}
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
                        background: `linear-gradient(90deg, ${selectedTeacherForView.isActive ? '#e8f5e8' : '#ffebee'}, transparent)`,
                        border: `2px solid ${selectedTeacherForView.isActive ? '#4caf50' : '#f44336'}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: selectedTeacherForView.isActive ? '#2e7d32' : '#c62828' }}>
                            Trạng thái giáo viên
                        </Typography>
                        <Chip
                            label={selectedTeacherForView.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                            color={selectedTeacherForView.isActive ? 'success' : 'error'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                        />
                        </Box>
                      </Paper>
                </Grid>

                {/* Description */}
                {selectedTeacherForView.description && (
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
                        Mô tả
                      </Typography>
                        <Box sx={{
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                          <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#2c3e50' }}>
                        {selectedTeacherForView.description}
                      </Typography>
                        </Box>
                    </Paper>
                  </Grid>
                )}
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

      <NotificationSnackbar
        open={snackbar.open}
        onClose={handleCloseNotification}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default TeacherManagement;
