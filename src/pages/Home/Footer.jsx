import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { Facebook as FacebookIcon, Twitter as TwitterIcon, Instagram as InstagramIcon, YouTube as YouTubeIcon,
    Phone as PhoneIcon, Email as EmailIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { COLORS } from '../../utils/colors';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    about: [
      { label: 'Về chúng tôi', href: '/about' },
      { label: 'Đội ngũ giảng viên', href: '/teachers' },
      { label: 'Cơ sở vật chất', href: '/facilities' },
      { label: 'Tuyển dụng', href: '/careers' },
    ],
    courses: [
      { label: 'Tiếng Anh Giao Tiếp', href: '/courses/communication' },
      { label: 'Luyện Thi IELTS', href: '/courses/ielts' },
      { label: 'Tiếng Anh Doanh Nghiệp', href: '/courses/business' },
      { label: 'Tiếng Anh Trẻ Em', href: '/courses/kids' },
    ],
    support: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Chính sách bảo mật', href: '/privacy' },
      { label: 'Điều khoản sử dụng', href: '/terms' },
      { label: 'Liên hệ', href: '/contact' },
    ],
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo và thông tin liên hệ */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              English Center
            </Typography>
            <Typography variant="body2" color="grey.400" paragraph>
              Trung tâm đào tạo tiếng Anh hàng đầu với đội ngũ giảng viên chuyên nghiệp và phương pháp giảng dạy hiện đại.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={{ mr: 1, color: COLORS.primary }} />
                <Typography variant="body2">(84) 123-456-789</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ mr: 1, color: COLORS.primary }} />
                <Typography variant="body2">info@englishcenter.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1, color: COLORS.primary }} />
                <Typography variant="body2">
                  123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Links */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" gutterBottom>
                  Về chúng tôi
                </Typography>
                {footerLinks.about.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    color="inherit"
                    display="block"
                    sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: COLORS.primary } }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" gutterBottom>
                  Khóa học
                </Typography>
                {footerLinks.courses.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    color="inherit"
                    display="block"
                    sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: COLORS.primary } }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" gutterBottom>
                  Hỗ trợ
                </Typography>
                {footerLinks.support.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    color="inherit"
                    display="block"
                    sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: COLORS.primary } }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'grey.800' }} />

        {/* Social media và copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="grey.400">
            © {currentYear} English Center. All rights reserved.
          </Typography>
          <Box sx={{ mt: { xs: 2, sm: 0 } }}>
            <IconButton color="inherit" aria-label="Facebook">
              <FacebookIcon />
            </IconButton>
            <IconButton color="inherit" aria-label="Twitter">
              <TwitterIcon />
            </IconButton>
            <IconButton color="inherit" aria-label="Instagram">
              <InstagramIcon />
            </IconButton>
            <IconButton color="inherit" aria-label="YouTube">
              <YouTubeIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
