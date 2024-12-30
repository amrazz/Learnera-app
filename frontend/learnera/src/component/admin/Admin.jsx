import React, { useState } from "react";
import SideBar from "./layout/sidebar/SideBar";
import Nav from "./layout/header/Nav";
import Sections from "./Sections";
import BackToTop from "../BackToTop";

const Admin = () => {
  const [activeMenu, setActiveMenu] = useState(false);
  return (
    <div className="grid grid-cols-[auto,1fr] min-h-screen">
      <div className="bg-[#0D2E76] text-white">
        <SideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </div>

      <div className="flex flex-col w-full">
        <div className="sticky top-0 bg-white shadow-md z-10">
          <Nav setActiveMenu={setActiveMenu} />
        </div>


        <div className="p-5 bg-gray-100 h-full">
          <Sections />
          <BackToTop />
        </div>
      </div>
    </div>
  );
};

export default Admin;
