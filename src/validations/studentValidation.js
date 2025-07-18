import { validateEmail, validatePhone, validateDayOfBirth, validateAddress, validateGender, validateName, validatePassword, validateDiscountCode, validateChangePassword } from './commonValidation';

// Có thể mở rộng thêm nếu cần validate riêng cho student

// Validate toàn bộ form học sinh (bao gồm cả discountPercent cho từng lớp)
export function validateStudent(form, isEdit = false, classEdits = []) {
  const errors = {};
  if (!isEdit) {
    // Khi thêm mới, validate password
    const passwordError = validatePassword(form.password);
    if (passwordError) errors.password = passwordError;
  }
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

  // Validate discountPercent cho từng classEdits (nếu có)
  if (Array.isArray(classEdits)) {
    errors.classEdits = classEdits.map((cls, idx) => {
      const discountError = validateDiscountCode(cls.discountPercent);
      return discountError ? { discountPercent: discountError } : null;
    });
  }

  return errors;
}

export { validateChangePassword };
