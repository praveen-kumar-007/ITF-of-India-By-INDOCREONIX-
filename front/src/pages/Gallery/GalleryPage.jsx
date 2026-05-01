import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import "../../components/Gallery/Gallery.css"; // Re-use the masonry CSS

const GalleryPage = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);

  const images = [
    "WhatsApp Image 2026-04-30 at 11.14.33 PM (1).jpeg",
    "WhatsApp Image 2026-04-30 at 11.14.33 PM.jpeg",
    "WhatsApp Image 2026-04-30 at 11.14.34 PM.jpeg",
    "WhatsApp Image 2026-04-30 at 11.14.35 PM.jpeg",
    "WhatsApp Image 2026-04-30 at 11.14.36 PM.jpeg",
    "WhatsApp Image 2026-04-30 at 11.16.42 PM.jpeg",
    "WhatsApp Image 2026-04-30 at 11.16.43 PM.jpeg",
    "WhatsApp Image 2026-04-30 at 11.16.44 PM.jpeg",
    "WhatsApp Image 2026-04-30 at 11.16.45 PM.jpeg",
  ];

  useEffect(() => {
    const loadImages = async () => {
      const loaded = await Promise.all(
        images.map(
          (img) =>
            new Promise((resolve) => {
              const temp = new Image();
              temp.src = `/club_image/${img}`;
              temp.onload = () =>
                resolve({
                  src: img,
                  width: temp.naturalWidth,
                  height: temp.naturalHeight,
                  area: temp.naturalWidth * temp.naturalHeight,
                });
              temp.onerror = () =>
                resolve({ src: img, width: 1, height: 1, area: 1 });
            }),
        ),
      );

      loaded.sort((a, b) => b.area - a.area);
      setGalleryItems(loaded);
    };

    loadImages();
  }, []);

  const openLightbox = (index) => {
    setSelectedImage(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = "auto";
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
    <div
      className="page-wrapper"
      style={{ paddingTop: "60px", paddingBottom: "60px" }}
    >
      <div className="container">
        <div className="gallery-header">
          <div>
            <span className="section-tag">{t("about.tag")}</span>
            <h1 className="section-title">{t("gallery.title")}</h1>
          </div>
          <p className="gallery-desc">{t("gallery.desc")}</p>
        </div>

        {/* TRUE MASONRY LAYOUT */}
        <div className="advanced-gallery-grid">
          {(galleryItems.length
            ? galleryItems
            : images.map((src) => ({ src }))
          ).map((item, i) => (
            <div
              key={item.src || i}
              className="gallery-item"
              onClick={() => openLightbox(i)}
            >
              <div className="gallery-img-wrapper">
                <img
                  src={`/club_image/${item.src}`}
                  alt={`Achievement ${i}`}
                  loading="lazy"
                />
                <div className="gallery-overlay">
                  <span className="zoom-icon">⛶</span>
                  <h4>View Full Size</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div className="lightbox-modal" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            ✕
          </button>

          <button className="lightbox-nav prev" onClick={prevImage}>
            ❮
          </button>

          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`/club_image/${images[selectedImage]}`}
              alt={`Full screen view ${selectedImage}`}
            />
            <div className="lightbox-caption">
              Achievement {selectedImage + 1} of {images.length}
            </div>
          </div>

          <button className="lightbox-nav next" onClick={nextImage}>
            ❯
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
