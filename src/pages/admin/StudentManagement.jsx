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
import { commonStyles } from "../../utils/styles";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { createStudentAPI, getAllStudentsAPI, getParentByIdAPI, deleteStudentAPI, updateStudentAPI } from '../../services/api';
import { validateStudent } from '../../validations/studentValidation';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';

const StudentManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [parentDetails, setParentDetails] = useState({});
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    dayOfBirth: '',
    phone: '',
    address: '',
    gender: 'female',
  });
  const [classEdits, setClassEdits] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleOpenDialog = (student = null) => {
    setSelectedStudent(student);
    setFormSubmitted(false);
    if (student) {
      setForm({
        name: student.userId?.name || '',
        email: student.userId?.email || '',
        password: student.userId?.password || '',
        dayOfBirth: student.userId?.dayOfBirth || '',
        phone: student.userId?.phone || '',
        address: student.userId?.address || '',
        gender: student.userId?.gender || 'female',
      });
      setClassEdits(
        (student.classes || []).map((cls, index) => ({
          classId: cls.classId?.id || cls.classId?._id || cls.classId || `class-${index}`,
          className: cls.classId?.name || `Lớp ${cls.classId?.grade || ''}.${cls.classId?.section || ''}`,
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
        gender: 'female',
      });
      setClassEdits([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form after dialog is closed to avoid flash effect
    setTimeout(() => {
      setSelectedStudent(null);
      setFormSubmitted(false);
      setForm({
        name: '',
        email: '',
        password: '',
        dayOfBirth: '',
        phone: '',
        address: '',
        gender: 'female',
      });
      setError('');
    }, 100);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassEditChange = (idx, field, value) => {
    setClassEdits(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async () => {
    const errors = validateStudent(form, !!selectedStudent, classEdits);
    // Kiểm tra lỗi tổng thể và lỗi discountPercent từng lớp
    const hasFieldError = Object.keys(errors).some(key => key !== 'classEdits' && errors[key]);
    const hasClassEditError = Array.isArray(errors.classEdits) && errors.classEdits.some(e => e && e.discountPercent);
    if (hasFieldError || hasClassEditError) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setSubmitting(true);

    try {
      let body;
      if (selectedStudent) {
        // Update: phải đúng format BE yêu cầu
        body = {
          userData: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            dayOfBirth: form.dayOfBirth,
            gender: form.gender,
            address: form.address,
          },
          studentData: classEdits.map(edit => ({
            classId: edit.classId,
            status: edit.status,
            discountPercent: edit.discountPercent || 0
          }))
        };
      } else {
        // Create: đúng format API specification
        body = {
          email: form.email,
          password: form.password,
          name: form.name,
          dayOfBirth: form.dayOfBirth,
          phone: form.phone,
          address: form.address,
          gender: form.gender
        };
      }

      console.log('Student submit body:', body);

      if (selectedStudent) {
        // Update existing student
        await updateStudentAPI(selectedStudent.id, body);
        setSnackbar({ open: true, message: 'Cập nhật học sinh thành công!', severity: 'success' });
      } else {
        // Create new student
        await createStudentAPI(body);
        setSnackbar({ open: true, message: 'Thêm học sinh thành công!', severity: 'success' });
      }

      handleCloseDialog();
      fetchStudents();
    } catch (error) {
      console.error('Error submitting student:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi lưu học sinh',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (student) => {
    setStudentToDelete(student);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setStudentToDelete(null);
    setOpenDeleteDialog(false);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    setLoading(true);
    setError('');
    try {
      await deleteStudentAPI(studentToDelete.id);
      setSnackbar({ open: true, message: 'Xóa học sinh thành công!', severity: 'success' });
      handleCloseDeleteDialog();
      fetchStudents(page); // Refresh student list
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Có lỗi xảy ra khi xóa học sinh',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        limit: 10,
        ...(debouncedSearch && { name: debouncedSearch })
      };

      const response = await getAllStudentsAPI(params);

      if (response && response.data) {
        setStudents(response.data);
        setTotalPages(response.totalPages || 1);

        // Extract parent information directly from response
        const parentMap = {};
        response.data.forEach(student => {
          parentMap[student.id] = student.parentId?.userId?.name || 'Không có phụ huynh';
        });

        setParentDetails(parentMap);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, debouncedSearch]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Helper function to safely render text content
  const renderText = (text) => {
    if (text === null || text === undefined) return '-';
    if (typeof text === 'object') return '-';
    return String(text);
  };

  // Helper function to format parent display
  const renderParent = (studentId) => {
    if (!studentId) return '-';
    // Lấy thông tin phụ huynh từ map đã được tạo
    const parentName = parentDetails[studentId];
    if (parentName) {
      return parentName;
    }
    return 'Không có phụ huynh';
  };

  // Helper function to format class display
  const renderClasses = (classes) => {
    if (!classes || classes.length === 0) return 'Chưa đăng ký lớp';

    return classes.map(cls => {
      // Lấy tên lớp trực tiếp từ classId object
      const className = cls.classId?.name || `Lớp ${cls.classId?.grade || ''}.${cls.classId?.section || ''}`;
      const status = cls.status === 'active' ? 'Đang học' : 'Đã nghỉ';
      const discount = cls.discountPercent ? ` (Giảm ${cls.discountPercent}%)` : '';
      return `${className}${discount} - ${status}`;
    }).join('\n');
  };

  const handleOpenViewDialog = (studentData) => {
    setSelectedStudentForView(studentData);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setSelectedStudentForView(null);
    setOpenViewDialog(false);
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
          Quản lý học sinh
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
              sx={commonStyles.primaryButton}
        >
          Thêm học sinh
        </Button>
      </Box>

          <Paper sx={commonStyles.searchContainer}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm học sinh..."
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
                  <TableCell width="18%">Họ và tên</TableCell>
                  <TableCell width="18%">Email</TableCell>
                  <TableCell width="10%">Số điện thoại</TableCell>
                  <TableCell width="16%">Phụ huynh</TableCell>
                  <TableCell width="20%">Lớp học</TableCell>
                  <TableCell width="6%">Giới tính</TableCell>
                  <TableCell width="12%" align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
                {loadingTable ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Đang tải...</TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Không có dữ liệu</TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={String(student.id || student._id || Math.random())}>
                      <TableCell>{renderText(student.userId?.name)}</TableCell>
                      <TableCell>{renderText(student.userId?.email)}</TableCell>
                      <TableCell>{renderText(student.userId?.phone)}</TableCell>
                      <TableCell>{renderParent(student.id)}</TableCell>
                      <TableCell sx={{ whiteSpace: 'pre-line' }}>{renderClasses(student.classes)}</TableCell>
                      <TableCell>
                        {student.userId?.gender === 'male' ? 'Nam' : 'Nữ'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" title="Xem chi tiết" onClick={() => handleOpenViewDialog(student)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" title="Chỉnh sửa" onClick={() => handleOpenDialog(student)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleOpenDeleteDialog(student)}>
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
          {selectedStudent ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedStudent ? 'Cập nhật thông tin học sinh' : 'Thêm học sinh mới vào hệ thống'}
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
                {selectedStudent ? (
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
                    Thông tin học sinh
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
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                          error={!!formErrors.name}
                          helperText={formErrors.name}
                        />
                </Grid>
                <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                          error={!!formErrors.email}
                          helperText={formErrors.email}
                        />
                </Grid>
                {selectedStudent == null && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mật khẩu"
                      name="password"
                      type="password"
                      value={form.password || ''}
                      onChange={handleChange}
                      required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#667eea',
                                },
                              },
                            }}
                      error={formSubmitted && !!formErrors.password}
                      helperText={formSubmitted ? formErrors.password : ''}
                    />
                  </Grid>
                )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày sinh"
                    name="dayOfBirth"
                    type="text"
                    value={form.dayOfBirth}
                    onChange={handleChange}
                required
                    placeholder="12/03/2018"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                    error={!!formErrors.dayOfBirth}
                    helperText={formErrors.dayOfBirth}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Số điện thoại"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                          error={!!formErrors.phone}
                          helperText={formErrors.phone}
                        />
                </Grid>
                <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Địa chỉ"
                          name="address"
                          value={form.address}
                          onChange={handleChange}
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
                    <Select label="Giới tính" name="gender" value={form.gender} onChange={handleChange} required>
                      <MenuItem value="male">Nam</MenuItem>
                      <MenuItem value="female">Nữ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
                  </Box>
                </Paper>
          {selectedStudent && classEdits.length > 0 && (
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
                  <React.Fragment key={String(cls.classId?.id || cls.classId || `class-edit-${idx}`)}>
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
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="Giảm giá (%)"
                        type="number"
                        value={cls.discountPercent}
                        onChange={e => handleClassEditChange(idx, 'discountPercent', e.target.value)}
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
                        error={!!(formErrors.classEdits && formErrors.classEdits[idx] && formErrors.classEdits[idx].discountPercent)}
                        helperText={formErrors.classEdits && formErrors.classEdits[idx] && formErrors.classEdits[idx].discountPercent}
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
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
                          value={cls.status}
                          label="Trạng thái"
                          onChange={e => handleClassEditChange(idx, 'status', e.target.value)}
                        >
                          <MenuItem value="active">Đang học</MenuItem>
                          <MenuItem value="completed">Đã hoàn thành</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </React.Fragment>
                ))}
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
                  }
                }}
              >
                Hủy
              </Button>
              <Button
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
                onClick={() => handleSubmit()}
                disabled={submitting}
              >
                {selectedStudent ? 'Cập nhật' : submitting ? 'Đang thêm...' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteStudent}
        title="Xác nhận xóa học sinh"
        message={studentToDelete ? `Bạn có chắc chắn muốn xóa học sinh "${studentToDelete.userId?.name}"? Hành động này không thể hoàn tác.` : ''}
        loading={loading}
      />

      {/* View Student Details Dialog */}
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
            Chi tiết học sinh
          </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Thông tin chi tiết về học sinh và lớp học
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
          {selectedStudentForView && (
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
                          {selectedStudentForView.userId?.name}
                        </Typography>
                      </Box>

                      <Box>
                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Email
                        </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedStudentForView.userId?.email}
                        </Typography>
                      </Box>

                      <Box>
                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Số điện thoại
                        </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedStudentForView.userId?.phone}
                        </Typography>
                      </Box>

                      <Box>
                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Ngày sinh
                        </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedStudentForView.userId?.dayOfBirth}
                        </Typography>
                      </Box>

                      <Box>
                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Giới tính
                        </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedStudentForView.userId?.gender === 'male' ? 'Nam' : 'Nữ'}
                        </Typography>
                      </Box>

                      <Box>
                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Địa chỉ
                        </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedStudentForView.userId?.address}
                        </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Right Column - Family & Class Info */}
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
                      Thông tin gia đình & học tập
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
                          Phụ huynh
                        </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#1976d2' }}>
                          {renderParent(selectedStudentForView.id)}
                        </Typography>
                      </Box>

                      <Box sx={{
                          p: 2,
                          borderRadius: 2,
                        background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                        border: '1px solid #9c27b0'
                      }}>
                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Số lớp đang học
                        </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#7b1fa2' }}>
                          {selectedStudentForView.classes ? selectedStudentForView.classes.length : 0}
                        </Typography>
                      </Box>

                      <Box sx={{
                          p: 2,
                          borderRadius: 2,
                        background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                        border: '1px solid #4caf50'
                      }}>
                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Trạng thái học tập
                        </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#2e7d32' }}>
                          {selectedStudentForView.classes && selectedStudentForView.classes.length > 0 ? 'Đang học' : 'Chưa đăng ký lớp'}
                        </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
            </Grid>

                {/* Full Width - Class Details */}
                {selectedStudentForView.classes && selectedStudentForView.classes.length > 0 && (
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
                        Danh sách lớp học
                      </Typography>
                      <Box sx={{
                        p: 2,
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                      <Grid container spacing={2}>
                        {selectedStudentForView.classes.map((cls, index) => (
                          <Grid item xs={12} md={4} key={String(cls.classId?.id || cls.classId || `view-class-${index}`)}>
                            <Box sx={{
                                p: 2,
                                borderRadius: 2,
                                background: cls.status === 'active'
                                  ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
                                  : 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
                                border: `2px solid ${cls.status === 'active' ? '#4caf50' : '#ff9800'}`,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                                <Typography variant="subtitle2" sx={{
                                  fontWeight: 600,
                                  mb: 1,
                                  color: cls.status === 'active' ? '#2e7d32' : '#e65100'
                                }}>
                                {cls.classId?.name || `Lớp ${cls.classId?.grade || ''}.${cls.classId?.section || ''}`}
                              </Typography>
                                <Typography variant="body2" sx={{
                                  fontWeight: 500,
                                  color: cls.status === 'active' ? '#2e7d32' : '#e65100',
                                  mb: 1
                                }}>
                                {cls.status === 'active' ? 'Đang học' : 'Đã nghỉ'}
                              </Typography>
                              {cls.discountPercent && (
                                  <Typography variant="caption" sx={{
                                    display: 'inline-block',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                                    color: '#667eea',
                                    fontWeight: 600
                                  }}>
                                  Giảm {cls.discountPercent}%
                                </Typography>
                              )}
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

export default StudentManagement;
