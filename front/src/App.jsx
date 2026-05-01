import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar/TopBar';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// Pages
import Home from './pages/Home/Home';
import AboutPage from './pages/About/AboutPage';
import SportsPage from './pages/Sports/SportsPage';
import Registration from './pages/Registration/Registration';
import GalleryPage from './pages/Gallery/GalleryPage';
import NewsPage from './pages/News/NewsPage';
import ContactPage from './pages/Contact/ContactPage';
import { LanguageProvider } from './context/LanguageContext';

import './App.css'; // Global styles

const App = () => {
  return (
    <LanguageProvider>
      <Router>
        <div className="sport-app">
        <TopBar />
        <Navbar />
        
        {/* Main Content Area */}
        <main style={{ minHeight: '80vh' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/sports" element={<SportsPage />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
      </Router>
    </LanguageProvider>
  );
};

export default App;
