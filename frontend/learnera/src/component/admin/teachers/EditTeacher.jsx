import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { UserCircle2, ArrowLeft } from "lucide-react";
import { HashLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import api from "../../../api";
import { TeacherEditSchema, teacherFormFields } from "./Constants";

const EditTeacher = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentTitles, setDocumentTitles] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await api.get("school_admin/subjects/");
        if (response.status === 200) {
          setSubjects(response.data);
        }
      } catch (error) {
        toast.error("Failed to fetch subjects");
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await api.get(`school_admin/teachers/${teacherId}`);
        if (response.status === 200) {
          setTeacher(response.data);
          if (response.data.user.profile_image) {
            setPreviewImage(
              `https://learnerapp.site/${response.data.user.profile_image}`
            );
          }
          if (response.data.documents) {
            setExistingDocuments(response.data.documents);
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

      const requestData = {
        user: {},
        qualifications:
          values.qualifications !== teacher.qualifications
            ? values.qualifications
            : undefined,
        subject:
          values.subject !== teacher.subject ? values.subject : undefined,
      };

      Object.keys(values).forEach((key) => {
        if (
          key !== "profile_image" &&
          key !== "documents" &&
          key !== "documentTitles" &&
          values[key] !== teacher.user[key]
        ) {
          requestData.user[key] = values[key];
        }
      });

      formData.append("data", JSON.stringify(requestData));

      if (values.profile_image) {
        formData.append("profile_image", values.profile_image);
      }

      documents.forEach((doc, index) => {
        if (doc) {
          formData.append("documents", doc);
          formData.append("document_titles", documentTitles[index]);
        }
      });

      const response = await api.patch(
        `school_admin/teachers/${teacherId}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Teacher information updated successfully!");
        setTimeout(() => {
          navigate(`/admin/teacher_info/${teacherId}`);
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update teacher");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocumentChange = (event, index) => {
    const newDocuments = [...documents];
    newDocuments[index] = event.target.files[0];
    setDocuments(newDocuments);
  };

  const handleTitleChange = (event, index) => {
    const newTitles = [...documentTitles];
    newTitles[index] = event.target.value;
    setDocumentTitles(newTitles);
  };

  const addDocumentField = () => {
    setDocuments([...documents, null]);
    setDocumentTitles([...documentTitles, ""]);
  };

  const removeDocumentField = (index) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    const newTitles = documentTitles.filter((_, i) => i !== index);
    setDocuments(newDocuments);
    setDocumentTitles(newTitles);
  };

  const removeExistingDocument = async (documentId) => {
    try {
      await api.delete(`school_admin/teacher-documents/${documentId}/`);
      setExistingDocuments(
        existingDocuments.filter((doc) => doc.id !== documentId)
      );
      toast.success("Document removed successfully");
    } catch (error) {
      toast.error("Failed to remove document");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader color="#0b43ff" size={50} speedMultiplier={2} />
      </div>
    );
  }

  if (error)
    return <div className="text-red-500 text-center py-4">Error: {error}</div>;
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
    subject: teacher.subject_name || "",
    profile_image: null,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ToastContainer />
      <div className="mb-6">
        <button
          onClick={() => navigate(`/admin/teacher_info/${teacherId}`)}
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
                              <label
                                key={option.value}
                                className="flex items-center"
                              >
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
                        ) : field.type === "select" ? (
                          <Field
                            as="select"
                            name={field.name}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2"
                          >
                            <option value="">Select a subject</option>
                            {subjects.map((subject) => (
                              <option key={subject.id} value={subject.id}>
                                {subject.subject_name}
                              </option>
                            ))}
                          </Field>
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

              <div className="space-y-6">
                {existingDocuments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-md font-medium mb-2">
                      Current Documents:
                    </h4>
                    {existingDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 border rounded mb-2"
                      >
                        <span>{doc.title}</span>
                        <div className="flex space-x-2">
                          <a
                            href={`https://learnerapp.site/${doc.document}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </a>
                          <button
                            type="button"
                            onClick={() => removeExistingDocument(doc.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {documents.map((doc, index) => (
                  <div key={index} className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Document Title"
                        value={documentTitles[index]}
                        onChange={(e) => handleTitleChange(e, index)}
                        className="border p-2 w-full rounded mb-2"
                      />
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleDocumentChange(e, index)}
                        className="w-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocumentField(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDocumentField}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add New Document
                </button>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/teacher_info/${teacherId}`)}
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
