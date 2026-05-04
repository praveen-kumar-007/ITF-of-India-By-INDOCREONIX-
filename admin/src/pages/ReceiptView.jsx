import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import ReceiptDocument from '../components/ReceiptDocument';
import '../../../front/src/pages/Registration/Registration.css';

const ReceiptView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const receiptData = location.state?.receiptData;

  const handlePrint = () => {
    window.print();
  };

  if (!receiptData) {
    return (
      <div className="receipt-error-page">
        <div className="error-card">
          <h2>No Receipt Data</h2>
          <p>Please go back and fill the generator form first.</p>
          <button className="btn-outline" onClick={() => navigate('/receipt-generator')}>
            <ArrowLeft size={18} />
            Back to Generator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-receipt-view-page">
      <div className="view-header no-print">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Official Receipt Preview</h1>
            <p>Verify details before printing</p>
          </div>
        </div>
        <button className="btn-print-primary" onClick={handlePrint}>
          <Printer size={18} />
          Print Official Document
        </button>
      </div>

      <div className="receipt-preview-wrapper">
        <ReceiptDocument data={receiptData} />
      </div>

      <div className="view-footer no-print">
        <p>Confirm that all athlete details match the offline application before issuing this receipt.</p>
      </div>
    </div>
  );
};

export default ReceiptView;
