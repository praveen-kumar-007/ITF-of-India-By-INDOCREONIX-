import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    "/club_image/WhatsApp Image 2026-04-30 at 11.16.45 PM.jpeg",
    "/club_image/WhatsApp Image 2026-04-30 at 11.16.43 PM.jpeg",
    "/club_image/WhatsApp Image 2026-04-30 at 11.14.33 PM.jpeg",
    "/club_image/WhatsApp Image 2026-04-30 at 11.14.35 PM.jpeg",
    "/club_image/WhatsApp Image 2026-04-30 at 11.16.42 PM.jpeg"
  ];

  const animations = ['zoom', 'fade', 'slide-left', 'slide-right', 'blur-in'];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(slideInterval);
  }, [heroImages.length]);

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
            <a href="#contact" className="btn-premium">{t('hero.cta_join')}</a>
            <a href="#about" className="btn-outline">{t('hero.cta_disciplines')}</a>
          </div>
        </div>

        <div className="hero-notice-side">
          <div className="notice-card">
            <div className="notice-header">
              <span className="live-dot"></span>
              <h3>{t('hero.notices')}</h3>
            </div>
            <div className="notice-body">
              <div className="notice-item">
                <span className="date">05 May</span>
                <p>State Level Karate Championship 2024 - Registration Portal Now Open.</p>
              </div>
              <div className="notice-item">
                <span className="date">12 May</span>
                <p>National Coaching Workshop: Special Focus on Grassroots Training.</p>
              </div>
              <div className="notice-item">
                <span className="date">01 Jun</span>
                <p>Upcoming Trials for Junior Athletics & Wrestling Contingents.</p>
              </div>
            </div>
            <a href="#contact" className="notice-more">Explore All Official Notices →</a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
