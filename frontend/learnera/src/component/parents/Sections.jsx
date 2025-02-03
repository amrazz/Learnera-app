import React from "react";
import StudentDetails from "./StudentDetails";
import PayStudentFees from "./PayStudentFees";
import PaymentSuccess from "./PaymentSuccess";
import ParentDashboard from "./ParentDashboard";
import { Routes, Route } from "react-router-dom";
import PaymentHistory from "./PaymentHistory";

const Sections = () => {
  return (
    <Routes>
      <Route path="/" element={<ParentDashboard />} />
      <Route path="student-details" element={<StudentDetails />} />
      <Route path="pay_fees" element={<PayStudentFees />} />
      <Route path="payment-success" element={<PaymentSuccess />} />
      <Route path="payment_history" element={<PaymentHistory />} />
    </Routes>
  );
};
export default Sections;