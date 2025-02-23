import React, { useEffect, useState } from "react";
import { menu, subMenus } from "./constants";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaChevronDown, FaChevronUp } from "react-icons/fa";

const Sidebar = ({ activeMenu, setActiveMenu, isMobile }) => {
  const [isToggled, setIsToggled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (id) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className={`text-white ${isToggled ? "w-32 " : "w-64"} ${activeMenu ? 'h-screen' : 'h-full'} flex flex-col p-5 shadow-lg transition-all duration-300`}
      style={{
        background: 'linear-gradient(to bottom, var(--gradient-start), var(--gradient-end))'
      }}
    >
      {/* Header Section */}
      <div className={`${!isToggled ? "flex items-center justify-between mb-8" : "flex justify-center pb-5"}`}>
        {!isToggled ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-3xl font-extrabold tracking-wide">
              LEARNERA
            </span>
            {!isMobile && (
              <button
                onClick={() => setIsToggled(true)}
                className="bg-white/20 p-2 rounded-full transition-transform transform hover:scale-110"
              >
                <FaArrowLeft size={20} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center">
            <button
              onClick={() => setIsToggled(false)}
              className="bg-white/20 p-3 rounded-full transition-transform transform hover:scale-110"
            >
              <FaArrowRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Menu Section - Now with proper height calculations */}
      <div 
        className={`flex-1 ${activeMenu ? 'overflow-y-auto' : ''}`}
        style={{
          height: 'calc(100vh - 120px)', // Account for header and padding
          paddingRight: '8px',
          marginBottom: '16px'
        }}
      >
        <ul className="space-y-5">
          {menu.map((item) => {
            const Icon = item.logo;
            const hasSubMenu = subMenus[item.id];
            return (
              <li key={item.id} className="relative">
                {hasSubMenu ? (
                  <>
                    <div
                      className={`flex items-center gap-4 p-3 ${
                        isToggled && "justify-center"
                      } rounded-lg cursor-pointer transition-all duration-200 hover:bg-[var(--gradient-start)] hover:scale-105`}
                      onClick={() => toggleDropdown(item.id)}
                    >
                      <span
                        className="bg-white/20 p-2 rounded-lg text-center transition-all hover:bg-white/30"
                        style={{ width: isToggled ? "40px" : "auto" }}
                      >
                        <Icon size={22} />
                      </span>
                      {!isToggled && (
                        <div className="flex justify-between w-full">
                          <span className="text-md font-medium">{item.name}</span>
                          <span>
                            {activeDropdown === item.id ? (
                              <FaChevronUp size={14} />
                            ) : (
                              <FaChevronDown size={14} />
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    <ul
                      className={`ml-6 mt-2 space-y-2 overflow-hidden transition-all cursor-pointer duration-300 ${
                        activeDropdown === item.id
                          ? "max-h-screen opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {subMenus[item.id].map((subItem, idx) => (
                        <li key={idx}>
                          <Link
                            to={`/parents/${subItem.toLowerCase().replace(" ", "_")}`}
                            className="p-2 block bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 hover:text-white"
                          >
                            {subItem}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    to={`/parents/${item.link === 'dashboard' ? '' : item.link}`}
                    className={`flex items-center gap-4 p-3 ${
                      isToggled && "justify-center"
                    } rounded-lg cursor-pointer transition-all duration-200 hover:bg-[var(--gradient-start)] hover:scale-105`}
                  >
                    <span
                      className="bg-white/20 p-2 rounded-lg text-center transition-all hover:bg-white/30"
                      style={{ width: isToggled ? "40px" : "auto" }}
                    >
                      <Icon size={22} />
                    </span>
                    {!isToggled && (
                      <span className="text-md font-medium">{item.name}</span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;