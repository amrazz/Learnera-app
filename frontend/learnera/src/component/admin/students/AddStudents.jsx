import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { initialValues, validationSchema, inputs } from "./constants";
import api from "../../../api";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure CSS is imported
import { HashLoader } from "react-spinners";
import { User } from "lucide-react";

const AddStudents = () => {
  const [profile, setProfile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [parentSearchTerm, setParentSearchTerm] = useState("");
  const [parents, setParents] = useState([]);
  const [filteredParents, setFilteredParents] = useState([]);
  const [selectedParentRelationship, setSelectedParentRelationship] = useState([]);

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

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const response = await api.get("school_admin/parents/?paginate=false");
        if (response.status === 200) {
          setParents(response.data);
        } else {
          toast.error("Error fetching parents");
        }
      } catch (error) {
        toast.error("Error fetching parents");
        console.error("Error fetching parents:", error);
      }
    };
    fetchParents();
  }, []);

  const handleParentSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredParents([]);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = parents.filter((parent) => {
      const firstName = parent.user.first_name.toLowerCase();
      const lastName = parent.user.last_name.toLowerCase();
      const email = parent.user.email.toLowerCase();

      return (
        firstName.includes(searchTermLower) ||
        lastName.includes(searchTermLower) ||
        email.includes(searchTermLower)
      );
    });

    setFilteredParents(filtered);
  };

  const handleParentSelect = (parent, relationshipType) => {
    if (selectedParentRelationship.length === 1) {
      toast.error("Only one parent can be linked to a student. Please remove the existing parent before adding a new one.");
      return; 
    }
    const exists = selectedParentRelationship.some(
      (rel) =>
        rel.parent_id === parent.id && rel.relationship_type === relationshipType
    );
    if (!exists) {
      setSelectedParentRelationship([
        ...selectedParentRelationship,
        {
          parent_id: parent.id,
          relationship_type: relationshipType,
          first_name: parent.user.first_name,
          last_name: parent.user.last_name,
          email: parent.user.email,
        },
      ]);
      toast.success(`Added ${parent.user.first_name} as ${relationshipType}`);
    } else {
      toast.warning("This parent-relationship combination already exists");
    }
    setParentSearchTerm("");
    setFilteredParents([]);
  };

  const handleRemoveParent = (index) => {
    const newRelationships = [...selectedParentRelationship];
    const removedParent = newRelationships[index];
    newRelationships.splice(index, 1);
    setSelectedParentRelationship(newRelationships);
    toast.info(`Removed ${removedParent.first_name} as ${removedParent.relationship_type}`);
  };

  const renderParentSearch = () => {
    return (
      <div className="space-y-4 mt-4">
        <label className="block font-medium text-gray-700">Search Parents</label>
        <input
          type="text"
          placeholder="Search parents by name or email"
          value={parentSearchTerm}
          onChange={(e) => {
            setParentSearchTerm(e.target.value);
            handleParentSearch(e.target.value);
          }}
          className="w-full p-2 border rounded-md"
        />

        {/* Parent Search Results */}
        {parentSearchTerm && filteredParents.length > 0 && (
          <div className="border rounded-md max-h-40 overflow-y-auto">
            {filteredParents.map((parent) => (
              <div
                key={parent.id}
                className="p-2 hover:bg-gray-100 flex justify-between items-center"
              >
                <span>
                  {parent.user.first_name} {parent.user.last_name} ({parent.user.email})
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleParentSelect(parent, "Father")}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Add as Father
                  </button>
                  <button
                    type="button"
                    onClick={() => handleParentSelect(parent, "Mother")}
                    className="px-2 py-1 bg-pink-500 text-white rounded text-sm hover:bg-pink-600"
                  >
                    Add as Mother
                  </button>
                  <button
                    type="button"
                    onClick={() => handleParentSelect(parent, "Guardian")}
                    className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    Add as Guardian
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Parents Display */}
        <div className="space-y-2">
          <label className="block font-medium text-gray-700">Selected Parents</label>
          {selectedParentRelationship.length > 0 ? (
            selectedParentRelationship.map((relationship, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-gray-50 rounded">
                  <span className="font-medium">{relationship.relationship_type}: </span>
                  {relationship.first_name} {relationship.last_name} ({relationship.email})
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveParent(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center p-4 bg-gray-50 rounded">
              No parents selected
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
    try {
      const response = await api.get(`school_admin/list_class/?class_id=${classId}`);
      if (response.status === 200) {
        setSections(response.data);
      } else {
        console.error("Error:", response.error);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const flattenErrors = (errors) => {
    let flattenedErrors = [];
  
    const flatten = (obj, path = "") => {
      for (const key in obj) {
        if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
          flatten(obj[key], path ? `${path}.${key}` : key);
        } else {
          flattenedErrors.push(`${path ? `${path}.` : ""}${key}: ${obj[key].join(" ")}`);
        }
      }
    };
  
    flatten(errors);
    return flattenedErrors;
  };

  const studentFormik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      const generatePassword = (length = 12) => {
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
        let password = "";
        for (let i = 0; i < length; i++) {
          password += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return password;
      };

      const formData = new FormData();

      const userData = {
        username: values.username,
        email: values.email,
        password: generatePassword(),
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

      formData.append("user", JSON.stringify(userData));
      formData.append("class_assigned", values.section);

      if (profile) {
        formData.append("profile_image", profile);
      }

      if (selectedParentRelationship.length > 0) {
        formData.append("parent_relationships", JSON.stringify(selectedParentRelationship));
      }

      try {
        const response = await api.post("school_admin/add_students/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.status === 201) {
            toast.success("Student added successfully");
            resetForm();
            setSelectedParentRelationship([]);
            setProfile(null);
            navigate("/admin/show_students");
        }
    } catch (error) {
        console.log("Error response:", error.response);
        
        if (error.response?.data) {
            const errorData = error.response.data;
            
            // Handle string error
            if (typeof errorData === 'string') {
                toast.error(errorData);
                return;
            }
            
            // Handle error message
            if (errorData.error) {
                toast.error(errorData.error);
                return;
            }
            
            // Handle error message
            if (errorData.message) {
                toast.error(errorData.message);
                return;
            }
            
            // Handle object errors
            if (typeof errorData === 'object') {
                Object.entries(errorData).forEach(([key, value]) => {
                    if (typeof value === 'string') {
                        toast.error(`${key}: ${value}`);
                    } else if (Array.isArray(value)) {
                        toast.error(`${key}: ${value.join(' ')}`);
                    } else if (typeof value === 'object') {
                        Object.entries(value).forEach(([subKey, subValue]) => {
                            if (Array.isArray(subValue)) {
                                toast.error(`${key}.${subKey}: ${subValue.join(' ')}`);
                            } else {
                                toast.error(`${key}.${subKey}: ${subValue}`);
                            }
                        });
                    }
                });
                return;
            }
        }
        // Fallback error
        toast.error("An error occurred while adding the student. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
},
});

// Update ToastContainer configuration
<ToastContainer
position="top-right"
autoClose={5000}
hideProgressBar={false}
newestOnTop
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
/>
  if (isSubmitting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <HashLoader color="#4F46E5" speedMultiplier={2} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white border border-gray-200 rounded shadow-lg">
      <ToastContainer />
      <h2 className="text-3xl font-bold mb-6 text-center font-montserrat">Add Student</h2>
      <hr />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          studentFormik.handleSubmit(e);
        }}
        encType="multipart/form-data"
      >
       <div className="my-5">
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
</div>
        <div className="mb-4">
          <label className="block font-medium text-gray-700">Profile Image</label>
          <input
            type="file"
            name="profileImage"
            className="mt-2"
            onChange={(event) => {
              setProfile(event.currentTarget.files[0]);
              studentFormik.setFieldValue("profileImage", event.currentTarget.files[0]);
            }}
          />
          {studentFormik.touched.profileImage && studentFormik.errors.profileImage && (
            <p className="text-red-500 text-sm">{studentFormik.errors.profileImage}</p>
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
                <p className="text-red-500 text-sm">{studentFormik.errors[name]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Class and Section Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
              <p className="text-red-500 text-sm">{studentFormik.errors.section}</p>
            )}
          </div>
        </div>

        {/* Parent Search and Selection */}
        {renderParentSearch()}

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