import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ArrowRight, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import './Login.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PasswordSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email');
  
  const [mode, setMode] = useState(emailParam ? 'verify' : 'request'); // 'request' or 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const [formData, setFormData] = useState({
    email: emailParam || '',
    otpValue: ["", "", "", "", "", ""],
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...formData.otpValue];
    newOtp[index] = value.substring(value.length - 1);
    setFormData(prev => ({ ...prev, otpValue: newOtp }));

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !formData.otpValue[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!formData.email) return setError('Email is required');

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/athlete/request-setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim() })
      });
      
      const result = await response.json();
      if (result.success) {
        setMode('verify');
        setResendTimer(180);
        setSuccess('Verification OTP sent to your registered email.');
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSet = async (e) => {
    e.preventDefault();
    const code = formData.otpValue.join("");
    if (code.length < 6) return setError('Please enter 6-digit OTP');

    if (formData.newPassword.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/athlete/setup-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          otp: code,
          password: formData.newPassword
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setSuccess('Password set successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.message || 'Failed to set password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="athlete-auth-container">
      <div className="auth-card glass-premium">
        <div className="auth-header">
          <div className="auth-logo">
            <img src="https://res.cloudinary.com/dgfpfxkpk/image/upload/q_auto/f_auto/v1777829890/logo_hdbywh.png" alt="ITF India" />
          </div>
          <h1>{mode === 'request' ? 'Password Security' : 'Secure Verification'}</h1>
          <p>
            {mode === 'request' ? 'Enter your email to receive a secure setup code' : 
             'Verify your identity and set your new password'}
          </p>
        </div>

        {error && <div className="auth-alert error"><AlertCircle size={18} /> {error}</div>}
        {success && <div className="auth-alert success"><CheckCircle size={18} /> {success}</div>}

        {mode === 'request' && (
          <form className="auth-form" onSubmit={handleRequestOtp}>
            <div className="input-group">
              <label><Mail size={16} /> Registered Email</label>
              <input 
                type="email" 
                name="email" 
                placeholder="athlete@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Verification OTP'} <ArrowRight size={18} />
            </button>
            <div className="auth-footer">
              <Link to="/login" className="back-link">Back to Login</Link>
            </div>
          </form>
        )}

        {mode === 'verify' && (
          <form className="auth-form" onSubmit={handleVerifyAndSet}>
            <div className="otp-verification-box">
              <div className="otp-title-group">
                <h4>6-Digit Verification Code</h4>
                <p>Sent to: <strong>{formData.email}</strong></p>
              </div>
              
              <div className="otp-digit-container">
                {formData.otpValue.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="otp-digit-box"
                    placeholder="•"
                  />
                ))}
              </div>

              <div className="resend-container">
                {resendTimer > 0 ? (
                  <p className="timer-text">Resend code in {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}</p>
                ) : (
                  <button type="button" className="resend-btn" onClick={handleRequestOtp} disabled={loading}>
                    Didn't receive code? Resend
                  </button>
                )}
              </div>
            </div>

            <div className="input-group">
              <label><Lock size={16} /> Create New Password</label>
              <input 
                type="password" 
                name="newPassword"
                placeholder="Minimum 8 characters"
                value={formData.newPassword}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="input-group">
              <label><ShieldCheck size={16} /> Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required 
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Complete Security Setup'} <KeyRound size={18} />
            </button>
            <div className="auth-footer">
               <button type="button" className="back-link" onClick={() => setMode('request')}>Use a different email</button>
            </div>
          </form>
        )}
      </div>
      
      <div className="auth-background">
        <div className="blob"></div>
        <div className="blob"></div>
      </div>
    </div>
  );
};

export default PasswordSetup;
