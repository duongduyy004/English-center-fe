import * as Yup from 'yup';

// Schema validation cho tạo lớp học mới
export const createClassValidationSchema = Yup.object().shape({
  grade: Yup.number()
    .required('Khối là bắt buộc')
    .typeError('Khối phải là số')
    .min(1, 'Khối phải lớn hơn 0')
    .max(12, 'Khối không được quá 12'),

  section: Yup.number()
    .required('Lớp là bắt buộc')
    .typeError('Lớp phải là số')
    .min(1, 'Lớp phải lớn hơn 0')
    .max(50, 'Lớp không được quá 50'),

  name: Yup.string()
    .required('Tên lớp là bắt buộc')
    .min(2, 'Tên lớp phải có ít nhất 2 ký tự')
    .max(50, 'Tên lớp không được quá 50 ký tự'),

  year: Yup.number()
    .required('Năm học là bắt buộc')
    .typeError('Năm học phải là số')
    .min(new Date().getFullYear() - 5, 'Năm học không được quá 5 năm trước')
    .max(new Date().getFullYear() + 5, 'Năm học không được quá 5 năm sau'),

  feePerLesson: Yup.number()
    .required('Học phí mỗi buổi là bắt buộc')
    .typeError('Học phí phải là số')
    .min(1, 'Học phí phải lớn hơn 0')
    .max(10000000, 'Học phí không được quá 10 triệu VNĐ'),

  maxStudents: Yup.number()
    .required('Số học sinh tối đa là bắt buộc')
    .typeError('Số học sinh tối đa phải là số')
    .min(1, 'Số học sinh tối đa phải lớn hơn 0')
    .max(100, 'Số học sinh tối đa không được quá 100'),

  room: Yup.string()
    .required('Phòng học là bắt buộc')
    .min(1, 'Phòng học phải có ít nhất 1 ký tự')
    .max(20, 'Phòng học không được quá 20 ký tự'),

  description: Yup.string()
    .max(500, 'Mô tả không được quá 500 ký tự'),

  schedule: Yup.object().shape({
    startDate: Yup.string()
      .required('Ngày bắt đầu là bắt buộc')
      .test('is-valid-date', 'Ngày bắt đầu không hợp lệ', function(value) {
        if (!value) return false;
        const date = new Date(value);
        return !isNaN(date.getTime());
      }),

    endDate: Yup.string()
      .required('Ngày kết thúc là bắt buộc')
      .test('is-valid-date', 'Ngày kết thúc không hợp lệ', function(value) {
        if (!value) return false;
        const date = new Date(value);
        return !isNaN(date.getTime());
      })
      .test('is-after-start', 'Ngày kết thúc phải sau ngày bắt đầu', function(value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;
        return new Date(value) > new Date(startDate);
      }),

    dayOfWeeks: Yup.array()
      .of(Yup.number().min(0).max(6))
      .min(1, 'Phải chọn ít nhất 1 ngày học trong tuần')
      .max(7, 'Không được chọn quá 7 ngày'),

    timeSlots: Yup.object().shape({
      // BỎ validate cho startTime và endTime
    })
  })
});

// Schema validation cho cập nhật lớp học
export const updateClassValidationSchema = Yup.object().shape({
  feePerLesson: Yup.number()
    .required('Học phí mỗi buổi là bắt buộc')
    .typeError('Học phí phải là số')
    .min(1, 'Học phí phải lớn hơn 0')
    .max(10000000, 'Học phí không được quá 10 triệu VNĐ'),

  maxStudents: Yup.number()
    .required('Số học sinh tối đa là bắt buộc')
    .typeError('Số học sinh tối đa phải là số')
    .min(1, 'Số học sinh tối đa phải lớn hơn 0')
    .max(100, 'Số học sinh tối đa không được quá 100'),

  room: Yup.string()
    .required('Phòng học là bắt buộc')
    .min(1, 'Phòng học phải có ít nhất 1 ký tự')
    .max(20, 'Phòng học không được quá 20 ký tự'),

  description: Yup.string()
    .max(500, 'Mô tả không được quá 500 ký tự'),

  schedule: Yup.object().shape({
    startDate: Yup.string()
      .required('Ngày bắt đầu là bắt buộc')
      .test('is-valid-date', 'Ngày bắt đầu không hợp lệ', function(value) {
        if (!value) return false;
        const date = new Date(value);
        return !isNaN(date.getTime());
      }),

    endDate: Yup.string()
      .required('Ngày kết thúc là bắt buộc')
      .test('is-valid-date', 'Ngày kết thúc không hợp lệ', function(value) {
        if (!value) return false;
        const date = new Date(value);
        return !isNaN(date.getTime());
      })
      .test('is-after-start', 'Ngày kết thúc phải sau ngày bắt đầu', function(value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;
        return new Date(value) > new Date(startDate);
      }),

    dayOfWeeks: Yup.array()
      .of(Yup.number().min(0).max(6))
      .min(1, 'Phải chọn ít nhất 1 ngày học trong tuần')
      .max(7, 'Không được chọn quá 7 ngày'),

    timeSlots: Yup.object().shape({
      // BỎ validate cho startTime và endTime
    })
  })
});

