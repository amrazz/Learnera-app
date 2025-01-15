import React, { useEffect, useState } from "react";
import { menu, subMenus } from "./constants";
import { Link } from "react-router-dom";
import { BiMenuAltLeft } from "react-icons/bi";
import { FaArrowRight, FaChevronDown, FaChevronUp } from "react-icons/fa";

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const [isToggled, setIsToggled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleSize();
    window.addEventListener("resize", handleSize);

    return () => window.removeEventListener("resize", handleSize);
  }, []);

  const toggleDropdown = (id) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className={`bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white ${
        isToggled ? "w-32" : "w-64"
      } h-full p-5 shadow-lg transition-all duration-300 ${
        isMobile && !isToggled ? "hidden" : ""
      }`}
    >
      <div
        className={`${
          !isToggled
            ? "flex items-center justify-between mb-8"
            : "flex justify-end pb-5"
        }`}
      >
        {!isToggled ? (
          <span className="text-3xl font-extrabold tracking-wide">
            LEARNERA
          </span>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-semibold tracking-wide">
              LEARNERA
            </span>
            <button
              onClick={() => setIsToggled(false)}
              className="bg-white/20 p-2 rounded-full transition-transform transform hover:scale-110"
            >
              <FaArrowRight size={20} />
            </button>
          </div>
        )}
      </div>

      <ul className="space-y-4">
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
                    } rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#1F4BA5] hover:scale-105`}
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
                          to={`/teachers/${subItem
                            .toLowerCase()
                            .replace(" ", "-")}`}
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
                  to={`/teachers/${item.link === 'dashboard' ? '' : item.link}`}
                  className={`flex items-center gap-4 p-3 ${
                    isToggled && "justify-center"
                  } rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#1F4BA5] hover:scale-105`}
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
  );
};

export default Sidebar;
