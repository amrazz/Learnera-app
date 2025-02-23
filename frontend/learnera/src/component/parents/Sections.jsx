import React from "react";
import StudentDetails from "./StudentDetails";
import PayStudentFees from "./PayStudentFees";
import PaymentSuccess from "./PaymentSuccess";
import ParentDashboard from "./ParentDashboard";
import { Routes, Route } from "react-router-dom";
import PaymentHistory from "./PaymentHistory";
import ChatPage from "../chat/ChatPage";
import UserProfile from "../UserProfile";
import AttendanceHistory from "../teachers/AttendanceHistory";
import AttendanceReport from "./AttendanceReport";

const Sections = () => {
  return (
    <Routes>
      <Route path="/" element={<ParentDashboard />} />
      <Route path="student-details" element={<StudentDetails />} />
      <Route path="pay_fees" element={<PayStudentFees />} />
      <Route path="payment-success" element={<PaymentSuccess />} />
      <Route path="payment_history" element={<PaymentHistory />} />
      <Route path="chats" element={<ChatPage />} />
      <Route path="profile" element={<UserProfile />} />
      <Route path="attendance-report" element={<AttendanceReport />} />
    </Routes>
  );
};
export default Sections;