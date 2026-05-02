import React from 'react';
import Contact from '../../components/Contact/Contact';

const ContactPage = () => {
  return (
    <div className="contact-page">
      {/* Hero Header */}
      <section className="page-hero">
        <div className="page-hero-bg">
          <div className="page-hero-track">
            {["hero.png", "about.png", "hero_dark.png"].map((img, i) => (
              <img key={i} src={`/${img}`} className="page-hero-img" alt="" />
            ))}
            {/* Repeat for seamless loop */}
            {["hero.png", "about.png", "hero_dark.png"].map((img, i) => (
              <img key={`dup-${i}`} src={`/${img}`} className="page-hero-img" alt="" />
            ))}
          </div>
          <div className="page-hero-overlay"></div>
        </div>
        <div className="container">
          <span className="section-tag">Reach Out To Headquarters</span>
          <h1>Contact Us</h1>
          <p className="lead">Have questions about registration or upcoming trials? Our team is here to support your athletic journey.</p>
        </div>
      </section>
      <Contact />
    </div>
  );
};

export default ContactPage;
