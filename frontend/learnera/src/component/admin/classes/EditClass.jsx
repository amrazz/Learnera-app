import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Loader } from "lucide-react";
import api from "../../../api";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

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
    .required("Student Count is required")
    .positive()
    .integer()
    .max(100),
  class_teacher: Yup.string().nullable(),
});

const EditClass = () => {
  const [initialValues, setInitialValues] = useState({
    class_name: "",
    section_name: "",
    student_count: 30,
    class_teacher: "",
  });
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { classId, sectionId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classResponse, teachersResponse] = await Promise.all([
          api.get("school_admin/classes"),
          api.get("school_admin/teachers/"),
        ]);

        setTeachers(teachersResponse.data);

        const classData = classResponse.data.find(
          (cls) => cls.id === parseInt(classId)
        );

        if (!classData) {
          throw new Error("Class not found");
        }

        const section = classData.sections.find(
          (section) => section.id === parseInt(sectionId)
        );

        if (!section) {
          throw new Error("Section not found");
        }

        setInitialValues({
          class_name: classData.class_name,
          section_name: section.section_name,
          student_count: section.student_count,
          class_teacher: section.class_teacher_info
            ? section.class_teacher_info.id.toString()
            : "",
        });
      } catch (error) {
        toast.error(error.message || "Failed to fetch data");
        setTimeout(() => navigate("/admin/show_class"), 1000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [classId, sectionId, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setIsLoading(true);

      const payload = {
        class_name: values.class_name,
        section: {
          section_name: values.section_name,
          student_count: values.student_count,
          // Convert back to number if necessary, or handle it in your API
          class_teacher: values.class_teacher || null,
        },
      };

      const response = await api.put(
        `school_admin/update/class/${classId}/section/${sectionId}/`,
        payload
      );

      if (response.status === 200) {
        toast.success("Class Updated Successfully!");
        setTimeout(() => navigate("/admin/show_class"), 1000);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        Object.values(error.response?.data || {})
          .flat()
          .join(", ") ||
        "Update failed";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
      setIsLoading(false);
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
            Edit Class
          </h1>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Class
                    </label>
                    <Field
                      type="text"
                      name="class_name"
                      maxLength="2"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <Field
                      as="select"
                      name="class_teacher"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id.toString()}>
                        {teacher.user.first_name} {teacher.user.last_name}
                      </option>
                      ))}
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
                    type="button"
                    onClick={() => navigate("/admin/show_class")}
                    className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update"
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

export default EditClass;
