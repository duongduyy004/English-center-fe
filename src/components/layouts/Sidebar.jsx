import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, Tooltip, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import GroupIcon from '@mui/icons-material/Group';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PaymentIcon from '@mui/icons-material/Payment';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../utils/colors';

const drawerWidth = 220;
const miniWidth = 72;

const getMenuItemsByRole = (role) => {
  switch (role) {
    case 'admin':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/admin/dashboard' },
        { text: 'Quản lý học viên', icon: <SchoolIcon />, path: '/admin/students' },
        { text: 'Quản lý giáo viên', icon: <GroupIcon />, path: '/admin/teachers' },
        { text: 'Quản lý lớp học', icon: <ClassIcon />, path: '/admin/classes' },
        { text: 'Quản lý phụ huynh', icon: <FamilyRestroomIcon />, path: '/admin/parents' },
        { text: 'Quản lý quảng cáo', icon: <CampaignIcon />, path: '/admin/advertisements' },
        { text: 'Thống kê', icon: <AssessmentIcon />, path: '/admin/statistics' },
      ];
    case 'teacher':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/teacher/dashboard' },
        { text: 'Lịch dạy', icon: <ClassIcon />, path: '/teacher/schedule' },
        { text: 'Lớp học của tôi', icon: <SchoolIcon />, path: '/teacher/classes' },
        { text: 'Lương', icon: <PaymentIcon />, path: '/teacher/salary' },
      ];
    case 'student':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/student/dashboard' },
        { text: 'Lịch học', icon: <ClassIcon />, path: '/student/schedule' },
        { text: 'Lớp học của tôi', icon: <SchoolIcon />, path: '/student/classes' },
      ];
    case 'parent':
      return [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/parent/dashboard' },
        { text: 'Con em', icon: <SchoolIcon />, path: '/parent/children' },
        { text: 'Thanh toán', icon: <PaymentIcon />, path: '/parent/payments' },
      ];
    default:
      return [
        { text: 'Trang chủ', icon: <HomeIcon />, path: '/' },
        { text: 'Khám phá', icon: <ExploreIcon />, path: '/explore' },
        { text: 'Kênh đăng ký', icon: <SubscriptionsIcon />, path: '/subscriptions' },
        { text: 'Thư viện', icon: <VideoLibraryIcon />, path: '/library' },
        { text: 'Lịch sử', icon: <HistoryIcon />, path: '/history' },
      ];
  }
};

const Sidebar = ({ open }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || 'student';
  const menuItems = getMenuItemsByRole(role);

      return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : miniWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : miniWidth,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          bgcolor: '#fff',
          borderRight: '1px solid #eee',
        },
      }}
    >
      <Box sx={{ mt: 8 }}>
        <List>
          {menuItems.map((item) => (
            <Tooltip key={item.text} title={!open ? item.text : ''} placement="right" arrow>
              <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
              sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    borderRadius: 2,
                    my: 0.5,
                    transition: 'background 0.2s',
                '&.Mui-selected': {
                      bgcolor: '#f5f5f5',
                      color: COLORS.primary.main,
                      '&:hover': {
                        bgcolor: '#eeeeee',
                      }
                    },
                '&:hover': {
                      bgcolor: '#f9f9f9',
                    },
                '&:focus': {
                      bgcolor: 'transparent',
                    },
                '&.Mui-focusVisible': {
                      bgcolor: 'transparent',
                    },
              }}
            >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: location.pathname === item.path ? COLORS.primary.main : 'inherit',
                    }}
                  >
                    {item.icon}
                    </ListItemIcon>
                  {open && <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />}
                  </ListItemButton>
                </ListItem>
            </Tooltip>
              ))}
            </List>
      </Box>
      <Divider />
      </Drawer>
  );
};

export default Sidebar;
