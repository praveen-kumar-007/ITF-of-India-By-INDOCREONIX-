import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import './Gallery.css';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/gallery`);
        const data = await res.json();
        if (data.success) {
          setImages(data.data);
        }
      } catch (err) {
        console.error("Gallery Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

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
        {images.length > 0 ? (
          <div className="slider-track">
            {/* Double the images to create infinite loop effect */}
            {[...images, ...images].map((img, i) => (
              <div 
                key={i} 
                className="slider-item" 
                onClick={() => openLightbox(i % images.length)}
              >
                <img src={img.imageUrl} alt={img.title || `Achievement ${i}`} loading="lazy" />
                <div className="gallery-overlay">
                  <span className="zoom-icon">⛶</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="gallery-empty-state">
            <div className="empty-visual-container">
              <div className="empty-glow"></div>
              <div className="empty-ring empty-ring-1"></div>
              <div className="empty-ring empty-ring-2"></div>
              <ImageIcon size={80} className="empty-icon-main" />
            </div>
            <h3>Moments in Making</h3>
            <p>Our visual history is being updated with the latest achievements. Stay tuned.</p>
            <div className="empty-shimmer-btn">Gallery Refresh in Progress</div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && images.length > 0 && (
        <div className="lightbox-modal" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>✕</button>
          <button className="lightbox-nav prev" onClick={prevImage}>❮</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={images[selectedImage].imageUrl} alt={images[selectedImage].title || `Full screen view ${selectedImage}`} />
            <div className="lightbox-caption">{images[selectedImage].title || `Achievement ${selectedImage + 1}`} ({selectedImage + 1} of {images.length})</div>
          </div>
          <button className="lightbox-nav next" onClick={nextImage}>❯</button>
        </div>
      )}
    </section>
  );
};

export default Gallery;
