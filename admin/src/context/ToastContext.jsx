import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = useCallback((message, type = 'info') => {
    setToast({ show: true, message, type });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.show && (
        <div className={`premium-toast-bar ${toast.type}`}>
          <div className="toast-logo">
            <img src="/logo.jpeg" alt="ITF Logo" />
          </div>
          <div className="toast-content">
            <h5>ITF India Portal</h5>
            <p>{toast.message}</p>
          </div>
          <div className="toast-progress-bar"></div>
        </div>
      )}
    </ToastContext.Provider>
  );
};
