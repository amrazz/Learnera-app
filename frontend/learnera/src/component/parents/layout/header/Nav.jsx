import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { CiMail } from "react-icons/ci";
import { FaBell } from "react-icons/fa";
import { IoLogOutSharp, IoMenu } from "react-icons/io5";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useNavigate } from "react-router-dom";
import Modal from "../../../Modal";

const Nav = ({ setActiveMenu, isMobile, isMenuOpen }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigate("/logout");
  };

  return (
    <div className="sticky top-0 bg-white shadow-md z-10">
      <div className="flex flex-wrap items-center justify-between px-4 py-4 md:px-6 md:py-6 bg-gradient-to-r from-white via-gray-100 to-white rounded-lg">
        {/* Menu Button - Only show on mobile */}
        {isMobile && (
          <button
            onClick={() => setActiveMenu(!isMenuOpen)}
            className="p-2 text-gray-600 hover:text-blue-500 transition-transform transform hover:scale-105"
          >
            <IoMenu size={30} />
          </button>
        )}

        {/* Search Bar */}
        <div className="w-full md:w-auto order-3 md:order-2 mt-4 md:mt-0 md:flex">
          <div className="relative w-full max-w-md mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 blur-xl rounded-xl transition-all duration-300 group-hover:blur-2xl"></div>
            <div className="relative flex items-stretch shadow-md rounded-lg">
              <input
                type="search"
                className="flex-grow rounded-l-lg py-3 px-4 text-gray-700 border border-gray-200 bg-white/80 backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all duration-300"
                placeholder="Search..."
              />
              <button className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-6 rounded-r-lg font-medium text-sm shadow-lg shadow-blue-400/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95 transition-all duration-300">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4 order-2 md:order-3">
          <button className="relative p-2 text-gray-600 hover:text-blue-600">
            <CiMail size={26} />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              5
            </span>
          </button>

          <button className="relative p-2 text-gray-600 hover:text-blue-600">
            <FaBell size={26} />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-2 text-gray-600 hover:text-blue-600"
          >
            <IoLogOutSharp size={26} />
          </button>
        </div>
      </div>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout Confirmation"
        message="Are you sure you want to logout?"
        confirmButtonClass="bg-blue-500"
        confirmText="Logout"
      />
    </div>
  );
};

export default Nav;
