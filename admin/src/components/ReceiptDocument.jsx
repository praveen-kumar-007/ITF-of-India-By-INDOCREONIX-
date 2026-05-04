import React from 'react';

const ReceiptDocument = ({ data }) => {
  if (!data) return null;

  return (
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
              <strong>{data.regNo}</strong>
            </div>
            <div className="meta-item">
              <label>Date Issued</label>
              <strong>{data.date}</strong>
            </div>
          </div>
        </div>

        <div className="document-body">
          <div className="doc-section">
            <h3 className="section-divider">Athlete Details</h3>
            <div className="info-grid">
              <div className="info-cell">
                <label>Full Name</label>
                <span>{data.fullName}</span>
              </div>
              <div className="info-cell">
                <label>Father's Name</label>
                <span>{data.fatherName}</span>
              </div>
              <div className="info-cell">
                <label>Sport Discipline</label>
                <span>{data.sportsDiscipline}</span>
              </div>
              <div className="info-cell">
                <label>State</label>
                <span>{data.state}</span>
              </div>
              <div className="info-cell">
                <label>District</label>
                <span>{data.district}</span>
              </div>
              <div className="info-cell">
                <label>Contact Number</label>
                <span>{data.contactNumber}</span>
              </div>
            </div>
          </div>

          <div className="doc-section">
            <h3 className="section-divider">Payment & Verification</h3>
            <div className="payment-status-box">
              <div className="payment-detail">
                <label>Transaction ID / UTR</label>
                <strong>{data.transactionId}</strong>
              </div>
              <div className="payment-detail">
                <label>Amount Paid</label>
                <strong>₹{data.amount}/-</strong>
              </div>
              <div className="payment-detail">
                <label>Status</label>
                <span className={`status-pill ${data.status === 'APPROVED' ? 'status-approved' : data.status === 'REJECTED' ? 'status-rejected' : 'status-pending'}`}>
                  {data.status || 'PENDING FOR VERIFICATION'}
                </span>
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
  );
};

export default ReceiptDocument;
