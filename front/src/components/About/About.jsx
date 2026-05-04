import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="section about-main">
      <div className="container">
        <div className="about-flex">
          <div className="about-text">
            <span className="section-tag">{t('about.profile_tag')}</span>
            <h2 className="section-title">{t('about.title')}</h2>
            <p className="main-desc"><strong>{t('brand.main')}</strong> {t('about.desc1')}</p>
            <p className="sub-desc">{t('about.desc2')}</p>
            
            <div className="about-features">
              <div className="feature-item">
                <span className="check">✓</span>
                <span>{t('about.feature1')}</span>
              </div>
              <div className="feature-item">
                <span className="check">✓</span>
                <span>{t('about.feature2')}</span>
              </div>
              <div className="feature-item">
                <span className="check">✓</span>
                <span>{t('about.feature3')}</span>
              </div>
            </div>

            <a href="#contact" className="btn-premium">{t('about.partner_btn')}</a>
          </div>
          <div className="about-visual">
            <div className="visual-stack">
              <img src="/club_image/img10.jpeg" alt="Training" className="sport-img main-img" />
              <div className="visual-accent"></div>
            </div>
          </div>
        </div>

        {/* Core Pillars Grid */}
        <div className="core-pillars">
          <div className="pillar-card">
            <div className="pillar-icon">🤝</div>
            <h4>{t('about.pillar1_title')}</h4>
            <p>{t('about.pillar1_desc')}</p>
          </div>
          <div className="pillar-card">
            <div className="pillar-icon">🏆</div>
            <h4>{t('about.pillar2_title')}</h4>
            <p>{t('about.pillar2_desc')}</p>
          </div>
          <div className="pillar-card">
            <div className="pillar-icon">⚖️</div>
            <h4>{t('about.pillar3_title')}</h4>
            <p>{t('about.pillar3_desc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
