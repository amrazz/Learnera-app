import React, { useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import About from './About';
import Features from './Features';
import Testimonials from './Testimonials';
import Stats from './Stats';
import Contact from './Contact';
import Footer from './Footer';

const LandingPage = () => {
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToSection = (ref) => {
    if(ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="overflow-x-hidden">
      <Navbar 
        scrollToSection={scrollToSection} 
        aboutRef={aboutRef}
        featuresRef={featuresRef}
        contactRef={contactRef}
      />
      <Hero />
      <Stats />
      <About aboutRef={aboutRef} />
      <Features featuresRef={featuresRef} />
      <Testimonials />
      <Contact contactRef={contactRef} />
      <Footer />
    </div>
  );
};

export default LandingPage;