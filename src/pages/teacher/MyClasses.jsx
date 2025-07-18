import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Tooltip,
  CardActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Event as EventIcon,
  School as SchoolIcon,
  DoneAll as DoneAllIcon,
  HourglassEmpty as HourglassEmptyIcon,
  WatchLater as WatchLaterIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { commonStyles } from '../../utils/styles';
import { useAuth } from '../../contexts/AuthContext';
import {
  getTeacherScheduleAPI,
  getClassByIdAPI,
} from '../../services/api';
import ClassDetailModal from './components/ClassDetailModal';
import AttendanceModal from './components/AttendanceModal';
import AttendanceHistoryModal from './components/AttendanceHistoryModal';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';

function formatSchedule(schedule) {
  if (!schedule) return '';
  const days = (schedule.dayOfWeeks || [])
    .map(d => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d])
    .join(', ');
  const time = schedule.timeSlots
    ? `${schedule.timeSlots.startTime} - ${schedule.timeSlots.endTime}`
    : '';
  return `${days}${time ? ' | ' + time : ''}`;
}

const MyClasses = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState(new Set());

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 700); // 0.7 seconds

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch danh sách lớp dạy cho tab cụ thể
  const fetchClassesForTab = async (tabIndex) => {
    if (!user?.teacherId || loadedTabs.has(tabIndex)) return;

    setLoading(true);
    try {
      const scheduleRes = await getTeacherScheduleAPI(user.teacherId);
      const classes = scheduleRes?.data?.classes || [];

      // Sử dụng dữ liệu từ schedule API thay vì gọi API riêng cho từng lớp
      const detailedClasses = classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        status: cls.status || 'active',
        schedule: cls.schedule,
        room: cls.room,
        grade: cls.grade,
        section: cls.section,
        students: cls.students || []
      }));

      // Thêm classes mới vào state hiện tại
      setMyClasses(prevClasses => {
        const existingIds = new Set(prevClasses.map(cls => cls.id));
        const newClasses = detailedClasses.filter(cls => !existingIds.has(cls.id));
        return [...prevClasses, ...newClasses];
      });

      // Đánh dấu tab đã được load
      setLoadedTabs(prev => new Set([...prev, tabIndex]));
    } catch (err) {
      setNotification({ open: true, message: 'Không thể tải danh sách lớp dạy', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    // Fetch classes cho tab mới nếu chưa được load
    fetchClassesForTab(newValue);
  };

  const handleOpenDetail = async (classItem) => {
    // Load chi tiết lớp nếu cần
    if (!classItem.students || classItem.students.length === 0) {
      try {
        const classRes = await getClassByIdAPI(classItem.id);
        if (classRes?.data) {
          // Cập nhật thông tin lớp trong state
          setMyClasses(prevClasses =>
            prevClasses.map(cls =>
              cls.id === classItem.id ? { ...cls, ...classRes.data } : cls
            )
          );
          setSelectedClass({ ...classItem, ...classRes.data });
        } else {
          setSelectedClass(classItem);
        }
      } catch (err) {
        console.error(`Không thể tải chi tiết lớp học ${classItem.id}:`, err);
        setSelectedClass(classItem);
      }
    } else {
      setSelectedClass(classItem);
    }
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedClass(null);
  };

    const handleOpenAttendance = (classItem) => {
    setSelectedClass(classItem);
    setAttendanceModalOpen(true);
  };

  const handleCloseAttendance = () => {
    setAttendanceModalOpen(false);
    setSelectedClass(null);
  };

  const handleOpenHistory = async (classItem) => {
    setSelectedClass(classItem);
    setHistoryModalOpen(true);
  };

  const handleCloseHistory = () => {
    setHistoryModalOpen(false);
    setSelectedClass(null);
  };

  // Filter classes based on search and tab
  const filteredClasses = useMemo(() => {
    let filtered = myClasses.filter(classItem =>
      classItem.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );

    const statusFilters = ['active', 'upcoming', 'closed'];
    if (selectedTab < statusFilters.length) {
      filtered = filtered.filter(classItem => classItem.status === statusFilters[selectedTab]);
    }

    return filtered;
  }, [myClasses, debouncedSearchQuery, selectedTab]);

  // Load classes cho tab đầu tiên khi component mount
  useEffect(() => {
    if (user?.teacherId && !loadedTabs.has(0)) {
      fetchClassesForTab(0);
    }
  }, [user?.teacherId]);

  const statusMap = {
    active: { label: 'Đang dạy', color: 'success' },
    upcoming: { label: 'Sắp diễn ra', color: 'warning' },
    closed: { label: 'Đã kết thúc', color: 'default' },
  };

  return (
    <DashboardLayout>
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>
              Lớp học của tôi
            </Typography>
          </Box>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tổng số lớp"
              value={myClasses.length}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
                </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đang dạy"
              value={myClasses.filter(c => c.status === 'active').length}
              icon={<HourglassEmptyIcon sx={{ fontSize: 40 }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Sắp diễn ra"
              value={myClasses.filter(c => c.status === 'upcoming').length}
              icon={<WatchLaterIcon sx={{ fontSize: 40 }} />}
              color="warning"
            />
                </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp đã kết thúc"
              value={myClasses.filter(c => c.status === 'closed').length}
              icon={<DoneAllIcon sx={{ fontSize: 40 }} />}
              color="primary"
            />
              </Grid>
        </Grid>

        {/* Search and Tabs */}
          <Paper sx={commonStyles.searchContainer}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm theo tên lớp học..."
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
          </Paper>

        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }} variant="fullWidth">
          <Tab label="Đang dạy" />
          <Tab label="Sắp diễn ra" />
            <Tab label="Đã kết thúc" />
          </Tabs>

        {/* Class Cards Grid */}
        <Grid container spacing={3}>
          {filteredClasses.map((classItem) => (
            <Grid item xs={12} sm={6} md={4} key={classItem.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Chip
                    label={statusMap[classItem.status]?.label || 'Không xác định'}
                    color={statusMap[classItem.status]?.color || 'default'}
                    size="small"
                    sx={{ mb: 1.5 }}
                  />
                  <Typography variant="h6" component="div" gutterBottom>
                    {classItem.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1 }}>
                    <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">Khối {classItem.grade} - Phần {classItem.section}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1 }}>
                    <EventIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">{formatSchedule(classItem.schedule)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 2 }}>
                    <SchoolIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">Phòng {classItem.room}</Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleOpenDetail(classItem)}>Xem chi tiết</Button>
                  {(classItem.status === 'active' || classItem.status === 'closed') && (
                      <Tooltip title="Xem lịch sử điểm danh">
                        <Button
                          size="small"
                          startIcon={<HistoryIcon />}
                          onClick={() => handleOpenHistory(classItem)}
                        >
                          Lịch sử điểm danh
                        </Button>
                      </Tooltip>
                  )}
                  {classItem.status === 'active' && (() => {
                    // Kiểm tra xem lớp có lịch học hôm nay không
                    const today = new Date();
                    const dayOfWeek = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7

                    if (!classItem.schedule || !classItem.schedule.dayOfWeeks) {
                      return null; // Không hiển thị nút nếu không có lịch học
                    }

                    // Kiểm tra xem hôm nay có phải là ngày học của lớp không
                    const hasClassToday = classItem.schedule.dayOfWeeks.includes(dayOfWeek);

                    if (!hasClassToday) {
                      return null; // Không hiển thị nút nếu hôm nay không có lịch học
                    }

                    return (
                      <Tooltip title="Điểm danh buổi học hôm nay">
                        <Button
                          size="small"
                          startIcon={<AssignmentIcon />}
                          onClick={() => handleOpenAttendance(classItem)}
                        >
                          Điểm danh
                        </Button>
                      </Tooltip>
                    );
                  })()}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredClasses.length === 0 && (
          <Typography sx={{ textAlign: 'center', mt: 4 }}>
            Không tìm thấy lớp học nào.
          </Typography>
        )}

        {/* Modals */}
        <ClassDetailModal
          open={detailModalOpen}
          onClose={handleCloseDetail}
          classData={selectedClass}
        />

        <AttendanceModal
          open={attendanceModalOpen}
          onClose={handleCloseAttendance}
          classData={selectedClass}
        />

        <AttendanceHistoryModal
          open={historyModalOpen}
          onClose={handleCloseHistory}
          classData={selectedClass}
        />

        {/* Notification Snackbar */}
        <NotificationSnackbar
          open={notification.open}
          onClose={() => setNotification({ ...notification, open: false })}
          message={notification.message}
          severity={notification.severity}
          autoHideDuration={6000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default MyClasses;
