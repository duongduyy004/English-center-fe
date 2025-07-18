import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { getAllStudentsAPI, enrollStudentAPI, getStudentsInClassAPI } from '../../services/api';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';

const AddStudentToClassDialog = ({ open, onClose, classData, onUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentDiscounts, setStudentDiscounts] = useState({});
  const [existingStudentIds, setExistingStudentIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch existing students in class
  useEffect(() => {
    const fetchExistingStudents = async () => {
      try {
        const params = { page: 1, limit: 100 };
        const res = await getStudentsInClassAPI(classData.id, params);
        if (res.data && res.data.students) {
          setExistingStudentIds(res.data.students.map(s => s.id));
        } else {
          setExistingStudentIds([]);
        }
      } catch (error) {
        console.error('Error fetching existing students:', error);
        setExistingStudentIds([]);
      }
    };

    if (open && classData?.id) {
      fetchExistingStudents();
    }
  }, [open, classData?.id]);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingList(true);
      try {
        const params = { limit: 30 };
        if (searchQuery) params.name = searchQuery;
        const response = await getAllStudentsAPI(params);
        // Filter out students who are already in the class
        const availableStudents = (response.data || []).filter(
          student => !existingStudentIds.includes(student.id)
        );
        setAllStudents(availableStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoadingList(false);
      }
    };

    const debounceFetch = setTimeout(() => {
        fetchStudents();
    }, 700); // Debounce search query

    return () => clearTimeout(debounceFetch);
  }, [searchQuery, existingStudentIds]);

  const handleToggleStudent = (studentId) => {
    const currentIndex = selectedStudents.indexOf(studentId);
    const newSelected = [...selectedStudents];
    const newDiscounts = { ...studentDiscounts };

    if (currentIndex === -1) {
      newSelected.push(studentId);
      newDiscounts[studentId] = '';
    } else {
      newSelected.splice(currentIndex, 1);
      delete newDiscounts[studentId];
    }
    setSelectedStudents(newSelected);
    setStudentDiscounts(newDiscounts);
  };

  const handleDiscountChange = (studentId, discount) => {
    let value = discount;
    if (value === '') {
      setStudentDiscounts(prev => ({ ...prev, [studentId]: '' }));
      return;
    }
    value = Math.max(0, Math.min(100, parseInt(value) || 0));
    setStudentDiscounts(prev => ({ ...prev, [studentId]: value }));
  };

  const handleAddStudents = async () => {
    setLoading(true);
    try {
      // Format data according to API requirements
      const studentsData = selectedStudents.map(studentId => ({
        studentId: studentId,
        discountPercent: studentDiscounts[studentId] === '' || studentDiscounts[studentId] === undefined ? 0 : studentDiscounts[studentId]
      }));
      console.log('Dữ liệu gửi đi khi thêm học sinh vào lớp:', { classId: classData.id, studentsData });
      await enrollStudentAPI(classData.id, studentsData);
      setNotification({ open: true, message: 'Thêm học sinh vào lớp thành công!', severity: 'success' });
      // Reset form
      setSelectedStudents([]);
      setStudentDiscounts({});
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      setNotification({ open: true, message: error.response?.data?.message || 'Học sinh đã có trong lớp.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  const remainingSlots = classData.maxStudents - existingStudentIds.length;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Thêm học sinh vào lớp "{classData.name}"
          <Typography variant="body2" color="textSecondary">
            Số chỗ còn lại: {remainingSlots} - Đã chọn: {selectedStudents.length}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            placeholder="Tìm kiếm học sinh theo tên hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ height: 300, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 1 }}>
            {loadingList ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {allStudents.length > 0 ? (
                  allStudents.map((student) => (
                    <ListItem
                      key={student.id}
                      button
                      onClick={() => handleToggleStudent(student.id)}
                      disabled={selectedStudents.length >= remainingSlots && !selectedStudents.includes(student.id)}
                    >
                      <Checkbox
                        edge="start"
                        checked={selectedStudents.indexOf(student.id) !== -1}
                        tabIndex={-1}
                        disableRipple
                      />
                      <ListItemText
                        primary={student.userId?.name || 'N/A'}
                        secondary={student.userId?.email || 'N/A'}
                      />
                      {selectedStudents.includes(student.id) && (
                        <TextField
                          type="number"
                          size="small"
                          label="Giảm giá (%)"
                          value={studentDiscounts[student.id] === undefined ? '' : studentDiscounts[student.id]}
                          onChange={(e) => handleDiscountChange(student.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ width: 120, ml: 1 }}
                          inputProps={{ min: 0, max: 100 }}
                        />
                      )}
                    </ListItem>
                  ))
                ) : (
                  <Typography sx={{ p: 2, textAlign: 'center' }}>
                    Không tìm thấy học sinh phù hợp hoặc tất cả đã ở trong lớp.
                  </Typography>
                )}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            onClick={handleAddStudents}
            variant="contained"
            disabled={loading || selectedStudents.length === 0 || selectedStudents.length > remainingSlots}
          >
            {loading ? <CircularProgress size={24} /> : 'Thêm học sinh'}
          </Button>
        </DialogActions>
      </Dialog>
      <NotificationSnackbar
        open={notification.open}
        onClose={handleCloseNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </>
  );
};

export default AddStudentToClassDialog;
