import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, MapPin, Shield, ArrowRight, RefreshCw } from 'lucide-react';
import { otpService } from '../services/otp.service';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import './AuthPages.css';

export function VerifyOTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuthStore();
  
  // Get phone from location state or user
  const phone = location.state?.phone || user?.phone;

  useEffect(() => {
    if (!phone) {
      navigate('/login');
      return;
    }

    // Send OTP on mount
    handleSendOTP();
  }, [phone]);

  useEffect(() => {
    // Countdown timer
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleSendOTP = async () => {
    try {
      const response = await otpService.sendOTP(phone);
      // In dev mode, auto-fill OTP if returned
      if (response.otp) {
        const otpDigits = response.otp.split('');
        setOtp(otpDigits);
        toast.info(`Dev Mode - OTP: ${response.otp}`);
      } else {
        toast.success('OTP sent to your phone');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(digits.length, 5)]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await otpService.verifyOTP(phone, otpString);
      setUser(response.user);
      toast.success('Phone verified successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await handleSendOTP();
      setCountdown(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Eye className="logo-eye" />
            <MapPin className="logo-pin" />
          </div>
          <span>CityWatch</span>
        </div>

        {/* Header */}
        <div className="auth-header">
          <div className="otp-icon">
            <Shield size={32} />
          </div>
          <h1 className="auth-title">Verify Your Phone</h1>
          <p className="auth-subtitle">
            We've sent a 6-digit code to<br />
            <strong>+91 {phone}</strong>
          </p>
        </div>

        {/* OTP Input */}
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="otp-input"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Verify Button */}
        <Button
          fullWidth
          size="lg"
          loading={loading}
          onClick={handleVerify}
          disabled={otp.join('').length !== 6}
        >
          Verify Phone
          <ArrowRight size={18} />
        </Button>

        {/* Resend */}
        <div className="otp-resend">
          {canResend ? (
            <button 
              className="otp-resend-btn"
              onClick={handleResend}
              disabled={resending}
            >
              <RefreshCw size={14} className={resending ? 'spinning' : ''} />
              Resend OTP
            </button>
          ) : (
            <p>Resend OTP in <strong>{countdown}s</strong></p>
          )}
        </div>

        {/* Change Number */}
        <div className="auth-link">
          <p>
            Wrong number?{' '}
            <a href="#" onClick={() => navigate('/register')}>Change</a>
          </p>
        </div>
      </div>
    </div>
  );
}
