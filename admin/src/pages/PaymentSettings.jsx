import React, { useState, useEffect } from 'react';
import { CreditCard, Save, Link as LinkIcon, IndianRupee, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './PaymentSettings.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PaymentSettings = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    upiId: '',
    merchantName: '',
    amount: ''
  });

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/payment`);
      const result = await response.json();
      if (result.success) {
        setFormData({
          upiId: result.data.upiId || '',
          merchantName: result.data.merchantName || '',
          amount: result.data.amount || ''
        });
      }
    } catch (error) {
      showToast('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/settings/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        showToast('Payment settings updated successfully', 'success');
      } else {
        showToast(result.message || 'Update failed', 'error');
      }
    } catch (error) {
      showToast('Error updating settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading Gateway Config...</p>
      </div>
    );
  }

  return (
    <div className="payment-settings-page animate-fade-in">
      <header className="page-header">
        <div className="header-icon-wrapper">
          <CreditCard size={28} />
        </div>
        <div>
          <h1>Payment Gateway Configuration</h1>
          <p>Manage UPI details and registration fees for athletes.</p>
        </div>
      </header>

      <div className="settings-grid">
        <div className="settings-card glass-premium">
          <div className="card-header">
            <h3>UPI Configuration</h3>
            <span className="status-dot active"></span>
          </div>

          <form onSubmit={handleSubmit} className="settings-form">
            <div className="input-group">
              <label>
                <LinkIcon size={16} /> 
                Official UPI ID
              </label>
              <input 
                type="text" 
                placeholder="e.g., 8340302054@ibl" 
                value={formData.upiId}
                onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                required
              />
              <p className="helper-text">Enter the VPA/UPI ID where registration fees should be sent.</p>
            </div>

            <div className="input-group">
              <label>
                <CreditCard size={16} /> 
                Account Holder Name
              </label>
              <input 
                type="text" 
                placeholder="e.g., Indra Kumar Rishi" 
                value={formData.merchantName}
                onChange={(e) => setFormData({...formData, merchantName: e.target.value})}
                required
              />
              <p className="helper-text">Official name associated with the UPI ID.</p>
            </div>

            <div className="input-group">
              <label>
                <IndianRupee size={16} /> 
                Registration Fee (Amount)
              </label>
              <input 
                type="number" 
                placeholder="e.g., 500" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
              <p className="helper-text">This amount will be automatically appended to the UPI QR code for athletes.</p>
            </div>

            <div className="warning-box">
              <AlertCircle size={20} />
              <div>
                <h4>Security Notice</h4>
                <p>Changes to these settings will immediately affect the registration portal. Please verify the UPI ID before saving.</p>
              </div>
            </div>

            <button type="submit" className="premium-btn btn-secondary save-btn" disabled={saving}>
              {saving ? (
                <>Updating...</>
              ) : (
                <>
                  <Save size={18} /> Update Gateway Settings
                </>
              )}
            </button>
          </form>
        </div>

        <div className="preview-card glass-premium">
           <div className="card-header">
             <h3>Portal Preview</h3>
           </div>
           <div className="preview-content">
             <div className="mock-mobile">
                <div className="mock-screen">
                  <div className="mock-header">Registration Payment</div>
                  <div className="mock-amount">₹{formData.amount || '0'}</div>
                  <div className="mock-qr-container">
                    <div className="mock-qr">
                      <div className="qr-box"></div>
                      <IndianRupee size={32} className="qr-icon" />
                    </div>
                  </div>
                  <div className="mock-details">
                     <p>Scan to Pay using any UPI App</p>
                     <span>{formData.upiId ? `Pay to: ${formData.upiId}` : 'UPI ID not set'}</span>
                  </div>
                </div>
             </div>
             <div className="preview-info">
                <CheckCircle size={16} /> <span>Dynamic QR Generation Active</span>
                <CheckCircle size={16} /> <span>Auto-Amount Appending</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
