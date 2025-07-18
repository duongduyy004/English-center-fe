import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Card, CardMedia, Box, Typography, IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

// Custom arrow components, perfectly circular and icon centered
const NextArrow = (props) => {
  const { style, onClick } = props;
  return (
    <IconButton
      style={{
        ...style,
        right: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        background: 'rgba(255,255,255,0.8)',
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: '50%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        color: '#333',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClick}
      aria-label="next"
    >
      <ArrowForwardIos fontSize="medium" />
    </IconButton>
  );
};

const PrevArrow = (props) => {
  const { style, onClick } = props;
  return (
    <IconButton
      style={{
        ...style,
        left: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        background: 'rgba(255,255,255,0.8)',
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: '50%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        color: '#333',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClick}
      aria-label="previous"
    >
      <ArrowBackIos fontSize="medium" />
    </IconButton>
  );
};

const AdvertisementSlider = ({ autoPlay = true, interval = 8000, ads }) => {
  if (!ads || ads.length === 0) return null;

  // Sắp xếp theo priority tăng dần (priority nhỏ hơn là ưu tiên hơn), cùng priority thì createdAt tăng dần, lấy tối đa 5 quảng cáo
  const sortedAds = [...ads]
    .sort((a, b) => {
      if ((a.priority ?? 0) !== (b.priority ?? 0)) {
        return (a.priority ?? 0) - (b.priority ?? 0); // priority nhỏ hơn lên trước
      }
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateA - dateB;
    })
    .slice(0, 5);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: autoPlay,
    autoplaySpeed: interval,
    cssEase: 'ease',
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Slider {...settings}>
        {sortedAds.map((ad, idx) => (
          <Box key={ad.id || idx} sx={{ position: 'relative', height: 550, overflow: 'hidden' }}>
            <Card
              sx={{
                height: '100%',
                position: 'relative',
                cursor: 'pointer',
                borderRadius: 0,
                overflow: 'hidden',
              }}
            >
              <CardMedia
                component="img"
                height="100%"
                image={ad.imageUrl || ad.image}
                alt={ad.title}
                sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: 'white', p: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {ad.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                  {ad.content || ad.description}
                </Typography>
              </Box>
            </Card>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default AdvertisementSlider;
