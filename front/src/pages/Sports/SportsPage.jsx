import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import "./SportsPage.css";

const SportsPage = () => {
  const { t } = useLanguage();

  const combatSports = t("disciplines.combat_list", { returnObjects: true });
  const teamSports = t("disciplines.team_list", { returnObjects: true });
  const individualSports = t("disciplines.individual_list", {
    returnObjects: true,
  });

  const renderSportList = (list, title, icon) => (
    <div className="sport-category-block">
      <div className="category-header">
        <span className="cat-icon">{icon}</span>
        <div>
          <h3>{title}</h3>
        </div>
      </div>
      <ul className="sport-list">
        {Array.isArray(list) &&
          list.map((sport, index) => <li key={index}>{sport}</li>)}
      </ul>
    </div>
  );

  return (
    <div className="sports-page">
      {/* Hero with Background */}
      {/* Hero Header */}
      <section className="page-hero sports-style">
        <div className="page-hero-bg">
          <div className="page-hero-track">
            {[10, 11, 12, 13, 14, 15].map((num, i) => (
              <img key={i} src={`/club_image/img${num}.jpeg`} className="page-hero-img" alt="" />
            ))}
            {/* Repeat for seamless loop */}
            {[10, 11, 12, 13, 14, 15].map((num, i) => (
              <img key={`dup-${i}`} src={`/club_image/img${num}.jpeg`} className="page-hero-img" alt="" />
            ))}
          </div>
          <div className="page-hero-overlay"></div>
        </div>
        <div className="container">
          <span className="section-tag">{t("disciplines.tag")}</span>
          <h1>{t("disciplines.title")}</h1>
          <p className="lead">{t("disciplines.desc")}</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="sports-content section">
        <div className="container">
          <div className="sports-categories-stack">
            {renderSportList(combatSports, t("disciplines.combat_title"), "🥋")}
            {renderSportList(teamSports, t("disciplines.team_title"), "⚽")}
            {renderSportList(
              individualSports,
              t("disciplines.individual_title"),
              "🏃",
            )}
          </div>

          {/* Info Box */}
          <div className="sports-info-banner">
            <div className="info-item">
              <span className="icon">🏅</span>
              <p>{t("disciplines.certification")}</p>
            </div>
            <div className="info-item">
              <span className="icon">🔥</span>
              <p>{t("disciplines.training")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SportsPage;
