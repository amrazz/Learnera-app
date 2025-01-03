import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import { validationSchema, inputs, initialValues } from "./Constants";
import { useFormik } from "formik";
import { toast } from "react-toastify";

const AddTeachers = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const teacherFormik = useFormik({
    initialValues: {
      ...initialValues,
      sections: [],
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();

      const userData = {
        username: values.username,
        email: values.email,
        password: values.password,
        phone_number: values.phoneNumber,
        emergency_contact_number: values.emergencyContactNumber,
        gender: values.gender,
        date_of_birth: values.dateOfBirth,
        address: values.address,
        city: values.city,
        state: values.state,
        district: values.district,
        country: values.country,
        first_name: values.firstName,
        last_name: values.lastName,
        is_teacher: true,
      };

      const payload = {
        user: userData,
        qualifications: values.qualifications,
      };

      formData.append("user", JSON.stringify(userData));
      formData.append("qualifications", payload.qualifications);

      if (profile) {
        formData.append("profile_image", profile);
      }

      try {
        const response = await api.post("school_admin/teachers/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 201) {
          toast.success("Teacher Created successfully");
          setTimeout(() => {
            navigate("/admin_dashboard/teacher_credentials", {
              state: {
                username: username,
                password: password,
              },
            });
          }, 2000);
          resetForm();
        }
      } catch (error) {
        console.error("Error adding teacher:", error.response?.data || error);
        toast.error("Failed to create teacher");
      }
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white border border-gray-200 rounded shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center font-montserrat">
        Add Teacher
      </h2>
      <hr />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          teacherFormik.handleSubmit(e);
        }}
        encType="multipart/form-data"
      >
        <div className="my-5">
          <img
            className="rounded-full w-40 h-40 border-2 border-black object-cover"
            src={
              profile
                ? URL.createObjectURL(profile)
                : "https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D"
            }
            alt="Profile Preview"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-700">
            Profile Image
          </label>
          <input
            type="file"
            name="profileImage"
            className="mt-2"
            onChange={(event) => {
              setProfile(event.currentTarget.files[0]);
              teacherFormik.setFieldValue(
                "profileImage",
                event.currentTarget.files[0]
              );
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {inputs.map(({ name, label, type }) => (
            <div key={name}>
              <label className="block font-medium text-gray-700">{label}</label>
              {type === "textarea" ? (
                <textarea
                  id={name}
                  name={name}
                  rows="4"
                  value={teacherFormik.values[name]}
                  onChange={teacherFormik.handleChange}
                  onBlur={teacherFormik.handleBlur}
                  className="border p-2 w-full rounded"
                />
              ) : type === "radio" ? (
                <div className="flex">
                  <label className="flex items-center mr-4">
                    <input
                      type="radio"
                      id="male"
                      name="gender"
                      value="M"
                      checked={teacherFormik.values.gender === "M"}
                      onChange={teacherFormik.handleChange}
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
                      checked={teacherFormik.values.gender === "F"}
                      onChange={teacherFormik.handleChange}
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
                  value={teacherFormik.values[name]}
                  onChange={teacherFormik.handleChange}
                  onBlur={teacherFormik.handleBlur}
                  className="border p-2 w-full rounded"
                />
              )}
              {teacherFormik.touched[name] && teacherFormik.errors[name] && (
                <p className="text-red-500 text-sm">
                  {teacherFormik.errors[name]}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-end">
          <button
            type="submit"
            className="m-3 px-5 bg-gradient-to-b from-[#0D2E76] to-[#1842DC] text-white p-3 rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTeachers;
