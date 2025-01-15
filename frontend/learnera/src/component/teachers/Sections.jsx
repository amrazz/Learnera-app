import React from "react";
import { Routes, Route } from "react-router-dom";
import TeacherDashboard from "./TeacherDashboard";
import MyStudentsList from "./MyStudentsList";
import TeacherStudent from "./TeacherStudent";
import MarkAttendance from "./MarkAttendance";
import AttendanceHistory from "./AttendanceHistory";


const Sections = () => {
  return (
    <Routes>
      <Route path="/" element={<TeacherDashboard />} />
      <Route path="my-students-list" element={<MyStudentsList />} />
      <Route path="student-info/:studentId" element={<TeacherStudent />} />
      <Route path="mark-attendance" element={<MarkAttendance />} />
      <Route path="attendance-history" element={<AttendanceHistory />} />
    </Routes>
  );
};
export default Sections;