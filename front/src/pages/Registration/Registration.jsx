import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Registration.css';

const GalleryImages = [
  "WhatsApp Image 2026-04-30 at 11.14.33 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.33 PM.jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.34 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.34 PM.jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.35 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.35 PM (2).jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.35 PM.jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.36 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.14.36 PM.jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.42 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.42 PM.jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.43 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.43 PM (2).jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.43 PM.jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.44 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.44 PM.jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.45 PM (1).jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.45 PM (2).jpeg",
  "WhatsApp Image 2026-04-30 at 11.16.45 PM.jpeg"
];

const Registration = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [landscapeImages, setLandscapeImages] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadImages = async () => {
      const loaded = [];
      for (const src of GalleryImages) {
        const img = new Image();
        img.src = `/club_image/${src}`;
        await new Promise(resolve => {
          img.onload = () => {
            // Check if landscape (width > height)
            if (img.width > img.height) {
              loaded.push(src);
            }
            resolve();
          };
          img.onerror = resolve;
        });
      }
      if (isMounted) {
        // We duplicate the array to allow for seamless infinite scrolling
        setLandscapeImages([...loaded, ...loaded]);
      }
    };
    loadImages();

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="registration-page">
      {/* Registration Header */}
      <section className="registration-hero">
        <div className="hero-slider-bg">
          <div className="hero-slider-track" style={{ 
            animationDuration: `${landscapeImages.length * 3}s` 
          }}>
            {landscapeImages.map((img, idx) => (
              <img key={idx} src={`/club_image/${img}`} alt="ITF Training" loading="lazy" />
            ))}
          </div>
        </div>

        <div className="hero-content-overlay container">
          <span className="section-tag" style={{color: 'white'}}>{t('registration.tag')}</span>
          <h1 className="section-title" style={{color: 'white', borderBottom: 'none', paddingBottom: 0, marginBottom: '1rem'}}>{t('registration.title')}</h1>
          <p className="hero-desc">{t('registration.desc')}</p>
        </div>
      </section>

      <section className="registration-content section">
        <div className="container">
          <div className="registration-grid">
            
            {/* Form Area */}
            <div className="registration-form-container">
              <div className="form-steps">
                <div className={`step ${step >= 1 ? 'active' : ''}`}>1. {t('registration.step1')}</div>
                <div className={`step ${step >= 2 ? 'active' : ''}`}>2. {t('registration.step2')}</div>
                <div className={`step ${step >= 3 ? 'active' : ''}`}>3. {t('registration.step3')}</div>
              </div>

              <form className="advanced-form" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                {step === 1 && (
                  <div className="form-section fade-in">
                    <h3>{t('registration.personal_info')}</h3>
                    <div className="input-group">
                      <div className="input-field">
                        <label>{t('registration.first_name')}</label>
                        <input type="text" placeholder={t('registration.first_name')} required />
                      </div>
                      <div className="input-field">
                        <label>{t('registration.last_name')}</label>
                        <input type="text" placeholder={t('registration.last_name')} required />
                      </div>
                    </div>
                    
                    <div className="input-group">
                      <div className="input-field">
                        <label>{t('registration.dob')}</label>
                        <input type="date" required />
                      </div>
                      <div className="input-field">
                        <label>{t('registration.gender')}</label>
                        <select required>
                          <option value="">{t('registration.select_gender')}</option>
                          <option value="male">{t('registration.male')}</option>
                          <option value="female">{t('registration.female')}</option>
                          <option value="other">{t('registration.other')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="input-field full">
                      <label>{t('registration.email')}</label>
                      <input type="email" placeholder={t('registration.email')} required />
                    </div>
                    
                    <div className="input-field full">
                      <label>{t('registration.phone')}</label>
                      <input type="tel" placeholder="+91" required />
                    </div>

                    <div className="input-group">
                      <div className="input-field">
                        <label>{t('registration.state')}</label>
                        <select required>
                          <option value="">{t('registration.state')}</option>
                          <option value="Jharkhand">Jharkhand</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Other">Other...</option>
                        </select>
                      </div>
                      <div className="input-field">
                        <label>{t('registration.city')}</label>
                        <input type="text" placeholder={t('registration.city')} required />
                      </div>
                    </div>

                    <button type="button" className="btn-premium form-next" onClick={() => setStep(2)}>{t('registration.next')} →</button>
                  </div>
                )}

                {step === 2 && (
                  <div className="form-section fade-in">
                    <h3>{t('registration.step2')}</h3>
                    
                    <div className="input-field full">
                      <label>Primary Discipline</label>
                      <select required>
                        <option value="">Select Primary Sport</option>
                        <option value="Karate">Karate</option>
                        <option value="Kabaddi">Kabaddi</option>
                        <option value="Athletics">Athletics</option>
                        <option value="Wrestling">Wrestling</option>
                        <option value="Boxing">Boxing</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="input-field full">
                      <label>Experience Level</label>
                      <select required>
                        <option value="beginner">Beginner (0-2 years)</option>
                        <option value="intermediate">Intermediate (2-5 years)</option>
                        <option value="advanced">Advanced / State Level (5+ years)</option>
                        <option value="national">National / International</option>
                      </select>
                    </div>

                    <div className="input-field full">
                      <label>Previous Achievements / Certifications (Optional)</label>
                      <textarea rows="4" placeholder="List your medals, belts, or notable tournament participations..."></textarea>
                    </div>

                    <div className="form-buttons">
                      <button type="button" className="btn-outline" onClick={() => setStep(1)}>← {t('registration.back')}</button>
                      <button type="submit" className="btn-premium form-next">{t('registration.submit')}</button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="form-section success-section fade-in">
                    <div className="success-icon">✓</div>
                    <h3>Registration Submitted</h3>
                    <p>Thank you for registering with ITF OF INDIA. Your application has been recorded in our national database.</p>
                    <p>An official representative will contact you at your provided email shortly.</p>
                    <button type="button" className="btn-premium" onClick={() => setStep(1)} style={{marginTop: '2rem'}}>Register Another Athlete</button>
                  </div>
                )}
              </form>
            </div>

            {/* Information Sidebar */}
            <div className="registration-sidebar">
              <div className="sidebar-image-card">
                <img src="/club_image/WhatsApp Image 2026-04-30 at 11.16.42 PM.jpeg" alt="Athletes" />
                <div className="overlay-text">Shape Your Future</div>
              </div>

              <div className="info-card">
                <h4>Why Register?</h4>
                <ul>
                  <li>Access to national-level training camps</li>
                  <li>Official certification and grading</li>
                  <li>Opportunities to represent state/country</li>
                  <li>Expert coaching from recognized professionals</li>
                </ul>
              </div>

              <div className="info-card highlight">
                <h4>Need Help?</h4>
                <p>If you face any issues during the registration process, please reach out to our headquarters:</p>
                <p>📞 +91 9229502961</p>
                <p>📧 itfofindia2013@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Registration;

