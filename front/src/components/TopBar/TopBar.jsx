import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const TopBar = () => {
  const { t } = useLanguage();

  return (
    <div className="top-bar">
      <div className="container top-bar-flex">
        <div className="top-info">
          <span>📧 itfofindia2013@gmail.com</span>
          <span>📞 +91 9229502961</span>
        </div>
        <div className="top-right-actions">
          <span className="hide-mobile">{t('topbar.official')}</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
