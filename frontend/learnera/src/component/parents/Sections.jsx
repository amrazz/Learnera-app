import React from "react";
import { Routes, Route } from "react-router-dom";
import ParentDashboard from "./ParentDashboard";
import StudentDetails from "./StudentDetails";

const Sections = () => {
  return (
    <Routes>
      <Route path="/" element={<ParentDashboard />} />
      <Route path="student-details" element={<StudentDetails />} />
    </Routes>
  );
};
export default Sections;