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
import CreateExam from "./Exam/CreateExam";
import ExamQuestions from "./Exam/ExamQuestions";
import ShowExam from "./Exam/ShowExam";
import ExamEvaluation from "./Exam/ExamEvaluation";
import TeacherExamResults from "./Exam/TeacherExamResults";
import ChatPage from "../chat/ChatPage";
import TeacherLeaveManagement from "./TeacherLeaveManagement";
import TeacherLeaveRequest from "./TeacherLeaveRequest";
import UserProfile from "../UserProfile";


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
      <Route path="show-exam" element={<ShowExam />} />
      <Route path="create-exam" element={<CreateExam />} />
      <Route path="create-exam/:examId/questions" element={<ExamQuestions />} />
      <Route path="exam-evaluation/:examId" element={<ExamEvaluation />} />
      <Route path="exam-results" element={<TeacherExamResults />} />
      <Route path="chats" element={<ChatPage />} />
      <Route path="leave-approval" element={<TeacherLeaveManagement />} />
      <Route path="leave-request" element={<TeacherLeaveRequest />} />
      <Route path="profile" element={<UserProfile />} />
    </Routes>
  );
};
export default Sections;