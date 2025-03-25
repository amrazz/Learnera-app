import React from "react";
import { useNavigate } from "react-router-dom";

export const CustomButton = ({ title, role }) => {
  const navigate = useNavigate();

  

  return (
    <div
      className="relative cursor-pointer inline-block text-lg group"
      onClick={() => {navigate("/login", {
        state: { selectedRole: role },
      })}}
    >
      <span className="relative z-10 block px-5 py-3 overflow-hidden font-medium leading-tight text-gray-800 transition-colors duration-300 ease-out border-2 border-gray-900 group-hover:text-white">
        <span className="absolute inset-0 w-full h-full px-5 py-3 bg-gray-50"></span>
        <span className="absolute left-0 w-48 h-48 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-gray-900 group-hover:-rotate-180 ease"></span>
        <span className="relative">{title}</span>
      </span>
      <span className="absolute bottom-0 right-0 w-full h-12 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-gray-900 group-hover:mb-0 group-hover:mr-0"></span>
    </div>
  );
};
