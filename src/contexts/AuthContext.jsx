import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { USER_ROLES } from '../utils/constants';
import { loginAPI, logoutAPI, refreshTokenAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        token: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        let user = JSON.parse(userData);
        // Nếu là parent và thiếu permissions thì bổ sung mặc định
        if (user.role === 'parent' && !user.permissions) {
          user.permissions = [
            'view_child_info',
            'view_child_attendance',
            'view_fees',
            'make_payment',
            'view_schedule'
          ];
          localStorage.setItem('userData', JSON.stringify(user));
        }
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, accessToken: token, refreshToken: refreshToken }
        });
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userData');
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    } else if (!token && refreshToken && userData) {
      // Nếu thiếu access_token nhưng có refresh_token và userData, tự động refresh
      (async () => {
        try {
          let user = JSON.parse(userData);
          const response = await refreshTokenAPI(refreshToken);
          let newAccessToken = null;
          let newRefreshToken = null;
          if (response?.tokens?.access?.token) {
            newAccessToken = response.tokens.access.token;
            newRefreshToken = response.tokens.refresh?.token;
          } else if (response?.data?.tokens?.access?.token) {
            newAccessToken = response.data.tokens.access.token;
            newRefreshToken = response.data.tokens.refresh?.token;
          } else if (response?.access?.token) {
            newAccessToken = response.access.token;
            newRefreshToken = response.refresh?.token;
          } else if (response?.data?.access?.token) {
            newAccessToken = response.data.access.token;
            newRefreshToken = response.data.refresh?.token;
          } else if (response?.access_token) {
            newAccessToken = response.access_token;
            newRefreshToken = response.refresh_token;
          } else if (response?.data?.access_token) {
            newAccessToken = response.data.access_token;
            newRefreshToken = response.data.refresh_token;
          }
          if (newAccessToken) {
            localStorage.setItem('access_token', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refresh_token', newRefreshToken);
            }
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, accessToken: newAccessToken, refreshToken: newRefreshToken || refreshToken }
            });
          } else {
            throw new Error('Invalid refresh token response');
          }
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('userData');
          dispatch({ type: 'LOGOUT' });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      })();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }

    // Lắng nghe event logout từ axios interceptor
    const handleLogoutEvent = (event) => {
      console.log('Received logout event:', event.detail);
      dispatch({ type: 'LOGOUT' });
    };

    window.addEventListener('auth:logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, []);

  // Luôn đồng bộ user/token vào localStorage khi thay đổi
  useEffect(() => {
    if (state.user && state.token) {
      localStorage.setItem('access_token', state.token);
      localStorage.setItem('userData', JSON.stringify(state.user));
      if (state.refreshToken) {
        localStorage.setItem('refresh_token', state.refreshToken);
      }
      if (state.user.role === 'parent' && state.user.parentId) {
        localStorage.setItem('parent_id', state.user.parentId);
      }
    }
  }, [state.user, state.token, state.refreshToken]);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const apiResponse = await Promise.race([
        loginAPI({
          email: credentials.email,
          password: credentials.password
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]);

      let userData = null;
      let accessToken = null;
      let refreshToken = null;

      // Ưu tiên lấy theo cấu trúc thực tế mới
      if (apiResponse?.user && apiResponse?.tokens?.access?.token) {
        userData = apiResponse.user;
        accessToken = apiResponse.tokens.access.token;
        refreshToken = apiResponse.tokens.refresh?.token;
      } else if (apiResponse?.data?.user && apiResponse?.data?.tokens?.access?.token) {
        userData = apiResponse.data.user;
        accessToken = apiResponse.data.tokens.access.token;
        refreshToken = apiResponse.data.tokens.refresh?.token;
      } else {
        // fallback cho các cấu trúc cũ
        if (apiResponse?.data?.data) {
          userData = apiResponse.data.data.user;
          accessToken = apiResponse.data.data.access_token || apiResponse.data.data.accessToken;
          refreshToken = apiResponse.data.data.refresh_token || apiResponse.data.data.refreshToken;
        } else if (apiResponse?.data) {
          userData = apiResponse.data.user;
          accessToken = apiResponse.data.access_token || apiResponse.data.accessToken;
          refreshToken = apiResponse.data.refresh_token || apiResponse.data.refreshToken;
        } else if (apiResponse?.user) {
          userData = apiResponse.user;
          accessToken = apiResponse.access_token || apiResponse.accessToken;
          refreshToken = apiResponse.refresh_token || apiResponse.refreshToken;
        }
      }

      if (!userData || !accessToken) {
        throw new Error('Invalid response structure: missing user data or token');
      }

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('userData', JSON.stringify(userData));
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      if (userData.role === 'parent' && userData.parentId) {
        localStorage.setItem('parent_id', userData.parentId);
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: userData,
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      });

      return { user: userData, accessToken, refreshToken };

    } catch (error) {
      let errorMessage = 'Đăng nhập thất bại';

      if (error.message === 'Request timeout') {
        errorMessage = 'Kết nối API timeout. Vui lòng thử lại.';
      } else if (error.response?.data?.message) {
        // Dịch các thông báo lỗi phổ biến từ tiếng Anh sang tiếng Việt
        const backendMessage = error.response.data.message;
        const errorTranslations = {
          'Incorrect email or password': 'Email hoặc mật khẩu không đúng',
          'Invalid email or password': 'Email hoặc mật khẩu không đúng',
          'Email or password is incorrect': 'Email hoặc mật khẩu không đúng',
          'User not found': 'Tài khoản không tồn tại',
          'Account not found': 'Tài khoản không tồn tại',
          'Email not found': 'Email không tồn tại',
          'Password is incorrect': 'Mật khẩu không đúng',
          'Invalid credentials': 'Thông tin đăng nhập không hợp lệ',
          'Authentication failed': 'Xác thực thất bại',
          'Login failed': 'Đăng nhập thất bại',
          'Account is disabled': 'Tài khoản đã bị vô hiệu hóa',
          'Account is locked': 'Tài khoản đã bị khóa',
          'Too many login attempts': 'Quá nhiều lần đăng nhập thất bại',
          'Please try again later': 'Vui lòng thử lại sau',
          'Server error': 'Lỗi server',
          'Internal server error': 'Lỗi server nội bộ'
        };

        errorMessage = errorTranslations[backendMessage] || backendMessage;
      } else if (error.response?.status === 401) {
        errorMessage = 'Email hoặc mật khẩu không đúng';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      } else if (error.message && error.message !== 'Request timeout') {
        errorMessage = error.message;
      }

      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });

      // Không throw error để tránh reload trang
      return null;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await logoutAPI(refreshToken);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('userData');
      localStorage.removeItem('parent_id');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await refreshTokenAPI(refreshToken);

      let newAccessToken = null;
      let newRefreshToken = null;

      // Xử lý response theo cấu trúc khác nhau
      if (response?.tokens?.access?.token) {
        newAccessToken = response.tokens.access.token;
        newRefreshToken = response.tokens.refresh?.token;
      } else if (response?.data?.tokens?.access?.token) {
        newAccessToken = response.data.tokens.access.token;
        newRefreshToken = response.data.tokens.refresh?.token;
      } else if (response?.access?.token) {
        newAccessToken = response.access.token;
        newRefreshToken = response.refresh?.token;
      } else if (response?.data?.access?.token) {
        newAccessToken = response.data.access.token;
        newRefreshToken = response.data.refresh?.token;
      } else if (response?.access_token) {
        newAccessToken = response.access_token;
        newRefreshToken = response.refresh_token;
      } else if (response?.data?.access_token) {
        newAccessToken = response.data.access_token;
        newRefreshToken = response.data.refresh_token;
      }

      if (!newAccessToken) {
        throw new Error('Invalid refresh token response');
      }

      // Cập nhật localStorage
      localStorage.setItem('access_token', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken);
      }

      // Cập nhật state
      dispatch({
        type: 'REFRESH_TOKEN_SUCCESS',
        payload: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      });

      return newAccessToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      // Nếu refresh token thất bại, logout user
      await logout();
      // Không throw error để tránh reload trang
      return null;
    }
  };

  const updateUser = (updatedData) => {
    dispatch({ type: 'UPDATE_USER', payload: updatedData });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    logout,
    refreshToken,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
