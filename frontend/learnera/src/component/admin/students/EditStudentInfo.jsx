import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { EditForm } from "./constants";
import api from "../../../api";
import { UserCircle2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HashLoader } from "react-spinners";

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
  gender: Yup.string().required("Gender is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  country: Yup.string().required("Country is required"),
  emergency_contact_number: Yup.string().matches(
    /^[0-9]{10}$/,
    "Emergency contact number must be 10 digits"
  ),
  admission_number: Yup.string().required("Admission number is required"),
  roll_number: Yup.string().required("Roll number is required"),
});

const EditStudentInfo = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await api.get(
          `school_admin/student_info/${studentId}`
        );
        setStudent(response.data);
        if (response.data.user.profile_image) {
          setPreviewImage(
            `https://learnerapp.site${response.data.user.profile_image}`
          );
        }
      } catch (error) {
        setError("Failed to fetch student details");
        toast.error("Failed to fetch student details");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      
      // Add all text fields to formData
      Object.keys(values).forEach(key => {
        if (key !== 'profile_image') {
          formData.append(key, values[key]);
        }
      });
      
      // Add profile image if it exists
      if (values.profile_image) {
        formData.append('profile_image', values.profile_image);
      }
      
      // Important: Set the correct content type for the request
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      await api.put(`school_admin/student_update/${student.user.id}/`,
        formData,
        config
      );
      
      toast.success("Student information updated successfully");
      navigate(`/admin/student_info/${studentId}`);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update student information");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }

  if (error) return <div className="text-red-500">{error}</div>;
  if (!student) return <div>No student found</div>;

  const initialValues = {
    first_name: student.user.first_name,
    last_name: student.user.last_name,
    email: student.user.email,
    phone_number: student.user.phone_number,
    address: student.user.address || "",
    city: student.user.city || "",
    state: student.user.state || "",
    country: student.user.country || "",
    date_of_birth: student.user.date_of_birth,
    gender: student.user.gender,
    emergency_contact_number: student.user.emergency_contact_number || "",
    admission_number: student.admission_number,
    roll_number: student.roll_number,
    profile_image: null,
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
          {({ isSubmitting, errors, touched, setFieldValue }) => (
            <EditForm
              isSubmitting={isSubmitting}
              errors={errors}
              touched={touched}
              student={student}
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
              setFieldValue={setFieldValue}
            />
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditStudentInfo;
