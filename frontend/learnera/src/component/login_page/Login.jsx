import React, { useState } from "react";
import { CustomButton } from "../landing_page/CustomBtn";
import { login_image } from "../../assets/landing_page";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 ">
      <div
        className="bg-white w-full max-w-5xl p-4 md:p-6 m-5 rounded-2xl flex flex-col md:flex-row shadow-lg overflow-hidden"
        style={{ height: "90vh" }}
      >
        <div className="flex flex-col w-full md:w-1/2 p-4 md:p-8">
          <h1 className="text-center md:text-start text-3xl md:text-4xl font-bold font-montserrat">
            Hello, <br /> Welcome Back
          </h1>
          <p className="text-center md:text-start font-montserrat mb-6 text-gray-800 leading-relaxed">
            Welcome Back to the real world
          </p>
          <form className="flex flex-col space-y-4 font-montserrat w-full">
            <div>
              <label htmlFor="username" className="block mb-1 text-gray-500">
                Username
              </label>
              <input
                id="username"
                className="w-full px-4 py-2 border rounded-lg border-gray-300 shadow-md tracking-widest"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-1 text-gray-500">
                Password
              </label>
              <input
                id="password"
                className="w-full px-4 py-2 border rounded-lg border-gray-300 shadow-md tracking-widest"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox text-purple-600 cursor-pointer"
                />
                <span className="ml-2">Remember me</span>
              </label>
              <a
                href="#"
                aria-label="Forgot Password"
                className="text-purple-600 hover:underline"
              >
                Forgot Password?
              </a>
            </div>
            <div className="flex justify-center">
              <CustomButton title="Sign In" aria-label="Sign In" />
            </div>
          </form>
          <p className="mt-6 text-sm text-center">
            Don't have an account?
            <a
              href="#"
              aria-label="Sign Up"
              className="text-purple-600 hover:underline"
            >
              Sign Up
            </a>
          </p>
        </div>
        <div className="hidden md:flex w-full md:w-1/2 justify-center items-center">
          <img
            src={login_image}
            alt="Login illustration"
            className="max-h-[112%] max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
