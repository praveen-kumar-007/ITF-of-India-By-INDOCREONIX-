import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { Calendar, Tag, ChevronRight, Newspaper, Bell } from "lucide-react";
import pageHeroImages from "../../utils/pageHeroImages";
import "./NewsPage.css";
import { NewsSkeleton } from "../../components/Skeleton";

const NewsPage = () => {
  const { t } = useLanguage();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const scrollRef = React.useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${API_URL}/news`);
        const data = await res.json();
        if (data.success) {
          setNews(data.data);
        }
      } catch (err) {
        console.error("News Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
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
    setFilter(cat);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const categories = [
    "All",
    "Latest",
    "Tournament",
    "Event",
    "Notice",
    "Announcement",
  ];
  const filteredNews =
    filter === "All" ? news : news.filter((n) => n.category === filter);

  return (
    <div className="news-page">
      {/* Hero Header */}
      <section className="page-hero news-style">
        <div className="page-hero-bg">
          <div className="page-hero-track">
            {pageHeroImages.map((img, i) => (
              <img key={i} src={img} className="page-hero-img" alt="" />
            ))}
            {/* Repeat for seamless loop */}
            {pageHeroImages.map((img, i) => (
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
          <span className="section-tag">{t("news.tag") || "Updates"}</span>
          <h1>{t("news.title") || "Official News & Notices"}</h1>
          <p className="lead">
            {t("news.desc") ||
              "Stay informed about the latest happenings, tournament results, and official announcements from ITF OF INDIA."}
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <div className="news-filter-bar">
        <div className="container">
          <div className="filter-scroll-container" ref={scrollRef}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`news-filter-chip ${filter === cat ? "active" : ""}`}
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
          <NewsSkeleton />
        ) : filteredNews.length > 0 ? (
          <div className="news-grid-premium">
            {filteredNews.map((item, i) => (
              <article
                key={item.id || i}
                className="news-article-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="article-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} loading="lazy" />
                  ) : (
                    <div className="article-image-fallback">
                      <Newspaper size={40} />
                    </div>
                  )}
                  <div className="article-category">{item.category}</div>
                </div>
                <div className="article-content">
                  <div className="article-meta">
                    <span className="article-date">
                      <Calendar size={14} />
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>
                    {item.content.length > 150
                      ? item.content.substring(0, 150) + "..."
                      : item.content}
                  </p>
                  <button className="read-more-btn">
                    Read Bulletin <ChevronRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="news-empty-state">
            <div className="empty-bell-icon">
              <Bell size={60} />
              <div className="ping-circle"></div>
            </div>
            <h3>No bulletins found in {filter}</h3>
            <p>
              We haven't posted any updates in this category yet. Check back
              soon for the latest news.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
