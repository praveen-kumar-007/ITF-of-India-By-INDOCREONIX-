import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import About from "../../components/About/About";
import StatsBar from "../../components/StatsBar/StatsBar";
import pageHeroImages from "../../utils/pageHeroImages";
import "./AboutPage.css";

const AboutPage = () => {
  const { t } = useLanguage();

  return (
    <div className="about-page">
      {/* Hero Header */}
      <section className="page-hero about-style">
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
          <span className="section-tag">{t("about.tag")}</span>
          <h1>{t("about.title")}</h1>
          <p className="lead">{t("about.description")}</p>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="leadership section">
        <div className="container">
          <div className="section-header center">
            <span className="section-tag">{t("about.leadership_tag")}</span>
            <h2 className="section-title">{t("about.leadership_title")}</h2>
          </div>
          <div className="leadership-grid">
            <div className="member-card">
              <div className="member-img">
                <img src="/president.jpeg" alt={t("about.name_president")} />
              </div>
              <h4>{t("about.name_president")}</h4>
              <span>{t("about.role_president")}</span>
            </div>
            <div className="member-card">
              <div className="member-img">
                <img src="/Secratery.jpeg" alt={t("about.name_secretary")} />
              </div>
              <h4>{t("about.name_secretary")}</h4>
              <span>{t("about.role_secretary")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable About Component */}
      <About />

      {/* Mission & Vision Section */}
      <section className="vision-mission section">
        <div className="container">
          <div className="vision-grid">
            <div className="vision-card">
              <div className="icon">👁️</div>
              <h3>{t("about.vision_title")}</h3>
              <p>{t("about.vision_text")}</p>
            </div>
            <div className="vision-card highlight">
              <div className="icon">🎯</div>
              <h3>{t("about.mission_title")}</h3>
              <p>{t("about.mission_text")}</p>
            </div>
          </div>
        </div>
      </section>

      <StatsBar />
    </div>
  );
};

export default AboutPage;
