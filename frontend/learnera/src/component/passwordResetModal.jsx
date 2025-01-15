import React, { useEffect, useState } from "react";
import {
  X,
  AlertCircle,
  Key,
  Lock,
  ShieldCheck,
  ShieldX,
  EyeClosed,
  Eye,
} from "lucide-react";
import api from "../api";
import { ClipLoader } from "react-spinners";

const PasswordResetModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [eyeOn, setEyeOn] = useState(false);

  useEffect(() => {
    const resetPassword = localStorage.getItem("resetPassword");
    if (resetPassword === "false") {
      setIsOpen(true);
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSeePassword = () => {
    if (eyeOn) {
      setEyeOn(false);
    } else {
      setEyeOn(true);
    }
  };

  const handleSkip = async () => {
    try {
      setIsLoading(true);
      const userEmail = localStorage.getItem("userEmail");
      const response = await api.post("/users/reset-password/", {
        userEmail,
        skip: true,
      });

      if (response.status === 200) {
        localStorage.setItem("resetPassword", "true");
        setIsOpen(false);
      } else {
        setError(response.data?.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to process request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      const userEmail = localStorage.getItem("userEmail");
      const response = await api.post("/users/reset-password/", {
        ...formData,
        userEmail,
      });

      if (response.status === 200) {
        localStorage.setItem("resetPassword", "true");
        setIsOpen(false);
      } else {
        setError(response.data?.error || "Failed to change password");
      }
    } catch (err) {
      setError("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md relative shadow-2xl">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Key className="text-blue-600" size={28} />
            <h2 className="text-2xl font-semibold text-gray-800">
              Change Password
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            The admin has set a temporary password for your account. Would you
            like to change it now?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 border border-red-100">
              <AlertCircle className="flex-shrink-0" size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              {eyeOn ? (
                <Eye
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={handleSeePassword}
                  size={20}
                />
              ) : (
                <EyeClosed
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={handleSeePassword}
                  size={20}
                />
              )}
              <input
                type={eyeOn ? "text" : "password"}
                name="new_password"
                placeholder="New Password"
                value={formData.new_password}
                onChange={handleInputChange}
                className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="relative">
              <ShieldCheck
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="password"
                name="confirm_password"
                placeholder="Confirm Password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all text-gray-600 font-medium"
            >
              <ShieldX size={20} />
              Keep Current Password
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium"
            >
              {isLoading ? (
                <ClipLoader color="#ffffff" size={20} />
              ) : (
                <Key size={20} />
              )}
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetModal;
