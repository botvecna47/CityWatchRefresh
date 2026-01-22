import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Eye, MapPin, Phone, Lock, User, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import './AuthPages.css';

export function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password', '');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await registerUser({
        name: data.name,
        phone: data.phone,
        password: data.password
      });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password)
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the civic accountability movement</p>
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
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon-left" />
              <input
                type="text"
                className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                placeholder="Enter your full name"
                style={{ paddingLeft: '2.75rem' }}
                {...register('name', { 
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
              />
            </div>
            {errors.name && (
              <div className="form-error">
                <AlertCircle size={14} />
                <span>{errors.name.message}</span>
              </div>
            )}
          </div>

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
                placeholder="Create a password"
                style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
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
            
            {/* Password Strength */}
            {password && (
              <div className="password-strength">
                <div className={`strength-item ${passwordChecks.length ? 'valid' : ''}`}>
                  <Check size={12} />
                  <span>At least 8 characters</span>
                </div>
                <div className={`strength-item ${passwordChecks.uppercase ? 'valid' : ''}`}>
                  <Check size={12} />
                  <span>One uppercase letter</span>
                </div>
                <div className={`strength-item ${passwordChecks.number ? 'valid' : ''}`}>
                  <Check size={12} />
                  <span>One number</span>
                </div>
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
            Create Account
            <ArrowRight size={18} />
          </Button>
        </form>

        {/* Footer */}
        <div className="auth-link">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>

        {/* Terms */}
        <p className="auth-terms">
          By creating an account, you agree to our{' '}
          <a href="#">Terms of Service</a> and{' '}
          <a href="#">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
