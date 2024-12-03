import React, { useEffect, useRef } from 'react'
import Navbar from './navbar'
import Hero from './hero'
import About from './About'

const Landing_page = () => {
  const aboutRef = useRef(null);
    const scrollToSection = (ref) => {
      if(ref.current) {
        ref.current.scrollIntoView({behaviour : "smooth"})
      }

  }
  return (
    <div>
      <Navbar scrollToSection={scrollToSection}  aboutRef={aboutRef} />
      <Hero  />
      <About aboutRef={aboutRef} />
    </div>
  )
}

export default Landing_page
