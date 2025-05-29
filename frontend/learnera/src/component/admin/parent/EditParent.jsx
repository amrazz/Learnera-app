import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ParentEditSchema, parentFormFields } from "./Constants";
import api from "../../../api";
import { UserCircle2, ArrowLeft } from "lucide-react";
import { HashLoader } from "react-spinners";
import { toast } from "react-toastify";

const EditParentInfo = () => {
  const { parentId } = useParams();
  const navigate = useNavigate();
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch parent details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const parentResponse = await api.get(`school_admin/parents/${parentId}`);

        if (parentResponse.status === 200) {
          setParent(parentResponse.data);
          if (parentResponse.data.user.profile_image) {
            setPreviewImage(`${import.meta.env.VITE_IMAGE_LOADING_URL}${parentResponse.data.user.profile_image}`);
          }
        }
      } catch (error) {
        setError(error.response?.data?.error || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [parentId]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();

      // Prepare the request data
      const requestData = {
        user: {},
        occupation: values.occupation !== parent.occupation ? values.occupation : undefined
      };

      // Add changed user fields
      Object.keys(values).forEach(key => {
        if (
          key !== 'occupation' && 
          key !== 'profile_image' && 
          values[key] !== parent.user[key]
        ) {
          requestData.user[key] = values[key];
        }
      });

      // Append the JSON data
      formData.append('data', JSON.stringify(requestData));

      // Append the profile image if it exists
      if (values.profile_image) {
        formData.append('profile_image', values.profile_image);
      }

      const response = await api.put(
        `school_admin/parents/${parentId}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        toast.success("Parent information updated successfully!");
        navigate(`/admin/parent_info/${parentId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update parent");
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
  if (!parent) return <div className="text-center py-4">No parent found</div>;

  const initialValues = {
    username: parent.user.username || "",
    first_name: parent.user.first_name || "",
    last_name: parent.user.last_name || "",
    email: parent.user.email || "",
    phone_number: parent.user.phone_number || "",
    occupation: parent.occupation || "",
    address: parent.user.address || "",
    city: parent.user.city || "",
    state: parent.user.state || "",
    district: parent.user.district || "",
    country: parent.user.country || "",
    emergency_contact_number: parent.user.emergency_contact_number || "",
    date_of_birth: parent.user.date_of_birth || "",
    gender: parent.user.gender || "",
    profile_image: null
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/admin/parent_info/${parentId}`)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Parent Profile
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <UserCircle2 className="mr-3 h-8 w-8" />
            Edit Parent Information
          </h2>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={ParentEditSchema}
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
              {parentFormFields.map((section, index) => (
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  onClick={() => navigate(`/admin/parent_info/${parentId}`)}
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

export default EditParentInfo;
