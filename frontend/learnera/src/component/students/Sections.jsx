import React from "react";
import { Routes, Route } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";

const Sections = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentDashboard />} />
    </Routes>
  );
};
export default Sections;
