import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Paper,
} from '@mui/material';
import {
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import {
  getAttendanceListAPI
} from '../../../services/api';

const AttendanceHistoryModal = ({
  open,
  onClose,
  classData
}) => {
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    if (open && classData) {
      handleOpenHistory();
    }
  }, [open, classData]);

  const handleOpenHistory = async () => {
    setLoading(true);
    try {
      const res = await getAttendanceListAPI({
        classId: classData.id,
        limit: 50,
        page: 1,
        sortBy: 'date'
      });
      setAttendanceHistory(res?.data || []);
    } catch (err) {
      console.error('Error loading attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceSummary = (attendance) => {
    if (!attendance?.students) return { present: 0, absent: 0, late: 0, total: 0, rate: 0 };

    const present = attendance.students.filter(s => s.status === 'present').length;
    const absent = attendance.students.filter(s => s.status === 'absent').length;
    const late = attendance.students.filter(s => s.status === 'late').length;
    const total = attendance.students.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, late, total, rate };
  };

  const handleToggleRow = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present': return 'Có mặt';
      case 'absent': return 'Vắng';
      case 'late': return 'Đi muộn';
      default: return 'Không xác định';
    }
  };

  return (
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
            Lịch sử điểm danh
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {classData?.name} - Khối {classData?.grade} - Phần {classData?.section}
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
          <HistoryIcon sx={{ fontSize: 28, color: 'white' }} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ py: 4, px: 4 }}>
            <LinearProgress />
            <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải lịch sử điểm danh...</Typography>
          </Box>
        ) : attendanceHistory.length > 0 ? (
          <Box sx={{ p: 4 }}>
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
                  Lịch sử điểm danh chi tiết
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Thống kê điểm danh theo từng buổi học
                </Typography>
              </Box>
          <TableContainer>
            <Table>
              <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Ngày</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Có mặt</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Vắng</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Đi muộn</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Tỷ lệ tham gia</TableCell>
                      <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceHistory.map((attendance, index) => {
                  const summary = getAttendanceSummary(attendance);
                  const isExpanded = expandedRows[index];

                  return (
                    <React.Fragment key={index}>
                          <TableRow
                            hover
                            onClick={() => handleToggleRow(index)}
                            sx={{ cursor: 'pointer' }}
                          >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {new Date(attendance.date).toLocaleDateString('vi-VN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={summary.present}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={summary.absent}
                            color="error"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={summary.late}
                            color="warning"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${summary.rate}%`}
                            color={summary.rate >= 80 ? 'success' : summary.rate >= 60 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={isExpanded ? "Đóng chi tiết" : "Xem chi tiết"}>
                            <IconButton
                              size="small"
                              onClick={e => { e.stopPropagation(); handleToggleRow(index); }}
                            >
                                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                              <Paper sx={{ p: 2, bgcolor: '#fafafa' }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Chi tiết điểm danh ngày {new Date(attendance.date).toLocaleDateString('vi-VN')}
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1 }}>
                                  {attendance.students?.map((student, studentIndex) => (
                                    <Box key={studentIndex} sx={{
                                      p: 1,
                                      border: '1px solid #e0e0e0',
                                      borderRadius: 1,
                                      bgcolor: 'white'
                                    }}>
                                      <Typography variant="body2" fontWeight="medium">
                                        {student.name}
                                      </Typography>
                                      <Chip
                                        label={getStatusLabel(student.status)}
                                        color={getStatusColor(student.status)}
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                      />
                                    </Box>
                                  ))}
                                </Box>
                              </Paper>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có lịch sử điểm danh
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lớp học này chưa có bản ghi điểm danh nào.
            </Typography>
          </Box>
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
  );
};

export default AttendanceHistoryModal;
