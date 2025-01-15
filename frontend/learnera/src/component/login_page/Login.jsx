import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { login_image } from "../../assets/landing_page";
import { login, schooladmin_login } from "../../redux/features/auth/actions";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { PropagateLoader } from "react-spinners";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  password: Yup.string().required("Password is required"),
  // .min(6, "Password must be at least 6 characters"),
  role: Yup.string().required("Role is required"),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { status, error, Role, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();
  const selectedRole = location.state?.selectedRole || 'student';

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === '/login') {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
    }
}, []);

useEffect(() => {

  if (error) {
    toast.error(error)
  }
  if (isAuthenticated && Role) {
    const routes = {
      is_student: "/students",
      is_teacher: "/teachers",
      is_parent: "/parents",
      school_admin: "/admin",
    };

        const targetRoute = routes[Role];
        if (targetRoute) {
            navigate(targetRoute);
        }
    }
}, [isAuthenticated, Role, navigate]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const roleMapping = {
        student: "is_student",
        teacher: "is_teacher",
        parent: "is_parent",
        school_admin: "school_admin",
      };

      const credentials = {
        username: values.username,
        password: values.password,
        role: roleMapping[values.role] || values.role,
      };

      const action = values.role === "school_admin" ? schooladmin_login : login;

      await dispatch(action(credentials)).unwrap();
      toast.success("Login successful!");

      setTimeout(() => {
        const routes = {
          is_student : "/students",
          is_teacher: "/teachers",
          is_parent: "/parents",
          school_admin: "/admin",
        }
          const targetRoute = routes[credentials.role];
          if (targetRoute) {
            navigate(targetRoute);
          }
          }, 2000)


    } catch (error) {
      toast.error(error || "Invalid Credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-4 w-full h-screen">
      <ToastContainer />
      <div className="bg-white w-full max-w-5xl h-[90vh] max-h-[900px] rounded-2xl flex flex-col md:flex-row shadow-2xl">
        <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-center md:text-left mb-2 text-gray-800">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-center md:text-left mb-6">
                Sign in to access your dashboard
              </p>
            </div>

            <Formik
              initialValues={{
                username: "",
                password: "",
                role: "student",
              }}
              validationSchema={LoginSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-4 m-5">
                  <div>
                    <label
                      htmlFor="role"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Select Role
                    </label>
                    <Field
                      as="select"
                      name="role"
                      className={`w-full px-4 py-2 border rounded-lg transition duration-300 ${
                        touched.role && errors.role
                          ? "border-red-500 ring-2 ring-red-200"
                          : "border-gray-300 hover:border-blue-500"
                      }`}
                    >
                      <option value="student">Student</option>c
                      <option value="teacher">Teacher</option>
                      <option value="school_admin">School Admin</option>
                      <option value="parent">Parent</option>
                    </Field>
                    <ErrorMessage
                      name="role"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="username"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Username
                    </label>
                    <Field
                      type="text"
                      name="username"
                      className={`w-full px-4 py-2 border rounded-lg transition duration-300 ${
                        touched.username && errors.username
                          ? "border-red-500 ring-2 ring-red-200"
                          : "border-gray-300 hover:border-blue-500"
                      }`}
                      placeholder="Enter your username"
                    />
                    <ErrorMessage
                      name="username"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className={`w-full px-4 py-2 border rounded-lg pr-10 transition duration-300 ${
                          touched.password && errors.password
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-300 hover:border-blue-500"
                        }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={toggleShowPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting || status === "loading"}
                      className="flex items-center justify-center w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300 disabled:opacity-50"
                    >
                      {status === "loading" ? (
                        <PropagateLoader
                          color="white"
                          className="mr-2 my-4 flex items-center"
                        />
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="text-red-500 text-center mt-4">
                      {error.error === "Login Failed"
                        ? "Invalid username or password"
                        : "Authentication Failed"}
                    </div>
                  )}
                </Form>
              )}
            </Formik>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-100 rounded-2xl to-purple-100 justify-center items-center p-4 lg:p-8">
          <img
            src={login_image}
            alt="Login illustration"
            className="max-h-full max-w-full object-contain hover:scale-110 transition-all duration-300 ease-in-out"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
