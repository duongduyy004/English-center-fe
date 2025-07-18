import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Avatar,
  TextField,
  Button,
  Container,
} from '@mui/material';
import { commonStyles } from '../../utils/styles';
import HomeHeader from './HomeHeader';
import Footer from './Footer';
import AdvertisementSlider from '../../components/advertisement/AdvertisementSlider';
import WelcomeAdPopup from '../../components/advertisement/WelcomeAdPopup';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getAllAnnouncementsAPI } from '../../services/api';
import FeedbackHome from './FeedbackHome';

const teachers = [
  {
    id: 1,
    name: 'Hoàng Thị Mai',
    role: 'Giáo viên tiếng Anh Tiểu học',
    experience: '8 năm giảng dạy học sinh lớp 1-5',
    education: 'Cử nhân Sư phạm Tiếng Anh, ĐH Sư phạm Hà Nội',
    image: '/images/anh-1.png',
    description: 'Tận tâm, sáng tạo, giúp học sinh nhỏ tuổi yêu thích tiếng Anh qua các hoạt động vui nhộn, tương tác.'
  },
  {
    id: 2,
    name: 'Phạm Quang Duy',
    role: 'Giáo viên tiếng Anh THCS',
    experience: '5 năm giảng dạy học sinh lớp 6-9',
    education: 'Cử nhân Ngôn ngữ Anh, ĐH Ngoại ngữ - ĐHQGHN',
    image: '/images/ang-chin-yong.webp',
    description: 'Chuyên xây dựng nền tảng vững chắc về ngữ pháp, phát âm và giao tiếp cho học sinh cấp 2, giúp các em tự tin sử dụng tiếng Anh.'
  },
  {
    id: 3,
    name: 'Đỗ Thị Hoa',
    role: 'Giáo viên tiếng Anh THPT & luyện thi',
    experience: '6 năm luyện thi tiếng Anh cho học sinh lớp 10-12',
    education: 'Thạc sĩ Giảng dạy Tiếng Anh, ĐH Hà Nội',
    image: '/images/anh-3.png',
    description: 'Kinh nghiệm luyện thi vào 10, tốt nghiệp THPT, IELTS cho học sinh phổ thông. Phương pháp học tập trung, hiệu quả, truyền cảm hứng.'
  }
];

