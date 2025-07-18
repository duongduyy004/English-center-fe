import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Button, Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, Select, MenuItem
} from '@mui/material';
import { Edit as EditIcon, PhotoCamera as PhotoCameraIcon, Save as SaveIcon, Cancel as CancelIcon, Lock as LockIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { changePasswordAPI, uploadAvatarAPI, updateUserAPI, sendVerificationEmailAPI, getUserByIdAPI } from '../../services/api';
import NotificationSnackbar from '../../components/common/NotificationSnackbar';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { commonStyles } from '../../utils/styles';
import { validateEmail, validatePhone, validateDayOfBirth, validateAddress, validateGender, validateName, validateChangePassword } from '../../validations/commonValidation';
import { useLocation, useNavigate } from 'react-router-dom';

const AdminProfile = () => {
  const { user, updateUser, refreshToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dayOfBirth: user?.dayOfBirth || '',
    avatar: user?.avatar || '',
    gender: user?.gender || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(profileData.avatar);
  const [avatarFile, setAvatarFile] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [passwordFormErrors, setPasswordFormErrors] = useState({});
  const fileInputRef = useRef();
  const [emailVerifySnackbar, setEmailVerifySnackbar] = useState({ open: false, message: '', severity: 'info' });
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dayOfBirth: user.dayOfBirth || '',
        avatar: user.avatar || '',
        gender: user.gender || '',
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  useEffect(() => {
    // Luôn lấy dữ liệu từ context khi vào trang
    setLoading(false);
  }, []);

  useEffect(() => {
    // Chỉ gọi API get a user khi xác thực email (location.state?.reload)
    let isMounted = true;
    const fetchUser = async () => {
      if (location.state?.reload && user?.id) {
        setLoading(true);
        try {
          const res = await getUserByIdAPI(user.id);
          const userData = res?.data?.data || res?.data || res;
          if (isMounted) {
            updateUser(userData);
            setLoading(false);
            navigate(location.pathname, { replace: true, state: {} });
          }
        } catch (e) {
          if (isMounted) setLoading(false);
        }
      }
    };
    fetchUser();
    return () => { isMounted = false; };
  }, [location.state?.reload, user?.id, updateUser, navigate, location.pathname]);

  const handleAvatarClick = () => fileInputRef.current.click();
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) { setAvatarError('Vui lòng chọn file ảnh hợp lệ'); return; }
      if (file.size > 5 * 1024 * 1024) { setAvatarError('Kích thước file không được vượt quá 5MB'); return; }
      setAvatarLoading(true); setAvatarError(''); setAvatarSuccess('');
      try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await uploadAvatarAPI(formData);
        const newAvatarUrl = response.data?.avatar || response.avatar || response.data?.url || response.url || response.data?.imageUrl || response.imageUrl;
        if (newAvatarUrl) {
          setAvatarPreview(newAvatarUrl);
          setProfileData(prev => ({ ...prev, avatar: newAvatarUrl }));
          setAvatarFile(null);
          setAvatarSuccess('Cập nhật avatar thành công!');
          updateUser({ ...user, avatar: newAvatarUrl });
        } else {
          setAvatarError('Không nhận được URL avatar từ server');
        }
        setTimeout(() => { setAvatarSuccess(''); }, 3000);
      } catch (err) {
        let errorMessage = 'Upload avatar thất bại';
        if (err.response?.data?.message) errorMessage = err.response.data.message;
        else if (err.response?.data?.error) errorMessage = err.response.data.error;
        else if (err.response?.status === 400) errorMessage = 'File không hợp lệ';
        else if (err.response?.status === 413) errorMessage = 'File quá lớn';
        else if (err.message) errorMessage = err.message;
        setAvatarError(errorMessage);
        setTimeout(() => { setAvatarError(''); }, 5000);
      } finally { setAvatarLoading(false); }
    }
  };
  const handleEdit = () => { setIsEditing(true); setSuccess(''); setError(''); };
  const handleCancel = () => {
    setIsEditing(false); setAvatarFile(null); setSuccess(''); setError('');
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dayOfBirth: user.dayOfBirth || '',
        avatar: user.avatar || '',
        gender: user.gender || '',
      });
      setAvatarPreview(user.avatar || '');
    }
  };
  const handleSave = async () => {
    setSuccess(''); setError('');
    // Validate trước khi lưu
    const errors = {
      email: validateEmail(profileData.email),
      name: validateName(profileData.name),
      dayOfBirth: validateDayOfBirth(profileData.dayOfBirth),
      phone: validatePhone(profileData.phone),
      address: validateAddress(profileData.address),
      gender: validateGender(profileData.gender),
    };
    setFormErrors(errors);
    const hasError = Object.values(errors).some(Boolean);
    if (hasError) {
      setIsEditing(true);
      setError('Vui lòng kiểm tra lại các trường thông tin.');
      return;
    }
    setIsEditing(false);
    if (avatarFile) setProfileData((prev) => ({ ...prev, avatar: avatarPreview }));
    try {
      const updateBody = { email: profileData.email, name: profileData.name, dayOfBirth: profileData.dayOfBirth, phone: profileData.phone, address: profileData.address, gender: profileData.gender };
      await updateUserAPI(user.id, updateBody);
      // Fetch latest user info from server
      const res = await getUserByIdAPI(user.id);
      const userData = res?.data?.data || res?.data || res;
      updateUser(userData);
      setSuccess('Cập nhật thông tin thành công!');
    } catch (err) {
      let errorMessage = 'Cập nhật thông tin thất bại';
      if (err.response?.data?.message) errorMessage = err.response.data.message;
      else if (err.message) errorMessage = err.message;
      setError(errorMessage);
    }
  };
  const handleOpenPasswordDialog = () => { setShowPasswordDialog(true); setPasswordData({ current: '', new: '', confirm: '' }); setError(''); setSuccess(''); };
  const handleClosePasswordDialog = () => { setShowPasswordDialog(false); setPasswordData({ current: '', new: '', confirm: '' }); setError(''); setSuccess(''); };
  const handlePasswordChange = (e) => { const { name, value } = e.target; setPasswordData((prev) => ({ ...prev, [name]: value })); };
  const handleToggleShowPassword = (field) => { setShowPassword((prev) => ({ ...prev, [field]: !prev[field] })); };
  const handleChangePassword = async () => {
    const errors = validateChangePassword({ current: passwordData.current, newPassword: passwordData.new, confirm: passwordData.confirm });
    setPasswordFormErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      setError('Vui lòng kiểm tra lại các trường mật khẩu.');
      return;
    }
    setPasswordLoading(true); setError(''); setSuccess('');
    try {
      await changePasswordAPI(passwordData.current, passwordData.new);
      setSuccess('Đổi mật khẩu thành công!');
      setPasswordData({ current: '', new: '', confirm: '' });
      setTimeout(() => { setShowPasswordDialog(false); setSuccess(''); }, 2000);
    } catch (err) {
      let errorMessage = 'Đổi mật khẩu thất bại';
      if (err.response?.data?.message) errorMessage = err.response.data.message;
      else if (err.response?.status === 400) errorMessage = 'Mật khẩu hiện tại không đúng';
      else if (err.response?.status === 401) errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
      else if (err.message) errorMessage = err.message;
      setError(errorMessage);
    } finally { setPasswordLoading(false); }
  };
  const formatDateToDisplay = (dateString) => {
    if (!dateString) return '';
    if (dateString.includes('-')) { const [yyyy, mm, dd] = dateString.split('-'); return `${dd}/${mm}/${yyyy}`; }
    return dateString;
  };
  const handleDayOfBirthChange = (e) => {
    const value = e.target.value;
    if (value && value.includes('-')) { const [yyyy, mm, dd] = value.split('-'); setProfileData(prev => ({ ...prev, dayOfBirth: `${dd}/${mm}/${yyyy}` })); } else { setProfileData(prev => ({ ...prev, dayOfBirth: value })); }
  };
  const handleSendVerificationEmail = async () => {
    try {
      await sendVerificationEmailAPI();
      setEmailVerifySnackbar({ open: true, message: 'Đã gửi email xác thực. Vui lòng kiểm tra hộp thư!', severity: 'success' });
    } catch (err) {
      setEmailVerifySnackbar({ open: true, message: 'Gửi email xác thực thất bại!', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <Box sx={{ py: 4 }}>
          <Typography sx={{ textAlign: 'center', mt: 2 }}>Đang tải dữ liệu cá nhân...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Typography sx={commonStyles.pageTitle}>Trang cá nhân</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={avatarPreview}
                    sx={{ width: 150, height: 150, mb: 2, border: '4px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: !avatarLoading ? 'pointer' : 'default', opacity: avatarLoading ? 0.7 : 1 }}
                    onClick={!avatarLoading ? handleAvatarClick : undefined}
                  >
                    {!avatarPreview && profileData.name.charAt(0)}
                  </Avatar>
                  {!avatarLoading && (
                    <IconButton sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'white' } }} onClick={handleAvatarClick}>
                      <PhotoCameraIcon />
                    </IconButton>
                  )}
                  {avatarLoading && (
                    <Box sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="caption">...</Typography>
                    </Box>
                  )}
                  <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleAvatarChange} disabled={avatarLoading} />
                </Box>
                <Typography variant="h6" sx={{ mb: 1 }}>{profileData.name}</Typography>
                <Typography color="textSecondary" sx={{ mb: 2 }}>{profileData.email}</Typography>
                {avatarLoading && (<Typography variant="caption" color="primary" sx={{ display: 'block', mb: 1 }}>Đang tải lên avatar...</Typography>)}
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email" value={profileData.email} disabled={!isEditing} onChange={e => setProfileData(prev => ({ ...prev, email: e.target.value }))} sx={commonStyles.formField} error={!!formErrors.email} helperText={formErrors.email} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Họ và tên" value={profileData.name} disabled={!isEditing} onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))} sx={commonStyles.formField} error={!!formErrors.name} helperText={formErrors.name} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Ngày sinh" value={isEditing ? profileData.dayOfBirth : formatDateToDisplay(profileData.dayOfBirth)} disabled={!isEditing} placeholder="dd/mm/yyyy" onChange={handleDayOfBirthChange} sx={commonStyles.formField} inputProps={{ maxLength: 10 }} error={!!formErrors.dayOfBirth} helperText={formErrors.dayOfBirth} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Số điện thoại" value={profileData.phone} disabled={!isEditing} onChange={e => setProfileData(prev => ({ ...prev, phone: e.target.value }))} sx={commonStyles.formField} error={!!formErrors.phone} helperText={formErrors.phone} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Địa chỉ" value={profileData.address} disabled={!isEditing} onChange={e => setProfileData(prev => ({ ...prev, address: e.target.value }))} sx={commonStyles.formField} error={!!formErrors.address} helperText={formErrors.address} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {isEditing ? (
                      <Select fullWidth value={profileData.gender || ''} onChange={e => setProfileData(prev => ({ ...prev, gender: e.target.value }))} displayEmpty sx={commonStyles.formField} error={!!formErrors.gender} helperText={formErrors.gender}>
                        <MenuItem value="">Chọn giới tính</MenuItem>
                        <MenuItem value="male">Nam</MenuItem>
                        <MenuItem value="female">Nữ</MenuItem>
                        <MenuItem value="other">Khác</MenuItem>
                      </Select>
                    ) : (
                      <TextField fullWidth label="Giới tính" value={profileData.gender === 'male' ? 'Nam' : profileData.gender === 'female' ? 'Nữ' : profileData.gender === 'other' ? 'Khác' : ''} disabled sx={commonStyles.formField} />
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Trạng thái email" value={user?.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'} disabled sx={commonStyles.formField} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Vai trò" value={user?.role === 'admin' ? 'Quản trị viên' : user?.role || ''} disabled sx={commonStyles.formField} />
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                  {!isEditing ? (
                    <>
                      <Button variant="outlined" onClick={handleOpenPasswordDialog} startIcon={<LockIcon />}>Đổi mật khẩu</Button>
                      {!user?.isEmailVerified && (
                        <Button variant="outlined" color="primary" onClick={handleSendVerificationEmail}>Xác thực email</Button>
                      )}
                      <Button variant="contained" onClick={handleEdit} startIcon={<EditIcon />}>Chỉnh sửa</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outlined" color="error" onClick={handleCancel} startIcon={<CancelIcon />}>Hủy</Button>
                      <Button variant="contained" color="primary" onClick={handleSave} startIcon={<SaveIcon />}>Lưu</Button>
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <NotificationSnackbar open={!!avatarSuccess || !!avatarError} onClose={() => { setAvatarSuccess(''); setAvatarError(''); }} message={avatarSuccess || avatarError} severity={avatarSuccess ? 'success' : 'error'} />
      <NotificationSnackbar open={!!success || !!error} onClose={() => { setSuccess(''); setError(''); }} message={success || error} severity={success ? 'success' : 'error'} />
      <NotificationSnackbar open={emailVerifySnackbar.open} onClose={() => setEmailVerifySnackbar({ ...emailVerifySnackbar, open: false })} message={emailVerifySnackbar.message} severity={emailVerifySnackbar.severity} />
      <Dialog open={showPasswordDialog} onClose={handleClosePasswordDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent>
          <TextField margin="normal" label="Mật khẩu hiện tại" name="current" type={showPassword.current ? 'text' : 'password'} value={passwordData.current} onChange={handlePasswordChange} fullWidth InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => handleToggleShowPassword('current')} edge="end">{showPassword.current ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} error={!!passwordFormErrors.current} helperText={passwordFormErrors.current} />
          <TextField margin="normal" label="Mật khẩu mới" name="new" type={showPassword.new ? 'text' : 'password'} value={passwordData.new} onChange={handlePasswordChange} fullWidth InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => handleToggleShowPassword('new')} edge="end">{showPassword.new ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} error={!!passwordFormErrors.newPassword} helperText={passwordFormErrors.newPassword} />
          <TextField margin="normal" label="Xác nhận mật khẩu mới" name="confirm" type={showPassword.confirm ? 'text' : 'password'} value={passwordData.confirm} onChange={handlePasswordChange} fullWidth InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => handleToggleShowPassword('confirm')} edge="end">{showPassword.confirm ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} error={!!passwordFormErrors.confirm} helperText={passwordFormErrors.confirm} />
          {error && <Typography color="error.main" sx={{ mt: 1 }}>{error}</Typography>}
          {success && <Typography color="success.main" sx={{ mt: 1 }}>{success}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} disabled={passwordLoading}>Hủy</Button>
          <Button variant="contained" onClick={handleChangePassword} disabled={passwordLoading}>{passwordLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}</Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminProfile;
