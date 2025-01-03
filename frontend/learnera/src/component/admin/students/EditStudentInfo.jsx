import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { EditForm } from "./constants";
import api from "../../../api";
import { UserCircle2 } from "lucide-react";
import { HashLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";

const StudentInfoSchema = Yup.object().shape({
  first_name: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  last_name: Yup.string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone_number: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  date_of_birth: Yup.date()
    .max(new Date(), "Birth date cannot be in the future")
    .required("Birth date is required"),
  admission_number: Yup.string().required("Admission number is required"),
  roll_number: Yup.string().required("Roll number is required"),
  parent_name: Yup.string().required("Parent name is required"),
  parent_email: Yup.string()
    .email("Invalid parent email address")
    .required("Parent email is required"),
});

const EditStudentInfo = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch student data
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await api.get(
          `school_admin/student_info/${studentId}`
        );

        if (response.status === 200) {
          setStudent(response.data);
        }
      } catch (error) {
        setError(
          error.response?.data?.error || "Failed to fetch student details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  const handleSubmit = async (values, { setSubmitting }) => {
    console.log(values);

    try {
      const response = await api.put(
        `school_admin/student_update/${studentId}/`,
        {
          ...values,
          class_assigned: student.class_assigned.id,
        }
      );

      if (response.status === 200) {

        toast.success("Student has been updated successfully")
        setTimeout(() => {
          navigate(`/admin_dashboard/student_info/${studentId}`);
        }, 2000)
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update student")
      setError(error.response?.data?.error || "Failed to update student");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  if (error) return <div>Error: {error}</div>;
  if (!student) return <div>No student found</div>;

  const initialValues = {
    first_name: student.user.first_name,
    last_name: student.user.last_name,
    email: student.user.email,
    phone_number: student.user.phone_number,
    address: student.user.address,
    city: student.user.city,
    state: student.user.state,
    country: student.user.country,
    date_of_birth: student.user.date_of_birth,
    gender: student.user.gender,
    emergency_contact_number: student.user.emergency_contact_number,
    admission_number: student.admission_number,
    roll_number: student.roll_number,
    parent_name: student.parent_name,
    parent_email: student.parent_email,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ToastContainer />
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <UserCircle2 className="mr-3 h-8 w-8" />
            Edit Student Information
          </h2>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={StudentInfoSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, studentId }) => (
            <EditForm
              isSubmitting={isSubmitting}
              errors={errors}
              touched={touched}
              studentId={studentId}
            />
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditStudentInfo;
