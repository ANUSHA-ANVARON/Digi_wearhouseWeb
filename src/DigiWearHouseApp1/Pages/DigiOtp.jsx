// File: src/pages/LoginPage.jsx
import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";

export default function otpPage() {
  const [otp, setOtp] = useState(new Array(4).fill(""));

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto focus to next input
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="flex w-full max-w-5xl rounded-2xl bg-white shadow-lg overflow-hidden">
        {/* Left Section - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          {/* Logo */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Log in</h1>
          <p className="text-gray-500 mb-6">
            Enter your Email address or Mobile number
          </p>

          {/* Input Field */}
          <input
            type="text"
            placeholder="Enter email or mobile"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 mb-6 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
          />

          {/* OTP Section */}
          <p className="text-sm text-gray-600 mb-3">
            We’ve sent an OTP to your Mobile
          </p>

          <div className="flex space-x-3 mb-4">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="w-12 h-12 border rounded-lg text-center text-lg font-semibold focus:outline-none focus:border-blue-500"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>

          <p className="text-xs text-gray-500 mb-6">
            I didn’t receive a code.{" "}
            <button className="text-[#800000] hover:underline">Resend</button>
          </p>

          {/* Continue Button */}
          <button className="w-full bg-[#800000] text-white py-3 rounded-lg hover:bg-blue-600 transition mb-4">
            Continue
          </button>

          {/* Google Login */}
          <button className="w-full border border-gray-300 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-gray-50 transition mb-6">
            <FaGoogle className="text-red-500" /> Sign in with Google
          </button>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-600">
            Don’t have an Account?{" "}
            <a href="/register" className="text-[#800000] hover:underline">
              Register
            </a>
          </p>
        </div>

        {/* Right Section - Image */}
        <div className="hidden md:block w-1/2 relative bg-blue-100">
          <img
            src="https://via.placeholder.com/600x600.png?text=Clothing+Store"
            alt="login side"
            className="w-full h-full object-cover rounded-l-none rounded-r-2xl"
          />
        </div>
      </div>
    </div>
  );
}
