import api from './api';

export const otpService = {
  // Send OTP to phone number
  sendOTP: async (phone) => {
    const response = await api.post('/otp/send', { phone });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (phone, otp) => {
    const response = await api.post('/otp/verify', { phone, otp });
    return response.data;
  },

  // Resend OTP
  resendOTP: async (phone) => {
    const response = await api.post('/otp/resend', { phone });
    return response.data;
  }
};
