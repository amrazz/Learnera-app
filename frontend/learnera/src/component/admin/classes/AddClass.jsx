import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate, useNavigate } from "react-router-dom";

const AddClass = () => {

  const [teachers, setTeachers] = useState([]);
  const navigate = useNavigate()

  const validationSchema = Yup.object({
    class_name: Yup.string()
      .max(2, "Class Name must be at most 2 characters")
      .required("Class Name is required"),
    section_name: Yup.string()
      .max(1, "Section must be a single character")
      .required("Section is required"),
    student_count: Yup.number()
      .default(30)
      .required("Student Count is required")
      .positive("Student Count must be a positive number")
      .integer("Student Count must be an integer"),
  });

  const handleSubmit = async (values, {resetForm}) => {

    try {
      const response = await api.post("school_admin/add_class/", values);
      console.log(`this is the class create response ${response.data}`);

      if (response.status === 201) {
        toast.success("New Class Created Successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        resetForm();

        setTimeout(() => {
          navigate('/admin_dashboard/show_class')
        }, 3000);
      } else {
        toast.error("Failed to create class. Please try again.");
      }
    } catch (error) {
      const errorData = error?.response?.data;
      let errorMessage = "An unexpected error occurred! Please try again.";

      if (errorData && typeof errorData === "object") {
        errorMessage = Object.entries(errorData)
          .map(
            ([field, messages]) =>
              `${field}: ${messages.map((msg) => msg.string).join(", ")}`
          )
          .join("\n");
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

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
                <div className="grid gap-6 grid-cols-2">
                  {/* Class Name */}
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

                  {/* Section */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Section
                    </label>
                    <Field
                      type="text"
                      name="section_name"
                      maxLength="1"
                      placeholder="Enter section (e.g., A)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <ErrorMessage
                      name="section_name"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  {/* Student Count */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Student Count
                    </label>
                    <Field
                      type="number"
                      name="student_count"
                      placeholder="Enter student count"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <ErrorMessage
                      name="student_count"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  {/* Class Teacher */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Class Teacher
                    </label>
                    <Field
                      as="select"
                      name="class_teacher"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select Teacher</option>
                      {/* Uncomment when you fetch teacher data */}
                      {/* {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.user.first_name} {teacher.user.last_name}
                        </option>
                      ))} */}
                    </Field>
                    <ErrorMessage
                      name="class_teacher"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={() => resetForm()}
                    className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all"
                  >
                    Reset
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
