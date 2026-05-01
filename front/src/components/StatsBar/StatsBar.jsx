import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const StatsBar = () => {
  const { t } = useLanguage();
  return (
    <section className="stats-bar">
      <div className="container stats-flex">
        <div className="stat"><h3>20+</h3><p>{t('stats.disciplines')}</p></div>
        <div className="stat"><h3>1000+</h3><p>{t('stats.athletes')}</p></div>
        <div className="stat"><h3>JH</h3><p>{t('stats.operations')}</p></div>
        <div className="stat"><h3>GOVT</h3><p>{t('stats.recognized')}</p></div>
      </div>
    </section>
  );
};

export default StatsBar;
