import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import AddStudentToClassDialog from './AddStudentToClassDialog';
import { removeStudentFromClassAPI, getStudentsInClassAPI } from '../../services/api';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ClassStudentManagement = ({ classData, onUpdate }) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        const params = { page: 1, limit: 100 }; // Get all students
        const res = await getStudentsInClassAPI(classData.id, params);
        if (res.data && res.data.students) {
          setStudents(res.data.students);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };

    if (classData?.id) {
      fetchStudents();
    }
  }, [classData?.id]);

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    // Refresh students list after adding
    const fetchStudents = async () => {
      try {
        const params = { page: 1, limit: 100 };
        const res = await getStudentsInClassAPI(classData.id, params);
        if (res.data && res.data.students) {
          setStudents(res.data.students);
        }
      } catch (error) {
        console.error('Error refreshing students:', error);
      }
    };
    fetchStudents();
  };

  const handleOpenConfirmRemove = (student) => {
    setStudentToRemove(student);
  };

  const handleCloseConfirmRemove = () => {
    setStudentToRemove(null);
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;
    setLoading(true);
    try {
      await removeStudentFromClassAPI(classData.id, studentToRemove.id);
      setNotification({ open: true, message: 'Xóa học sinh khỏi lớp thành công!', severity: 'success' });
      // Refresh students list
      const params = { page: 1, limit: 100 };
      const res = await getStudentsInClassAPI(classData.id, params);
      if (res.data && res.data.students) {
        setStudents(res.data.students);
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      setNotification({ open: true, message: error.response?.data?.message || 'Lỗi khi xóa học sinh.', severity: 'error' });
    } finally {
      setLoading(false);
      handleCloseConfirmRemove();
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Danh sách học sinh ({students.length} / {classData.maxStudents})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          disabled={students.length >= classData.maxStudents}
        >
          Thêm học sinh
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Họ và tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentsLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Đang tải danh sách học sinh...
                </TableCell>
              </TableRow>
            ) : students.length > 0 ? (
              students.map((student) => (
                <TableRow key={String(student.id || student._id || Math.random())}>
                  <TableCell>{student.name || 'N/A'}</TableCell>
                  <TableCell>{student.email || 'N/A'}</TableCell>
                  <TableCell>{student.phone || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => handleOpenConfirmRemove(student)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Chưa có học sinh nào trong lớp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {openAddDialog && (
        <AddStudentToClassDialog
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          classData={classData}
          onUpdate={onUpdate}
        />
      )}

      {studentToRemove && (
        <ConfirmDialog
          open={Boolean(studentToRemove)}
          onClose={handleCloseConfirmRemove}
          onConfirm={handleRemoveStudent}
          title="Xác nhận xóa học sinh"
          content={`Bạn có chắc chắn muốn xóa học sinh "${studentToRemove.name}" khỏi lớp này không?`}
          loading={loading}
        />
      )}

      <NotificationSnackbar
        open={notification.open}
        onClose={handleCloseNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </Box>
  );
};

export default ClassStudentManagement;
