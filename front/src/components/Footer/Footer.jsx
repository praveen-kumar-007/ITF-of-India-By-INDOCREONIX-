import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-main">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo-frame">
            <img src="/logo.jpeg" alt="ITF OF INDIA logo" />
          </div>
          <h3>{t("brand.main")}</h3>
          <p className="footer-full-name">{t("topbar.official")}</p>
          <p>{t("footer.desc")}</p>
        </div>

        <div className="footer-column footer-links">
          <h4>{t("footer.quick_links")}</h4>
          <ul className="footer-list">
            <li>
              <Link to="/">{t("nav.home")}</Link>
            </li>
            <li>
              <Link to="/about">{t("nav.about")}</Link>
            </li>
            <li>
              <Link to="/sports">{t("nav.sports")}</Link>
            </li>
            <li>
              <Link to="/news">{t("nav.news")}</Link>
            </li>
            <li>
              <Link to="/gallery">{t("nav.gallery")}</Link>
            </li>
            <li>
              <Link to="/registration">{t("nav.registration")}</Link>
            </li>
            <li>
              <Link to="/contact">{t("nav.contact")}</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column footer-contact">
          <h4>{t("contact.tag")}</h4>
          <address className="footer-contact-block">
            <p>
              <strong>{t("contact.head_office")}:</strong>
              <br />
              YOGIYADERA, PORAIYA, NIMIYAGHAT, DUMRI, GIRIDIH-825167, JHARKHAND
            </p>
            <p>
              <strong>Phone:</strong>
              <br />
              +91 9229502961
              <br />
              +91 9241350028
            </p>
            <p>
              <strong>Email:</strong>
              <br />
              itfofindia2013@gmail.com
            </p>
          </address>
          <div className="footer-leadership-list">
            <p>
              <strong>{t("about.role_president")}:</strong>{" "}
              {t("about.name_president")}
            </p>
            <p>
              <strong>{t("about.role_secretary")}:</strong>{" "}
              {t("about.name_secretary")}
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {currentYear} {t("footer.copy")}
        </p>
        <div className="footer-legal">
          <span>{t("footer.sub_copy")}</span>
          <span>{t("footer.privacy")}</span>
          <span>{t("footer.terms")}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
