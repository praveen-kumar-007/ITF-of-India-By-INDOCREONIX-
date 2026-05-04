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
      img: "img6.jpeg"
    },
    {
      date: "02 Jun 2024",
      tag: t('news.tag_workshop'),
      title: t('news.item2_title'),
      excerpt: t('news.item2_excerpt'),
      img: "img7.jpeg"
    },
    {
      date: "20 Jun 2024",
      tag: t('news.tag_announcement'),
      title: t('news.item3_title'),
      excerpt: t('news.item3_excerpt'),
      img: "img8.jpeg"
    },
    {
      date: "10 Jul 2024",
      tag: t('news.tag_infrastructure'),
      title: t('news.item4_title'),
      excerpt: t('news.item4_excerpt'),
      img: "img9.jpeg"
    }
  ];

  return (
    <div className="news-page">
      {/* Hero Header */}
      <section className="page-hero news-style">
        <div className="page-hero-bg">
          <div className="page-hero-track">
            {["hero.png", "hero_dark.png"].map((img, i) => (
              <img key={i} src={`/${img}`} className="page-hero-img" alt="" />
            ))}
            {/* Repeat for seamless loop */}
            {["hero.png", "hero_dark.png"].map((img, i) => (
              <img key={`dup-${i}`} src={`/${img}`} className="page-hero-img" alt="" />
            ))}
          </div>
          <div className="page-hero-overlay"></div>
        </div>
        <div className="container">
          <span className="section-tag">{t('news.tag')}</span>
          <h1>{t('news.title')}</h1>
          <p className="lead">Stay updated with the latest events, tournament results, and national announcements from ITF OF INDIA.</p>
        </div>
      </section>

      <div className="container section">

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

