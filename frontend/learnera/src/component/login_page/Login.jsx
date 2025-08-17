import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { login_image } from "../../assets/landing_page";
import { login, schooladmin_login } from "../../redux/features/auth/actions";
import {resetError} from '../../redux/features/auth/authSlice'
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, User, Lock, UserCheck } from "lucide-react";
import { SyncLoader } from "react-spinners";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";
import PasswordResetModal from "../passwordResetModal";

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
  password: Yup.string().required("Password is required"),
  role: Yup.string().required("Role is required"),
});

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const formVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const imageVariants = {
  hidden: { opacity: 0, x: 30, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
  },
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const { status, error, Role, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();
  const selectedRole = location.state?.selectedRole || "student";

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === "/login") {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      dispatch(resetError())
    }
  }, [dispatch]);

  useEffect(() => {
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
          is_student: "/students",
          is_teacher: "/teachers",
          is_parent: "/parents",
          school_admin: "/admin",
        };
        const targetRoute = routes[credentials.role];
        if (targetRoute) {
          navigate(targetRoute);
        }
      }, 2000);
    } catch (error) {
      toast.error("Invalid Credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <motion.div className="flex justify-center items-center min-h-screen bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-4 w-full h-screen">
        <ToastContainer />
        <motion.div
          className="bg-white w-full max-w-5xl h-[90vh] max-h-[900px] rounded-2xl flex flex-col md:flex-row shadow-2xl overflow-hidden"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          whileHover={{
            y: -2,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
          }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-full md:w-1/2 p-4 md:p-8 flex flex-col justify-center"
            variants={formVariants}
          >
            <div className="max-w-md w-full mx-auto space-y-6">
              <motion.div variants={itemVariants}>
                <motion.h1
                  className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-800"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Welcome Back
                </motion.h1>
                <motion.p
                  className="text-gray-600 text-center mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Sign in to access your dashboard
                </motion.p>
              </motion.div>

              <Formik
                initialValues={{
                  username: "",
                  password: "",
                  role: selectedRole,
                }}
                enableReinitialize
                validationSchema={LoginSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched, values }) => (
                  <Form className="space-y-4 m-5">
                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="role"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Select Role
                      </label>
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <Field
                          as="select"
                          name="role"
                          className={`w-full px-4 py-2 pl-10 border rounded-lg transition-all duration-300 ${
                            touched.role && errors.role
                              ? "border-red-500 ring-2 ring-red-200"
                              : focusedField === "role"
                              ? "border-blue-500 ring-2 ring-blue-200 shadow-md"
                              : "border-gray-300 hover:border-blue-400"
                          }`}
                          onFocus={() => setFocusedField("role")}
                          onBlur={() => setFocusedField(null)}
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="school_admin">School Admin</option>
                          <option value="parent">Parent</option>
                        </Field>
                        <motion.div
                          className="absolute left-3 top-1/3 transform -translate-y-1/2"
                          animate={{
                            color:
                              focusedField === "role" ? "#3B82F6" : "#9CA3AF",
                            scale: focusedField === "role" ? 1.1 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <User size={18} />
                        </motion.div>
                      </motion.div>
                      <AnimatePresence>
                        {touched.role && errors.role && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-red-500 text-sm mt-1"
                          >
                            {errors.role}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label
                        htmlFor="username"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Username
                      </label>
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <Field
                          type="text"
                          name="username"
                          className={`w-full px-4 py-2 pl-10 border rounded-lg transition-all duration-300 ${
                            touched.username && errors.username
                              ? "border-red-500 ring-2 ring-red-200"
                              : focusedField === "username"
                              ? "border-blue-500 ring-2 ring-blue-200 shadow-md"
                              : "border-gray-300 hover:border-blue-400"
                          }`}
                          placeholder="Enter your username"
                          onFocus={() => setFocusedField("username")}
                          onBlur={() => setFocusedField(null)}
                        />
                        <motion.div
                          className="absolute left-3 top-1/3 transform -translate-y-1/2"
                          animate={{
                            color:
                              focusedField === "username"
                                ? "#3B82F6"
                                : "#9CA3AF",
                            scale: focusedField === "username" ? 1.1 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <User size={18} />
                        </motion.div>
                      </motion.div>
                      <AnimatePresence>
                        {touched.username && errors.username && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-red-500 text-sm mt-1"
                          >
                            {errors.username}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div variants={itemVariants} className="relative">
                      <label
                        htmlFor="password"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Password
                      </label>
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <Field
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className={`w-full px-4 py-2 pl-10 pr-10 border rounded-lg transition-all duration-300 ${
                            touched.password && errors.password
                              ? "border-red-500 ring-2 ring-red-200"
                              : focusedField === "password"
                              ? "border-blue-500 ring-2 ring-blue-200 shadow-md"
                              : "border-gray-300 hover:border-blue-400"
                          }`}
                          placeholder="Enter your password"
                          onFocus={() => setFocusedField("password")}
                          onBlur={() => setFocusedField(null)}
                        />
                        <motion.div
                          className="absolute left-3 top-1/3 transform -translate-y-1/2"
                          animate={{
                            color:
                              focusedField === "password"
                                ? "#3B82F6"
                                : "#9CA3AF",
                            scale: focusedField === "password" ? 1.1 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Lock size={18} />
                        </motion.div>
                        <motion.button
                          type="button"
                          onClick={toggleShowPassword}
                          className="absolute right-3 top-1/3 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ duration: 0.1 }}
                        >
                          <div>
                            {showPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </div>
                        </motion.button>
                      </motion.div>
                      <AnimatePresence>
                        {touched.password && errors.password && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-red-500 text-sm mt-1"
                          >
                            {errors.password}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -10 }}
                          className="text-red-500 text-center mt-4 p-3 bg-red-50 rounded-lg border border-red-200"
                        >
                          {error.error === "Login Failed"
                            ? "Invalid username or password"
                            : "Authentication Failed"}
                        </motion.div>
                      )}
                    </AnimatePresence> */}

                    <motion.div className="pt-4" variants={itemVariants}>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting || status === "loading"}
                        className="flex items-center justify-center w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 relative overflow-hidden"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.1 }}
                      >
                        <AnimatePresence mode="wait">
                          {status === "loading" ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="flex items-center justify-center h-full w-full"
                            >
                              <SyncLoader
                                color="white"
                                className="my-2 text-center"
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="signin"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="flex items-center"
                            >
                              <LogIn size={20} className="mr-2" />
                              Sign In
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </motion.div>
                  </Form>
                )}
              </Formik>

              <motion.div className="text-center mt-4" variants={itemVariants}>
                <motion.p
                  className="text-sm text-blue-600 hover:underline hover:text-blue-800 font-medium transition-colors duration-200 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    console.log("hooi");
                    setShowResetPassword(!showResetPassword);
                  }}
                >
                  Forgot Password?
                </motion.p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-100 rounded-2xl to-purple-100 justify-center items-center p-4 lg:p-8"
            variants={imageVariants}
          >
            <motion.img
              src={login_image}
              alt="Login illustration"
              className="max-h-full max-w-full object-contain"
              whileHover={{
                scale: 1.05,
                rotate: [0, 1, -1, 0],
                transition: {
                  scale: { duration: 0.3 },
                  rotate: { duration: 0.5, ease: "easeInOut" },
                },
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
      <div>
        {showResetPassword && (
          <PasswordResetModal
            isOpen={showResetPassword}
            onClose={() => setShowResetPassword(false)}
          />
        )}
      </div>
    </>
  );
};

export default Login;
