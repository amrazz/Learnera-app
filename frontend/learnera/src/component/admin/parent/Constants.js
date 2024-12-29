import * as Yup from 'yup';

const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  occupation: Yup.string().required("Occupation is required"),
  phoneNumber: Yup.string()
    .matches(/^(99|62|9)[0-9]{8}$/, "Phone number must start with 99, 62, or 9 and be exactly 10 digits")
    .required("Phone number is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  district: Yup.string().required("District is required"),
  country: Yup.string().required("Country is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one symbol")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
  emergencyContactNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Emergency contact number must be exactly 10 digits")
    .notOneOf([Yup.ref("phoneNumber"), null], "Phone number and emergency contact cannot be the same")
});

const initialValues = {
  profileImage: null,
  username: "",
  firstName: "",
  lastName: "",
  occupation: "",
  phoneNumber: "",
  email: "",
  address: "",
  city: "",
  state: "",
  district: "",
  country: "",
  password: "",
  confirmPassword: "",
  emergencyContactNumber: ""
};

const inputs = [
  { name: "username", label: "Username" },
  { name: "firstName", label: "First Name" },
  { name: "lastName", label: "Last Name" },
  { name: "email", label: "Email", type: "email" },
  { name: "occupation", label: "Occupation" },
  { name: "phoneNumber", label: "Phone Number", type: "tel" },
  { name: "password", label: "Password", type: "password" },
  { name: "confirmPassword", label: "Confirm Password", type: "password" },
  { name: "dateOfBirth", label: "Date Of Birth", type : 'date'},
  { name: "gender", label: "Gender", type : 'radio'},
  { name: "address", label: "Address", type: "textarea" },
  { name: "city", label: "City" },
  { name: "district", label: "District" },
  { name: "state", label: "State" },
  { name: "country", label: "Country" },
  { name: "emergencyContactNumber", label: "Emergency Contact Number" },
];

export {inputs, validationSchema, initialValues }





export const ParentEditSchema = Yup.object().shape({
  first_name: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  last_name: Yup.string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  occupation: Yup.string()
    .required("Occupation is required"),
  phone_number: Yup.string()
    .matches(/^(99|62|9)[0-9]{8}$/, "Phone number must start with 99, 62, or 9 and be exactly 10 digits")
    .required("Phone number is required"),
  address: Yup.string()
    .required("Address is required"),
  city: Yup.string()
    .required("City is required"),
  state: Yup.string()
    .required("State is required"),
  district: Yup.string()
    .required("District is required"),
  country: Yup.string()
    .required("Country is required"),
  emergency_contact_number: Yup.string()
    .matches(/^[0-9]{10}$/, "Emergency contact number must be exactly 10 digits")
    .notOneOf([Yup.ref("phone_number"), null], "Phone number and emergency contact cannot be the same"),
  date_of_birth: Yup.date()
    .max(new Date(), "Date of birth cannot be in the future")
    .required("Date of birth is required"),
  gender: Yup.string()
    .oneOf(['M', 'F'], "Please select a valid gender")
    .required("Gender is required")
});

export const parentFormFields = [
  {
    section: "Personal Information",
    fields: [
      { name: "first_name", label: "First Name", type: "text" },
      { name: "last_name", label: "Last Name", type: "text" },
      { name: "username", label: "Username", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone_number", label: "Phone Number", type: "tel" },
      { name: "occupation", label: "Occupation", type: "text" },
      { name: "date_of_birth", label: "Date of Birth", type: "date" },
      { 
        name: "gender", 
        label: "Gender", 
        type: "radio",
        options: [
          { value: "M", label: "Male" },
          { value: "F", label: "Female" }
        ]
      }
    ]
  },
  {
    section: "Contact Information",
    fields: [
      { name: "address", label: "Address", type: "textarea" },
      { name: "district", label: "District", type: "text" },
      { name: "city", label: "City", type: "text" },
      { name: "state", label: "State", type: "text" },
      { name: "country", label: "Country", type: "text" },
      { name: "emergency_contact_number", label: "Emergency Contact Number", type: "tel" }
    ]
  }
];



// -----------------------------------------------------


