import React from 'react';
import Hero from '../../components/Hero/Hero';
import StatsBar from '../../components/StatsBar/StatsBar';
import About from '../../components/About/About';
import SportsGrid from '../../components/SportsGrid/SportsGrid';
import Gallery from '../../components/Gallery/Gallery';
import Contact from '../../components/Contact/Contact';

const Home = () => {
  return (
    <>
      <Hero />
      <StatsBar />
      <About />
      <SportsGrid />
      <Gallery />
      <Contact />
    </>
  );
};

export default Home;
