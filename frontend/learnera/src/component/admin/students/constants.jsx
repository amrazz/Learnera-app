import * as Yup from "yup";
import {  ErrorMessage, Field, Form } from "formik";
import {
  Edit,
  Save,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  UserCircle2,
  UserCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";



export const initialValues = {
  profileImage: null,
  username: "",
  firstName: "",
  lastName: "",
  class: "",
  section: "",
  parentName: "",
  phoneNumber: "",
  city: "",
  state: "",
  parentEmail: "",
  gender: "Male",
  dateOfBirth: "",
  email: "",
  address: "",
  district: "",
  country: "",
  password: "",
  confirmPassword: "",
  emergencyContactNumber: "",
};

export const validationSchema = Yup.object({
  username: Yup.string()
      .trim()
      .matches(/^(?!\s{2,})/, "Username cannot start with two spaces")
      .required("Username is required"),
  email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
  password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/\d/, "Password must contain at least one number")
      .matches(/[@$!%*?&#]/, "Password must contain at least one special character")
      .required("Password is required"),
  firstName: Yup.string()
      .trim()
      .matches(/^(?!\s{2,})/, "First name cannot start with two spaces")
      .matches(/^[a-zA-Z]+$/, "First name can only contain letters")
      .required("First name is required"),
  lastName: Yup.string()
      .trim()
      .matches(/^(?!\s{2,})/, "Last name cannot start with two spaces")
      .matches(/^[a-zA-Z]+$/, "Last name can only contain letters")
      .required("Last name is required"),
  phoneNumber: Yup.string()
      .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
      .required("Phone number is required"),
  emergencyContactNumber: Yup.string()
      .matches(/^\d{10}$/, "Emergency contact number must be exactly 10 digits")
      .nullable(),
      dateOfBirth: Yup.date()
      .required("Date of birth is required")
      .test(
          "is-10-years-old",
          "You must be at least 10 years old",
          (value) => {
              const today = new Date();
              const birthDate = new Date(value);
              const age = today.getFullYear() - birthDate.getFullYear();
              const monthDifference = today.getMonth() - birthDate.getMonth();
              const dayDifference = today.getDate() - birthDate.getDate();

              return (
                  age > 10 ||
                  (age === 10 && (monthDifference > 0 || (monthDifference === 0 && dayDifference >= 0)))
              );
          }
      ),
  gender: Yup.string()
      .required("Gender is required"),
  address: Yup.string()
      .trim()
      .matches(/^(?!\s{2,})/, "Address cannot start with two spaces")
      .required("Address is required"),
  city: Yup.string()
      .trim()
      .matches(/^(?!\s{2,})/, "City cannot start with two spaces")
      .required("City is required"),
  state: Yup.string()
      .trim()
      .matches(/^(?!\s{2,})/, "State cannot start with two spaces")
      .required("State is required"),
  district: Yup.string()
      .trim()
      .matches(/^(?!\s{2,})/, "District cannot start with two spaces")
      .required("District is required"),
  country: Yup.string()
      .trim()
      .matches(/^(?!\s{2,})/, "Country cannot start with two spaces")
      .required("Country is required"),
      profileImage: Yup.mixed()
      .required("Profile image is required")
      .test(
          "fileType",
          "Only JPEG, PNG, or JPG files are allowed",
          (value) => {
              if (!value) return false;
              const fileType = ["image/jpeg", "image/png", "image/jpg"];
              return fileType.includes(value.type);
          }
      )
      .test(
          "fileSize",
          "File size must be less than 2MB",
          (value) => {
              if (!value) return false; 
              const maxSize = 2 * 1024 * 1024; 
              return value.size <= maxSize;
          }
      ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

export const inputs = [
  { name: "username", label: "Username" },
  { name: "firstName", label: "First Name" },
  { name: "lastName", label: "Last Name" },
  { name: "email", label: "Email" },
  { name: "phoneNumber", label: "Phone Number" },
  { name: "password", label: "Password", type: "password" },
  { name: "confirmPassword", label: "Confirm Password", type: "password" },
  { name: "gender", label: "Gender", type: "radio" },
  { name: "dateOfBirth", label: "Date of Birth", type: "date" },
  { name: "parentName", label: "Parent Name" },
  { name: "parentEmail", label: "Parent Email" },
  { name: "address", label: "Address", type : "textarea" },
  { name: "city", label: "City" },
  { name: "district", label: "District" },
  { name: "state", label: "State" },
  { name: "country", label: "Country" },
  {
    name: "emergencyContactNumber",
    label: "Emergency Contact Number (optional)",
  },
];


export const EditForm = ({ isSubmitting, errors, touched,  }) => {
  const { studentId } = useParams()
  const navigate = useNavigate()

  return (
  <Form className="p-6 space-y-6">

      {/* Personal Information Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
          <User className="mr-2 h-5 w-5 text-blue-500" />
          Personal Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <Field
              type="text"
              name="first_name"
              className={`mt-1 block w-full border rounded-md p-2 ${
                touched.first_name && errors.first_name ? "border-red-500" : "border-gray-300"
              }`}
            />
            <ErrorMessage name="first_name" component="div" className="text-red-500 text-sm mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <Field
              type="text"
              name="last_name"
              className={`mt-1 block w-full border rounded-md p-2 ${
                touched.last_name && errors.last_name ? "border-red-500" : "border-gray-300"
              }`}
            />
            <ErrorMessage name="last_name" component="div" className="text-red-500 text-sm mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Field
              type="email"
              name="email"
              className={`mt-1 block w-full border rounded-md p-2 ${
                touched.email && errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <Field
              type="tel"
              name="phone_number"
              className={`mt-1 block w-full border rounded-md p-2 ${
                touched.phone_number && errors.phone_number ? "border-red-500" : "border-gray-300"
              }`}
            />
            <ErrorMessage name="phone_number" component="div" className="text-red-500 text-sm mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <Field
              type="text"
              name="address"
              className="mt-1 block w-full border rounded-md p-2 border-gray-300"
            />
            <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <Field
              type="text"
              name="city"
              className="mt-1 block w-full border rounded-md p-2 border-gray-300"
            />
            <ErrorMessage name="city" component="div" className="text-red-500 text-sm mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <Field
              type="text"
              name="state"
              className="mt-1 block w-full border rounded-md p-2 border-gray-300"
            />
            <ErrorMessage name="state" component="div" className="text-red-500 text-sm mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <Field
              type="text"
              name="country"
              className="mt-1 block w-full border rounded-md p-2 border-gray-300"
            />
            <ErrorMessage name="country" component="div" className="text-red-500 text-sm mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <Field
              type="date"
              name="date_of_birth"
              className="mt-1 block w-full border rounded-md p-2 border-gray-300"
            />
            <ErrorMessage name="date_of_birth" component="div" className="text-red-500 text-sm mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <Field
              as="select"
              name="gender"
              className="mt-1 block w-full border rounded-md p-2 border-gray-300"
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </Field>
            <ErrorMessage name="gender" component="div" className="text-red-500 text-sm mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Emergency Contact Number</label>
            <Field
              type="tel"
              name="emergency_contact_number"
              className="mt-1 block w-full border rounded-md p-2 border-gray-300"
            />
            <ErrorMessage
              name="emergency_contact_number"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>
        </div>
      </div>

      {/* Student Details Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
          <UserCheck className="mr-2 h-5 w-5 text-green-500" />
          Student Details
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Admission Number</label>
            <Field
              type="text"
              name="admission_number"
              className={`mt-1 block w-full border rounded-md p-2 ${
                touched.admission_number && errors.admission_number ? "border-red-500" : "border-gray-300"
              }`}
            />
            <ErrorMessage
              name="admission_number"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Roll Number</label>
            <Field
              type="text"
              name="roll_number"
              className={`mt-1 block w-full border rounded-md p-2 ${
                touched.roll_number && errors.roll_number ? "border-red-500" : "border-gray-300"
              }`}
            />
            <ErrorMessage name="roll_number" component="div" className="text-red-500 text-sm mt-1" />
          </div>
        </div>
      </div>

      {/* Parent Details Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
          <UserCircle2 className="mr-2 h-5 w-5 text-purple-500" />
          Parent Details
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Parent Name</label>
            <Field
              type="text"
              name="parent_name"
              className={`mt-1 block w-full border rounded-md p-2 ${
                touched.parent_name && errors.parent_name ? "border-red-500" : "border-gray-300"
              }`}
            />
            <ErrorMessage name="parent_name" component="div" className="text-red-500 text-sm mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Parent Email</label>
            <Field
              type="email"
              name="parent_email"
              className={`mt-1 block w-full border rounded-md p-2 ${
                touched.parent_email && errors.parent_email ? "border-red-500" : "border-gray-300"
              }`}
            />
            <ErrorMessage name="parent_email" component="div" className="text-red-500 text-sm mt-1" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => navigate(`/admin_dashboard/student_info/${studentId}`)}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-300 transition"
        >
          <X className="mr-2 h-5 w-5" /> Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Save className="mr-2 h-5 w-5" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>

    </Form>
  )
}