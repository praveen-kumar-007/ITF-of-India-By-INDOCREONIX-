import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './NewsPage.css';

const NewsPage = () => {
  const { t } = useLanguage();
  const newsItems = [
    {
      date: "15 May 2024",
      tag: t('news.tag_tournament'),
      title: t('news.item1_title'),
      excerpt: t('news.item1_excerpt'),
      img: "WhatsApp Image 2026-04-30 at 11.14.33 PM.jpeg"
    },
    {
      date: "02 Jun 2024",
      tag: t('news.tag_workshop'),
      title: t('news.item2_title'),
      excerpt: t('news.item2_excerpt'),
      img: "WhatsApp Image 2026-04-30 at 11.14.35 PM.jpeg"
    },
    {
      date: "20 Jun 2024",
      tag: t('news.tag_announcement'),
      title: t('news.item3_title'),
      excerpt: t('news.item3_excerpt'),
      img: "WhatsApp Image 2026-04-30 at 11.16.42 PM.jpeg"
    },
    {
      date: "10 Jul 2024",
      tag: t('news.tag_infrastructure'),
      title: t('news.item4_title'),
      excerpt: t('news.item4_excerpt'),
      img: "WhatsApp Image 2026-04-30 at 11.16.45 PM.jpeg"
    }
  ];

  return (
    <div className="page-wrapper" style={{paddingTop: '60px', paddingBottom: '60px', background: 'var(--bg-soft)'}}>
      <div className="container">
        <div className="gallery-header">
          <div>
            <span className="section-tag">{t('news.tag')}</span>
            <h1 className="section-title">{t('news.title')}</h1>
          </div>
        </div>

        <div className="news-grid">
          {newsItems.map((news, i) => (
            <article key={i} className="news-card">
              <div className="news-img">
                <span className="news-badge">{news.tag}</span>
                <img src={`/club_image/${news.img}`} alt={news.title} />
              </div>
              <div className="news-content">
                <span className="news-date">{news.date}</span>
                <h3>{news.title}</h3>
                <p>{news.excerpt}</p>
                <button className="read-more-btn">{t('news.read_more')} →</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;

