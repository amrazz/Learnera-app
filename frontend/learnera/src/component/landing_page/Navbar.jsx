import React, { useEffect, useState } from "react";
import { close, logo, menu, logowhite } from "../../assets/landing_page/index";
import { navLinks, navLinks2 } from "./constants";
import { useNavigate } from "react-router-dom";

const Navbar = ({ scrollToSection, aboutRef, featuresRef, contactRef }) => {
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();

  const handleSignInClick = () => {
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (link) => {
    setActive(link.name);
    // Check the link id and scroll accordingly
    switch (link.id) {
      case "home":
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "about":
        scrollToSection(aboutRef);
        break;
      case "features":
        scrollToSection(featuresRef);
        break;
      case "contact":
        scrollToSection(contactRef);
        break;
      default:
        break;
    }
  };

  return (
    <nav
      className={`w-full z-20 fixed top-0 transition-all duration-500 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="flex py-6 sm:px-16 max-sm:px-9 justify-between items-center">
        <div
          className="cursor-pointer duration-200"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            src={hovered ? logo : scrolled ? logo : logowhite}
            alt="logo"
            className="w-52 object-contain transition-all duration-500"
          />
        </div>

        <ul className="list-none hidden sm:flex flex-row items-center gap-14">
          {navLinks.map((link) => (
            <li
              key={link.id}
              className={`${
                active === link.name
                  ? "text-gray-600"
                  : scrolled
                  ? "text-black"
                  : "text-white"
              } text-[18px] font-montserrat font-semibold cursor-pointer hover:bg-black px-5 py-2 rounded-full hover:text-white transition-colors duration-300`}
              onClick={() => handleNavClick(link)}
            >
              {link.name}
            </li>
          ))}
        </ul>

        <div
          className="relative cursor-pointer inline-block px-5 py-3 font-medium group max-sm:hidden"
          onClick={handleSignInClick}
        >
          <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
          <span className="absolute inset-0 w-full h-full bg-white border-2 border-black group-hover:bg-black"></span>
          <span className="relative text-black font-montserrat group-hover:text-white">
            Sign In
          </span>
        </div>

        <div className="sm:hidden block cursor-pointer">
          <img
            src={!toggle ? menu : close}
            alt="menu"
            width={25}
            height={25}
            onClick={() => setToggle(!toggle)}
          />
        </div>
      </div>

      <div
        className={`${
          toggle ? "flex" : "hidden"
        } sm:hidden absolute right-0 top-20 bg-gradient-to-tr from-gray-800 via-black to-gray-600 px-10 rounded-md py-4 mr-20`}
      >
        <ul className="list-none flex flex-col text-center gap-4">
          {navLinks2.map((link) => (
            <li
              key={link.id}
              className={`${
                active === link.name ? "text-white" : "text-gray-500"
              } hover:text-primary text-[18px] font-montserrat cursor-pointer transition-colors duration-300`}
              onClick={() => {
                setActive(link.name);
                setToggle(false);
                if (link.name === "Sign In") {
                  handleSignInClick();
                } else {
                  handleNavClick(link);
                }
              }}
            >
              {link.name}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
