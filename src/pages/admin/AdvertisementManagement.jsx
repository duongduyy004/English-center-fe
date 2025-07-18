import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import {
  getAllAnnouncementsAPI,
  createAnnouncementAPI,
  updateAnnouncementAPI,
  deleteAnnouncementAPI
} from '../../services/api';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import { validateAdvertisement } from '../../validations/advertisementValidation';

const AdvertisementManagement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    image: null,
    displayType: 'banner',
    priority: 1
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formErrors, setFormErrors] = useState({});

  // Lấy danh sách quảng cáo từ API
  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const res = await getAllAnnouncementsAPI();
      setAdvertisements(res.data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách quảng cáo:', err);
    }
  };

  const handleOpenDialog = (ad = null) => {
    if (ad) {
      setEditingAd(ad);
      setFormData({
        title: ad.title || '',
        description: ad.description || '',
        content: ad.content || '',
        image: null,
        displayType: ad.displayType || 'banner',
        priority: ad.priority || 1
      });
    } else {
      setEditingAd(null);
      setFormData({
        title: '',
        description: '',
        content: '',
        image: null,
        displayType: 'banner',
        priority: 1
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAd(null);
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSaveAd = async () => {
    // Validate trước khi submit
    const errors = validateAdvertisement({
      title: formData.title,
      shortDescription: formData.description,
      content: formData.content,
      priority: formData.priority,
      imageName: formData.image ? formData.image.name : (editingAd?.imageUrl ? editingAd.imageUrl.split('/').pop() : ''),
    });
    setFormErrors(errors);
    const hasError = Object.values(errors).some(Boolean);
    if (hasError) return;

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('content', formData.content);
    data.append('displayType', formData.displayType);
    data.append('priority', formData.priority);
    if (formData.image) data.append('image', formData.image);

    try {
      if (editingAd) {
        await updateAnnouncementAPI(editingAd.id, data);
        setSnackbar({ open: true, message: 'Cập nhật quảng cáo thành công!', severity: 'success' });
      } else {
        await createAnnouncementAPI(data);
        setSnackbar({ open: true, message: 'Tạo quảng cáo thành công!', severity: 'success' });
      }
      fetchAdvertisements();
      handleCloseDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Có lỗi khi lưu quảng cáo!',
        severity: 'error'
      });
      console.error(err);
    }
  };

  const handleDeleteAd = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa quảng cáo này?')) {
      try {
        await deleteAnnouncementAPI(id);
        setSnackbar({ open: true, message: 'Xóa quảng cáo thành công!', severity: 'success' });
        fetchAdvertisements();
      } catch (err) {
        setSnackbar({
          open: true,
          message: err?.response?.data?.message || 'Có lỗi khi xóa quảng cáo!',
          severity: 'error'
        });
        console.error(err);
      }
    }
  };

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Quản lý Quảng cáo
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Tạo quảng cáo mới
            </Button>
          </Box>

          {/* Advertisements Table */}
          <Card>
            <CardContent>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hình ảnh</TableCell>
                      <TableCell>Tiêu đề</TableCell>
                      <TableCell>Mô tả</TableCell>
                      <TableCell>Kiểu hiển thị</TableCell>
                      <TableCell>Độ ưu tiên</TableCell>
                      <TableCell>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {advertisements.map((ad) => (
                      <TableRow key={ad.id}>
                        <TableCell>
                          <Avatar
                            src={ad.imageUrl}
                            alt={ad.title}
                            variant="rounded"
                            sx={{ width: 60, height: 40 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {ad.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {ad.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {ad.displayType === 'banner' ? 'Banner' :
                           ad.displayType === 'popup' ? 'Popup' :
                           ad.displayType === 'notification' ? 'Notification' : 'Banner'}
                        </TableCell>
                        <TableCell>
                          {ad.priority}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(ad)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteAd(ad.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Create/Edit Dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                overflow: 'hidden'
              }
            }}
          >
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              py: 3,
              px: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              {editingAd ? 'Chỉnh sửa quảng cáo' : 'Tạo quảng cáo mới'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {editingAd ? 'Cập nhật thông tin quảng cáo' : 'Tạo quảng cáo mới cho hệ thống'}
                </Typography>
              </Box>
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {editingAd ? (
                  <EditIcon sx={{ fontSize: 28, color: 'white' }} />
                ) : (
                  <AddIcon sx={{ fontSize: 28, color: 'white' }} />
                )}
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ p: 4 }}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: '1px solid #e0e6ed'
                }}>
                  <Typography variant="h6" gutterBottom sx={{
                    color: '#2c3e50',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2
                  }}>
                    <Box sx={{
                      width: 4,
                      height: 20,
                      bgcolor: '#667eea',
                      borderRadius: 2
                    }} />
                    Thông tin quảng cáo
                  </Typography>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tiêu đề *"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                    error={!!formErrors.title}
                    helperText={formErrors.title}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả ngắn *"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                    error={!!formErrors.shortDescription}
                    helperText={formErrors.shortDescription}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Nội dung *"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                    error={!!formErrors.content}
                    helperText={formErrors.content}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Kiểu hiển thị"
                    value={formData.displayType}
                    onChange={(e) => setFormData({ ...formData, displayType: e.target.value })}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                    error={!!formErrors.displayType}
                    helperText={formErrors.displayType}
                  >
                    <MenuItem value="banner">Banner</MenuItem>
                    <MenuItem value="popup">Popup</MenuItem>
                    <MenuItem value="notification">Notification</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Độ ưu tiên *"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    inputProps={{ min: 1 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#667eea',
                              },
                            },
                          }}
                    error={!!formErrors.priority}
                    helperText={formErrors.priority}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                            border: '2px dashed #667eea',
                      borderRadius: 0,
                      minHeight: 300,
                      minWidth: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #e3f2fd 100%)',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: '#764ba2',
                              background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f7fa 100%)'
                            }
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      accept="image/png,image/jpg,image/jpeg,image/webp"
                      hidden
                      onChange={handleFileChange}
                    />
                    {formData.image ? (
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="preview"
                        style={{
                          maxWidth: '736px',
                          maxHeight: '552552px',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          borderRadius: 0
                        }}
                      />
                    ) : editingAd && editingAd.imageUrl ? (
                      <img
                        src={editingAd.imageUrl}
                        alt="current"
                        style={{
                          maxWidth: '736px',
                          maxHeight: '552552px',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          borderRadius: 0
                        }}
                      />
                    ) : (
                            <Box sx={{ textAlign: 'center', color: '#667eea' }}>
                        <CloudUploadIcon sx={{ fontSize: 48, mb: 1 }} />
                              <Typography variant="body2" color="inherit" sx={{ fontWeight: 600 }}>
                          Tải ảnh quảng cáo
                        </Typography>
                        <Typography variant="caption" color="inherit">
                          (PNG, JPG, JPEG, WEBP)
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
                  </Box>
                </Paper>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
              <Button
                onClick={handleCloseDialog}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  border: '2px solid #667eea',
                  color: '#667eea',
                  '&:hover': {
                    background: '#667eea',
                    color: 'white',
                  }
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveAd}
                variant="contained"
                disabled={!formData.title || !formData.description || !formData.content}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: '#667eea',
                  '&:hover': { bgcolor: '#5a6fd8' },
                  '&:disabled': {
                    background: '#ccc',
                  }
                }}
              >
                {editingAd ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogActions>
          </Dialog>

          <NotificationSnackbar
            open={snackbar.open}
            onClose={handleCloseNotification}
            message={snackbar.message}
            severity={snackbar.severity}
          />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default AdvertisementManagement;
