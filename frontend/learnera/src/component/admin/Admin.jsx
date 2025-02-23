import React, { useEffect, useState } from "react";
import SideBar from "./layout/sidebar/SideBar";
import Nav from "./layout/header/Nav";
import Sections from "./Sections";
import BackToTop from "../BackToTop";
import { SidebarProvider } from "@/components/ui/sidebar";

const Admin = () => {
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, activeMenu]);

  return (
    <div className="relative min-h-screen">
      {/* Overlay when mobile sidebar is open */}
      {isMobile && activeMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Main Layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div 
          className={`sidebar-container fixed md:relative md:flex z-30 transition-transform duration-300 ${
            isMobile 
              ? activeMenu 
                ? 'translate-x-0' 
                : '-translate-x-full'
              : 'translate-x-0'
          }`}
        >
           <div className="grid grid-cols-[auto,1fr] min-h-screen">
            <SidebarProvider>
            <SideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
            </SidebarProvider>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col w-full">
          {/* Navigation */}
          <div className="sticky top-0 bg-white shadow-md z-10">
            <Nav 
              setActiveMenu={setActiveMenu} 
              isMobile={isMobile}
              isMenuOpen={activeMenu}
            />
          </div>

          <div className="p-3 md:p-5 bg-gray-100 flex-1">
            <Sections />
            <BackToTop />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

