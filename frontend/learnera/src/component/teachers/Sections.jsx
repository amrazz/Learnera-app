import React from "react";
import { Routes, Route } from "react-router-dom";
import TeacherDashboard from "./TeacherDashboard";


const Sections = () => {
  return (
    <Routes>

      <Route path="/" element={<TeacherDashboard />} />
    </Routes>
  );
};
export default Sections;