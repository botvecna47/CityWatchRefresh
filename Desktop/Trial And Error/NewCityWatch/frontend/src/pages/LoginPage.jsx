import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Eye, MapPin, Phone, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import './AuthPages.css';

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await login(data.phone, data.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      setError(error.message || 'Invalid phone number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">
            <Eye className="logo-eye" />
            <MapPin className="logo-pin" />
          </div>
          <span>CityWatch</span>
        </Link>

        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue to CityWatch</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="auth-error">
            <AlertCircle />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-wrapper">
              <Phone className="input-icon-left" />
              <input
                type="tel"
                className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                placeholder="Enter your phone number"
                style={{ paddingLeft: '2.75rem' }}
                {...register('phone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Enter a valid 10-digit phone number'
                  }
                })}
              />
            </div>
            {errors.phone && (
              <div className="form-error">
                <AlertCircle size={14} />
                <span>{errors.phone.message}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon-left" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                placeholder="Enter your password"
                style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              <button 
                type="button" 
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                <Eye size={18} />
              </button>
            </div>
            {errors.password && (
              <div className="form-error">
                <AlertCircle size={14} />
                <span>{errors.password.message}</span>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            fullWidth 
            loading={loading}
            size="lg"
            className="auth-submit"
          >
            Sign In
            <ArrowRight size={18} />
          </Button>
        </form>

        {/* Footer */}
        <div className="auth-link">
          <p>Don't have an account? <Link to="/register">Create one</Link></p>
        </div>

        {/* Demo Credentials */}
        <div className="auth-demo">
          <p className="auth-demo-title">Demo Accounts</p>
          <div className="auth-demo-list">
            <div className="auth-demo-item">
              <span className="auth-demo-role">Citizen:</span>
              <span>9876543210 / password123</span>
            </div>
            <div className="auth-demo-item">
              <span className="auth-demo-role">Moderator:</span>
              <span>9999999998 / password123</span>
            </div>
            <div className="auth-demo-item">
              <span className="auth-demo-role">Admin:</span>
              <span>9999999999 / password123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
