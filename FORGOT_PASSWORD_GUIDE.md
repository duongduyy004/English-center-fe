# Hướng dẫn sử dụng chức năng Quên mật khẩu

## Tổng quan

Chức năng quên mật khẩu đã được tích hợp vào hệ thống English Center với 3 bước chính:

1. Nhập email
2. Xác thực mã
3. Đặt lại mật khẩu

## Các API đã được thêm

### 1. Forgot Password API

- **Endpoint**: `POST /api/v1/auth/forgot-password`
- **Body**: `email` (urlencoded)
- **Chức năng**: Gửi mã xác thực đến email

### 2. Verify Code API

- **Endpoint**: `POST /api/v1/auth/verify-code`
- **Body**: `code`, `email` (urlencoded)
- **Chức năng**: Xác thực mã code

### 3. Reset Password API

- **Endpoint**: `POST /api/v1/auth/reset-password?token={token}`
- **Body**: `password` (urlencoded)
- **Chức năng**: Đặt lại mật khẩu mới

## Cải tiến giao diện

### 1. Bỏ màu xanh autocomplete

- Đã thêm CSS global để loại bỏ màu xanh khi browser tự động điền thông tin
- Áp dụng cho tất cả input fields trong hệ thống

### 2. Giao diện đăng nhập

- Nút "Quên mật khẩu?" đã được thêm vào trang đăng nhập
- Hover effect và styling đã được cải thiện

### 3. Trang quên mật khẩu

- Giao diện 3 bước rõ ràng
- Validation đầy đủ cho từng bước
- Thông báo lỗi chi tiết
- Loading states
- Chức năng gửi lại mã

## Cách sử dụng

1. **Từ trang đăng nhập**: Click vào "Quên mật khẩu?"
2. **Nhập email**: Nhập email đã đăng ký trong hệ thống
3. **Xác thực mã**: Nhập mã 6 số được gửi đến email
4. **Đặt lại mật khẩu**: Nhập mật khẩu mới và xác nhận
5. **Hoàn thành**: Quay lại trang đăng nhập với mật khẩu mới

## Lưu ý kỹ thuật

- Tất cả API calls sử dụng format `urlencoded` như yêu cầu của backend
- Token được xử lý tự động từ response của verify code API
- Validation được thực hiện ở cả frontend và backend
- Error handling đầy đủ với thông báo chi tiết

## Files đã được cập nhật

1. `src/pages/auth/Login.jsx` - Thêm nút quên mật khẩu và bỏ màu xanh autocomplete
2. `src/pages/auth/ForgotPassword.jsx` - Tạo trang quên mật khẩu hoàn chỉnh
3. `src/services/api.js` - Thêm các API auth mới
4. `src/config/api.js` - Thêm endpoints mới
5. `src/App.jsx` - Thêm route cho trang quên mật khẩu
6. `src/index.css` - Thêm CSS global để bỏ màu xanh autocomplete
