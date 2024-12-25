import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { CiMail } from "react-icons/ci";
import { FaBell } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const Nav = ({ setActiveMenu }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div className="flex flex-wrap items-center justify-between px-4 py-4 md:px-6 md:py-6 bg-gradient-to-r from-white via-gray-100 to-white shadow-lg rounded-lg">
      {/* Menu Button */}
      <div className="w-full md:w-auto text-center md:text-left mb-2 md:mb-0">
        <button
          onClick={() => setActiveMenu(true)}
          className="block md:hidden p-2 text-gray-600 hover:text-blue-500 transition-transform transform hover:scale-105"
        >
          <IoMenu size={30} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full md:w-auto flex items-center justify-center mb-2 md:mb-0 p-2">
        <div className="relative w-full max-w-md group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 blur-xl rounded-xl transition-all duration-300 group-hover:blur-2xl"></div>
          <div className="relative flex items-stretch shadow-md rounded-lg">
            <input
              type="search"
              className="flex-grow rounded-l-lg py-3 px-4 text-gray-700 border border-gray-200 bg-white/80 backdrop-blur-sm placeholder-gray-400 placeholder:font-light focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all duration-300"
              placeholder="Search for anything..."
              aria-label="Search"
            />
            <button
              className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-6 rounded-r-lg font-medium tracking-wide text-sm shadow-lg shadow-blue-400/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95 transition-all duration-300"
              type="button"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Icons and Dropdown */}
      <div className="flex gap-4 w-full md:w-auto justify-center md:justify-end items-center">
        {/* Message Icon */}
        <button
          className="relative p-2 text-gray-600 hover:text-blue-600 focus:outline-none transition-all duration-300"
          title="Messages"
        >
          <CiMail size={26} />
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
            5
          </span>
        </button>

        <button
          className="relative p-2 text-gray-600 hover:text-blue-600 focus:outline-none transition-all duration-300"
          title="Notifications"
        >
          <FaBell size={26} />
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
            3
          </span>
        </button>


      </div>
    </div>
  );
};

export default Nav;
