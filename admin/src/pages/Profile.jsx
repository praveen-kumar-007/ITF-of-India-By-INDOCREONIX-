import React, { useState, useRef } from 'react';
import { Camera, User, Mail, Lock, Shield, Save, Upload } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './Profile.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const { showToast } = useToast();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    password: '',
    confirmPassword: '',
    otpValue: ["", "", "", "", "", ""]
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user.photo || '');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const requestOtp = async () => {
    if (!formData.password) {
      showToast('Please enter a new password first', 'warning');
      return;
    }
    setSendingOtp(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/request-profile-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setOtpSent(true);
        showToast('Verification OTP sent to your email', 'success');
      } else {
        showToast(result.message || 'Failed to send OTP', 'error');
      }
    } catch (error) {
      showToast('Error connecting to server', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...formData.otpValue];
    newOtp[index] = value.substring(value.length - 1);
    setFormData((prev) => ({ ...prev, otpValue: newOtp }));

    if (value && index < 5) {
      const nextInput = document.getElementById(`profile-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !formData.otpValue[index] && index > 0) {
      const prevInput = document.getElementById(`profile-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);



    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      if (formData.password) {
        data.append('password', formData.password);
        data.append('otp', formData.otpValue.join(""));
      }
      if (photoFile) data.append('photo', photoFile);

      const response = await fetch(`${API_BASE_URL}/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Don't set Content-Type header when using FormData, 
          // the browser will set it with the correct boundary
        },
        body: data
      });

      const result = await response.json();
      if (result.success) {
        const updatedUser = { 
          ...user, 
          fullName: formData.fullName, 
          email: formData.email, 
          photo: result.data.photo || user.photo 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showToast('Profile updated successfully!', 'success');
        setFormData({ ...formData, password: '', confirmPassword: '' });
        setPhotoFile(null);
      } else {
        showToast(result.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Update error:', error);
      showToast('An error occurred. Please try again.', 'error');
    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="Profile" 
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar placeholder">
                  <User size={60} />
                </div>
              )}
              <button 
                type="button"
                className="edit-avatar-btn" 
                title="Upload Photo"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={18} />
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <h2>{formData.fullName}</h2>
            <p>{user.role?.toUpperCase()} Account</p>
          </div>

          <div className="profile-body">


            <form onSubmit={handleUpdate}>
              <div className="form-section">
                <h3><User size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Account Details</h3>
                <div className="form-grid">
                  <div className="input-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input 
                      id="fullName"
                      name="fullName"
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <input 
                      id="email"
                      name="email"
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3><Lock size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Security</h3>
                <div className="form-grid">
                  <div className="input-group">
                    <label htmlFor="newPassword">New Password (leave blank to keep current)</label>
                    <input 
                      id="newPassword"
                      name="password"
                      type="password" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input 
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password" 
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {formData.password && (
                  <div className="otp-verification-box animate-fade-in">
                    <div className="otp-title-group">
                      <h4>Security Verification Required</h4>
                      <p>Enter the 6-digit code sent to your email</p>
                    </div>

                    <div className="otp-digit-container">
                      {formData.otpValue.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`profile-otp-${idx}`}
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

                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                      <button 
                        type="button" 
                        onClick={requestOtp} 
                        disabled={sendingOtp}
                        className="request-otp-btn"
                      >
                        {sendingOtp ? 'Sending code...' : otpSent ? 'Resend Verification Code' : 'Send Verification OTP'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="save-profile-btn" disabled={loading}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  {loading ? (
                    <>Saving Changes...</>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Profile Changes
                    </>
                  )}
                </div>
              </button>
            </form>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
