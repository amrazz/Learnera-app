import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { PropagateLoader } from "react-spinners";

const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { Role } = useSelector((state) => state.auth);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("userEmail");

    if (email) {
      setUserEmail(email);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const response = await api.post("/users/send-otp/", { email: userEmail });
      toast.success(
        response.data.message || "OTP has been resent to your email!"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to resend OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/users/verify-otp/", {
        email: userEmail,
        otp: otpValue,
      });
      if (response.data.message) {
        toast.success("Email verified successfully!");
      }
      localStorage.removeItem("userEmail");

      // Navigate based on role
      const routes = {
        is_student: "/students",
        is_teacher: "/teachers",
        is_parent: "/parents",
        school_admin: "/admin",
      };

      navigate(routes[Role] || "/login");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Invalid OTP. Please try again."
      );
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-8">
          Verify Your Email
        </h2>
        <p className="text-gray-600 text-center mb-2">
          Enter the 6-digit code sent to
        </p>
        <p className="text-blue-600 font-medium text-center mb-6">
          {userEmail}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="w-12 h-12 text-center text-xl font-semibold border rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}
                onKeyUp={(e) => {
                  if (
                    e.key === "Backspace" &&
                    !e.target.value &&
                    e.target.previousSibling
                  ) {
                    e.target.previousSibling.focus();
                  }
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300 disabled:opacity-50 mb-4"
          >
            {loading ? (
              <PropagateLoader color="white" size={10} />
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-600 mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResendOTP}
            disabled={loading || timeLeft > 0}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
          >
            {timeLeft > 0 ? `Resend OTP in ${timeLeft}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
