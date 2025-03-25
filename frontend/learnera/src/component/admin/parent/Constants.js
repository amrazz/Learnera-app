import * as Yup from 'yup';

const validationSchema = Yup.object({
  username: Yup.string()
    .trim()
    .matches(/^(?!\s{2,})/, "Username cannot start with two spaces")
    .required("Username is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
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
    .test("fileType", "Only JPEG, PNG, or JPG files are allowed", (value) => {
      if (!value) return false;
      const fileType = ["image/jpeg", "image/png", "image/jpg"];
      return fileType.includes(value.type);
    })
    .test("fileSize", "File size must be less than 2MB", (value) => {
      if (!value) return false;
      const maxSize = 2 * 1024 * 1024;
      return value.size <= maxSize;
    }),

});

const initialValues = {
  profileImage: null,
  username: "",
  firstName: "",
  lastName: "",
  occupation: "",
  phoneNumber: "",
  email: "",
  dateOfBirth: "",
  gender: "", 
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
  { name: "dateOfBirth", label: "Date Of Birth", type: 'date' },
  { name: "gender", label: "Gender", type: 'radio' },
  { name: "address", label: "Address", type: "textarea" },
  { name: "city", label: "City" },
  { name: "district", label: "District" },
  { name: "state", label: "State" },
  { name: "country", label: "Country" },
  { name: "emergencyContactNumber", label: "Emergency Contact Number" },
];

export { inputs, validationSchema, initialValues }





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


