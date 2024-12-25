import React, { useEffect, useState } from "react";
import {
  close,
  logo,
  menu,
  hoveredLogo,
} from "../../assets/landing_page/index";
import { navLinks, navLinks2 } from "./constants";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({scrollToSection, aboutRef,}) => {
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();

  const handleSignInClick = () => {
    navigate("/login"); // Use navigate here
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`w-full z-20 sticky top-0 duration-200 ease-in-out opacity-95 transition-all ${
        scrolled ? "bg-white" : "bg-transparent"
      } `}
    >
      <div className="flex py-6 sm:px-16 max-sm:px-9 justify-between items-center">
        <div
          className="cursor-pointer duration-200"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            src={hovered ? logo : scrolled ? logo : hoveredLogo}
            alt="logo"
            className="w-52 object-contain ease-in-out transition-all duration-500"
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
                  ? "text-black "
                  : "text-white"
              } 
                text-[18px] font-montserrat font-semibold cursor-pointer hover:bg-black px-5 py-2 rounded-full
               hover:text-white duration-300 `}
              onClick={() => {
                setActive(link.name);
                if(link.name === "About"){
                  scrollToSection(aboutRef)
                }else if(link.name === "Home"){
                  window.scrollTo(0, 0)
                }
              }}
            >
              {link.name}
            </li>
          ))}
        </ul>

        <div className="relative cursor-pointer inline-block px-5 py-3 font-medium group max-sm:hidden" onClick={handleSignInClick}>
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
              } hover:text-primary text-[18px] font-montserrat cursor-pointer duration-300`}
              onClick={() => {
                setActive(link.name);
                setToggle(false);
              if(link.name === 'Sign In') {
                  handleSignInClick();
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
