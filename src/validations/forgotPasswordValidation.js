import { validateEmail, validatePassword } from './commonValidation';

export function validateOtpCode(otpCode) {
  if (!otpCode) return 'Vui lòng nhập mã OTP';
  if (!/^[0-9]{6}$/.test(otpCode)) return 'Mã OTP phải gồm 6 chữ số';
  return '';
}

export function validateForgotPassword({ email, password, confirmPassword, otpCode }) {
  const errors = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  if (otpCode !== undefined) {
    const otpError = validateOtpCode(otpCode);
    if (otpError) errors.otpCode = otpError;
  }
  if (confirmPassword !== undefined) {
    if (!confirmPassword) errors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
    else if (password !== confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
  }
  return errors;
}
