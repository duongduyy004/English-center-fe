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
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Container,
  Stack,
  Badge,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  EmojiEvents as EmojiEventsIcon,
  AssignmentLate as AssignmentLateIcon,
  Person as PersonIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AttachMoney as AttachMoneyIcon,
  Discount as DiscountIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Grade as GradeIcon,
  Room as RoomIcon,
  Group as GroupIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
  Percent as PercentIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { COLORS } from "../../utils/colors";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import StatCard from '../../components/common/StatCard';
import { getParentByIdAPI, getClassByIdAPI, getStudentAttendanceAPI, getAttendanceListAPI, getTeacherByIdAPI } from '../../services/api';

const Children = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classDetails, setClassDetails] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [detailLoading, setDetailLoading] = useState(false);

  // Teacher detail dialog states
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [parentPermissions, setParentPermissions] = useState({
    canViewTeacherDetails: false // Default to false, will be updated from parent data
  });

  // Thêm state cho collapse từng lớp
  const [openClassIds, setOpenClassIds] = useState([]);

  useEffect(() => {
    const fetchParent = async () => {
      setLoading(true);
      try {
        const parentId = localStorage.getItem('parent_id');
        if (parentId) {
          const res = await getParentByIdAPI(parentId);

          if (res) {
            const parentData = res;
            const childrenList = parentData.studentIds || [];

            // Update parent permissions based on actual data
            setParentPermissions({
              canViewTeacherDetails: parentData.canSeeTeacherInfo !== undefined ? parentData.canSeeTeacherInfo : false
            });

            const formattedChildren = childrenList.map(child => ({
              id: child.userId.id,
              studentId: child.id,
              name: child.userId.name,
              email: child.userId.email,
              age: 0,
              grade: '',
              dateOfBirth: '',
              avatar: null,
              status: 'active',
              averageScore: 0,
              incompleteAssignments: 0,
              classes: child.classes || [],
            }));

            setChildren(formattedChildren);
          }
        }
      } catch (err) {
        console.error('Error fetching parent data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParent();
  }, []);

  const handleOpenDialog = async (childData = null) => {
    setSelectedChild(childData);
    setOpenDialog(true);

    if (childData) {
      setDetailLoading(true);
      try {
        const classPromises = childData.classes.map(async (classItem) => {
          try {
            const classRes = await getClassByIdAPI(classItem.classId);
            return {
              classId: classItem.classId,
              classData: classRes?.data || classRes,
              discountPercent: classItem.discountPercent,
              status: classItem.status,
              enrollmentDate: classItem.enrollmentDate
            };
          } catch (err) {
            return {
              classId: classItem.classId,
              classData: null,
              discountPercent: classItem.discountPercent,
              status: classItem.status,
              enrollmentDate: classItem.enrollmentDate
            };
          }
        });

        const classResults = await Promise.all(classPromises);
        const classDetailsMap = {};
        classResults.forEach(result => {
          classDetailsMap[result.classId] = result;
        });
        setClassDetails(classDetailsMap);

        try {
          const attendanceRes = await getStudentAttendanceAPI(childData.studentId || childData.id);
          setAttendanceData(attendanceRes?.data || {});
        } catch (err) {
          setAttendanceData({});
        }

      } catch (err) {
        console.error('Error loading child details:', err);
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedChild(null);
    setClassDetails({});
    setAttendanceData({});
  };

  const handleOpenTeacherDialog = async (teacherData) => {
    try {
      // Gọi API để lấy thông tin chi tiết giáo viên
      const teacherRes = await getTeacherByIdAPI(teacherData.id);
      setSelectedTeacher(teacherRes?.data || teacherRes);
      setTeacherDialogOpen(true);
    } catch (err) {
      console.error('Error loading teacher details:', err);
      // Fallback to basic teacher data if API fails
      setSelectedTeacher(teacherData);
      setTeacherDialogOpen(true);
    }
  };

  const handleCloseTeacherDialog = () => {
    setTeacherDialogOpen(false);
    setSelectedTeacher(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return 'N/A';

    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const days = (schedule.dayOfWeeks || [])
      .map(d => dayNames[d])
      .join(', ');

    let timeStr = '';
    if (schedule.timeSlots) {
      timeStr = `${schedule.timeSlots.startTime} - ${schedule.timeSlots.endTime}`;
    }

    let dateStr = '';
    if (schedule.startDate && schedule.endDate) {
      const startDate = new Date(schedule.startDate).toLocaleDateString('vi-VN');
      const endDate = new Date(schedule.endDate).toLocaleDateString('vi-VN');
      dateStr = `${startDate} - ${endDate}`;
    }

    return { days, timeStr, dateStr };
  };

  // Hàm toggle collapse
  const handleToggleClass = (classId) => {
    setOpenClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={commonStyles.pageContainer}>
          <Box sx={commonStyles.contentContainer}>
            <LinearProgress />
            <Typography sx={{ mt: 2, textAlign: 'center' }}>Đang tải thông tin...</Typography>
          </Box>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Quản lý con cái
            </Typography>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Theo dõi thông tin học tập và tiến độ của con em
          </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Tổng số con"
              value={children.length}
              icon={<PersonIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Con đang học"
              value={children.filter(child => child.status === 'active').length}
              icon={<SchoolIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Tổng số lớp học"
              value={children.reduce((total, child) => total + child.classes.length, 0)}
              icon={<EventIcon />}
              color="info"
            />
          </Grid>
            </Grid>

        {/* Children List */}
        {children.length === 0 ? (
          <Paper sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            backgroundColor: 'background.paper',
            boxShadow: 2
          }}>
            <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có thông tin con cái
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hãy liên hệ với trung tâm để thêm thông tin con em của bạn
            </Typography>
          </Paper>
              ) : (
          <Box sx={{
            display: 'flex',
            justifyContent: children.length <= 2 ? 'center' : 'flex-start',
            width: '100%'
          }}>
          <Grid container spacing={3}>
            {children.map((child) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={children.length === 1 ? 6 : children.length === 2 ? 6 : 4}
                  lg={children.length === 1 ? 4 : children.length === 2 ? 5 : 4}
                  key={child.id}
                >
                  <Card sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: 3,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      {/* Header with Avatar and Name */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: 'success.main',
                                border: '2px solid white'
                              }}
                            />
                          }
                        >
                          <Avatar
                            sx={{
                              width: 60,
                              height: 60,
                              bgcolor: 'primary.main',
                              fontSize: '1.5rem',
                              fontWeight: 600
                            }}
                          >
                            {child.name.charAt(0).toUpperCase()}
                              </Avatar>
                        </Badge>
                        <Box sx={{ ml: 2, flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {child.name}
                        </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          {child.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                      {/* Quick Stats */}
                      <Stack spacing={2} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <SchoolIcon sx={{ fontSize: 18, mr: 1 }} />
                            Số lớp học:
                          </Typography>
                          <Chip
                            label={child.classes.length}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <EventIcon sx={{ fontSize: 18, mr: 1 }} />
                            Trạng thái:
                          </Typography>
                          <Chip
                            label="Đang học"
                            size="small"
                            color="success"
                            variant="filled"
                          />
                    </Box>
                      </Stack>

                      {/* Action Button */}
                    <Button
                      variant="contained"
                      fullWidth
                              onClick={() => handleOpenDialog(child)}
                      startIcon={<ViewIcon />}
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: '1rem'
                        }}
                    >
                      Xem chi tiết
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          </Box>
        )}

        {/* Detail Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
          maxWidth="md"
            fullWidth
          PaperProps={{
            sx: {
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
                p: 0,
            }
          }}
          >
            <DialogTitle
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                py: 3,
                px: 4,
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: 1,
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SchoolIcon sx={{ fontSize: 36, color: 'white' }} />
                <span>Thông tin chi tiết học sinh</span>
              </Box>
              <Button
                onClick={handleCloseDialog}
                sx={{ color: 'white', minWidth: 0, p: 1, borderRadius: '50%', '&:hover': { background: 'rgba(255,255,255,0.15)' } }}
              >
                <CancelIcon sx={{ fontSize: 32 }} />
              </Button>
            </DialogTitle>
            <DialogContent sx={{ p: 4, background: 'transparent' }}>
            {detailLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
                <LinearProgress sx={{ width: '100%', mb: 2 }} />
                <Typography>Đang tải thông tin chi tiết...</Typography>
              </Box>
            ) : (
              selectedChild && (
              <Box>
                {/* Classes Information */}
                  <Typography variant="h5" gutterBottom sx={{
                    fontWeight: 700,
                    mb: 3,
                    color: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <SchoolIcon />
                  Danh sách lớp học
                </Typography>

                  {selectedChild.classes.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                      <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Chưa đăng ký lớp học nào
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Hãy liên hệ với trung tâm để đăng ký lớp học cho con em
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={3}>
                  {selectedChild.classes.map((cls, index) => {
                    const classDetail = classDetails[cls.classId];
                    const classData = classDetail?.classData;

                    let classAttendance = { total: 0, present: 0, absent: 0, late: 0, rate: 0, details: [] };
                    if (attendanceData && attendanceData.detailedAttendance) {
                      const details = attendanceData.detailedAttendance.filter(a => a.class?.id === cls.classId);
                      const total = details.length;
                      const present = details.filter(a => a.status === 'present').length;
                      const absent = details.filter(a => a.status === 'absent').length;
                      const late = details.filter(a => a.status === 'late').length;
                      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
                      classAttendance = { total, present, absent, late, rate, details };
                    }

                      const isOpen = openClassIds.includes(cls.classId);
                    return (
                            <Card key={cls.classId} sx={{ borderRadius: 2, boxShadow: 1, overflow: 'hidden', border: 'none', p: 0 }}>
                              <Box
                                sx={{
                                p: 3,
                                backgroundColor: 'white',
                                color: 'black',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-start',
                                  borderRadius: 2,
                                  transition: 'background 0.2s',
                                  '&:hover': { backgroundColor: 'grey.100' },
                                }}
                                onClick={() => handleToggleClass(cls.classId)}
                              >
                                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'black' }}>
                                      Lớp {classData?.name || classData?.className || cls.className || cls.classId}
                              </Typography>
                                  <Chip
                                    label={classData?.status === 'active' ? 'Đang học' :
                                           classData?.status === 'upcoming' ? 'Sắp diễn ra' :
                                           classData?.status === 'closed' ? 'Đã kết thúc' :
                                           cls.status === 'active' ? 'Đang học' : 'Tạm nghỉ'}
                                    color={classData?.status === 'active' ? 'success' :
                                           classData?.status === 'upcoming' ? 'warning' :
                                           classData?.status === 'closed' ? 'default' :
                                           cls.status === 'active' ? 'success' : 'warning'}
                                    variant="filled"
                                  />
                                </Box>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                      <Chip
                                        icon={<GradeIcon color="primary" />}
                                        label={`Khối ${classData?.grade || cls.grade || 'N/A'}`}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                      />
                                      <Chip
                                        icon={<RoomIcon color="primary" />}
                                        label={`Phòng ${classData?.room || cls.room || 'N/A'}`}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                      />
                        </Box>
                                <Collapse in={isOpen} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
                                  <Box sx={{ pt: 3 }}>
                                <Grid container spacing={3}>
                                  {/* Teacher Information */}
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <PersonIcon color="primary" />
                                      Giáo viên
                                    </Typography>
                                    <Paper sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {classData?.teacherName || 'Chưa có giáo viên'}
                                        </Typography>
                                        {classData?.teacherId && parentPermissions.canViewTeacherDetails && (
                                          <IconButton
                                            size="small"
                                            onClick={() => handleOpenTeacherDialog({ id: classData.teacherId, name: classData.teacherName })}
                                            sx={{
                                              color: 'primary.main',
                                              '&:hover': { backgroundColor: 'primary.light' }
                                            }}
                                          >
                                            <ViewIcon fontSize="small" />
                                          </IconButton>
                                        )}
                                      </Box>
                                    </Paper>
                                  </Grid>

                                  {/* Enrollment Information */}
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <CalendarIcon color="primary" />
                                      Thông tin đăng ký
                                    </Typography>
                                    <Paper sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                                      <Typography variant="body2">
                                        Ngày đăng ký: {new Date(cls.enrollmentDate).toLocaleDateString('vi-VN')}
                                      </Typography>
                                    </Paper>
                                  </Grid>

                                  {/* Fee Information */}
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <AttachMoneyIcon color="primary" />
                                      Học phí
                                    </Typography>
                                    <Paper sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        <strong>Học phí:</strong> {classData?.feePerLesson ? formatCurrency(classData.feePerLesson) :
                                         cls.feePerLesson ? formatCurrency(cls.feePerLesson) : 'N/A'} / buổi
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        <strong>Giảm giá:</strong> {cls.discountPercent}%
                                      </Typography>
                                    </Paper>
                                  </Grid>

                                  {/* Schedule Information */}
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <ScheduleIcon color="primary" />
                                      Lịch học
                                    </Typography>
                                    <Paper sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                                      {(classData?.schedule || cls.schedule) ? (
                                        <Box>
                                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                            <strong>Thứ:</strong> {formatSchedule(classData?.schedule || cls.schedule).days}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            <strong>Giờ học:</strong> {formatSchedule(classData?.schedule || cls.schedule).timeStr}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                            <strong>Thời gian khóa học:</strong> {formatSchedule(classData?.schedule || cls.schedule).dateStr}
                                          </Typography>
                                        </Box>
                                      ) : (
                                        <Typography variant="body2">
                                          Chưa có lịch học
                                        </Typography>
                                      )}
                                    </Paper>
                                  </Grid>

                                  {/* Learning Progress */}
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <TrendingUpIcon color="primary" />
                                      Tiến độ học tập
                                    </Typography>
                                    <Paper sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                                      {(() => {
                                        const schedule = classData?.schedule || cls.schedule;
                                        if (!schedule || !schedule.startDate || !schedule.endDate) {
                                          return (
                                            <Typography variant="body2">
                                              Chưa có thông tin lịch học
                                            </Typography>
                                          );
                                        }

                                        const startDate = new Date(schedule.startDate);
                                        const endDate = new Date(schedule.endDate);
                                        const today = new Date();

                                        // Tính tổng số tuần học
                                        const totalWeeks = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 7));

                                        // Tính số tuần đã học (từ ngày bắt đầu đến hôm nay)
                                        const weeksCompleted = Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24 * 7)));

                                        // Tính số buổi học đã diễn ra
                                        const daysPerWeek = schedule.dayOfWeeks?.length || 0;
                                        const totalLessons = totalWeeks * daysPerWeek;
                                        const completedLessons = Math.min(weeksCompleted * daysPerWeek, totalLessons);

                                        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

                                        return (
                                          <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                              <strong>Đã hoàn thành:</strong> {completedLessons} / {totalLessons} buổi học
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                              <strong>Tỷ lệ hoàn thành:</strong> {progressPercentage}%
                                            </Typography>
                                          </Box>
                                        );
                                      })()}
                                    </Paper>
                                  </Grid>

                                  {/* Description */}
                                  {(classData?.description || cls.description) && (
                                    <Grid item xs={12}>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DescriptionIcon color="primary" />
                                        Mô tả
                                      </Typography>
                                      <Paper sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                                        <Typography variant="body2">
                                          {classData?.description || cls.description}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                  )}
                                </Grid>

                                {/* Attendance Information */}
                                <Box sx={{ mt: 4 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleIcon color="primary" />
                                    Thông tin điểm danh
                        </Typography>

                        {classAttendance.total > 0 ? (
                              <React.Fragment>
                                      <Grid container spacing={2} sx={{ mb: 3 }}>
                                        <Grid item xs={12} sm={6} md={6}>
                                <StatCard
                                  title="Tổng số buổi học"
                                  value={classAttendance.total}
                                  icon={<EventIcon />}
                                  color="primary"
                                />
                              </Grid>
                                        <Grid item xs={12} sm={6} md={6}>
                                <StatCard
                                  title="Buổi có mặt"
                                  value={classAttendance.present}
                                  icon={<CheckCircleIcon />}
                                  color="success"
                                />
                              </Grid>
                                        <Grid item xs={12} sm={6} md={6}>
                                <StatCard
                                  title="Buổi vắng"
                                  value={classAttendance.absent}
                                  icon={<CancelIcon />}
                                  color="error"
                                />
                            </Grid>
                            {classAttendance.late > 0 && (
                                          <Grid item xs={12} sm={6} md={6}>
                                <StatCard
                                  title="Buổi đi muộn"
                                  value={classAttendance.late}
                                  icon={<ScheduleIcon />}
                                  color="warning"
                                />
                              </Grid>
                            )}
                                        <Grid item xs={12} sm={6} md={6}>
                                <StatCard
                                  title="Tỷ lệ tham gia"
                                  value={`${classAttendance.rate}%`}
                                  icon={<PercentIcon />}
                                  color="info"
                                />
                              </Grid>
                                </Grid>
                                      {/* Attendance Details */}
                                      <Box sx={{ mt: 3 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                          Chi tiết các buổi điểm danh:
                              </Typography>
                                        <Paper sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                                          <List dense>
                                {classAttendance.details.map((att, idx) => (
                                              <ListItem key={idx} sx={{ px: 0 }}>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                  {att.status === 'present' ? (
                                                    <CheckCircleIcon color="success" fontSize="small" />
                                                  ) : att.status === 'absent' ? (
                                                    <CancelIcon color="error" fontSize="small" />
                                                  ) : (
                                                    <ScheduleIcon color="warning" fontSize="small" />
                                                  )}
                                                </ListItemIcon>
                                                <ListItemText
                                                  primary={`${new Date(att.date).toLocaleDateString('vi-VN')} - ${
                                                    att.status === 'present' ? 'Có mặt' :
                                                    att.status === 'absent' ? 'Vắng' : 'Đi muộn'
                                                  }`}
                                                  secondary={att.note}
                                                />
                                              </ListItem>
                                ))}
                                          </List>
                                        </Paper>
                            </Box>
                              </React.Fragment>
                        ) : (
                                    <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'grey.50', borderRadius: 2 }}>
                                      <EventIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                      <Typography variant="body1" color="text.secondary">
                            Chưa có dữ liệu điểm danh cho lớp này
                          </Typography>
                                    </Paper>
                        )}
                                </Box>
                      </Box>
                                    </Collapse>
                                  </Box>
                  </Card>
                );
              })}
                    </Stack>
                  )}
                </Box>
              )
              )}
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', background: 'transparent' }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
                sx={{ borderRadius: 2, px: 3, fontWeight: 600, fontSize: 16 }}
                startIcon={<CancelIcon />}
            >
                Đóng
              </Button>
            </DialogActions>
          </Dialog>

        {/* Teacher Detail Dialog */}
        <Dialog
          open={teacherDialogOpen}
          onClose={handleCloseTeacherDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            pb: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
                fontSize: '1.5rem',
                fontWeight: 600
              }}>
                {selectedTeacher?.userId?.name?.charAt(0).toUpperCase() ||
                 selectedTeacher?.name?.charAt(0).toUpperCase() || 'G'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {selectedTeacher?.userId?.name || selectedTeacher?.name || 'Giáo viên'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Thông tin chi tiết giáo viên
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            {selectedTeacher && (
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                    Thông tin cơ bản
                  </Typography>
                  <Paper sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Họ và tên
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedTeacher?.userId?.name || selectedTeacher?.name || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedTeacher?.userId?.email || selectedTeacher?.email || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Số điện thoại
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedTeacher?.userId?.phone || selectedTeacher?.phone || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Ngày sinh
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedTeacher?.userId?.dayOfBirth ?
                            new Date(selectedTeacher.userId.dayOfBirth).toLocaleDateString('vi-VN') :
                            selectedTeacher?.dayOfBirth ?
                            new Date(selectedTeacher.dayOfBirth).toLocaleDateString('vi-VN') :
                            'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Professional Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                    Thông tin chuyên môn
                  </Typography>
                  <Paper sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Chuyên ngành
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedTeacher?.specialization ?
                            (Array.isArray(selectedTeacher.specialization) ?
                              selectedTeacher.specialization.join(', ') :
                              selectedTeacher.specialization) :
                            selectedTeacher?.major || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Bằng cấp
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedTeacher?.qualifications ?
                            (Array.isArray(selectedTeacher.qualifications) ?
                              selectedTeacher.qualifications.join(', ') :
                              selectedTeacher.qualifications) :
                            selectedTeacher?.degree || selectedTeacher?.qualification || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Số lớp dạy
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedTeacher?.classes ? selectedTeacher.classes.length : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">
                          Trạng thái
                        </Typography>
                        <Chip
                          label={selectedTeacher?.isActive ? 'Đang giảng dạy' : 'Tạm nghỉ'}
                          color={selectedTeacher?.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Additional Information */}
                {(selectedTeacher?.bio || selectedTeacher?.description) && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Giới thiệu
                    </Typography>
                    <Paper sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body1">
                        {selectedTeacher?.bio || selectedTeacher?.description}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              onClick={handleCloseTeacherDialog}
              variant="outlined"
              sx={{ borderRadius: 2, px: 3 }}
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

export default Children;
