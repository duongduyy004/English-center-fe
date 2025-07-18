import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  Chip,
  Grid,
  Paper,
  Autocomplete,
  TextField,
} from '@mui/material';
import { Person as PersonIcon, School as SchoolIcon } from '@mui/icons-material';
import { getAllTeachersAPI, assignTeacherAPI, unassignTeacherAPI } from '../../services/api';
import { COLORS } from '../../utils/colors';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';

const ClassTeacherManagement = ({ classData, onUpdate, onClose, onSuccessMessage }) => {
  const [allTeachers, setAllTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [searchTeacher, setSearchTeacher] = useState('');
  const [debouncedSearchTeacher, setDebouncedSearchTeacher] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [currentTeacherObj, setCurrentTeacherObj] = useState(null);

  // Cập nhật currentTeacherObj khi classData thay đổi
  useEffect(() => {
    const updateCurrentTeacher = async () => {
      let teacherObj = null;

      if (typeof classData?.teacherId === 'string' && classData.teacherId) {
        // Nếu teacherId là string, tìm trong allTeachers trước
        if (allTeachers.length > 0) {
          teacherObj = allTeachers.find(
            (t) => String(t.id || t._id) === classData.teacherId
          );
        }

        // Nếu không tìm thấy trong allTeachers, fetch từ API
        if (!teacherObj) {
          try {
            const params = { limit: 1000 }; // Lấy tất cả giáo viên để tìm
            const response = await getAllTeachersAPI(params);
            const foundTeacher = response.data?.find(
              (t) => String(t.id || t._id) === classData.teacherId
            );
            if (foundTeacher) {
              teacherObj = foundTeacher;
            }
          } catch (error) {
            console.error('Error fetching teacher data:', error);
          }
        }
      } else if (typeof classData?.teacherId === 'object' && classData.teacherId) {
        teacherObj = classData.teacherId;
      }

      setCurrentTeacherObj(teacherObj);
    };

    updateCurrentTeacher();
  }, [classData]);

  // Debounce search input for teacher
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTeacher(searchTeacher);
    }, 700);
    return () => clearTimeout(handler);
  }, [searchTeacher]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        if (!debouncedSearchTeacher) {
          setAllTeachers([]);
          return;
        }
        const params = { limit: 20, name: debouncedSearchTeacher };
        const response = await getAllTeachersAPI(params);
        setAllTeachers(response.data || []);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };
    fetchTeachers();
  }, [debouncedSearchTeacher]);

  useEffect(() => {
    // Set the initial selected teacher if one is already assigned
    if (currentTeacherObj && (currentTeacherObj.id || currentTeacherObj._id)) {
      setSelectedTeacherId(String(currentTeacherObj.id || currentTeacherObj._id));
    } else {
      setSelectedTeacherId('');
    }
  }, [currentTeacherObj]);

  const handleAssignTeacher = async () => {
    if (!selectedTeacherId) {
      setNotification({ open: true, message: 'Vui lòng chọn một giáo viên.', severity: 'warning' });
      return;
    }
    setLoading(true);
    try {
      await assignTeacherAPI(classData.id, selectedTeacherId);
      if (onSuccessMessage) onSuccessMessage('Gán giáo viên thành công!', 'success');
      setNotification({ open: true, message: 'Gán giáo viên thành công!', severity: 'success' });
      // Reset form state
      setSearchTeacher('');
      setSelectedTeacherId('');
      setAllTeachers([]);
      // Clear current teacher object to force refresh
      setCurrentTeacherObj(null);
      // Refresh data without closing dialog
      onUpdate();
    } catch (error) {
      setNotification({ open: true, message: error.response?.data?.message || 'Lỗi khi gán giáo viên.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignTeacher = async () => {
    setLoading(true);
    try {
      await unassignTeacherAPI(classData.id);
      if (onSuccessMessage) onSuccessMessage('Hủy gán giáo viên thành công!', 'success');
      setNotification({ open: true, message: 'Hủy gán giáo viên thành công!', severity: 'success' });
      // Reset form state
      setSelectedTeacherId('');
      setSearchTeacher('');
      setAllTeachers([]);
      // Clear current teacher object to force refresh
      setCurrentTeacherObj(null);
      // Refresh data without closing dialog
      onUpdate();
    } catch (error) {
      setNotification({ open: true, message: error.response?.data?.message || 'Lỗi khi hủy gán giáo viên.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Current Teacher Info */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, #f5f7fa, #e0e8f0)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: COLORS.primary }}>
              Giáo viên hiện tại
            </Typography>
            {currentTeacherObj ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon color="action" />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {currentTeacherObj.userId?.name || currentTeacherObj.name || 'Chưa có thông tin'}
                </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleUnassignTeacher}
                    disabled={loading}
                  >
                    {loading ? 'Đang xử lý...' : 'Xóa'}
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                    {currentTeacherObj.userId?.email || ''}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1" color="textSecondary">
                Chưa có giáo viên nào được gán cho lớp này.
              </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Autocomplete
                    options={allTeachers}
                    getOptionLabel={(option) => option.userId?.name || option.name || ''}
                    filterOptions={(options) => options}
                    value={allTeachers.find(t => String(t.id || t._id) === selectedTeacherId) || null}
                    onChange={(_, value) => {
                      if (value) {
                        setSelectedTeacherId(String(value.id || value._id));
                      } else {
                        setSelectedTeacherId('');
                      }
                    }}
                    onInputChange={(_, value) => setSearchTeacher(value)}
                    renderInput={(params) => (
                      <TextField {...params} label="Tìm kiếm giáo viên theo tên..." variant="outlined" />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                        <span style={{ fontWeight: 500 }}>{option.userId?.name || 'Unnamed Teacher'}</span>
                        <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>{option.userId?.email}</span>
                      </Box>
                    )}
                    isOptionEqualToValue={(option, value) => String(option.id || option._id) === String(value.id || value._id)}
                    noOptionsText="Không tìm thấy giáo viên phù hợp"
                    fullWidth
                    sx={{ background: '#fff', borderRadius: 1 }}
                  />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAssignTeacher}
                    disabled={loading || !selectedTeacherId}
                    sx={{ alignSelf: 'flex-start' }}
              >
                    {loading ? 'Đang xử lý...' : 'Thêm giáo viên'}
              </Button>
            </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <NotificationSnackbar
        open={notification.open}
        onClose={handleCloseNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </Box>
  );
};

export default ClassTeacherManagement;
