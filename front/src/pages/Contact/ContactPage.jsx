import React from 'react';
import Contact from '../../components/Contact/Contact';

const ContactPage = () => {
  return (
    <div className="page-wrapper" style={{paddingTop: '60px'}}>
      <div className="container" style={{marginBottom: '-40px'}}>
        <div className="gallery-header" style={{marginBottom: 0}}>
          <div>
            <span className="section-tag">Reach Out To Headquarters</span>
            <h1 className="section-title">Contact Us</h1>
          </div>
        </div>
      </div>
      <Contact />
    </div>
  );
};

export default ContactPage;
