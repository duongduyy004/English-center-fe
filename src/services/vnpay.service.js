import axiosInstance from '../utils/axios.customize';
import { API_CONFIG } from '../config/api';

// VNPay APIs
export const createVNPayPaymentAPI = (data) => axiosInstance.post(API_CONFIG.ENDPOINTS.VNPAY.CREATE_PAYMENT, data);

export const verifyVNPayReturnAPI = (queryParams) => axiosInstance.get(API_CONFIG.ENDPOINTS.VNPAY.VERIFY_RETURN, { params: queryParams });

export const handleVNPayIPNAPI = (data) => axiosInstance.post(API_CONFIG.ENDPOINTS.VNPAY.IPN, data);

// Process VNPay return URL parameters
export const processVNPayReturn = (searchParams) => {
    const params = new URLSearchParams(searchParams);
    return {
        vnp_Amount: params.get('vnp_Amount'),
        vnp_BankCode: params.get('vnp_BankCode'),
        vnp_BankTranNo: params.get('vnp_BankTranNo'),
        vnp_CardType: params.get('vnp_CardType'),
        vnp_OrderInfo: params.get('vnp_OrderInfo'),
        vnp_PayDate: params.get('vnp_PayDate'),
        vnp_ResponseCode: params.get('vnp_ResponseCode'),
        vnp_TmnCode: params.get('vnp_TmnCode'),
        vnp_TransactionNo: params.get('vnp_TransactionNo'),
        vnp_TransactionStatus: params.get('vnp_TransactionStatus'),
        vnp_TxnRef: params.get('vnp_TxnRef'),
        vnp_SecureHash: params.get('vnp_SecureHash')
    };
};
