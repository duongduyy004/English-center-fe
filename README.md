# English Center Management System

Hệ thống quản lý trung tâm tiếng Anh được xây dựng với React + Vite và Material-UI.

## Tính năng chính

### Quản trị viên (Admin)

- ✅ Dashboard tổng quan với thống kê
- 🔧 Quản lý lớp học (tạo, đóng, mở lớp theo năm học)
- 🔧 Quản lý giáo viên
- 🔧 Quản lý học sinh và điểm danh
- 🔧 Quản lý phụ huynh
- 🔧 Quản lý học phí và thanh toán
- 🔧 Thông báo và quảng cáo
- 🔧 Thống kê doanh thu và enrollment

### Giáo viên (Teacher)

- ✅ Dashboard cá nhân
- 🔧 Xem danh sách lớp đang dạy
- 🔧 Điểm danh học sinh
- 🔧 Xem lịch dạy và số buổi đã dạy

### Học sinh (Student)

- ✅ Dashboard cá nhân
- 🔧 Xem thông tin lớp học
- 🔧 Xem lịch sử điểm danh
- 🔧 Xem lịch học

### Phụ huynh (Parent)

- ✅ Dashboard cá nhân
- 🔧 Theo dõi thông tin con em
- 🔧 Xem điểm danh và lịch học
- 🔧 Xem học phí và thanh toán
- 🔧 Nhận thông báo từ trung tâm

## Công nghệ sử dụng

- **Frontend**: React 19 + Vite
- **UI Framework**: Material-UI (MUI)
- **Routing**: React Router v6
- **State Management**: React Context
- **Form Handling**: Custom useForm hook
- **Date Handling**: Day.js
- **Slider/Carousel**: Swiper.js
- **Charts**: Recharts
- **HTTP Client**: Axios

## Cấu trúc dự án

```
src/
├── components/           # Các component tái sử dụng
│   ├── common/          # Component chung
│   └── layout/          # Layout components
├── pages/               # Các trang theo role
│   ├── admin/           # Trang admin
│   ├── teacher/         # Trang giáo viên
│   ├── student/         # Trang học sinh
│   ├── parent/          # Trang phụ huynh
│   ├── auth/            # Trang đăng nhập
│   └── home/            # Trang chủ
├── contexts/            # React Context
├── services/            # API services
├── utils/               # Utility functions
├── hooks/               # Custom hooks
└── constants/           # Hằng số và enums
```

## Cài đặt và chạy

1. Clone project:

```bash
git clone [repository-url]
cd English-Center-FE
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Chạy development server:

```bash
npm run dev
```

4. Mở trình duyệt tại http://localhost:5173

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Kiểm tra ESLint

## Yêu cầu hệ thống

- Node.js 16+
- npm hoặc yarn
- Trình duyệt hiện đại (Chrome, Firefox, Safari, Edge)

## Roadmap

- [ ] Hoàn thiện tất cả các module quản lý
- [ ] Tích hợp backend API
- [ ] Thêm real-time notifications
- [ ] Mobile responsive optimization
- [ ] PWA support
- [ ] Backup và restore data
- [ ] Multi-language support

## Đóng góp

1. Fork project
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request
