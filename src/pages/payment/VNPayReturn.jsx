import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Container,
    Card,
    CardContent,
    Divider,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { processVNPayReturn, verifyVNPayReturnAPI } from '../../services/vnpay.service';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../utils/constants';

const VNPayReturn = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [paymentResult, setPaymentResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handlePaymentReturn = async () => {
            try {
                // Extract query parameters from URL
                const queryParams = processVNPayReturn(location.search);

                // Verify payment with backend
                const response = await verifyVNPayReturnAPI(queryParams);
                setPaymentResult(response.data);
            } catch (err) {
                console.error('Error verifying VNPay payment:', err);
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi xác thực thanh toán');
            } finally {
                setLoading(false);
            }
        };

        handlePaymentReturn();
    }, [location.search]);

    const handleGoToDashboard = () => {
        if (user?.role === USER_ROLES.PARENT) {
            navigate('/parent/payments');
        } else if (user?.role === USER_ROLES.STUDENT) {
            navigate('/student/dashboard');
        } else {
            navigate('/');
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount / 100); // VNPay amount is in VND cents
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Đang xử lý kết quả thanh toán...
                    </Typography>
                </Paper>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper sx={{ p: 4 }}>
                    <Alert
                        severity="error"
                        icon={<ErrorIcon />}
                        sx={{ mb: 3 }}
                    >
                        <Typography variant="h6">Lỗi xác thực thanh toán</Typography>
                        <Typography>{error}</Typography>
                    </Alert>
                    <Box sx={{ textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            onClick={handleGoToDashboard}
                            sx={{ mt: 2 }}
                        >
                            Quay về trang chủ
                        </Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    const isSuccess = paymentResult?.vnp_ResponseCode === '00';

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Card>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        {isSuccess ? (
                            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                        ) : (
                            <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                        )}
                        <Typography variant="h4" gutterBottom>
                            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {isSuccess
                                ? 'Giao dịch của bạn đã được xử lý thành công.'
                                : 'Giao dịch không thể hoàn thành. Vui lòng thử lại.'
                            }
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <WalletIcon sx={{ mr: 1 }} />
                            Thông tin giao dịch
                        </Typography>

                        <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Mã giao dịch:</Typography>
                                <Typography fontWeight="medium">{paymentResult?.vnp_TxnRef}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Số tiền:</Typography>
                                <Typography fontWeight="medium">
                                    {formatAmount(paymentResult?.vnp_Amount)}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Ngân hàng:</Typography>
                                <Typography fontWeight="medium">{paymentResult?.vnp_BankCode}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Thời gian:</Typography>
                                <Typography fontWeight="medium">
                                    {paymentResult?.vnp_PayDate &&
                                        new Date(
                                            paymentResult.vnp_PayDate.replace(
                                                /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
                                                '$1-$2-$3T$4:$5:$6'
                                            )
                                        ).toLocaleString('vi-VN')
                                    }
                                </Typography>
                            </Box>

                            {paymentResult?.vnp_OrderInfo && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">Nội dung:</Typography>
                                    <Typography fontWeight="medium">{paymentResult.vnp_OrderInfo}</Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleGoToDashboard}
                        >
                            {isSuccess ? 'Tiếp tục' : 'Thử lại'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default VNPayReturn;
