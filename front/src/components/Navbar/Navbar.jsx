import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const Navbar = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`sport-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container nav-content">
          <Link to="/" className="brand" style={{textDecoration: 'none'}}>
            <img src="/logo.jpeg" alt="ITF" className="logo" />
            <div className="brand-text">
              <span className="main">{t('brand.main')}</span>
              <span className="sub">{t('brand.sub')}</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <ul className="links desktop-links">
            <li><Link to="/">{t('nav.home')}</Link></li>
            <li><Link to="/about">About US</Link></li>
            <li><Link to="/sports">Sports</Link></li>
            <li><Link to="/news">{t('nav.news')}</Link></li>
            <li><Link to="/gallery">{t('nav.gallery')}</Link></li>
            <li><Link to="/contact">{t('nav.contact')}</Link></li>
            <li><Link to="/registration" className="nav-cta-btn">{t('nav.registration')}</Link></li>
          </ul>

          <div className="nav-actions">
            {/* Pill-style Language Toggle - Next to Hamburger */}
            <button className="nav-lang-btn pill-style" onClick={toggleLanguage}>
              <svg viewBox="0 0 24 24" width="16" height="16" className="translate-icon">
                <path fill="currentColor" d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75l1.13 3h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
              </svg>
              <span className="lang-text">{language === 'en' ? 'HI' : 'EN'}</span>
            </button>

            <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <div className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
                <span></span><span></span><span></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <div className="menu-logo">
              <img src="/logo.jpeg" alt="Logo" />
              <div>
                <h4 className="main">{t('brand.main')}</h4>
                <span className="sub">{t('brand.sub')}</span>
              </div>
            </div>
            <button className="menu-close-x" onClick={() => setIsMenuOpen(false)}>✕</button>
          </div>

          <nav className="mobile-nav-list">
            <Link to="/" className="mobile-link active" onClick={() => setIsMenuOpen(false)}>
              {t('nav.home')}
            </Link>
            
            <Link to="/about" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
              About US
            </Link>

            <Link to="/sports" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
              Sports
            </Link>

            <Link to="/news" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.news')}
            </Link>

            <Link to="/gallery" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.gallery')}
            </Link>

            <Link to="/registration" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.registration')}
            </Link>

            <Link to="/contact" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.contact')}
            </Link>
          </nav>

          <div className="mobile-menu-footer">
            <div className="affiliate-box">
              <img src="/logo.jpeg" alt="Affiliate Logo" className="footer-affiliate-logo" />
              <div className="affiliate-text">
                <p className="title">ITF OF INDIA TRUST</p>
                <p className="sub">NATIONAL MULTI-SPORT ORGANIZATION</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
