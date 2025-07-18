import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, MenuItem, Grid, Typography, Select, InputLabel, FormControl, Checkbox, ListItemText, OutlinedInput, Chip, FormHelperText
} from '@mui/material';
import { getAllTeachersAPI } from '../../services/api';
import { validateClassData, validateField } from '../../validations/classValidation';

const daysOfWeek = [
  { value: 0, label: 'Chủ nhật' },
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
];



const timeSlotOptions = [
  { value: '07:00-09:00', label: '7:00 - 9:00', startTime: '07:00', endTime: '09:00' },
  { value: '09:00-11:00', label: '9:00 - 11:00', startTime: '09:00', endTime: '11:00' },
  { value: '14:00-16:00', label: '14:00 - 16:00', startTime: '14:00', endTime: '16:00' },
  { value: '16:00-18:00', label: '16:00 - 18:00', startTime: '16:00', endTime: '18:00' },
  { value: '18:00-20:00', label: '18:00 - 20:00', startTime: '18:00', endTime: '20:00' },
  { value: '20:00-22:00', label: '20:00 - 22:00', startTime: '20:00', endTime: '22:00' },
];

const AddClassForm = ({ classData, onSubmit, loading, id }) => {
  const [form, setForm] = useState({
    grade: '',
    section: '',
    name: '',
    feePerLesson: '',
    maxStudents: '',
    description: '',
    room: '',
    schedule: {
      startDate: '',
      endDate: '',
      dayOfWeeks: [],
      timeSlots: {
        startTime: '',
        endTime: ''
      }
    }
  });

  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (classData) {
      setForm({
        grade: classData.grade || '',
        section: classData.section || '',
        name: classData.name || '',
        feePerLesson: classData.feePerLesson || '',
        maxStudents: classData.maxStudents || '',
        description: classData.description || '',
        room: classData.room || '',
        schedule: {
          startDate: classData.schedule?.startDate ? new Date(classData.schedule.startDate).toISOString().split('T')[0] : '',
          endDate: classData.schedule?.endDate ? new Date(classData.schedule.endDate).toISOString().split('T')[0] : '',
          dayOfWeeks: classData.schedule?.dayOfWeeks || [],
          timeSlots: {
            startTime: classData.schedule?.timeSlots?.startTime || '',
            endTime: classData.schedule?.timeSlots?.endTime || ''
          }
        }
      });
      // Luôn hiển thị khung giờ hiện tại kể cả không khớp
      const start = classData.schedule?.timeSlots?.startTime;
      const end = classData.schedule?.timeSlots?.endTime;
      if (start && end) {
        const foundSlot = timeSlotOptions.find(slot => slot.startTime === start && slot.endTime === end);
        if (foundSlot) {
          setSelectedTimeSlot(foundSlot.value);
        } else {
          setSelectedTimeSlot(`${start}-${end}`);
        }
      } else {
        setSelectedTimeSlot('');
      }
    }
  }, [classData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [name]: value
      }
    }));

    // Clear error when user starts typing
    if (errors[`schedule.${name}`]) {
      setErrors(prev => ({
        ...prev,
        [`schedule.${name}`]: ''
      }));
    }
  };

  const handleTimeSlotChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        timeSlots: {
          ...prev.schedule.timeSlots,
          [name]: value
        }
      }
    }));
  };

  const handleDayOfWeeksChange = (e) => {
    const { value } = e.target;
    setForm(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        dayOfWeeks: typeof value === 'string' ? value.split(',') : value
      }
    }));
  };

  const handleTimeSlotSelect = (timeSlotValue) => {
    setSelectedTimeSlot(timeSlotValue);
    const selectedSlot = timeSlotOptions.find(slot => slot.value === timeSlotValue);
    if (selectedSlot) {
      setForm(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          timeSlots: {
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime
          }
        }
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validate field on blur
    const error = validateField(field, form[field]);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const handleScheduleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [`schedule.${field}`]: true
    }));

    // Validate field on blur
    const error = validateField(`schedule.${field}`, form.schedule[field]);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [`schedule.${field}`]: error
      }));
    }
  };

  // Hàm tính toán trạng thái tự động dựa trên ngày
  const calculateStatus = (startDate, endDate) => {
    if (!startDate || !endDate) return 'upcoming';

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Đặt thời gian cho ngày bắt đầu và kết thúc
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (now < start) {
      return 'upcoming'; // Chưa đến ngày bắt đầu
    } else if (now >= start && now <= end) {
      return 'active'; // Trong thời gian học
    } else {
      return 'closed'; // Quá ngày kết thúc
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      // Prepare data for validation
      const validationData = {
        ...form,
        schedule: {
          ...form.schedule,
          timeSlots: {
            startTime: selectedTimeSlot.split(' - ')[0] || form.schedule.timeSlots.startTime,
            endTime: selectedTimeSlot.split(' - ')[1] || form.schedule.timeSlots.endTime
          }
        }
      };

      // Validate all fields
      const validationErrors = await validateClassData(validationData);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Format dates to yyyy/mm/dd format
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
      };
      let submitData;
      // Tính toán trạng thái tự động
      const autoStatus = calculateStatus(form.schedule.startDate, form.schedule.endDate);

      // Sắp xếp ngày học trong tuần theo thứ tự Thứ 2 -> Chủ nhật
      const sortedDays = [...form.schedule.dayOfWeeks].map(day => parseInt(day)).sort((a, b) => {
        // Thứ 2-7: 1-6, Chủ nhật: 0 (cuối cùng)
        if (a === 0) return 1;
        if (b === 0) return -1;
        return a - b;
      });

      if (classData) {
        // EDIT MODE: chỉ gửi đúng body update class
        submitData = {
          status: autoStatus, // Sử dụng trạng thái tự động
          feePerLesson: parseInt(form.feePerLesson),
          maxStudents: parseInt(form.maxStudents),
          description: form.description,
          room: form.room,
          schedule: {
            startDate: formatDate(form.schedule.startDate),
            endDate: formatDate(form.schedule.endDate),
            dayOfWeeks: sortedDays,
            timeSlots: {
              startTime: form.schedule.timeSlots.startTime,
              endTime: form.schedule.timeSlots.endTime
            }
          }
        };
      } else {
        // CREATE MODE: giữ nguyên như cũ
        submitData = {
          grade: form.grade,
          section: form.section,
          name: form.name,
          status: autoStatus, // Sử dụng trạng thái tự động
          feePerLesson: parseInt(form.feePerLesson),
          maxStudents: parseInt(form.maxStudents),
          description: form.description,
          room: form.room,
          schedule: {
            startDate: formatDate(form.schedule.startDate),
            endDate: formatDate(form.schedule.endDate),
            dayOfWeeks: sortedDays,
            timeSlots: {
              startTime: form.schedule.timeSlots.startTime,
              endTime: form.schedule.timeSlots.endTime
            }
          }
        };
      }
      if (onSubmit) {
        console.log('CALLING onSubmit in AddClassForm', submitData);
        onSubmit(submitData);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  return (
    <Box component="form" id={id || "class-form"} onSubmit={handleSubmit} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Khối"
            name="grade"
            value={form.grade}
            onChange={handleChange}
            onBlur={() => handleBlur('grade')}
            fullWidth
            required
            disabled={!!classData}
            error={!!errors.grade}
            helperText={errors.grade}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Lớp"
            name="section"
            value={form.section}
            onChange={handleChange}
            onBlur={() => handleBlur('section')}
            fullWidth
            required
            disabled={!!classData}
            error={!!errors.section}
            helperText={errors.section}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Tên lớp"
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            fullWidth
            required
            disabled={!!classData}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Khung giờ học</InputLabel>
            <Select
              name="timeSlot"
              value={selectedTimeSlot}
              onChange={(e) => handleTimeSlotSelect(e.target.value)}
              onBlur={() => handleScheduleBlur('timeSlots')}
              label="Khung giờ học"
              required
            >
              {timeSlotOptions.map(slot => (
                <MenuItem key={String(slot.value)} value={slot.value}>
                  {slot.label}
                </MenuItem>
              ))}
              {/* Nếu selectedTimeSlot không nằm trong options thì vẫn hiển thị */}
              {selectedTimeSlot && !timeSlotOptions.some(slot => slot.value === selectedTimeSlot) && (
                <MenuItem key={selectedTimeSlot} value={selectedTimeSlot}>
                  {(() => {
                    const [start, end] = selectedTimeSlot.split('-');
                    return `${start} - ${end}`;
                  })()}
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Học phí/buổi"
            name="feePerLesson"
            type="number"
            value={form.feePerLesson}
            onChange={handleChange}
            onBlur={() => handleBlur('feePerLesson')}
            fullWidth
            required
            error={!!errors.feePerLesson}
            helperText={errors.feePerLesson}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Số học sinh tối đa"
            name="maxStudents"
            type="number"
            value={form.maxStudents}
            onChange={handleChange}
            onBlur={() => handleBlur('maxStudents')}
            fullWidth
            required
            error={!!errors.maxStudents}
            helperText={errors.maxStudents}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Phòng học"
            name="room"
            value={form.room}
            onChange={handleChange}
            onBlur={() => handleBlur('room')}
            fullWidth
            required
            error={!!errors.room}
            helperText={errors.room}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Ngày bắt đầu"
            name="startDate"
            type="date"
            value={form.schedule.startDate}
            onChange={handleScheduleChange}
            onBlur={() => handleScheduleBlur('startDate')}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
            error={!!errors['schedule.startDate']}
            helperText={errors['schedule.startDate']}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Ngày kết thúc"
            name="endDate"
            type="date"
            value={form.schedule.endDate}
            onChange={handleScheduleChange}
            onBlur={() => handleScheduleBlur('endDate')}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
            error={!!errors['schedule.endDate']}
            helperText={errors['schedule.endDate']}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors['schedule.dayOfWeeks']}>
            <InputLabel>Ngày học trong tuần</InputLabel>
            <Select
              multiple
              name="dayOfWeeks"
              value={form.schedule.dayOfWeeks}
              onChange={handleDayOfWeeksChange}
              onBlur={() => handleScheduleBlur('dayOfWeeks')}
              input={<OutlinedInput label="Ngày học trong tuần" />}
              renderValue={(selected) => selected.map(val => daysOfWeek.find(d => d.value === val)?.label).join(', ')}
            >
              {daysOfWeek.map(day => (
                <MenuItem key={String(day.value)} value={day.value}>
                  <Checkbox checked={form.schedule.dayOfWeeks.indexOf(day.value) > -1} />
                  <ListItemText primary={day.label} />
                </MenuItem>
              ))}
            </Select>
            {errors['schedule.dayOfWeeks'] && <FormHelperText>{errors['schedule.dayOfWeeks']}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Mô tả"
            name="description"
            value={form.description}
            onChange={handleChange}
            onBlur={() => handleBlur('description')}
            fullWidth
            multiline
            rows={2}
            error={!!errors.description}
            helperText={errors.description}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddClassForm;
