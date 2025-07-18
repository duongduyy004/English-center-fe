import { validateEmail, validatePhone, validateDayOfBirth, validateAddress, validateGender, validateName, validatePassword, validateChangePassword } from './commonValidation';

// Có thể mở rộng thêm nếu cần validate riêng cho teacher

// Validate toàn bộ form giáo viên
export function validateTeacher(form) {
  const errors = {};
  const nameError = validateName(form.name);
  if (nameError) errors.name = nameError;
  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;
  const phoneError = validatePhone(form.phone);
  if (phoneError) errors.phone = phoneError;
  const dobError = validateDayOfBirth(form.dayOfBirth);
  if (dobError) errors.dayOfBirth = dobError;
  const addressError = validateAddress(form.address);
  if (addressError) errors.address = addressError;
  const genderError = validateGender(form.gender);
  if (genderError) errors.gender = genderError;

  // Validate salaryPerLesson (>=0)
  if (form.salaryPerLesson === undefined || form.salaryPerLesson === null || form.salaryPerLesson === '') {
    errors.salaryPerLesson = 'Lương không được để trống';
  } else if (isNaN(form.salaryPerLesson) || Number(form.salaryPerLesson) < 0) {
    errors.salaryPerLesson = 'Lương phải là số lớn hơn hoặc bằng 0';
  }

  // Validate qualifications, specialization, description (không được để trống)
  if (!form.qualifications || form.qualifications.trim() === '') {
    errors.qualifications = 'Bằng cấp không được để trống';
  }
  if (!form.specialization || form.specialization.trim() === '') {
    errors.specialization = 'Chuyên môn không được để trống';
  }
  if (!form.description || form.description.trim() === '') {
    errors.description = 'Mô tả không được để trống';
  }

  return errors;
}

export {
  validateEmail,
  validatePhone,
  validateDayOfBirth,
  validateAddress,
  validateGender,
  validateName,
  validatePassword,
  validateChangePassword,
};
