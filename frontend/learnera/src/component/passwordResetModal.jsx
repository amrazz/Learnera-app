import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertCircle,
  Key,
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  Send,
  Timer,
  ShieldAlert,
} from "lucide-react";
import api from "../api";
import { ClipLoader } from "react-spinners";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Form data for different steps
  const [emailData, setEmailData] = useState({ email: "" });
  const [otpData, setOtpData] = useState(["", "", "", ""]);
  const [passwordData, setPasswordData] = useState({
    new_password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Refs for OTP inputs
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setEmailData({ email: "" });
      setOtpData(["", "", "", ""]);
      setPasswordData({ new_password: "", confirm_password: "" });
      setError("");
      setSuccess("");
      setCountdown(0);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleCheckEmailVerified = async () => {
    setError("");
    setSuccess("");

    if (!emailData.email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setVerifyLoading(true);
      const response = await api.post("users/check-email/", {
        email: emailData.email,
      });
      if (response.status === 200) {
        setSuccess("Email is registered and eligible for verification.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "This email is not registered with us."
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmailData({ email: e.target.value });
    setError("");
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length <= 1) {
      const newOtp = [...otpData];
      newOtp[index] = value;
      setOtpData(newOtp);
      setError("");

      if (value && index < 3) {
        otpRefs[index + 1].current?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpData[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Handle password input
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!emailData.email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("users/forgot-password/", {
        email: emailData.email,
      });

      if (response.status === 200) {
        setSuccess("OTP sent successfully to your email!");
        setCurrentStep(2);
        setCountdown(60); // 60 seconds countdown
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to send OTP. Please check your email address."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    const otpString = otpData.join("");
    if (otpString.length !== 4) {
      setError("Please enter the complete 4-digit OTP");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("users/verify-otp/", {
        email: emailData.email,
        otp: otpString,
      });

      if (response.status === 200) {
        setSuccess("OTP verified successfully!");
        setCurrentStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("users/reset-password-confirm/", {
        email: emailData.email,
        otp: otpData.join(""),
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password,
      });

      if (response.status === 200) {
        setSuccess(
          "Password reset successful! You can now login with your new password."
        );
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;

    try {
      setIsLoading(true);
      await api.post("users/forgot-password/", {
        email: emailData.email,
      });
      setSuccess("OTP resent successfully!");
      setCountdown(60);
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to previous step
  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
      setSuccess("");
    }
  };

  if (!isOpen) return null;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl p-8 w-full max-w-md relative shadow-2xl"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>

          {/* Back Button (for steps 2 and 3) */}
          {currentStep > 1 && (
            <button
              onClick={goBack}
              className="absolute left-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}

          {/* Progress Indicator */}
          <div className="flex justify-center mb-6 mt-2">
            <div className="flex space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    step === currentStep
                      ? "bg-blue-600 scale-125"
                      : step < currentStep
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="text-blue-600" size={28} />
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Forgot Password?
                    </h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Enter your email address and we'll send you a 4-digit OTP to
                    reset your password.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-6">
                  {error ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 border border-red-100"
                    >
                      <AlertCircle className="flex-shrink-0" size={20} />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  ) : success ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 text-green-500 p-4 rounded-lg flex items-center gap-3 border border-green-200"
                    >
                      <AlertCircle className="flex-shrink-0" size={20} />
                      <span className="text-sm">{success}</span>
                    </motion.div>
                  ) : (
<></>
                  )}

                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={emailData.email}
                      onChange={handleEmailChange}
                      className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-10 justify-evenly">
                    <button
                      type="submit"
                      disabled={verifyLoading}
                      onClick={handleCheckEmailVerified}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium"
                    >
                      {verifyLoading ? (
                        <ClipLoader color="#ffffff" size={20} />
                      ) : (
                        <ShieldAlert size={20} />
                      )}
                      Verify Email
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium"
                    >
                      {isLoading ? (
                        <ClipLoader color="#ffffff" size={20} />
                      ) : (
                        <Send size={20} />
                      )}
                      Send OTP
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 2: Enter OTP */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="text-blue-600" size={28} />
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Enter OTP
                    </h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    We've sent a 4-digit OTP to{" "}
                    <strong>{emailData.email}</strong>. Please enter it below.
                  </p>
                </div>

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-3 border border-green-100 mb-6"
                  >
                    <CheckCircle className="flex-shrink-0" size={20} />
                    <span className="text-sm">{success}</span>
                  </motion.div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 border border-red-100"
                    >
                      <AlertCircle className="flex-shrink-0" size={20} />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}

                  {/* OTP Input Boxes */}
                  <div className="flex justify-center gap-3">
                    {otpData.map((digit, index) => (
                      <input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-14 h-14 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        pattern="[0-9]"
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || isLoading}
                      className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                      {countdown > 0 ? (
                        <>
                          <Timer size={16} />
                          Resend OTP in {countdown}s
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Resend OTP
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpData.join("").length !== 4}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium"
                  >
                    {isLoading ? (
                      <ClipLoader color="#ffffff" size={20} />
                    ) : (
                      <ShieldCheck size={20} />
                    )}
                    Verify OTP
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 3: Set New Password */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <Key className="text-blue-600" size={28} />
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Set New Password
                    </h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Choose a strong password for your account. Make sure it's at
                    least 6 characters long.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 border border-red-100"
                    >
                      <AlertCircle className="flex-shrink-0" size={20} />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 text-green-600 p-4 rounded-lg flex items-center gap-3 border border-green-100"
                    >
                      <CheckCircle className="flex-shrink-0" size={20} />
                      <span className="text-sm">{success}</span>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="new_password"
                        placeholder="New Password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        className="w-full pl-11 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div className="relative">
                      <ShieldCheck
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirm_password"
                        placeholder="Confirm Password"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        className="w-full pl-11 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium"
                  >
                    {isLoading ? (
                      <ClipLoader color="#ffffff" size={20} />
                    ) : (
                      <Key size={20} />
                    )}
                    Reset Password
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
