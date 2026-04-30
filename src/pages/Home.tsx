import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Doctors from '../components/Doctors';
import Gallery from '../components/Gallery';
import SocialProof from '../components/SocialProof';
import FAQ from '../components/FAQ';

const Home: React.FC = () => {
  return (
    <div className="home-page animate-fade-in-up">
      <Hero />
      <Services />
      <Doctors />
      <Gallery />
      <SocialProof />
      <FAQ />
    </div>
  );
};

export default Home;
