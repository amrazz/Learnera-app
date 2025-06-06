import React, { useEffect, useState } from 'react';
import Sidebar from './layout/sidebar/SideBar';
import Nav from './layout/header/Nav';
import Sections from './Sections';
import BackToTop from '../BackToTop';

const Teachers = () => {
  const [activeMenu, setActiveMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setActiveMenu(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        activeMenu &&
        !event.target.closest(".sidebar-container")
      ) {
        setActiveMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, activeMenu]);

  return (
    <div className="relative min-h-screen">
      {isMobile && activeMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-20 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar container */}
        <div
          className={`sidebar-container fixed md:relative md:flex z-30 h-screen md:w-96 overflow-y-auto overflow-x-hidden transition-transform duration-300 ${
            isMobile
              ? activeMenu
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          }`}
        >
          <div className="bg-[#0D2E76] h-full">
            <Sidebar
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              isMobile={isMobile}
            />
          </div>
        </div>

        {/* Main content container */}
        <div className="flex flex-col z-10 w-[130%] h-screen overflow-y-auto">
          <div className="sticky top-0  bg-white shadow-md z-30">
            <Nav
              setActiveMenu={setActiveMenu}
              isMobile={isMobile}
              isMenuOpen={activeMenu}
            />
          </div>
          <div className="p-5 bg-gray-100 z-10">
            <Sections />
            <BackToTop />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Teachers;
