import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const SportsGrid = () => {
  const { t } = useLanguage();
  const sports = [
    "Karate", "Kabaddi", "Kho Kho", "Badminton", "Volleyball", "Football",
    "Athletics", "Wrestling", "Judo", "Cycling", "Yoga", "Gymnastics",
    "Swimming", "Shooting", "Cricket", "Archery", "Handball", "Boxing",
    "Wushu", "Taekwondo", "Shooting Ball", "Gatka"
  ];

  return (
    <section id="sports" className="section" style={{background: 'var(--bg-soft)'}}>
      <div className="container">
        <span className="section-tag">{t('sports.tag')}</span>
        <h2 className="section-title">{t('sports.title')}</h2>
        <div className="sports-list">
          {sports.map((sport, i) => (
            <div key={i} className="sport-tag-card">
              <h3>{sport}</h3>
              <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{t('sports.card_desc')}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SportsGrid;
