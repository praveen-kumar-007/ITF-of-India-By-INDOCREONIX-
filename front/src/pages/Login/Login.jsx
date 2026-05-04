import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, ShieldCheck, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import './Login.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AthleteLogin = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'setup' or 'verify'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Form States
  const [formData, setFormData] = useState({
    registrationNumber: '', // Used for identifier in login
    email: '',
    password: '',
    otpValue: ["", "", "", "", "", ""], // Digit-by-digit OTP
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Timer Effect
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...formData.otpValue];
    newOtp[index] = value.substring(value.length - 1);
    setFormData(prev => ({ ...prev, otpValue: newOtp }));

    // Auto-focus next
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/athlete/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.registrationNumber,
          password: formData.password
        })
      });
      
      const result = await response.json();
      if (result.success) {
        localStorage.setItem('athleteToken', result.data.token);
        localStorage.setItem('athlete', JSON.stringify(result.data.athlete));
        navigate('/athlete/profile');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
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
        body: JSON.stringify({
          email: formData.email
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setMode('verify');
        setResendTimer(180); // 3 minutes
        let msg = 'OTP sent to your registered email.';
        if (result.data?.devOtp) {
          msg = `Dev Mode: Your OTP is ${result.data.devOtp}`;
        }
        setSuccess(msg);
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
          email: formData.email,
          otp: code,
          password: formData.newPassword
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setMode('login');
        setSuccess('Password set successfully! You can now login.');
        setFormData({ ...formData, password: '', otpValue: ["", "", "", "", "", ""], newPassword: '', confirmPassword: '' });
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
            <img src="/logo.jpeg" alt="ITF India" />
          </div>
          <h1>Athlete Portal</h1>
          <p>
            {mode === 'login' ? 'Welcome back! Login to your portal' : 
             mode === 'setup' ? 'Setup or Reset your password via Email' : 
             'Verify your identity with OTP'}
          </p>
        </div>

        {error && <div className="auth-alert error"><AlertCircle size={18} /> {error}</div>}
        {success && <div className="auth-alert success"><CheckCircle size={18} /> {success}</div>}

        {mode === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label><User size={16} /> Reg. ID or Email</label>
              <input 
                type="text" 
                name="registrationNumber"
                placeholder="ID or Registered Email"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="input-group">
              <label><Lock size={16} /> Password</label>
              <div className="password-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required 
                  style={{ width: '100%' }}
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
            </button>
            <div className="auth-footer">
              <p>
                First time or lost access? 
                <button type="button" onClick={() => { setMode('setup'); setError(''); setSuccess(''); }}>
                  Setup / Forgot Password?
                </button>
              </p>
            </div>
          </form>
        )}

        {mode === 'setup' && (
          <form className="auth-form" onSubmit={handleRequestOtp}>
            <div className="input-group">
              <label><Mail size={16} /> Registered Email</label>
              <input 
                type="email" 
                name="email" 
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Get Verification OTP'}
            </button>
            <div className="auth-footer">
              <p>Remember your password? <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Login Now</button></p>
            </div>
          </form>
        )}

        {mode === 'verify' && (
          <form className="auth-form" onSubmit={handleVerifyAndSet}>
            <div className="otp-verification-box">
              <div className="otp-title-group">
                <h4>Email Verification</h4>
                <p>Enter the code sent to {formData.email}</p>
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

              <span 
                className={`resend-link ${loading || resendTimer > 0 ? 'disabled' : ''}`} 
                onClick={(!loading && resendTimer === 0) ? handleRequestOtp : null}
              >
                {loading ? "Processing..." : (resendTimer > 0 ? `Resend in ${formatTime(resendTimer)}` : "Resend OTP")}
              </span>
            </div>

            <div className="input-group">
              <label><Lock size={16} /> New Password</label>
              <div className="password-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  name="newPassword"
                  placeholder="Min. 8 characters"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required 
                  style={{ width: '100%' }}
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: 'absolute', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="input-group">
              <label><Lock size={16} /> Confirm Password</label>
              <div className="password-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required 
                  style={{ width: '100%' }}
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Set Password & Verify'}
            </button>
            <div className="auth-footer">
              <button type="button" onClick={() => { setMode('setup'); setError(''); setSuccess(''); }}>Change Email Address</button>
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

export default AthleteLogin;
