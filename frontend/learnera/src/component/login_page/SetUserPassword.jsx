import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Shield } from "lucide-react";
import api from "../../api";
import { toast, ToastContainer } from "react-toastify";

const SetUserPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Password validation checks
  const passwordChecks = {
    length: formData.new_password.length >= 8,
    uppercase: /[A-Z]/.test(formData.new_password),
    number: /[0-9]/.test(formData.new_password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { new_password, confirm_password } = formData;

    if (!isPasswordValid) {
      toast.error("Password does not meet all requirements.");
      return;
    }

    if (new_password !== confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await api.post(`/users/set-password/${uid}/${token}/`, formData);
      toast.success("Password updated! Redirecting...");
      setFormData({ new_password: "", confirm_password: "" });
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Password set failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <ToastContainer />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-white/80 backdrop-blur-lg p-10 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Set Your Password
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Create a secure password for your account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              New Password
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="new_password"
                  placeholder="Enter your new password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Confirm your new password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Password Strength Indicator */}
          <div className="space-y-2">
            <div className="text-xs text-gray-500">Password Requirements:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={`flex items-center gap-1 ${
                  passwordChecks.length ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    passwordChecks.length ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                8+ characters
              </div>
              <div
                className={`flex items-center gap-1 ${
                  passwordChecks.uppercase ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    passwordChecks.uppercase ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                Uppercase letter
              </div>
              <div
                className={`flex items-center gap-1 ${
                  passwordChecks.number ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    passwordChecks.number ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                Number
              </div>
              <div
                className={`flex items-center gap-1 ${
                  passwordChecks.special ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    passwordChecks.special ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                Special character
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              !isPasswordValid ||
              formData.new_password !== formData.confirm_password
            }
            className={`w-full py-4 rounded-xl font-semibold shadow-lg transition-all duration-200 focus:ring-4 
    ${
      isPasswordValid && formData.new_password === formData.confirm_password
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }`}
          >
            Set Password
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Your password will be encrypted and stored securely
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetUserPassword;
