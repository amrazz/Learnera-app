import React from "react";
import { Routes, Route } from "react-router-dom";
import ParentDashboard from "./ParentDashboard";

const Sections = () => {
  return (
    <Routes>
      <Route path="/" element={<ParentDashboard />} />
    </Routes>
  );
};
export default Sections;