import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Loader } from "lucide-react";
import api from "../../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import SearchTeacher from "./SearchTeacher";

const validationSchema = Yup.object({
  class_name: Yup.string()
    .max(2, "Class Name must be at most 2 characters")
    .required("Class Name is required")
    .matches(/^[0-9]+$/, "Class Name must be numeric"),
  section_name: Yup.string()
    .max(1, "Section must be a single character")
    .required("Section is required")
    .matches(/^[A-Z]$/, "Section must be a single uppercase letter"),
  student_count: Yup.number()
    .default(30)
    .required("Student Count is required")
    .positive("Student Count must be a positive number")
    .integer("Student Count must be an integer")
    .max(100, "Student Count cannot exceed 100"),
  class_teacher: Yup.string().required("Class Teacher is required"),
});

const AddClass = () => {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await api.get('school_admin/teachers/');
        setTeachers(response.data);
      } catch (error) {
        toast.error("Failed to fetch teachers. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await api.post("school_admin/add_class/", values);
      if (response.status === 201) {
        toast.success("New Class Created Successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        resetForm();
        setTimeout(() => navigate("/admin/show_class"), 1000);
      }
    } catch (error) {
      const errorData = error?.response?.data;
      const errorMessage = typeof errorData === "object" ? 
        Object.values(errorData).flat().join(", ") : 
        errorData || "An unexpected error occurred! Please try again.";
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-200 p-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="font-sans text-center text-3xl font-bold text-blue-800 mb-10">
            Add New Class
          </h1>

          <Formik
            initialValues={{
              class_name: "",
              section_name: "",
              student_count: 30,
              class_teacher: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, resetForm }) => (
              <Form className="space-y-8">
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Class
                    </label>
                    <Field
                      type="text"
                      name="class_name"
                      maxLength="2"
                      placeholder="Enter class (e.g., 10)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <ErrorMessage
                      name="class_name"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Section
                    </label>
                    <Field
                      type="text"
                      name="section_name"
                      maxLength="1"
                      placeholder="Enter section (e.g., A)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase"
                    />
                    <ErrorMessage
                      name="section_name"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Student Count
                    </label>
                    <Field
                      type="number"
                      name="student_count"
                      min="1"
                      max="100"
                      placeholder="Enter student count"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <ErrorMessage
                      name="student_count"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Class Teacher
                    </label>
                    <Field name="class_teacher">
                      {({ field, form }) => (
                        <SearchTeacher
                          teachers={teachers}
                          onChange={(value) => form.setFieldValue("class_teacher", value)}
                          error={form.errors.class_teacher}
                        />
                      )}
                    </Field>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => resetForm()}
                    className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default AddClass;