// Validate email
export function validateEmail(email) {
  if (!email) return 'Email không được để trống';
  const re = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!re.test(email)) return 'Email không hợp lệ';
  return '';
}

// Validate phone (Việt Nam, 10 số, bắt đầu bằng 0)
export function validatePhone(phone) {
  if (!phone) return 'Số điện thoại không được để trống';
  const re = /^0\d{9}$/;
  if (!re.test(phone)) return 'Số điện thoại không hợp lệ';
  return '';
}

// Validate dayOfBirth (dd/mm/yyyy)
export function validateDayOfBirth(dayOfBirth) {
  if (!dayOfBirth) return 'Ngày sinh không được để trống';
  const re = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  if (!re.test(dayOfBirth)) return 'Ngày sinh phải có định dạng dd/mm/yyyy';
  // Kiểm tra ngày thực tế
  const [dd, mm, yyyy] = dayOfBirth.split('/').map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return 'Ngày sinh không hợp lệ';
  // Ngày sinh phải nhỏ hơn ngày hiện tại
  const today = new Date();
  if (d >= today) return 'Ngày sinh phải nhỏ hơn ngày hiện tại';
  return '';
}

// Validate address
export function validateAddress(address) {
  if (!address) return 'Địa chỉ không được để trống';
  if (address.length < 3) return 'Địa chỉ quá ngắn';
  return '';
}

// Validate gender
export function validateGender(gender) {
  if (!gender) return 'Vui lòng chọn giới tính';
  if (!['male', 'female'].includes(gender)) return 'Giới tính không hợp lệ';
  return '';
}

// Validate name
export function validateName(name) {
  if (!name) return 'Họ và tên không được để trống';
  if (name.length < 2) return 'Họ và tên quá ngắn';
  return '';
}

// Validate password (tối thiểu 8 ký tự, gồm cả chữ và số)
export function validatePassword(password) {
  if (!password) return 'Mật khẩu không được để trống';
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Mật khẩu phải bao gồm cả chữ và số';
  return '';
}

// Validate discount code (giá trị từ 0 đến 100)
export function validateDiscountCode(discount) {
  if (discount === undefined || discount === null || discount === '') return 'Mã giảm giá không được để trống';
  if (isNaN(discount)) return 'Mã giảm giá phải là số';
  const value = Number(discount);
  if (value < 0 || value > 100) return 'Mã giảm giá chỉ cho phép từ 0 đến 100';
  return '';
}

// Validate đổi mật khẩu
export function validateChangePassword({ current, newPassword, confirm }) {
  const errors = {};
  if (!current) errors.current = 'Vui lòng nhập mật khẩu hiện tại';
  if (!newPassword) errors.newPassword = 'Vui lòng nhập mật khẩu mới';
  else if (newPassword.length < 8) errors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự';
  else if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) errors.newPassword = 'Mật khẩu mới phải bao gồm cả chữ và số';
  if (!confirm) errors.confirm = 'Vui lòng xác nhận mật khẩu mới';
  else if (newPassword !== confirm) errors.confirm = 'Mật khẩu xác nhận không khớp';
  return errors;
}
