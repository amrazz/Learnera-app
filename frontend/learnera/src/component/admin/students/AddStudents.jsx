import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { initialValues, validationSchema, inputs } from "./constants";
import api from "../../../api";
import { useNavigate } from "react-router-dom";

const AddStudents = () => {
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get("school_admin/list_class/");
        if (response.status === 200) {
          setClasses(response.data);
        } else {
          console.error("Error fetching classes:", response.error);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, []);

  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
    try {
      const response = await api.get(
        `school_admin/list_class/?class_id=${classId}`
      );
      if (response.status === 200) {
        setSections(response.data);
      } else {
        console.error("Error:", response.error);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const studentFormik = useFormik({
    initialValues,
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
        first_name: values.firstName || "",
        last_name: values.lastName || "",
        is_student: true,
      };

      const payload = {
        user: userData,
        parent_name: values.parentName || "",
        parent_email: values.parentEmail || "",
        class_assigned: values.section,
      };

      formData.append("user", JSON.stringify(userData));
      formData.append("parent_name", payload.parent_name);
      formData.append("parent_email", payload.parent_email);
      formData.append("class_assigned", payload.class_assigned);

      if (profile) {
        formData.append("profile_image", profile);
      }

      try {
        const response = await api.post(
          "school_admin/add_students/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("API Response:", response.data);

        if (response.status === 201) {
          const { admission_number, username, password } = response.data;
          console.log("This is the student credentials", response.data);
          
          navigate("/admin_dashboard/student_credentials", {
            state: {
              admissionNumber: admission_number,
              username: username,
              password: password,
            },
          });
          resetForm();
        }
      } catch (error) {
        console.error("Error adding student:", error.response?.data || error);
      }
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white border border-gray-200 rounded shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center font-montserrat">
        Add Student
      </h2>
      <hr />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          studentFormik.handleSubmit(e);
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
              studentFormik.setFieldValue(
                "profileImage",
                event.currentTarget.files[0]
              );
            }}
          />
          {studentFormik.touched.profileImage &&
            studentFormik.errors.profileImage && (
              <p className="text-red-500 text-sm">
                {studentFormik.errors.profileImage}
              </p>
            )}
        </div>

        {/* Dynamic Form Inputs */}
        <div className="grid grid-cols-2 gap-4">
          {inputs.map(({ name, label, type }) => (
            <div key={name}>
              <label className="block font-medium text-gray-700">{label}</label>
              {type === "textarea" ? (
                <textarea
                  id={name}
                  name={name}
                  rows="4"
                  value={studentFormik.values[name]}
                  onChange={studentFormik.handleChange}
                  onBlur={studentFormik.handleBlur}
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
                      checked={studentFormik.values.gender === "M"}
                      onChange={studentFormik.handleChange}
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
                      checked={studentFormik.values.gender === "F"}
                      onChange={studentFormik.handleChange}
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
                  value={studentFormik.values[name]}
                  onChange={studentFormik.handleChange}
                  onBlur={studentFormik.handleBlur}
                  className="border p-2 w-full rounded"
                />
              )}

              {studentFormik.touched[name] && studentFormik.errors[name] && (
                <p className="text-red-500 text-sm">
                  {studentFormik.errors[name]}
                </p>
              )}
            </div>
          ))}
        </div>
        {/* Class Selection */}
        <div className="mb-4">
          <label className="block font-medium text-gray-700">Class</label>
          <select
            name="class"
            className="border p-2 w-full"
            onChange={(e) => {
              const selectedValue = e.target.value;
              handleClassChange(selectedValue);
              studentFormik.handleChange(e);
            }}
            value={studentFormik.values.class}
          >
            <option value="">Select a Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.class_name}
              </option>
            ))}
          </select>
          {studentFormik.touched.class && studentFormik.errors.class && (
            <p className="text-red-500 text-sm">{studentFormik.errors.class}</p>
          )}
        </div>

        {/* Section Selection */}
        <div className="mb-4">
          <label className="block font-medium text-gray-700">Section</label>
          <select
            name="section"
            className="border p-2 w-full"
            onChange={studentFormik.handleChange}
          >
            <option value="">Select a Section</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.section_name}
              </option>
            ))}
          </select>
          {studentFormik.touched.section && studentFormik.errors.section && (
            <p className="text-red-500 text-sm">
              {studentFormik.errors.section}
            </p>
          )}
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

export default AddStudents; 