const Home = () => {
  const { user } = useAuth();
  const [showWelcomeAd, setShowWelcomeAd] = useState(false);
  const [ads, setAds] = useState([]);
  const [popupAds, setPopupAds] = useState([]);
  const [bannerAds, setBannerAds] = useState([]);

  useEffect(() => {
    const adShown = sessionStorage.getItem('welcomeAdShown');
    if (!adShown) {
      const timer = setTimeout(() => {
        setShowWelcomeAd(true);
      }, 1000); // Hiển thị sau 2 giây
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    getAllAnnouncementsAPI()
      .then(res => {
        setAds(res.data || []);
        setPopupAds((res.data || []).filter(ad => ad.displayType === 'popup'));
        setBannerAds((res.data || []).filter(ad => ad.displayType === 'banner'));
      });
  }, []);

  const handleCloseWelcomeAd = () => {
    sessionStorage.setItem('welcomeAdShown', 'true');
    setShowWelcomeAd(false);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      position: 'relative'
    }}>
      {/* Quảng cáo popup động */}
      {popupAds.length > 0 && (
        <WelcomeAdPopup
          open={showWelcomeAd}
          onClose={handleCloseWelcomeAd}
          ads={popupAds}
        />
      )}
      <HomeHeader sx={{
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)'
      }} />
      <Box sx={{ width: '100%' }}>
          <Box id="hero-section"
            sx={{
              position: 'relative',
              height: '580px',
              borderRadius: 0,
              mb: 0,
              pt: 7.8,
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(229,57,53,0.1) 0%, rgba(25,118,210,0.1) 100%)',
                zIndex: 1
              }
            }}
          >
            <Box
              component="img"
              src="/images/Banner-tieng-Anh.png"
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: 0,
                objectFit: 'cover',
                position: 'relative',
                zIndex: 0
              }}
            />
          </Box>
        <Box sx={{ px: '8%', bgcolor: '#fff', py: 4 }}>


          {/* About Section - now 4 columns */}
          <Box id="about-section" sx={{ mb: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  color: '#000',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  mb: 2
                }}
            >
              Về chúng tôi
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
                sx={{
                  mb: 0,
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  fontWeight: 300
                }}
            >
              Tìm hiểu thêm về English Center
            </Typography>
            </Box>
            <Grid container spacing={4}>
              <Grid item xs={12} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                    borderRadius: 3,
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(229,57,53,0.2)'
                    }
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                      color: '#000',
                      mb: 1
                    }}
                  >
                    Sứ mệnh
                  </Typography>
                  <Typography paragraph sx={{ lineHeight: 1.8, color: '#555' }}>
                    Chúng tôi cam kết mang đến chất lượng đào tạo tiếng Anh tốt nhất, giúp học viên tự tin giao tiếp và đạt được mục tiêu học tập của mình.
                  </Typography>
                  <Typography paragraph sx={{ lineHeight: 1.8, color: '#555' }}>
                    Mỗi học viên đều được quan tâm sát sao, xây dựng lộ trình học tập cá nhân hóa phù hợp với năng lực và mục tiêu riêng.
                  </Typography>
                  <Typography paragraph sx={{ lineHeight: 1.8, color: '#555' }}>
                    Chúng tôi không ngừng đổi mới phương pháp giảng dạy để truyền cảm hứng học tập và phát triển toàn diện cho học sinh từ lớp 1 đến lớp 12.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                    borderRadius: 3,
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(25,118,210,0.2)'
                    }
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                      color: '#000',
                      mb: 1
                    }}
                  >
                    Tầm nhìn
                  </Typography>
                  <Typography paragraph sx={{ lineHeight: 1.8, color: '#555' }}>
                    Trở thành trung tâm đào tạo tiếng Anh hàng đầu, được tin tưởng bởi học viên và đối tác trên toàn quốc.
                  </Typography>
                  <Typography paragraph sx={{ lineHeight: 1.8, color: '#555' }}>
                    Xây dựng môi trường học tập hiện đại, thân thiện, nơi mọi học sinh đều có cơ hội phát triển kỹ năng tiếng Anh và kỹ năng sống.
                  </Typography>
                  <Typography paragraph sx={{ lineHeight: 1.8, color: '#555' }}>
                    Định hướng phát triển lâu dài, mở rộng hệ thống và hợp tác quốc tế để mang lại nhiều giá trị hơn cho cộng đồng học sinh Việt Nam.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                    borderRadius: 3,
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(76,175,80,0.2)'
                    }
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                      color: '#000',
                      mb: 1
                    }}
                  >
                    Giá trị cốt lõi
                  </Typography>
                  <Typography component="ul" sx={{ pl: 2, lineHeight: 1.8, color: '#555' }}>
                    <li>Chất lượng đào tạo xuất sắc, lấy học viên làm trung tâm.</li>
                    <li>Đội ngũ giáo viên chuyên nghiệp, tận tâm, sáng tạo.</li>
                    <li>Phương pháp giảng dạy hiện đại, cập nhật liên tục.</li>
                    <li>Môi trường học tập thân thiện, khuyến khích sự chủ động.</li>
                    <li>Hỗ trợ học viên tận tâm, đồng hành cùng phụ huynh.</li>
                  </Typography>
                  <Typography paragraph sx={{ lineHeight: 1.8, color: '#555', mt: 2 }}>
                    Chúng tôi tin rằng mỗi học sinh đều có tiềm năng riêng và xứng đáng được phát triển tối đa trong môi trường giáo dục chất lượng.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                    borderRadius: 3,
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(255,152,0,0.2)'
                    }
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                      color: '#000',
                      mb: 1
                    }}
                  >
                    Lịch sử phát triển
                  </Typography>
                  <Typography paragraph sx={{ lineHeight: 1.8, color: '#555' }}>
                    English Center được thành lập năm 2010 với sứ mệnh mang đến chất lượng đào tạo tiếng Anh tốt nhất cho học viên Việt Nam.
                  </Typography>
                  <Typography paragraph sx={{ lineHeight: 1.8, color: '#555' }}>
                    Trải qua hơn 10 năm phát triển, chúng tôi đã đào tạo hơn 10,000 học viên, mở rộng hệ thống cơ sở trên toàn quốc và trở thành đối tác tin cậy của nhiều trường học, doanh nghiệp.
                  </Typography>
                  <Typography paragraph sx={{ lineHeight: 1.8, color: '#555' }}>
                    Với đội ngũ giảng viên giàu kinh nghiệm và phương pháp giảng dạy hiện đại, chúng tôi cam kết mang đến trải nghiệm học tập tốt nhất cho mọi học viên, từ lớp 1 đến lớp 12.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Advertisement Banner động */}
          <Box sx={{ mb: 8 }}>
            <AdvertisementSlider ads={bannerAds} />
          </Box>

          {/* Teachers Section */}
          <Box id="teachers-section" sx={{ mb: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  color: '#000',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  mb: 2
                }}
            >
              Đội ngũ giảng viên
            </Typography>
            </Box>

              {/* Section 3 giá trị cốt lõi */}
              <Box sx={{ mb: 8 }}>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                          borderRadius: 3,
                          border: '1px solid rgba(0,0,0,0.05)',
                          transition: 'all 0.3s ease',
                          height: '100%',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(229,57,53,0.2)'
                          }
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 'bold',
                            mb: 3,
                            textAlign: 'center',
                            color: '#000'
                          }}
                        >
                          Chuyên môn giỏi
                        </Typography>
                        <Typography color="text.secondary" sx={{ textAlign: 'justify', lineHeight: 1.8 }}>
                        Đội ngũ giáo viên chuyên môn giỏi, xuất thân từ các các trường học uy tín hàng đầu quốc tế hoặc trường ngoại ngữ có tiếng tại Việt Nam, đồng thời sở hữu chứng chỉ TESOL với phương pháp và kỹ năng giảng dạy chuyên sâu. Bên cạnh đó giáo viên của chúng tôi được tinh tuyển, đào tạo khắt khe, áp dụng đồng bộ phương pháp RIPL trong giảng dạy, giúp học viên cán đích thành công.
                      </Typography>
                    </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                          borderRadius: 3,
                          border: '1px solid rgba(0,0,0,0.05)',
                          transition: 'all 0.3s ease',
                          height: '100%',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(25,118,210,0.2)'
                          }
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 'bold',
                            mb: 3,
                            textAlign: 'center',
                            color: '#000'
                          }}
                        >
                          Nhiệt tình
                        </Typography>
                        <Typography color="text.secondary" sx={{ textAlign: 'justify', lineHeight: 1.8 }}>
                        Đội ngũ giảng viên luôn lấy 5 giá trị cốt lõi làm kim chỉ nam cho mọi trường hợp: Tận tâm phục vụ, Trách nhiệm kỷ luật, Đổi mới sáng tạo, Dám nghĩ dám làm, Chính trực thẳng thắn. Thầy cô đặt hiệu quả học tập của học viên làm ưu tiên số 1 trong mọi suy nghĩ và hành động nên luôn cống hiến hết mình cho từng bài giảng để học viên đạt hiệu quả tiếp thu tối đa.
                      </Typography>
                    </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                          borderRadius: 3,
                          border: '1px solid rgba(0,0,0,0.05)',
                          transition: 'all 0.3s ease',
                          height: '100%',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                            border: '1px solid rgba(76,175,80,0.2)'
                          }
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 'bold',
                            mb: 3,
                            textAlign: 'center',
                            color: '#000'
                          }}
                        >
                          Sáng tạo
                        </Typography>
                        <Typography color="text.secondary" sx={{ textAlign: 'justify', lineHeight: 1.8 }}>
                        Giáo viên luôn chủ động nghiên cứu những phương pháp giảng dạy mới, sáng kiến trong nghề để mỗi bài giảng trở nên hấp dẫn và học trò tiếp thu hiệu quả hơn. Tâm niệm học những gì cần thiết, hữu ích chứ không học dàn trải tất cả những gì tiếng Anh có nên thầy cô luôn áp dụng cách học logic, thực hành tối đa, cùng học viên theo đuổi mục tiêu đến cùng.
                      </Typography>
                    </Paper>
                    </Grid>
                  </Grid>
            </Box>

            <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  color: '#000',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  mb: 2
                }}
            >
              Các giảng viên tiêu biểu
            </Typography>
            </Box>
            <Grid container spacing={4}>
              {teachers.map((teacher) => (
                <Grid item key={teacher.id} xs={12} md={4}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                      <CardMedia
                        component="img"
                        image={teacher.image}
                        alt={teacher.name}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="h2"
                        sx={{ fontWeight: 'bold', color: '#000' }}
                      >
                        {teacher.name}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        color="primary"
                        gutterBottom
                        sx={{ fontWeight: 600, mb: 2 }}
                      >
                        {teacher.role}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                        sx={{ mb: 1, fontWeight: 500 }}
                      >
                        {teacher.experience}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                        sx={{ mb: 2, fontWeight: 500 }}
                      >
                        {teacher.education}
                      </Typography>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{ lineHeight: 1.6, color: '#555' }}
                      >
                        {teacher.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {/* Feedback slider section */}
            <Box id="feedback-section" sx={{ my: 10 }}>
              <FeedbackHome />
            </Box>
            </Box>
          </Box>
        </Box>
      <Footer />
    </Box>
  );
};

export default Home;
