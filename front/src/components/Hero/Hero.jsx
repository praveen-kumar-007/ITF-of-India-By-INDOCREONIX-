import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import { NoticeSkeleton } from '../Skeleton';

const Hero = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroImages = [
    "/club_image/img1.jpeg",
    "/club_image/img2.jpeg",
    "/club_image/img3.jpeg",
    "/club_image/img4.jpeg",
    "/club_image/img5.jpeg"
  ];

  const animations = ['zoom', 'fade', 'slide-left', 'slide-right', 'blur-in'];
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    const fetchNotices = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/news`);
        const data = await res.json();
        if (data.success) {
          // All news and notices uploads are displayed on the home page scrolling notice board
          const filtered = data.data.slice(0, 5);
          setNotices(filtered);
        }
      } catch (err) {
        console.error("Hero Notice Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
    return () => clearInterval(slideInterval);
  }, [heroImages.length, API_URL]);

  return (
    <header id="home" className="sport-hero">
      <div className="hero-slider">
        {heroImages.map((img, i) => (
          <div key={i} className={`slide ${i === currentSlide ? `active ${animations[i % animations.length]}` : ''}`}>
            <img src={img} alt={`Slide ${i}`} />
          </div>
        ))}
        <div className="overlay"></div>
      </div>

      <div className="container hero-content-grid">
        <div className="hero-text-side">
          <span className="section-tag">{t('about.tag')}</span>
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.subtitle')}</p>
          <div className="hero-btns">
            <Link to="/registration" className="btn-premium">{t('hero.cta_join')}</Link>
            <Link to="/sports" className="btn-outline">{t('hero.cta_disciplines')}</Link>
          </div>
        </div>

        <div className="hero-notice-side">
          <div className="notice-card">
            <div className="notice-header">
              <span className="live-dot"></span>
              <h3>{t('hero.notices')}</h3>
            </div>
            <div className="notice-body">
              {loading ? (
                <NoticeSkeleton />
              ) : notices.length > 0 ? (
                notices.map((notice, idx) => (
                  <div key={notice.id || idx} className="notice-item">
                    <span className="date">
                      {new Date(notice.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <p>{notice.title}</p>
                  </div>
                ))
              ) : (
                <div className="notice-empty">
                  <p>No active notices at the moment. Stay tuned for official updates.</p>
                </div>
              )}
            </div>
            <Link to="/news" className="notice-more">Explore All Official Notices →</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
