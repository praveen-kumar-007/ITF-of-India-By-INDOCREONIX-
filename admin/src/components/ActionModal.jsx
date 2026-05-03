import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import './ActionModal.css';

const ActionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'info', // 'info', 'success', 'danger', 'warning'
  showInput = false,
  inputPlaceholder = 'Enter reason...',
  inputValue = '',
  onInputChange = () => {},
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="modal-icon success" size={48} />;
      case 'danger': return <XCircle className="modal-icon danger" size={48} />;
      case 'warning': return <AlertTriangle className="modal-icon warning" size={48} />;
      default: return <Info className="modal-icon info" size={48} />;
    }
  };

  const logoUrl = 'https://res.cloudinary.com/dgfpfxkpk/image/upload/q_auto/f_auto/v1777829890/logo_hdbywh.png';

  return (
    <div className="modal-overlay">
      <div className="modal-container glass-premium animate-fade-in">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        
        <div className="modal-header">
          <img src={logoUrl} alt="ITF Logo" className="modal-logo" />
          <div className="header-decoration"></div>
        </div>

        <div className="modal-body">
          {getIcon()}
          <h3>{title}</h3>
          <p>{message}</p>

          {showInput && (
            <div className="modal-input-wrapper">
              <textarea
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={inputPlaceholder}
                className="modal-textarea"
                rows="4"
                autoFocus
              ></textarea>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button 
            className="modal-btn cancel" 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            className={`modal-btn confirm ${type}`} 
            onClick={() => onConfirm(inputValue)}
            disabled={loading || (showInput && !inputValue.trim())}
          >
            {loading ? <div className="spinner-small"></div> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
