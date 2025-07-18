export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Quản trị viên',
  [USER_ROLES.TEACHER]: 'Giáo viên',
  [USER_ROLES.STUDENT]: 'Học sinh',
  [USER_ROLES.PARENT]: 'Phụ huynh',
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'manage_classes',
    'manage_teachers',
    'manage_students',
    'manage_parents',
    'view_statistics',
    'manage_announcements',
    'manage_fees',
    'manage_attendance'
  ],
  [USER_ROLES.TEACHER]: [
    'view_my_classes',
    'mark_attendance',
    'view_student_list',
    'view_schedule'
  ],
  [USER_ROLES.STUDENT]: [
    'view_my_class',
    'view_attendance',
    'view_schedule'
  ],
  [USER_ROLES.PARENT]: [
    'view_child_info',
    'view_child_attendance',
    'view_fees',
    'make_payment',
    'view_schedule'
  ]
};
