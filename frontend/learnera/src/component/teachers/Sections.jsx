import React from "react";
import { Routes, Route } from "react-router-dom";
import TeacherDashboard from "./TeacherDashboard";
import MyStudentsList from "./MyStudentsList";
import TeacherStudent from "./TeacherStudent";
import MarkAttendance from "./MarkAttendance";
import AttendanceHistory from "./AttendanceHistory";
import CreateAssignment from "./CreateAssignment";
import ShowAssignment from "./ShowAssignment";
import AssignmentSubmissions from "./AssignmentSubmissions";


const Sections = () => {
  return (
    <Routes>
      <Route path="/" element={<TeacherDashboard />} />
      <Route path="my-students-list" element={<MyStudentsList />} />
      <Route path="student-info/:studentId" element={<TeacherStudent />} />
      <Route path="mark-attendance" element={<MarkAttendance />} />
      <Route path="attendance-history" element={<AttendanceHistory />} />
      <Route path="create-assignment" element={<CreateAssignment />} />
      <Route path="show-assignment" element={<ShowAssignment />} />
      <Route path="assignment-submissions/:assignment_id/submissions" element={<AssignmentSubmissions />} />
    </Routes>
  );
};
export default Sections;