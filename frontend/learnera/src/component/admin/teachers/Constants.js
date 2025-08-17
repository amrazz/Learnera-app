import * as Yup from 'yup';

const validationSchema = Yup.object({
  username: Yup.string()
    .trim()
    .matches(/^(?!\s{2,})/, "Username cannot start with two spaces")
    .matches(/^(?!_{2,3})/, "First name cannot start with underscores")
    .required("Username is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  firstName: Yup.string()
    .trim()
    .matches(/^(?!\s{2,})/, "First name cannot start with two spaces")
    .matches(/^(?!_{2,3})/, "First name cannot start with underscores")
    .matches(/^[a-zA-Z]+$/, "First name can only contain letters")
    .required("First name is required"),
  lastName: Yup.string()
    .trim()
    .matches(/^(?!\s{2,})/, "Last name cannot start with two spaces")
    .matches(/^[a-zA-Z]+$/, "Last name can only contain letters")
    .matches(/^(?!_{2,3})/, "First name cannot start with underscores")
    .required("Last name is required"),
  phoneNumber: Yup.string()
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
  emergencyContactNumber: Yup.string()
    .matches(/^\d{10}$/, "Emergency contact number must be exactly 10 digits")
    .nullable(),
  dateOfBirth: Yup.date()
    .required("Date of birth is required")
    .max(new Date(), "Date of birth cannot be in the future.")
    .test("min-age", "Parent must be at least 18 years old", (value) => {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age >= 18;
    }),
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
  documents: Yup.array().of(
    Yup.mixed()
      .test(
        "fileType",
        "Only PDF files are allowed",
        (value) => {
          if (!value) return true;
          return value.type === "application/pdf";
        }
      )
      .test(
        "fileSize",
        "File size must be less than 5MB",
        (value) => {
          if (!value) return true;
          return value.size <= 5 * 1024 * 1024;
        }
      )
  ),
  documentTitles: Yup.array().of(
    Yup.string().required("Document title is required")
  ),
  subject: Yup.string().test(
    "subject-or-new-subject",
    "Either select a subject or enter a new subject name",
    function (value) {
      const { newSubjectName } = this.parent;
      if (!value && !newSubjectName) {
        return this.createError({
          message: "Either select a subject or enter a new subject name",
        });
      }
      return true;
    }
  ),
  newSubjectName: Yup.string().test(
    "subject-or-new-subject",
    "Either select a subject or enter a new subject name",
    function (value) {
      const { subject } = this.parent;
      if (!subject && !value) {
        return this.createError({
          message: "Either select a subject or enter a new subject name",
        });
      }
      return true;
    }
  ),
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
  classes: [],
  documents: [],
  docuementTitles: [],
};

const inputs = [
  { name: "username", label: "Username", type: "text" },
  { name: "email", label: "Email", type: "email" },
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
];


export { initialValues, validationSchema, inputs }



















// --------------------------------------------



const TeacherEditSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone_number: Yup.string().required("Phone number is required"),
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  district: Yup.string().required("District is required"),
  country: Yup.string().required("Country is required"),
  date_of_birth: Yup.string().required("Date of birth is required"),
  gender: Yup.string().required("Gender is required"),
  documents: Yup.array().of(
    Yup.mixed()
      .test(
        "fileType",
        "Only PDF files are allowed",
        (value) => {
          if (!value) return true;
          return value.type === "application/pdf";
        }
      )
      .test(
        "fileSize",
        "File size must be less than 5MB",
        (value) => {
          if (!value) return true;
          return value.size <= 5 * 1024 * 1024;
        }
      )
  ),
  documentTitles: Yup.array().of(
    Yup.string().required("Document title is required")
  ),
  subject: Yup.string().required("Subject is required")

});

const teacherFormFields = [
  {
    section: "Basic Information",
    fields: [
      { name: "username", label: "Username", type: "text" },
      { name: "first_name", label: "First Name", type: "text" },
      { name: "last_name", label: "Last Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone_number", label: "Phone Number", type: "text" },
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
  {
    section: "Subject Information",
    fields: [
      { name: "subject", label: "Subject", type: "select", options: [] },
    ],
  },
  {
    section: "Qualification Documents",
    fields: [],
  },
];

export { TeacherEditSchema, teacherFormFields };