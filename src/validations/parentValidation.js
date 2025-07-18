import { validateEmail, validatePhone, validateDayOfBirth, validateAddress, validateGender, validateName, validatePassword, validateChangePassword } from './commonValidation';

// Có thể mở rộng thêm nếu cần validate riêng cho parent

// Validate toàn bộ form phụ huynh
export function validateParent(form) {
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
  return errors;
}

export { validateChangePassword };
