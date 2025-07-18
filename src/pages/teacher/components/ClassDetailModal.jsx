import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  School as SchoolIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import {
  getClassByIdAPI,
  getStudentsInClassAPI,
} from '../../../services/api';
import AttendanceModal from './AttendanceModal';

const ClassDetailModal = ({
  open,
  onClose,
  classData
}) => {
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);
  const [studentsDetail, setStudentsDetail] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [detailTabValue, setDetailTabValue] = useState(0);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);

  useEffect(() => {
    if (open && classData) {
      handleOpenDetail();
    }
  }, [open, classData]);

  const handleOpenDetail = async () => {
    if (!classData?.id) return;

    setLoadingDetail(true);
    try {
      // Lấy thông tin chi tiết lớp học
      const classRes = await getClassByIdAPI(classData.id);
      setSelectedClassDetail(classRes?.data);

      // Lấy danh sách học sinh
      setLoadingStudents(true);
      const allStudents = await fetchAllStudentsInClass(classData.id);
      setStudentsDetail(allStudents);
    } catch (err) {
      console.error('Error loading class details:', err);
    } finally {
      setLoadingDetail(false);
      setLoadingStudents(false);
    }
  };

  const fetchAllStudentsInClass = async (classId) => {
    const allStudents = [];
    let page = 1;
    const limit = 50;

    while (true) {
      try {
        const res = await getStudentsInClassAPI(classId, { limit, page });
        const students = res?.data?.students || [];

        if (students.length === 0) break;

        allStudents.push(...students);

        if (students.length < limit) break;

        page++;
      } catch (err) {
        console.error('Error fetching students:', err);
        break;
      }
    }

    return allStudents;
  };

  const handleDetailTabChange = (event, newValue) => {
    setDetailTabValue(newValue);
  };

  const handleOpenAttendance = () => {
    setAttendanceModalOpen(true);
  };

  const handleCloseAttendance = () => {
    setAttendanceModalOpen(false);
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return '';
    const days = (schedule.dayOfWeeks || [])
      .map(d => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d])
      .join(', ');
    const time = schedule.timeSlots
      ? `${schedule.timeSlots.startTime} - ${schedule.timeSlots.endTime}`
      : '';
    return `${days}${time ? ' | ' + time : ''}`;
  };

  const statusMap = {
    active: { label: 'Đang dạy', color: 'success' },
    upcoming: { label: 'Sắp diễn ra', color: 'warning' },
    closed: { label: 'Đã kết thúc', color: 'default' },
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
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
              Chi tiết lớp học
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {selectedClassDetail?.name}
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
            <SchoolIcon sx={{ fontSize: 28, color: 'white' }} />
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {loadingDetail ? (
            <Box sx={{ py: 4, px: 4 }}>
              <LinearProgress />
              <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải thông tin lớp học...</Typography>
            </Box>
          ) : selectedClassDetail ? (
            <Box sx={{ p: 4 }}>
              <Tabs value={detailTabValue} onChange={handleDetailTabChange} sx={{ mb: 3 }} variant="fullWidth">
                <Tab label="Thông tin lớp" />
                <Tab label="Danh sách học sinh" />
              </Tabs>

              {/* Tab 0: Thông tin lớp */}
              {detailTabValue === 0 && (
                <Grid container spacing={3}>
                  {/* Thông tin cơ bản */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                      border: '1px solid #e0e6ed',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <Typography variant="h6" gutterBottom sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        color: '#2c3e50',
                        fontWeight: 600
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
                            {selectedClassDetail.name}
                          </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                            Khối lớp
                          </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                            Khối {selectedClassDetail.grade} - Phần {selectedClassDetail.section}
                          </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                            Năm học
                          </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                            {selectedClassDetail.year}
                          </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                            Trạng thái
                          </Typography>
                          <Chip
                            label={statusMap[selectedClassDetail.status]?.label || selectedClassDetail.status}
                            color={statusMap[selectedClassDetail.status]?.color || 'default'}
                            size="small"
                          />
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Thông tin lịch học */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                      border: '1px solid #e0e6ed',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <Typography variant="h6" gutterBottom sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        color: '#2c3e50',
                        fontWeight: 600
                      }}>
                        <Box sx={{
                          width: 4,
                          height: 20,
                          bgcolor: '#667eea',
                          borderRadius: 2
                        }} />
                        Lịch học
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
                            Ngày học trong tuần
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {(selectedClassDetail.schedule?.dayOfWeeks || []).map((day, index) => (
                              <Chip
                                key={index}
                                label={['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day]}
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                            ))}
                          </Box>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                            Giờ học
                          </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                            {selectedClassDetail.schedule?.timeSlots?.startTime} - {selectedClassDetail.schedule?.timeSlots?.endTime}
                          </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                            Thời gian khóa học
                          </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                            Từ: {new Date(selectedClassDetail.schedule?.startDate).toLocaleDateString('vi-VN')}
                          </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                            Đến: {new Date(selectedClassDetail.schedule?.endDate).toLocaleDateString('vi-VN')}
                          </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Thông tin phòng học và học phí */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                      border: '1px solid #e0e6ed',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <Typography variant="h6" gutterBottom sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        color: '#2c3e50',
                        fontWeight: 600
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
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                            Phòng học
                          </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                            {selectedClassDetail.room}
                          </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                            Sĩ số tối đa
                          </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                            {selectedClassDetail.maxStudents} học sinh
                          </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                            Học phí mỗi buổi
                          </Typography>
                          <Typography variant="h6" color="success.main" fontWeight="bold">
                            {selectedClassDetail.feePerLesson?.toLocaleString('vi-VN')} VNĐ
                          </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Mô tả */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                      border: '1px solid #e0e6ed',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <Typography variant="h6" gutterBottom sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        color: '#2c3e50',
                        fontWeight: 600
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
                        <Typography variant="body1" sx={{
                          minHeight: 100,
                          color: '#2c3e50',
                          lineHeight: 1.6
                        }}>
                          {selectedClassDetail.description || 'Chưa có mô tả cho lớp học này.'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* Tab 1: Danh sách học sinh */}
              {detailTabValue === 1 && (
                <Box>
                  {loadingStudents ? (
                    <Box sx={{ py: 4 }}>
                      <LinearProgress />
                      <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải danh sách học sinh...</Typography>
                    </Box>
                  ) : studentsDetail.length > 0 ? (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Họ và Tên</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Số điện thoại</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {studentsDetail.map((student, index) => (
                            <TableRow key={student.id} hover>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                  <Typography variant="body2" fontWeight="medium">
                                    {student.name}
                                  </Typography>
                              </TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>{student.phone || '---'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Chưa có học sinh nào
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Lớp học này chưa có học sinh nào được đăng ký.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              Không thể tải thông tin lớp học
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={onClose}
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

      {/* Attendance Modal */}
      <AttendanceModal
        open={attendanceModalOpen}
        onClose={handleCloseAttendance}
        classData={selectedClassDetail}
      />
    </>
  );
};

export default ClassDetailModal;
