import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import api from "../../../api";
import { validationSchema, initialValues, inputs } from "./Constants";
import { HashLoader } from "react-spinners";
import { User } from "lucide-react";

const ErrorAlert = ({ messages, onClose }) => (
  <div
    className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
    role="alert"
  >
    <strong className="font-bold">Error!</strong>
    <ul className="list-disc pl-5">
      {messages.map((msg, idx) => (
        <li key={idx}>{msg}</li>
      ))}
    </ul>
    <button
      onClick={onClose}
      className="absolute top-0 right-0 px-2 py-1 text-red-700 hover:text-red-900"
    >
      &times;
    </button>
  </div>
);

const AddParents = () => {
  const [profile, setProfile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const navigate = useNavigate();

  const flattenErrors = (errorData) => {
    let messages = [];
    if (typeof errorData === "string") {
      messages.push(errorData);
    } else if (Array.isArray(errorData)) {
      errorData.forEach((item) => {
        messages = messages.concat(flattenErrors(item));
      });
    } else if (typeof errorData === "object" && errorData !== null) {
      Object.values(errorData).forEach((value) => {
        messages = messages.concat(flattenErrors(value));
      });
    }
    return messages;
  };

  const parentFormik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setSubmitting(true);
      // Clear any previous error messages
      setErrorMessages([]);
      
      try {
        const formData = new FormData();
        const generatePassword = (length = 12) => {
          const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
          let password = "";
          for (let i = 0; i < length; i++) {
            password += characters.charAt(
              Math.floor(Math.random() * characters.length)
            );
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
          date_of_birth: values.dateOfBirth,
          gender: values.gender,
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
        console.error("Error adding parent:", error.response?.data);
        const errorData = error?.response?.data;

        if (errorData) {
          const flattened = flattenErrors(errorData);
          if (flattened.length > 0) {
            setErrorMessages(flattened);
          } else {
            setErrorMessages(["An error occurred while adding the parent."]);
          }
        } else {
          setErrorMessages(["An error occurred while adding the parent."]);
        }
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
      {errorMessages.length > 0 && (
        <ErrorAlert messages={errorMessages} onClose={() => setErrorMessages([])} />
      )}
      <h2 className="text-3xl font-bold mb-6 text-center font-montserrat">
        Add Parent
      </h2>
      <hr />

      <form onSubmit={parentFormik.handleSubmit} className="space-y-6">
        <div className="my-5 flex flex-col items-center">
        {profile ? (
            <img
              className="rounded-full w-40 h-40 border-2 border-black object-contain p-1"
              src={URL.createObjectURL(profile)}
              alt="Profile Preview"
            />
          ) : (
            <div className="rounded-full w-40 h-40 border-2 border-black flex items-center justify-center bg-gray-100">
              <User className="w-32 h-32 text-gray-600 " />
            </div>
          )}
          <div className="md:ml-16 md:mt-4">
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
          {parentFormik.touched.profileImage && parentFormik.errors.profileImage && (
            <p className="text-red-500 text-sm">{parentFormik.errors.profileImage}</p>
          )}
        </div>

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