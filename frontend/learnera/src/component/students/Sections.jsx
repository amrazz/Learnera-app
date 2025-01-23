import React from "react";
import { Routes, Route } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";
import MyStudentsList from "../teachers/MyStudentsList";
import StudentAssignments from "./StudentAssignments";

const Sections = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentDashboard />} />
      <Route path ="student-assignments" element={<StudentAssignments />} />
    </Routes>
  );
};
export default Sections;
