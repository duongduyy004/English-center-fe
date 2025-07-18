import React, { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ScheduleCalendar from '../../components/common/ScheduleCalendar';
import { useApi } from '../../hooks/useApi';
import { getStudentScheduleAPI, getAllStudentsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

const processSchedules = (schedules) => {
  const lessons = [];
  if (!schedules) return lessons;

  schedules.forEach((item) => {
    const { class: classInfo, schedule, teacher } = item;
    const startDate = dayjs(schedule.startDate);
    const endDate = dayjs(schedule.endDate);
    const dayOfWeeks = schedule.dayOfWeeks;
    const time = `${schedule.timeSlots.startTime} - ${schedule.timeSlots.endTime}`;

    let currentDate = startDate;
    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      // dayjs().day() returns 0 for Sunday, 1 for Monday... 6 for Saturday
      const currentDay = currentDate.day();

      if (dayOfWeeks.includes(currentDay)) {
        const lesson = {
          date: currentDate.format('YYYY-MM-DD'),
          className: classInfo.name,
          time,
          room: classInfo.room,
          teacher: teacher.name,
          type: 'student',
        };
        lessons.push(lesson);
      }
      currentDate = currentDate.add(1, 'day');
    }
  });

  return lessons;
};

const Schedule = () => {
  const { user } = useAuth();
  const { data, loading, error, execute: fetchSchedule } = useApi(getStudentScheduleAPI, null, false);

  useEffect(() => {
    let studentId = user?.id;
    if (user?.role === 'student' && user?.studentId) {
      studentId = user.studentId;
    }
    if (studentId) {
      fetchSchedule(studentId);
    }
  }, [user, fetchSchedule]);

  const lessons = useMemo(() => {
    // The API response is now correctly handled by useApi
    // The data object from the response is nested under a 'data' key
    return data?.data?.schedules ? processSchedules(data.data.schedules) : [];
  }, [data]);

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box>
          <Typography color="error" textAlign="center" sx={{ mt: 4, mb: 2 }}>
            Đã xảy ra lỗi khi tải lịch học.
          </Typography>
          <Paper component="pre" sx={{ p: 2, backgroundColor: '#fbe9e7', border: '1px solid #ffab91', overflowX: 'auto' }}>
            {JSON.stringify(error, null, 2)}
          </Paper>
        </Box>
      );
    }

    if (lessons && lessons.length > 0) {
      return (
        <ScheduleCalendar lessons={lessons} title="Lịch học của tôi" userType="student" />
      );
    }

    // Nếu không có dữ liệu, không lỗi, không loading
    return <Typography sx={{ mt: 4, textAlign: 'center' }}>Không có lịch học nào.</Typography>;
  };

  return (
    <DashboardLayout role="student">
      {renderContent()}
    </DashboardLayout>
  );
};

export default Schedule;
