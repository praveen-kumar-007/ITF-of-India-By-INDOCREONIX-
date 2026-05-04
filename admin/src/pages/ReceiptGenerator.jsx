import React, { useState, useEffect } from 'react';
import { Printer, RefreshCcw, FileCheck, UserPlus } from 'lucide-react';
import './ReceiptGenerator.css';
import '../../../front/src/pages/Registration/Registration.css'; // Correct path to reuse professional receipt styles

const ReceiptGenerator = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    sportsDiscipline: '',
    state: '',
    district: '',
    contactNumber: '',
    transactionId: '',
    regNo: '',
    date: new Date().toISOString().split('T')[0],
    amount: '500'
  });

  const [previewData, setPreviewData] = useState(null);

  // Generate a mock Receipt ID if empty
  useEffect(() => {
    if (!formData.regNo) {
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      setFormData(prev => ({ ...prev, regNo: `ITF/OFFLINE/${year}/${random}` }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoadSample = () => {
    setFormData({
      fullName: 'Praveen Kumar',
      fatherName: 'Late Sh. Ram Kumar',
      sportsDiscipline: 'Kabaddi',
      state: 'Haryana',
      district: 'Rohtak',
      contactNumber: '9876543210',
      transactionId: 'OFFLINE_CASH_12345',
      regNo: 'ITF/REG/2026/SAMPLE',
      date: new Date().toISOString().split('T')[0],
      amount: '500'
    });
    setPreviewData({
      fullName: 'Praveen Kumar',
      fatherName: 'Late Sh. Ram Kumar',
      sportsDiscipline: 'Kabaddi',
      state: 'Haryana',
      district: 'Rohtak',
      contactNumber: '9876543210',
      transactionId: 'OFFLINE_CASH_12345',
      regNo: 'ITF/REG/2026/SAMPLE',
      date: new Date().toLocaleDateString(),
      amount: '500'
    });
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    setPreviewData({
      ...formData,
      date: new Date(formData.date).toLocaleDateString()
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-generator-page">
      <div className="page-header no-print">
        <div>
          <h1>Receipt Generator</h1>
          <p>Issue official receipts for offline registrations</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" onClick={handleLoadSample}>
            <FileCheck size={18} />
            Load Sample Receipt
          </button>
        </div>
      </div>

      <div className="generator-layout">
        <div className="generator-form-card no-print">
          <h2>Receipt Details</h2>
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label>Receipt Number</label>
              <input 
                type="text" 
                name="regNo" 
                value={formData.regNo} 
                onChange={handleInputChange} 
                placeholder="e.g. ITF/REG/2026/001"
              />
            </div>
            
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleInputChange} 
                placeholder="Athlete's Full Name"
                required
              />
            </div>

            <div className="form-group">
              <label>Father's Name</label>
              <input 
                type="text" 
                name="fatherName" 
                value={formData.fatherName} 
                onChange={handleInputChange} 
                placeholder="Father's Name"
              />
            </div>

            <div className="form-group">
              <label>Sport Discipline</label>
              <input 
                type="text" 
                name="sportsDiscipline" 
                value={formData.sportsDiscipline} 
                onChange={handleInputChange} 
                placeholder="e.g. Taekwondo, Kabaddi"
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input 
                type="text" 
                name="state" 
                value={formData.state} 
                onChange={handleInputChange} 
                placeholder="State"
              />
            </div>

            <div className="form-group">
              <label>District</label>
              <input 
                type="text" 
                name="district" 
                value={formData.district} 
                onChange={handleInputChange} 
                placeholder="District"
              />
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <input 
                type="text" 
                name="contactNumber" 
                value={formData.contactNumber} 
                onChange={handleInputChange} 
                placeholder="Phone Number"
              />
            </div>

            <div className="form-group">
              <label>Transaction ID / Remarks</label>
              <input 
                type="text" 
                name="transactionId" 
                value={formData.transactionId} 
                onChange={handleInputChange} 
                placeholder="e.g. CASH, UTR12345"
              />
            </div>

            <div className="form-group">
              <label>Registration Date</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleInputChange} 
              />
            </div>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input 
                type="number" 
                name="amount" 
                value={formData.amount} 
                onChange={handleInputChange} 
              />
            </div>

            <div className="generator-actions">
              <button type="submit" className="btn-generate">
                Preview Receipt
              </button>
              {previewData && (
                <button type="button" className="btn-print" onClick={handlePrint}>
                  <Printer size={18} />
                  Print Official Receipt
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="receipt-preview-section">
          {previewData ? (
            <div className="receipt-document-wrapper">
              <div className="receipt-professional-document" id="printable-receipt">
                <div className="document-header">
                  <div className="org-branding">
                    <img src="/logo.jpeg" alt="ITF Logo" className="doc-logo" />
                    <div className="org-names">
                      <h1>ITF OF INDIA</h1>
                      <p>National Sports Federation & Athlete Portal</p>
                    </div>
                  </div>
                  <div className="doc-meta">
                    <div className="reg-badge">OFFICIAL RECEIPT</div>
                    <div className="meta-item">
                      <label>Receipt ID</label>
                      <strong>{previewData.regNo}</strong>
                    </div>
                    <div className="meta-item">
                      <label>Date Issued</label>
                      <strong>{previewData.date}</strong>
                    </div>
                  </div>
                </div>

                <div className="document-body">
                  <div className="doc-section">
                    <h3 className="section-divider">Athlete Details</h3>
                    <div className="info-grid">
                      <div className="info-cell">
                        <label>Full Name</label>
                        <span>{previewData.fullName}</span>
                      </div>
                      <div className="info-cell">
                        <label>Father's Name</label>
                        <span>{previewData.fatherName}</span>
                      </div>
                      <div className="info-cell">
                        <label>Sport Discipline</label>
                        <span>{previewData.sportsDiscipline}</span>
                      </div>
                      <div className="info-cell">
                        <label>State</label>
                        <span>{previewData.state}</span>
                      </div>
                      <div className="info-cell">
                        <label>District</label>
                        <span>{previewData.district}</span>
                      </div>
                      <div className="info-cell">
                        <label>Contact Number</label>
                        <span>{previewData.contactNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="doc-section">
                    <h3 className="section-divider">Payment & Verification</h3>
                    <div className="payment-status-box">
                      <div className="payment-detail">
                        <label>Transaction ID / UTR</label>
                        <strong>{previewData.transactionId}</strong>
                      </div>
                      <div className="payment-detail">
                        <label>Amount Paid</label>
                        <strong>₹{previewData.amount}/-</strong>
                      </div>
                      <div className="payment-detail">
                        <label>Status</label>
                        <span className="status-pending-pill">Official Record</span>
                      </div>
                    </div>
                  </div>

                  <div className="verification-notice-box">
                    <p>This is a computer-generated official receipt for your registration with ITF OF INDIA. This document serves as proof of registration for national records and participation in sanctioned events.</p>
                  </div>
                </div>

                <div className="document-footer">
                  <div className="signature-area">
                    <div className="sig-box center-sig">
                      <img
                        src="/logo.jpeg"
                        alt="Official Seal"
                        className="watermark-stamp official-seal"
                      />
                      <div className="sig-line"></div>
                      <p>Registrar, ITF OF INDIA</p>
                      <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '5px' }}>National Headquarters, India</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="receipt-preview-container no-print">
              <div className="placeholder-text">
                <Printer size={48} opacity={0.2} />
                <p>Fill the form and click "Preview Receipt" to see the document here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerator;
