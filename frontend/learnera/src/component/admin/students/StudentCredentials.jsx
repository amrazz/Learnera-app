import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const StudentCredentials = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate("/add_students");
    return null;
  }

  const { admissionNumber, username, password } = state;

  return (
    <div className="max-w-xl mx-auto p-8 bg-white border border-gray-200 rounded shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-4">Student Credentials</h2>
      <p className="mb-2">
        <strong>Admission Number:</strong> {admissionNumber}
      </p>
      <p className="mb-2">
        <strong>Username:</strong> {username}
      </p>
      <p className="mb-2">
        <strong>Password:</strong> {password}
      </p>
      <p className="mt-6 text-sm text-gray-500">
        Please share these details with the student for login purposes.
      </p>

      <Link to={`/admin_dashboard/show_students`}>
        <button
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate("admin_dashboard/show_students")}
        >
          Back to Student
        </button>
      </Link>
    </div>
  );
};

export default StudentCredentials;
