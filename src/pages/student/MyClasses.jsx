import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
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
  Button,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Tabs,
  Tab,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentByIdAPI, getStudentDashboardAPI, getClassByIdAPI, getTeacherByIdAPI, getStudentAttendanceAPI } from '../../services/api';
import dayjs from 'dayjs';
import StatCard from '../../components/common/StatCard';

const MyClasses = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalClasses: 0,
    activeClasses: 0,
    completedClasses: 0,
    attendance: {
      totalSessions: 0,
      presentSessions: 0,
      absentSessions: 0,
      lateSessions: 0,
      attendanceRate: 0
    }
  });
  const [classDetailLoading, setClassDetailLoading] = useState(false);
  const [attendanceInfo, setAttendanceInfo] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      console.log('DEBUG - fetchClasses START');
      setLoading(true);
      try {
        let studentId = user?.id;
        if (user?.role === 'student' && user?.studentId) {
          studentId = user.studentId;
        }
        if (!studentId) {
          console.log('DEBUG - Không tìm thấy thông tin học sinh', user);
          throw new Error('Không tìm thấy thông tin học sinh');
        }

        // Lấy dữ liệu dashboard cho StatCard
        try {
          const dashRes = await getStudentDashboardAPI(studentId);
          const dashData = dashRes?.data?.data || dashRes?.data || {};
          setDashboardData({
            totalClasses: dashData.totalClasses || 0,
            activeClasses: dashData.activeClasses || 0,
            completedClasses: dashData.completedClasses || 0,
            attendance: dashData.attendance || {
              totalSessions: 0,
          presentSessions: 0,
          absentSessions: 0,
          lateSessions: 0,
          attendanceRate: 0
            }
          });
        } catch (e) {
          // Nếu lỗi vẫn tiếp tục lấy danh sách lớp
        }

        // Lấy thông tin học sinh và các lớp học từ getStudentByIdAPI
        console.log('DEBUG - Gọi getStudentByIdAPI với studentId:', studentId);
        const res = await getStudentByIdAPI(studentId);
        console.log('DEBUG - API response:', res);
        const studentData = res;
        console.log('DEBUG - studentData:', studentData);
        console.log('DEBUG - studentData.classes:', studentData.classes);
        if (!studentData || !Array.isArray(studentData.classes)) {
          console.log('DEBUG - Không có hoặc không phải mảng classes:', studentData?.classes);
          setClasses([]);
          console.log('DEBUG - setClasses([]) do không có dữ liệu');
          return;
        }

        // Chuyển đổi dữ liệu lớp học từ response mới
        const realClasses = studentData.classes.map((item) => {
          const classInfo = item.classId;
          const teacherName = classInfo.teacherId?.userId?.name || 'Chưa phân công';
          const schedule = classInfo.schedule;
          const dayText = schedule?.dayOfWeeks?.length > 0
            ? schedule.dayOfWeeks.map(d => ['CN','T2','T3','T4','T5','T6','T7'][d]).join(', ')
            : 'Chưa có lịch';
          const startTime = schedule?.timeSlots?.startTime || '';
          const endTime = schedule?.timeSlots?.endTime || '';
          let scheduleDays = dayText;
          let scheduleTime = '';
          if (startTime && endTime) {
            scheduleTime = `${startTime} - ${endTime}`;
          } else if (startTime || endTime) {
            scheduleTime = startTime || endTime;
          }
          return {
            id: classInfo.id,
            name: classInfo.name,
            teacher: teacherName,
            scheduleDays,
            scheduleTime,
            status: classInfo.status,
            enrollStatus: item.status,
            room: classInfo.room || 'Chưa phân phòng',
            startDate: schedule?.startDate,
            endDate: schedule?.endDate,
            grade: classInfo.grade,
            section: classInfo.section,
            year: classInfo.year,
            discountPercent: item.discountPercent,
            enrollmentDate: item.enrollmentDate
          };
        });
        setClasses(realClasses);
        console.log('DEBUG - setClasses(realClasses):', realClasses);
      } catch (error) {
        console.log('DEBUG - Error in fetchClasses:', error);
        console.error('Error fetching classes:', error);
        setClasses([]);
        console.log('DEBUG - setClasses([]) do error');
      } finally {
        setLoading(false);
        console.log('DEBUG - fetchClasses END');
      }
    };
    fetchClasses();
  }, [user]);

  const handleOpenDialog = async (classData = null) => {
    if (!classData?.id) return;
    setClassDetailLoading(true);
    setAttendanceLoading(true);
    setAttendanceInfo(null);
    try {
      const res = await getClassByIdAPI(classData.id);
      const detail = res?.data?.data || res?.data || res;
      setSelectedClass({ ...classData, ...detail });
    } catch (e) {
    setSelectedClass(classData);
    } finally {
      setClassDetailLoading(false);
    }
    // Lấy điểm danh
    try {
      let studentId = user?.id;
      if (user?.role === 'student' && user?.studentId) {
        studentId = user.studentId;
      }
      if (studentId) {
        const attRes = await getStudentAttendanceAPI(studentId);
        const attData = attRes?.data?.data || attRes?.data || attRes;
        // Lọc các bản ghi điểm danh đúng lớp
        const filteredDetailed = (attData.detailedAttendance || []).filter(a => a.class?.id === classData.id);
        const filteredAbsent = (attData.absentSessionsDetails || []).filter(a => a.class?.id === classData.id);
        // Tính lại attendanceStats cho đúng lớp
        let attendanceStats = {
          totalSessions: filteredDetailed.length,
          presentSessions: filteredDetailed.filter(a => a.status === 'present').length,
          absentSessions: filteredDetailed.filter(a => a.status === 'absent').length,
          lateSessions: filteredDetailed.filter(a => a.status === 'late').length,
          attendanceRate: 0
        };
        if (attendanceStats.totalSessions > 0) {
          attendanceStats.attendanceRate = Math.round(((attendanceStats.presentSessions + attendanceStats.lateSessions) / attendanceStats.totalSessions) * 100);
        }
        const filteredAttendance = {
          ...attData,
          attendanceStats,
          absentSessionsDetails: filteredAbsent,
          detailedAttendance: filteredDetailed,
        };
        setAttendanceInfo(filteredAttendance);
      }
    } catch (e) {
      setAttendanceInfo(null);
    } finally {
      setAttendanceLoading(false);
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setSelectedClass(null);
    setOpenDialog(false);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const filteredClasses = classes.filter((classItem) => {
    const name = classItem.name || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());

    // Lọc theo tab và trạng thái
    let matchesStatus = true;
    if (selectedTab === 0) {
      // Tab "Đang học" - hiển thị các lớp active
      matchesStatus = classItem.status === 'active';
    } else if (selectedTab === 1) {
      // Tab "Sắp khai giảng" - hiển thị các lớp upcoming
      matchesStatus = classItem.status === 'upcoming';
    } else if (selectedTab === 2) {
      // Tab "Đã kết thúc" - hiển thị các lớp closed
      matchesStatus = classItem.status === 'closed' || classItem.status === 'completed';
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    if (status === 'active') return 'success';
    if (status === 'closed') return 'info';
    if (status === 'upcoming') return 'warning';
    return 'default';
  };

  const getStatusLabel = (status) => {
    if (status === 'active') return 'Đang học';
    if (status === 'closed') return 'Đã kết thúc';
    if (status === 'upcoming') return 'Sắp khai giảng';
    return 'Không xác định';
  };

  const calculateAttendanceRate = (attended, total) => {
    return total > 0 ? Math.round((attended / total) * 100) : 0;
  };

  // Hàm tính số buổi học lý thuyết dựa trên ngày bắt đầu, ngày kết thúc, lịch học và ngày tham chiếu
  function countLessonsBetweenDates(startDate, endDate, daysOfWeek, untilDate = new Date()) {
    if (!startDate || !endDate || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0) return { total: 0, done: 0 };
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date(untilDate);
    let total = 0;
    let done = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (daysOfWeek.includes(d.getDay())) {
        total++;
        if (d <= today) done++;
      }
    }
    return { total, done };
  }

  return (
    <DashboardLayout role="student">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, color: COLORS.primary, fontWeight: 600 }}>
        Lớp học của tôi
      </Typography>

      <Grid container spacing={3}>
        {/* Stat Cards */}
                <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng số lớp"
                value={dashboardData.totalClasses || classes.length}
                icon={<SchoolIcon sx={{ fontSize: 40 }} />}
                color="primary"
              />
                </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Đang học"
                value={dashboardData.activeClasses || classes.filter((c) => c.status === 'active').length}
                icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
                color="success"
              />
                </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Đã kết thúc"
                value={dashboardData.completedClasses || classes.filter((c) => c.status === 'closed' || c.status === 'completed').length}
                icon={<CancelIcon sx={{ fontSize: 40 }} />}
                color="info"
              />
                    </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tỷ lệ tham gia"
                value={typeof dashboardData.attendance.attendanceRate === 'number' ? `${dashboardData.attendance.attendanceRate}%` : ''}
                icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
                color="warning"
              />
                    </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng số buổi"
                value={dashboardData.attendance.totalSessions}
                icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
                color="secondary"
              />
                    </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Buổi có mặt"
                value={dashboardData.attendance.presentSessions}
                icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
                color="success"
              />
                    </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Buổi vắng"
                value={dashboardData.attendance.absentSessions}
                icon={<CancelIcon sx={{ fontSize: 40 }} />}
                color="error"
              />
                </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Buổi muộn"
                value={dashboardData.attendance.lateSessions}
                icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
                color="warning"
              />
              </Grid>
          </Grid>
        </Grid>

        {/* Danh sách lớp học */}
        <Grid item xs={12}>
          <Paper sx={{ p: 0, mb: 3, boxShadow: 'none', background: 'transparent' }}>
            <Box sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm lớp học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                sx={{ width: '100%', background: '#fff', borderRadius: 2, boxShadow: 1 }}
                />
            </Box>
          </Paper>

          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            sx={{ mb: 2, width: '100%' }}
            TabIndicatorProps={{ sx: { height: 4, borderRadius: 2 } }}
          >
            <Tab label="Đang học" sx={{ width: '33.33%' }} />
            <Tab label="Sắp khai giảng" sx={{ width: '33.33%' }} />
            <Tab label="Đã kết thúc" sx={{ width: '33.33%' }} />
          </Tabs>

          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
            <LinearProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Đang tải dữ liệu lớp học...
              </Typography>
            </Box>
          ) : filteredClasses.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? 'Không tìm thấy lớp học phù hợp' :
                 selectedTab === 0 ? 'Chưa có lớp học nào đang diễn ra' :
                 selectedTab === 1 ? 'Chưa có lớp học nào đã kết thúc' :
                 'Chưa có lớp học nào sắp khai giảng'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? 'Hãy thử tìm kiếm với từ khóa khác' : 'Vui lòng liên hệ admin để được phân lớp'}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                      <TableRow sx={{ backgroundColor: COLORS.primary }}>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }}>Tên lớp</TableCell>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }}>Giáo viên</TableCell>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }}>Lịch học</TableCell>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }}>Phòng học</TableCell>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }}>Năm</TableCell>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }}>Ngày bắt đầu</TableCell>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }}>Ngày kết thúc</TableCell>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }}>Trạng thái</TableCell>
                        <TableCell sx={{ color: 'black', fontWeight: 600 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClasses.map((classItem) => (
                        <TableRow key={classItem.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.primary }}>
                              {classItem.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {classItem.teacher}
                              </Typography>
                          </TableCell>
                          <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.primary }}>
                              {classItem.scheduleDays || 'Chưa có lịch'}
                              </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{classItem.room}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{classItem.year}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{classItem.startDate ? new Date(classItem.startDate).toLocaleDateString('vi-VN') : ''}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{classItem.endDate ? new Date(classItem.endDate).toLocaleDateString('vi-VN') : ''}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(classItem.status)}
                              color={getStatusColor(classItem.status)}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleOpenDialog(classItem)}
                          color="primary"
                              title="Xem chi tiết"
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>

      {/* Dialog xem chi tiết lớp học */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
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
        {classDetailLoading && (
          <Box sx={{ width: '100%', p: 4, textAlign: 'center' }}>
            <LinearProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Đang tải chi tiết lớp học...
            </Typography>
          </Box>
        )}
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
              {selectedClass?.name}
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
          {selectedClass && !classDetailLoading && (
            <Box sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  {/* Thông tin cơ bản */}
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
                  Thông tin lớp học
                </Typography>
                    <Box sx={{
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                            Tên lớp:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {selectedClass.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                            Giáo viên:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                            {selectedClass.teacher}
                          </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                            Phòng học:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                            {selectedClass.room}
                          </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                            Lịch học:
                          </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                      {selectedClass.scheduleDays || 'Chưa có lịch'}
                          </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                      Giờ học:
                          </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                      {selectedClass.scheduleTime || 'Chưa có giờ'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                            Học phí/buổi:
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {selectedClass.feePerLesson?.toLocaleString()} VNĐ
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                            Trạng thái:
                          </Typography>
                        <Chip
                          label={getStatusLabel(selectedClass.status)}
                          color={getStatusColor(selectedClass.status)}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            mt: 0.5,
                            '& .MuiChip-icon': {
                              fontSize: '16px'
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                    </Box>
                  </Paper>
                  </Grid>


                  {/* Thống kê tham gia */}
                  {selectedClass.status !== 'upcoming' && (
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
                      Thống kê tham gia học tập
                    </Typography>
                        {attendanceLoading ? (
                          <Box sx={{ p: 2, textAlign: 'center' }}>
                            <LinearProgress />
                            <Typography variant="body2" sx={{ mt: 1 }}>Đang tải thông tin điểm danh...</Typography>
                          </Box>
                        ) : attendanceInfo ? (
                    <Box sx={{
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                                <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                          <CardContent>
                            <Typography variant="h4" sx={{ color: 'success.dark', fontWeight: 600 }}>
                                      {attendanceInfo.attendanceStats?.presentSessions ?? 0}
                            </Typography>
                              <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
                              Buổi đã học
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                                <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #ffe0e3 0%, #ffb3ba 100%)', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                          <CardContent>
                            <Typography variant="h4" sx={{ color: 'error.dark', fontWeight: 600 }}>
                                      {attendanceInfo.attendanceStats?.absentSessions ?? 0}
                            </Typography>
                              <Typography variant="body2" color="error.dark" sx={{ fontWeight: 500 }}>
                              Buổi đã nghỉ
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                                <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #fff9e0 0%, #ffeab3 100%)', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                          <CardContent>
                            <Typography variant="h4" sx={{ color: 'warning.dark', fontWeight: 600 }}>
                                      {attendanceInfo.attendanceStats?.lateSessions ?? 0}
                            </Typography>
                              <Typography variant="body2" color= "warning.dark" sx={{ fontWeight: 500 }}>
                                      Buổi muộn
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                                <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #e3e0ff 0%, #b3baff 100%)', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                          <CardContent>
                            <Typography variant="h4" sx={{ color: 'info.dark', fontWeight: 600 }}>
                                      {attendanceInfo.attendanceStats?.attendanceRate ?? 0}%
                            </Typography>
                              <Typography variant="body2" color="info.dark" sx={{ fontWeight: 500 }}>
                              Tỷ lệ tham gia
                            </Typography>
                          </CardContent>
                        </Card>
                  </Grid>
                </Grid>
                    </Box>
                        ) : (
                          <Typography variant="body2" color="error" sx={{ p: 2 }}>Không có dữ liệu điểm danh.</Typography>
                        )}
                  </Paper>
              </Grid>
                  )}

                  {/* Lịch sử điểm danh */}
                  {selectedClass.status !== 'upcoming' && (
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
                      Lịch sử điểm danh
                </Typography>
                        {attendanceLoading ? (
                          <Box sx={{ p: 2, textAlign: 'center' }}>
                            <LinearProgress />
                            <Typography variant="body2" sx={{ mt: 1 }}>Đang tải lịch sử điểm danh...</Typography>
                          </Box>
                        ) : attendanceInfo && attendanceInfo.detailedAttendance?.length > 0 ? (
                          <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                      <TableContainer>
                  <Table size="small">
                    <TableHead>
                            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                              <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Ngày</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Trạng thái</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Ghi chú</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                                  {attendanceInfo.detailedAttendance.map((attendance, idx) => (
                                    <TableRow key={idx} hover>
                              <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                  {new Date(attendance.date).toLocaleDateString('vi-VN')}
                                </Typography>
                              </TableCell>
                          <TableCell>
                            <Chip
                                          label={attendance.status === 'present' ? 'Có mặt' : attendance.status === 'absent' ? 'Vắng' : 'Đi muộn'}
                                          color={attendance.status === 'present' ? 'success' : attendance.status === 'absent' ? 'error' : 'warning'}
                              size="small"
                                          icon={attendance.status === 'present' ? <CheckCircleIcon /> : attendance.status === 'absent' ? <CancelIcon /> : <ScheduleIcon />}
                                          sx={{ fontWeight: 600, '& .MuiChip-icon': { fontSize: '16px' } }}
                            />
                          </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  {attendance.note || '-'}
                                </Typography>
                              </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                    </Box>
                        ) : (
                          <Typography variant="body2" color="black" align="center" sx={{ p: 2 }}>Không có dữ liệu điểm danh.</Typography>
                        )}
                  </Paper>
                </Grid>
                  )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button
            onClick={handleCloseDialog}
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
    </Box>
      </Box>
    </DashboardLayout>
  );
};

export default MyClasses;
