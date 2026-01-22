import api from './api';

export const authService = {
  // Register new user
  register: async (data) => {
    return api.post('/auth/register', data);
  },

  // Login
  login: async (phone, password) => {
    const response = await api.post('/auth/login', { phone, password });
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getMe: async () => {
    return api.get('/auth/me');
  },

  // Alias for getMe
  getCurrentUser: async () => {
    return api.get('/auth/me');
  },

  // Send OTP
  sendOtp: async (phone, purpose = 'REGISTRATION') => {
    return api.post('/auth/send-otp', { phone, purpose });
  },

  // Verify OTP
  verifyOtp: async (phone, otp, purpose = 'REGISTRATION') => {
    return api.post('/auth/verify-otp', { phone, otp, purpose });
  },

  // Get stored user
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },
};
