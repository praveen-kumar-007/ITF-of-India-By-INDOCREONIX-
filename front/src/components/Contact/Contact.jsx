import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        setStatus({ type: 'success', message: result.message });
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', message: result.message });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to connect to server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section" style={{background: 'var(--bg-soft)'}}>
      <div className="container contact-grid">
        <div className="contact-details">
          <span className="section-tag">{t('contact.tag')}</span>
          <h2 className="section-title">{t('contact.title')}</h2>
          <div>
            <h4 style={{color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '6px'}}>{t('contact.head_office')}</h4>
            <p>YOGIYADERA, PORAIYA, NIMIYAGHAT, DUMRI, GIRIDIH-825167, JHARKHAND</p>
          </div>
          <br/>
          <div>
            <h4 style={{color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '6px'}}>{t('contact.direct_contact')}</h4>
            <p>+91 9229502961, +91 9241350028</p>
          </div>
          <br/>
          <div>
            <h4 style={{color: 'var(--secondary)', fontSize: '0.85rem', marginBottom: '6px'}}>{t('contact.official_email')}</h4>
            <p>itfofindia2013@gmail.com</p>
          </div>
        </div>
        <div className="contact-form-box">
          <form onSubmit={handleSubmit}>
            {status && (
              <div className={`form-status-alert ${status.type}`} style={{
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '0.9rem',
                background: status.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: status.type === 'success' ? '#166534' : '#991b1b',
                border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecaca'}`
              }}>
                {status.message}
              </div>
            )}
            <div className="form-name-grid">
              <input 
                type="text" 
                placeholder={t('registration.first_name')} 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
              <input 
                type="text" 
                placeholder={t('registration.last_name')} 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
            <input 
              type="email" 
              placeholder={t('registration.email')} 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <textarea 
              placeholder={t('contact.message_placeholder')} 
              rows="5"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
            ></textarea>
            <button 
              type="submit" 
              className="btn-premium" 
              style={{width: '100%', opacity: loading ? 0.7 : 1}}
              disabled={loading}
            >
              {loading ? 'Sending...' : t('contact.send')}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
