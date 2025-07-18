import React from 'react';
import { Dialog, IconButton, Box, Card, CardMedia, CardContent, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const WelcomeAdPopup = ({ open, onClose, ads }) => {
  if (!ads || !Array.isArray(ads) || ads.length === 0) return null;
  // Chọn quảng cáo có priority nhỏ nhất, nếu cùng priority thì lấy createdAt sớm nhất
  const welcomeAd = [...ads].sort((a, b) => {
    if ((a.priority ?? 0) !== (b.priority ?? 0)) {
      return (a.priority ?? 0) - (b.priority ?? 0);
    }
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateA - dateB;
  })[0];
  if (!welcomeAd) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
        },
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          animation: 'welcomeSlideIn 0.6s ease-out',
          '@keyframes welcomeSlideIn': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.8) translateY(-50px)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)',
            },
          },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: -10,
            top: -10,
            zIndex: 10,
            bgcolor: 'error.main',
            color: 'white',
            width: 40,
            height: 40,
            '&:hover': {
              bgcolor: 'error.dark',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s'
          }}
        >
          <CloseIcon />
        </IconButton>

        <Card
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 8,
            border: '3px solid',
            borderColor: 'primary.main',
            position: 'relative'
          }}
        >
          <CardMedia
            component="img"
            height="400"
            image={welcomeAd.imageUrl || welcomeAd.image}
            alt={welcomeAd.title}
            sx={{
              filter: 'brightness(0.8)',
            }}
          />

          {/* Overlay for text */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              color: 'white',
              p: 3
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              fontWeight="bold"
              sx={{ color: 'white' }}
            >
              {welcomeAd.title}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.9)'
              }}
            >
              {welcomeAd.content || welcomeAd.description}
            </Typography>
          </Box>
        </Card>

        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -20,
            right: -20,
            width: 60,
            height: 60,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            opacity: 0.1,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', opacity: 0.1 },
              '50%': { transform: 'scale(1.2)', opacity: 0.2 },
              '100%': { transform: 'scale(1)', opacity: 0.1 },
            },
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            top: -15,
            right: 30,
            width: 30,
            height: 30,
            borderRadius: '50%',
            bgcolor: 'secondary.main',
            opacity: 0.2,
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-10px)' },
            },
          }}
        />
      </Box>
    </Dialog>
  );
};

export default WelcomeAdPopup;
