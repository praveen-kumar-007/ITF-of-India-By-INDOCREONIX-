import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();

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
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-name-grid">
              <input type="text" placeholder={t('registration.first_name')} />
              <input type="text" placeholder={t('registration.last_name')} />
            </div>
            <input type="email" placeholder={t('registration.email')} />
            <textarea placeholder={t('contact.message_placeholder')} rows="5"></textarea>
            <button type="submit" className="btn-premium" style={{width: '100%'}}>{t('contact.send')}</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
