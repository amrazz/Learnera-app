import React from "react";
import { Routes, Route } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";
import StudentAssignments from "./StudentAssignments";
import StudentExamList from "./Exam/StudentExamList";
import ExamPreparation from "./Exam/ExamPreparation";
import ExamInterface from "./Exam/ExamInterface";
import ExamOver from "./Exam/ExamOver";
import StudentExamResults from "./Exam/StudentExamResults";
import ChatPage from "../chat/ChatPage";
import StudentAttendance from "./StudentAttendance";
import StudentLeaveRequest from "./StudentLeaveRequest";
import UserProfile from "../UserProfile";

const Sections = () => {
  return (
    <Routes>
      <Route path = "chats" element={<ChatPage />} />
      <Route path="/" element={<StudentDashboard />} />
      <Route path = "exam-over" element={<ExamOver />} />
      <Route path = "exam_list" element={<StudentExamList />} />
      <Route path = "my-results" element={<StudentExamResults />} />
      <Route path = "leave-request" element={<StudentLeaveRequest />} />
      <Route path="my-attendance" element={<StudentAttendance />} />
      <Route path = "exam_interface/:examId" element={<ExamInterface />} />
      <Route path = "student-assignments" element={<StudentAssignments />} />
      <Route path = "exam-preparation/:examId" element={<ExamPreparation />} />
      <Route path = "profile" element={<UserProfile />} />


    </Routes>
  );
};
export default Sections;
