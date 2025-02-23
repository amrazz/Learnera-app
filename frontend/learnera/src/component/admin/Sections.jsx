import React from "react";
import { Routes, Route } from "react-router-dom";
import AddStudents from "./students/AddStudents";
import ShowStudents from "./students/ShowStudents";
import StudentInfo from "./students/StudentInfo";
import EditStudentInfo from "./students/EditStudentInfo";
import AdminDashboard from "./AdminDashboard";
import AddClass from "./classes/AddClass";
import ShowClass from "./classes/ShowClass";
import Logout from "../login_page/Logout";
import EditClass from "./classes/EditClass";
import AddParents from "./parent/AddParents";
import ShowParents from "./parent/ShowParents";
import ParentInfo from "./parent/ParentInfo";
import EditParent from "./parent/EditParent";
import AddTeachers from "./teachers/AddTeachers";
import ShowTeachers from "./teachers/ShowTeachers";
import TeacherInfo from "./teachers/TeacherInfo";
import EditTeacher from "./teachers/EditTeacher";
import AdminAttendance from "./components/AdminAttendance";
import Subjects from "./teachers/Subjects";
import FeeCreation from "./accounts/FeeCreation";
import ShowFeePayments from "./accounts/ShowFeePayments";
import AdminLeaveManagement from "./AdminLeaveManagement";
import AdminProfile from "./AdminProfile";

const Sections = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="add_students" element={<AddStudents />} />
      <Route path="show_students" element={<ShowStudents />} />
      <Route path="logout" element={<Logout />} />
      <Route path="student_info/:studentId" element={<StudentInfo />} />
      <Route path="student_info/:studentId/edit" element={<EditStudentInfo />}
      />
      <Route path="add_class" element={<AddClass />} />
      <Route path="show_class" element={<ShowClass />} />
      <Route path="edit_class/:classId/:sectionId" element={<EditClass />} />

      <Route path="add_parents" element={<AddParents />} />
      <Route path="show_parents" element={<ShowParents />} />
      <Route path="parent_info/:parentId" element={<ParentInfo />} />
      <Route path="parent_info/:parentId/edit" element={<EditParent />} />

      <Route path="add_teachers" element={<AddTeachers />} />
      <Route path="show_teachers" element={<ShowTeachers />} />
      <Route path="teacher_info/:teacherId/" element={<TeacherInfo />} />
      <Route path="teacher_info/:teacherId/edit" element={<EditTeacher />} />
      <Route path="subjects" element={<Subjects />} />
      <Route path="fee_creation" element={<FeeCreation />} />
      <Route path="payments" element={<ShowFeePayments />} />


      <Route path="attendance" element={<AdminAttendance />} />
      <Route path="leave-management" element={<AdminLeaveManagement />} />
      <Route path="admin-profile" element={<AdminProfile />} />
    </Routes>
  );
};
export default Sections;