// Hàm validate form data
export const validateClassData = async (data, isUpdate = false) => {
  try {
    const schema = isUpdate ? updateClassValidationSchema : createClassValidationSchema;
    await schema.validate(data, { abortEarly: false });
    return {}; // Không có lỗi
  } catch (error) {
    const errors = {};
    error.inner.forEach((err) => {
      errors[err.path] = err.message;
    });
    return errors;
  }
};

// Hàm validate từng trường
export const validateField = (fieldName, value, isUpdate = false) => {
  try {
    const schema = isUpdate ? updateClassValidationSchema : createClassValidationSchema;

    // Xử lý các trường nested
    if (fieldName.includes('.')) {
      const [parent, child] = fieldName.split('.');
      const testData = { [parent]: { [child]: value } };
      schema.validateSyncAt(fieldName, testData);
    } else {
      schema.validateSyncAt(fieldName, { [fieldName]: value });
    }

    return null; // Không có lỗi
  } catch (error) {
    return error.message;
  }
};

// Hàm validate schedule
export const validateSchedule = async (schedule, isUpdate = false) => {
  try {
    const schema = isUpdate ? updateClassValidationSchema : createClassValidationSchema;
    await schema.validateAt('schedule', { schedule });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.inner.forEach((err) => {
      if (err.path.startsWith('schedule.')) {
        errors[err.path.replace('schedule.', '')] = err.message;
      }
    });
    return { isValid: false, errors };
  }
};

// Hàm kiểm tra xung đột lịch học
export const checkScheduleConflict = (newSchedule, existingSchedules, excludeClassId = null) => {
  const conflicts = [];

  existingSchedules.forEach(existingClass => {
    if (excludeClassId && existingClass.id === excludeClassId) return;

    const existingSchedule = existingClass.schedule;
    if (!existingSchedule) return;

    // Kiểm tra xung đột ngày học
    const commonDays = newSchedule.dayOfWeeks.filter(day =>
      existingSchedule.dayOfWeeks.includes(day)
    );

    if (commonDays.length > 0) {
      // Kiểm tra xung đột thời gian
      const newStart = new Date(`2000-01-01T${newSchedule.timeSlots.startTime}`);
      const newEnd = new Date(`2000-01-01T${newSchedule.timeSlots.endTime}`);
      const existingStart = new Date(`2000-01-01T${existingSchedule.timeSlots.startTime}`);
      const existingEnd = new Date(`2000-01-01T${existingSchedule.timeSlots.endTime}`);

      // Kiểm tra xung đột phòng học
      if (newSchedule.room === existingSchedule.room) {
        // Kiểm tra xung đột thời gian
        if (
          (newStart < existingEnd && newEnd > existingStart) ||
          (existingStart < newEnd && existingEnd > newStart)
        ) {
          conflicts.push({
            classId: existingClass.id,
            className: existingClass.name,
            conflictType: 'time_and_room',
            message: `Xung đột lịch học với lớp ${existingClass.name} (${existingSchedule.room})`
          });
        }
      }
    }
  });

  return conflicts;
};

// Hàm format validation errors
export const formatValidationErrors = (errors) => {
  const formattedErrors = {};

  Object.keys(errors).forEach(key => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      if (!formattedErrors[parent]) {
        formattedErrors[parent] = {};
      }
      formattedErrors[parent][child] = errors[key];
    } else {
      formattedErrors[key] = errors[key];
    }
  });

  return formattedErrors;
};
