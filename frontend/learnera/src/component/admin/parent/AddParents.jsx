import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import api from "../../../api";
import { validationSchema, initialValues, inputs } from "./Constants";
import { HashLoader } from "react-spinners";

const AddParents = () => {
  const [profile, setProfile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();


  const parentFormik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {

      setSubmitting(true);
      setError("");

      try {
        const formData = new FormData();
        const generatePassword = (length = 12) => {
          const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
          let password = '';
          for (let i = 0; i < length; i++) {
            password += characters.charAt(Math.floor(Math.random() * characters.length));
          }
          return password;
        };

        const userData = {
          username: values.username,
          email: values.email,
          password: generatePassword(),
          phone_number: values.phoneNumber,
          emergency_contact_number: values.emergencyContactNumber,
          address: values.address,
          city: values.city,
          state: values.state,
          district: values.district,
          country: values.country,
          first_name: values.firstName,
          last_name: values.lastName,
          is_parent: true,
        };

        formData.append("user", JSON.stringify(userData));
        formData.append("occupation", values.occupation);

        if (profile) {
          formData.append("profile_image", profile);
        }

        const response = await api.post("school_admin/parents/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 201) {
          resetForm();
          setProfile(null);
          navigate("/admin/show_parents");
        }
      } catch (error) {
        console.error("Error adding parent:", error);
        setError(
          error.response?.data?.message ||
            "Failed to add parent. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  
  if (submitting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <HashLoader color="#4F46E5" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white border border-gray-200 rounded shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center font-montserrat">
        Add Parent
      </h2>
      <hr />

      {error && (
        <div className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={parentFormik.handleSubmit} className="space-y-6">
        {/* Profile Image Section */}
        <div className="my-5 flex flex-col items-center">
          <img
            className="rounded-full w-40 h-40 border-2 border-black object-cover mb-5"
            src={
              profile
                ? URL.createObjectURL(profile)
                : "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/corporate-user-icon.png"
            }
            alt="Profile Preview"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.currentTarget.files[0];
              setProfile(file);
              parentFormik.setFieldValue("profileImage", file);
            }}
            className="w-full max-w-xs"
          />
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inputs.map(({ name, label, type }) => (
            <div key={name} className="space-y-1">
              <label className="block font-medium text-gray-700">{label}</label>
              {type === "textarea" ? (
                <textarea
                  id={name}
                  name={name}
                  rows="4"
                  value={parentFormik.values[name]}
                  onChange={parentFormik.handleChange}
                  onBlur={parentFormik.handleBlur}
                  className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500"
                />
              ) : type === "radio" ? (
                <div className="flex">
                  <label className="flex items-center mr-4">
                    <input
                      type="radio"
                      id="male"
                      name="gender"
                      value="M"
                      checked={parentFormik.values.gender === "M"}
                      onChange={parentFormik.handleChange}
                      className="mr-2"
                    />
                    Male
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      id="female"
                      name="gender"
                      value="F"
                      checked={parentFormik.values.gender === "F"}
                      onChange={parentFormik.handleChange}
                      className="mr-2"
                    />
                    Female
                  </label>
                </div>
              ) : (
                <input
                  type={type || "text"}
                  id={name}
                  name={name}
                  value={parentFormik.values[name]}
                  onChange={parentFormik.handleChange}
                  onBlur={parentFormik.handleBlur}
                  className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500"
                />
              )}
              {parentFormik.touched[name] && parentFormik.errors[name] && (
                <p className="text-red-500 text-sm">
                  {parentFormik.errors[name]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Student Search and Selection Section
        <div className="space-y-4">
          {renderStudentSearch()}
          
          Student Search Results
          {searchTerm && filteredStudents.length > 0 && (
            <div className="border rounded-md max-h-40 overflow-y-auto">
              {filteredStudents.map((student) => (
                <div
                  key={student.admission_number}
                  className="p-2 hover:bg-gray-100 flex justify-between items-center"
                >
                  <span>
                    {student.user.first_name} {student.user.last_name} (
                    {student.admission_number})
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleStudentSelect(student, 'Father')}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      Add as Father
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStudentSelect(student, 'Mother')}
                      className="px-2 py-1 bg-pink-500 text-white rounded text-sm"
                    >
                      Add as Mother
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStudentSelect(student, 'Guardian')}
                      className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                    >
                      Add as Guardian
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          Selected Students Display
          <div className="space-y-2">
            {studentRelationships.length > 0 ? (
              studentRelationships.map((relationship, index) => {
                const student = students.find(
                  (s) => s.admission_number === relationship.admission_number
                );
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 p-2 bg-gray-50 rounded">
                      <span className="font-medium">
                        {relationship.relationship_type}:
                      </span>{" "}
                      {student?.user?.first_name} {student?.user?.last_name} (
                      {relationship.admission_number})
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStudent(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="flex justify-center items-center p-4 bg-gray-50 rounded">
                No students selected
              </div>
            )}
          </div>
        </div> */}

        {/* Submit Button */}
        <div className="mt-6 text-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-3 bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddParents;