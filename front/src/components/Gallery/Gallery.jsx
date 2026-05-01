import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Gallery.css';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const images = [
    "WhatsApp Image 2026-04-30 at 11.14.33 PM (1).jpeg",
    "WhatsApp Image 2026-04-30 at 11.14.33 PM.jpeg",
    "WhatsApp Image 2026-04-30 at 11.14.34 PM.jpeg",
    "WhatsApp Image 2026-04-30 at 11.14.35 PM.jpeg",
    "WhatsApp Image 2026-04-30 at 11.14.36 PM.jpeg",
    "WhatsApp Image 2026-04-30 at 11.16.42 PM.jpeg",
    "WhatsApp Image 2026-04-30 at 11.16.43 PM.jpeg",
    "WhatsApp Image 2026-04-30 at 11.16.44 PM.jpeg",
    "WhatsApp Image 2026-04-30 at 11.16.45 PM.jpeg"
  ];

  const openLightbox = (index) => {
    setSelectedImage(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="section" style={{overflow: 'hidden'}}>
      <div className="container">
        <div className="gallery-header" style={{marginBottom: '2rem'}}>
          <div>
            <span className="section-tag">Achievements</span>
            <h2 className="section-title">Moments Of Victory.</h2>
          </div>
          <Link to="/gallery" className="btn-outline">View Full Gallery</Link>
        </div>
      </div>

      {/* Auto Slider Track */}
      <div className="gallery-auto-slider">
        <div className="slider-track">
          {/* Double the images to create infinite loop effect */}
          {[...images, ...images].map((img, i) => (
            <div 
              key={i} 
              className="slider-item" 
              onClick={() => openLightbox(i % images.length)}
            >
              <img src={`/club_image/${img}`} alt={`Achievement ${i}`} loading="lazy" />
              <div className="gallery-overlay">
                <span className="zoom-icon">⛶</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div className="lightbox-modal" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>✕</button>
          <button className="lightbox-nav prev" onClick={prevImage}>❮</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={`/club_image/${images[selectedImage]}`} alt={`Full screen view ${selectedImage}`} />
            <div className="lightbox-caption">Achievement {selectedImage + 1} of {images.length}</div>
          </div>
          <button className="lightbox-nav next" onClick={nextImage}>❯</button>
        </div>
      )}
    </section>
  );
};

export default Gallery;
