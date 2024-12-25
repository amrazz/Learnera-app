import React from "react";
import { Routes, Route } from "react-router-dom";
import AddStudents from "./students/AddStudents";
import ShowStudents from "./students/ShowStudents";
import StudentCredentials from "./students/StudentCredentials";
import StudentInfo from "./students/StudentInfo";
import EditStudentInfo from "./students/EditStudentInfo";
import AdminDashboard from "./AdminDashboard";
import AddClass from "./classes/AddClass";
import ShowClass from './classes/ShowClass'
import Logout from "../login_page/Logout";


const Sections = () => {
  return (
    <Routes>

      <Route path="/" element={<AdminDashboard />} />
      <Route path="add_students" element={<AddStudents />} />
      <Route path="show_students" element={<ShowStudents />} />
      <Route path="logout" element={<Logout />} />
      <Route path="student_credentials" element={<StudentCredentials />} />
      <Route path="student_info/:studentId" element={<StudentInfo />} />
      <Route path="student_info/:studentId/edit" element={<EditStudentInfo />} />

      <Route path="add_class" element={<AddClass />} />
      <Route path="show_class" element={<ShowClass />} />
    </Routes>
  );
};

export default Sections;
