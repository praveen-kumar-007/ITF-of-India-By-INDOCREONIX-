import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { Image as ImageIcon } from "lucide-react";
import pageHeroImages from "../../utils/pageHeroImages";
import "../../components/Gallery/Gallery.css";
import { GallerySkeleton } from "../../components/Skeleton";

const GalleryPage = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const scrollRef = React.useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch(`${API_URL}/gallery`);
        const data = await res.json();
        if (data.success) {
          setPhotos(data.data);
        }
      } catch (err) {
        console.error("Gallery Page Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [API_URL]);

  // Auto-scroll logic for mobile filter bar
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let interval;
    const startScrolling = () => {
      interval = setInterval(() => {
        if (!isPaused && window.innerWidth <= 768) {
          if (
            scrollContainer.scrollLeft >=
            scrollContainer.scrollWidth - scrollContainer.clientWidth
          ) {
            scrollContainer.scrollLeft = 0; // Reset to start
          } else {
            scrollContainer.scrollLeft += 1;
          }
        }
      }, 30);
    };

    startScrolling();
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleFilterClick = (cat) => {
    setActiveFilter(cat);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const categories = [
    "All",
    "General",
    "Tournament",
    "Award",
    "Training",
    "Event",
  ];
  const filteredPhotos =
    activeFilter === "All"
      ? photos
      : photos.filter((p) => p.category === activeFilter);

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
    setSelectedImage((prev) => (prev + 1) % filteredPhotos.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setSelectedImage(
      (prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length,
    );
  };

  const bannerImages = pageHeroImages;

  return (
    <div className="gallery-page">
      {/* Hero Header */}
      <section className="page-hero gallery-style">
        <div className="page-hero-bg">
          <div className="page-hero-track">
            {bannerImages.map((img, i) => (
              <img key={i} src={img} className="page-hero-img" alt="" />
            ))}
            {/* Repeat for seamless loop */}
            {bannerImages.map((img, i) => (
              <img
                key={`dup-${i}`}
                src={img}
                className="page-hero-img"
                alt=""
              />
            ))}
          </div>
          <div className="page-hero-overlay"></div>
        </div>
        <div className="container">
          <span className="section-tag">{t("about.tag")}</span>
          <h1>{t("gallery.title")}</h1>
          <p className="lead">{t("gallery.desc")}</p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="gallery-filter-bar">
        <div className="container">
          <div className="gallery-filter-scroll" ref={scrollRef}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`gallery-filter-chip ${
                  activeFilter === cat ? "active" : ""
                }`}
                onClick={() => handleFilterClick(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container section">
        {loading ? (
          <GallerySkeleton />
        ) : filteredPhotos.length > 0 ? (
          <div className="advanced-gallery-grid">
            {filteredPhotos.map((item, i) => (
              <div
                key={item.id || i}
                className="gallery-item animate-item"
                onClick={() => openLightbox(i)}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="gallery-img-wrapper">
                  <img
                    src={item.imageUrl}
                    alt={item.title || `Achievement ${i}`}
                    loading="lazy"
                  />
                  <div className="gallery-overlay">
                    <span className="zoom-icon">⛶</span>
                    <h4>{item.title}</h4>
                    <span className="cat-badge">{item.category}</span>
                  </div>
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
              <ImageIcon size={100} className="empty-icon-main" />
            </div>
            <h3>{activeFilter} Archive Pending</h3>
            <p>
              We are currently assembling our latest visual chronicles for this
              category. Check back soon for new updates.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && filteredPhotos.length > 0 && (
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
              src={filteredPhotos[selectedImage].imageUrl}
              alt={
                filteredPhotos[selectedImage].title ||
                `Full screen view ${selectedImage}`
              }
            />
            <div className="lightbox-caption">
              <strong>{filteredPhotos[selectedImage].title}</strong>
              <span>Category: {filteredPhotos[selectedImage].category}</span>
              <div className="counter">
                {selectedImage + 1} of {filteredPhotos.length}
              </div>
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
