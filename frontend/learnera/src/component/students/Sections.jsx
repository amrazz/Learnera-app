import React from "react";
import { Routes, Route } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";
import StudentAssignments from "./StudentAssignments";
import StudentExamList from "./Exam/StudentExamList";
import ExamPreparation from "./Exam/ExamPreparation";
import ExamInterface from "./Exam/ExamInterface";
import ExamOver from "./Exam/ExamOver";
import StudentExamResults from "./Exam/StudentExamResults";

const Sections = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path = "student-assignments" element={<StudentAssignments />} />
      <Route path = "exam_list" element={<StudentExamList />} />
      <Route path = "exam-preparation/:examId" element={<ExamPreparation />} />
      <Route path = "exam_interface/:examId" element={<ExamInterface />} />
      <Route path = "exam-over" element={<ExamOver />} />
      <Route path = "my-results" element={<StudentExamResults />} />


    </Routes>
  );
};
export default Sections;
