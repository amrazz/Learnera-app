import * as Yup from 'yup';

const validationSchema = Yup.object({
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
  qualifications: Yup.string()
      .trim()
      .matches(/^(?!\s{2,})/, "Qualifications cannot start with two spaces")
      .required("Qualifications are required"),
});

const initialValues = {
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    emergencyContactNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    district: "",
    country: "",
    qualifications: "",
    classes: [],
    subjects: []
  };
  
  const inputs = [
    { name: "username", label: "Username", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "password", label: "Password", type: "password" },
    { name: "confirmPassword", label: "Confirm Password", type: "password" },
    { name: "firstName", label: "First Name", type: "text" },
    { name: "lastName", label: "Last Name", type: "text" },
    { name: "phoneNumber", label: "Phone Number", type: "tel" },
    { name: "emergencyContactNumber", label: "Emergency Contact", type: "tel" },
    { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    { name: "gender", label: "Gender", type: "radio" },
    { name: "address", label: "Address", type: "textarea" },
    { name: "city", label: "City", type: "text" },
    { name: "state", label: "State", type: "text" },
    { name: "district", label: "District", type: "text" },
    { name: "country", label: "Country", type: "text" },
    { name: "qualifications", label: "Qualifications", type: "textarea" },
  ];


export { initialValues, validationSchema, inputs }



















// --------------------------------------------


const TeacherEditSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone_number: Yup.string().required("Phone number is required"),
  qualifications: Yup.string().required("Qualifications are required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  district: Yup.string().required("District is required"),
  country: Yup.string().required("Country is required"),
  date_of_birth: Yup.string().required("Date of birth is required"),
  gender: Yup.string().required("Gender is required"),
});

// Form fields configuratione
const teacherFormFields = [
  {
    section: "Basic Information",
    fields: [
      { name: "username", label: "Username", type: "text" },
      { name: "first_name", label: "First Name", type: "text" },
      { name: "last_name", label: "Last Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone_number", label: "Phone Number", type: "text" },
      { name: "qualifications", label: "Qualifications", type: "textarea" },
    ],
  },
  {
    section: "Personal Information",
    fields: [
      { name: "date_of_birth", label: "Date of Birth", type: "date" },
      {
        name: "gender",
        label: "Gender",
        type: "radio",
        options: [
          { value: "M", label: "Male" },
          { value: "F", label: "Female" },
          { value: "O", label: "Other" },
        ],
      },
      { name: "emergency_contact_number", label: "Emergency Contact", type: "text" },
    ],
  },
  {
    section: "Address Information",
    fields: [
      { name: "address", label: "Address", type: "textarea" },
      { name: "city", label: "City", type: "text" },
      { name: "state", label: "State", type: "text" },
      { name: "district", label: "District", type: "text" },
      { name: "country", label: "Country", type: "text" },
    ],
  },
];

export {TeacherEditSchema, teacherFormFields, }