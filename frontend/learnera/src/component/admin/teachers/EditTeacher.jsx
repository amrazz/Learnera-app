import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../../../api";
import { TeacherEditSchema, teacherFormFields } from "./Constants";
import { UserCircle2, ArrowLeft } from "lucide-react";
import { HashLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";

// Validation schema for teacher form


const EditTeacher = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch teacher details
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await api.get(`school_admin/teachers/${teacherId}`);
        if (response.status === 200) {
          setTeacher(response.data);
          if (response.data.user.profile_image) {
            setPreviewImage(`http://127.0.0.1:8000/${response.data.user.profile_image}`);
          }
        }
      } catch (error) {
        setError(error.response?.data?.error || "Failed to fetch teacher data");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [teacherId]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      
      // Prepare the request data
      const requestData = {
        user: {},
        qualifications: values.qualifications !== teacher.qualifications ? values.qualifications : undefined
      };
  
      // Add changed user fields
      Object.keys(values).forEach(key => {
        if (key !== 'qualifications' && 
            key !== 'profile_image' && 
            values[key] !== teacher.user[key]) {
          requestData.user[key] = values[key];
        }
      });
  
      // Append the JSON data
      formData.append('data', JSON.stringify(requestData));
  
      // Append the profile image if it exists
      if (values.profile_image) {
        formData.append('profile_image', values.profile_image);
      }
  
      const response = await api.patch(
        `school_admin/teachers/${teacherId}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      if (response.status === 200) {
        toast.success("Teacher information updated successfully!");
        setTimeout(() => {
            navigate(`/admin_dashboard/teacher_info/${teacherId}`);
        }, 2000)
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update teacher");
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

  if (error) return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  if (!teacher) return <div className="text-center py-4">No teacher found</div>;

  const initialValues = {
    username: teacher.user.username || "",
    first_name: teacher.user.first_name || "",
    last_name: teacher.user.last_name || "",
    email: teacher.user.email || "",
    phone_number: teacher.user.phone_number || "",
    qualifications: teacher.qualifications || "",
    address: teacher.user.address || "",
    city: teacher.user.city || "",
    state: teacher.user.state || "",
    district: teacher.user.district || "",
    country: teacher.user.country || "",
    emergency_contact_number: teacher.user.emergency_contact_number || "",
    date_of_birth: teacher.user.date_of_birth || "",
    gender: teacher.user.gender || "",
    profile_image: null
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ToastContainer />
      <div className="mb-6">
        <button
          onClick={() => navigate(`/admin_dashboard/teacher_info/${teacherId}`)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Teacher Profile
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <UserCircle2 className="mr-3 h-8 w-8" />
            Edit Teacher Information
          </h2>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={TeacherEditSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form className="p-6 space-y-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 relative rounded-full overflow-hidden">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <UserCircle2 className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.currentTarget.files[0];
                    setFieldValue("profile_image", file);
                    if (file) {
                      setPreviewImage(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                  id="profile_image"
                />
                <label
                  htmlFor="profile_image"
                  className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Change Profile Picture
                </label>
              </div>

              {/* Form Fields */}
              {teacherFormFields.map((section, index) => (
                <div key={index} className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    {section.section}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {section.fields.map((field) => (
                      <div key={field.name}>
                        <label
                          htmlFor={field.name}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {field.label}
                        </label>
                        {field.type === "radio" ? (
                          <div className="flex space-x-4">
                            {field.options.map((option) => (
                              <label key={option.value} className="flex items-center">
                                <Field
                                  type="radio"
                                  name={field.name}
                                  value={option.value}
                                  className="mr-2"
                                />
                                {option.label}
                              </label>
                            ))}
                          </div>
                        ) : field.type === "textarea" ? (
                          <Field
                            as="textarea"
                            name={field.name}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows={3}
                          />
                        ) : (
                          <Field
                            type={field.type}
                            name={field.name}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2"
                          />
                        )}
                        <ErrorMessage
                          name={field.name}
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(`/admin_dashboard/teacher_info/${teacherId}`)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditTeacher;