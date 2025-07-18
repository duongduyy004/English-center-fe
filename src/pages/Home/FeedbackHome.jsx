import React, { useRef, useState } from 'react';
import Slider from 'react-slick';
import { Card, CardContent, Avatar, Typography, Box, Button, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const feedbacks = [
  {
    img: 'https://langmaster.edu.vn/storage/images/student-testimonial/1713956055-Chị Thuý (1).webp',
    alt: 'Nguyễn Thuý',
    name: 'Nguyễn Thuý',
    content: 'Trong sự kiện Martech Summit Asia được tổ chức tại Singapore , anh Tony Dũng - Founder TAGT Langmaster đã tình cờ gặp lại và có buổi phỏng vấn trực tiếp với chị Thúy (Global Marketing Executive)- cựu học viên của trung tâm. Với nền tảng tiếng Anh vững chắc từ khi còn học ở Langmaster, con đường sự nghiệp và phát triển bản thân của chị Thuý đã phát triển rất xa và hiện...',
    socialLink: 'https://www.facebook.com/Tienganhgiaotieplangmaster/videos/473629661808715/',
    socialType: 'svg',
    socialIcon: null,
  },
  {
    img: 'https://langmaster.edu.vn/storage/images/student-testimonial/1728017242-Ảnh màn hình 2024-10-04 lúc 11.webp',
    alt: 'Lý Vương Thảo',
    name: 'Lý Vương Thảo',
    content: 'Chị Thảo hiện đang là giảng viên luật tại Đại học Ngoại thương, đã có một hành trình học tiếng Anh đáng ngưỡng mộ cùng Langmaster. Sau khi hoàn thành khóa học, chị không chỉ nâng cao khả năng tiếng Anh mà còn trở thành huấn luyện viên và trợ giảng tại Langmaster, tiếp tục phát triển bản thân và đạt được điểm IELTS 7.5 ấn tượng. Nhờ vào sự nỗ lực không ngừng và nền tản...',
    socialLink: 'https://www.youtube.com/watch?v=swE1JrEZyAs&list=PLxc4V8jyRl2fPgPOKX3qSI1hHFsIYE6Je&index=7',
    socialType: 'img',
    socialIcon: '/images/youtube.png',
  },
  {
    img: 'https://langmaster.edu.vn/storage/images/student-testimonial/1728017221-Seeding 1 ảnh.webp',
    alt: 'Ms. Diệu Hoa',
    name: 'Ms. Diệu Hoa',
    content: 'Hơn 10 năm làm việc tại Langmaster đã giúp chị phát triển bản thân vượt bậc. Tại đây, chị học được bài học quý giá về việc làm mọi thứ với "100% OR NOTHING". Chính phương châm này đã giúp chị thành công và được thăng tiến. Langmaster còn là nơi chị rèn luyện khả năng quan sát, phân tích, và không ngừng phát triển bản thân, biến chị từ một cô sinh viên nhút nhát thành...',
    socialLink: 'https://youtu.be/zaf8i5UoB08?si=31E0SuJKLPYUl2bV',
    socialType: 'img',
    socialIcon: '/images/youtube.png',
  },
  {
    img: 'https://langmaster.edu.vn/storage/images/student-testimonial/1713952311-Thu Trang.webp',
    alt: 'Hạ Thu Trang',
    name: 'Hạ Thu Trang',
    content: 'Học 1 kèm 1 thì thích nhất là sai ở đâu cô sửa ở đó, cô dạy rất sát theo năng lực, nên chỉ sau gần 3 tháng thì mình đã gần như lấy lại tự tin, có thể giao tiếp tốt với mọi người, đọc tài liệu, tra cứu thông tin rất nhanh. Cứ đà này ra trường mình có thể tự tin apply các công ty nước ngoài.',
    socialLink: 'https://www.facebook.com/Tienganhgiaotieplangmaster/posts/pfbid0Lh8ReNQ6J7XQxpZRA25FMc2fksXzxb8Ro1jtTucRsgzLLgwyj4EASgnNQegQicnGl',
    socialType: 'svg',
    socialIcon: null,
  },
  {
    img: 'https://langmaster.edu.vn/storage/images/student-testimonial/1714194022-Trúc Linh.webp',
    alt: 'Trúc Linh',
    name: 'Trúc Linh',
    content: 'Để duy trì sự sáng tạo và không ngừng nâng cao trình độ tiếng Anh, bí quyết của mình chính là đăng ký lớp học 1 kèm 1 ở Langmaster. Tại đây, mình được hình thành thói quen tốt đó là kết hợp tự học và học online. Tự học là để chủ động trong tốc độ, còn học với Langmaster để có môi trường luyện tập phản xạ.',
    socialLink: 'https://www.tiktok.com/@truclinh.99_/video/7357727736166649089?lang=vi-VN',
    socialType: 'img',
    socialIcon: '/images/youtube.png',
  },
  {
    img: 'https://langmaster.edu.vn/storage/images/student-testimonial/1713934327-6.webp',
    alt: 'Đỗ Văn Linh',
    name: 'Đỗ Văn Linh',
    content: (
      <span>
        Đến với lớp học Offline của Langmaster, Linh đã được trải nghiệm 3 KHÔNG:<br/>- Không được chỉ ngồi im chép bài, vì bạn cần phải luyện kỹ năng giao tiếp, phải nói, nói và nói liên tục<br/>- Không buồn ngủ vì không khí lớp học rất sôi động và ai cũng nhiệt tình phát biểu<br/>- Không sợ xấu hổ khi nói sai vì mình sẽ được giáo viên sửa lỗi liên tục và tiến bộ ngay tức thì
      </span>
    ),
    socialLink: 'https://www.tiktok.com/@dovanling/video/7359545175112273169',
    socialType: 'img',
    socialIcon: '/images/youtube.png',
  },
];

const AVATAR_SIZE = 110;
const AVATAR_BORDER = 4;
const AVATAR_MARGIN = 12;

const FeedbackCard = ({ fb }) => (
  <Box sx={{ px: 2, pb: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
    {/* Avatar nằm ngoài card, không che nội dung */}
    <Box
      sx={{
        width: AVATAR_SIZE + AVATAR_BORDER * 2,
        height: AVATAR_SIZE + AVATAR_BORDER * 2,
        borderRadius: "50%",
        bgcolor: "#fff",
        boxShadow: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: `-${AVATAR_SIZE / 2 + AVATAR_MARGIN / 2}px`, // kéo card lên gần avatar
        zIndex: 2,
        position: "relative"
      }}
    >
      <Avatar
        src={fb.img}
        alt={fb.alt}
        sx={{
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          border: `${AVATAR_BORDER}px solid #e53935`,
          background: "#fff"
        }}
      />
    </Box>
    <Card
      sx={{
        border: "2px solid #e53935",
        borderRadius: 4,
        minHeight: 340,
        pt: `${AVATAR_SIZE / 2 + AVATAR_MARGIN}px`, // đủ lớn để không bị che
        pb: 2,
        px: 2,
        boxShadow: "0 2px 8px rgba(229,57,53,0.08)",
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#fff",
        width: "100%",
        position: "relative"
      }}
    >
      <CardContent sx={{ width: "100%", p: 0 }}>
        <Typography variant="body1" sx={{ mb: 2, minHeight: 100, textAlign: "justify", fontSize: '1.1rem', lineHeight: 1.6 }}>
          {fb.content}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
          <Typography variant="h6" sx={{ color: "#e53935", fontWeight: "bold" }}>
            {fb.name}
          </Typography>
          <Button
            href={fb.socialLink}
            target="_blank"
            sx={{ color: "#1976d2", textTransform: "none", fontWeight: 600, ml: 1 }}
          >
            Xem
            {fb.socialType === 'svg' ? (
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 16 16"
                style={{ width: 20, height: 20, borderRadius: '100%', marginLeft: 4 }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"></path>
              </svg>
            ) : (
              <img style={{ width: 20, marginLeft: 4 }} alt={fb.name} src={fb.socialIcon} />
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Box>
);

const FeedbackHome = () => {
  const sliderRef = useRef();
  const [current, setCurrent] = useState(0);

  // Tính toán index đầu của mỗi nhóm 3 feedback
  const navIndexes = Array.from({ length: Math.ceil(feedbacks.length / 3) }, (_, i) => i * 3);

  // Khi slider chuyển, cập nhật current
  const handleBeforeChange = (oldIndex, newIndex) => setCurrent(newIndex);

  // Xử lý điều hướng mũi tên
  const handlePrev = () => {
    sliderRef.current.slickPrev();
  };

  const handleNext = () => {
    sliderRef.current.slickNext();
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    beforeChange: handleBeforeChange,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <Box sx={{ position: 'relative', px: 4 }}>
      {/* Tiêu đề */}
      <Typography
        variant="h4"
        sx={{
          textAlign: 'center',
          mb: 4,
          color: '#000',
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
        }}
      >
        Phụ huynh và học sinh nói gì sau khóa học
      </Typography>

      {/* Mũi tên trái */}
      <IconButton
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          bgcolor: '#f5f5f5 !important',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          width: 48,
          height: 48,
          '&:hover': {
            bgcolor: '#e0e0e0 !important',
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
          },
          '&:active': {
            bgcolor: '#d0d0d0 !important',
          },
          '&:focus': {
            bgcolor: '#f5f5f5 !important',
            outline: 'none',
          },
          '@media (max-width: 600px)': {
            left: 8,
          }
        }}
      >
        <ChevronLeft sx={{ color: '#e53935', fontSize: 28 }} />
      </IconButton>

      {/* Mũi tên phải */}
      <IconButton
        onClick={handleNext}
        sx={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          bgcolor: '#f5f5f5 !important',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          width: 48,
          height: 48,
          '&:hover': {
            bgcolor: '#e0e0e0 !important',
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
          },
          '&:active': {
            bgcolor: '#d0d0d0 !important',
          },
          '&:focus': {
            bgcolor: '#f5f5f5 !important',
            outline: 'none',
          },
          '@media (max-width: 600px)': {
            right: 8,
          }
        }}
      >
        <ChevronRight sx={{ color: '#e53935', fontSize: 28 }} />
      </IconButton>

      <Slider
        {...settings}
        ref={sliderRef}
        className="feedback-home-slider"
      >
        {feedbacks.map((fb, idx) => (
          <FeedbackCard fb={fb} key={idx} />
        ))}
      </Slider>
    </Box>
  );
};

export default FeedbackHome;
