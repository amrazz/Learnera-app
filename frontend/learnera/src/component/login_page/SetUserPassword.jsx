import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeClosed } from "lucide-react";
import api from '../../api'
import {toast, ToastContainer} from 'react-toastify'

const SetUserPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ new_password: "", confirm_password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.new_password !== formData.confirm_password) {
      toast.error("Passwords do not match.")
      return;
    }

    try {
      const res = await api.post(`/users/set-password/${uid}/${token}/`, formData);
      toast.success("Password updated! Redirecting...")
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Password set failed")
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <ToastContainer />
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">Set Your Password</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="new_password"
              placeholder="New Password"
              value={formData.new_password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            {showPassword ? (
              <Eye className="absolute right-3 top-3 cursor-pointer" onClick={() => setShowPassword(false)} />
            ) : (
              <EyeClosed className="absolute right-3 top-3 cursor-pointer" onClick={() => setShowPassword(true)} />
            )}
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm Password"
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all">
            Set Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetUserPassword;
