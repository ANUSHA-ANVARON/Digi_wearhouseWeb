import React, { useState } from "react";
import img1 from "../../assets/1.png";
import img2 from "../../assets/2.png";
import img3 from "../../assets/3.png";
import img4 from "../../assets/4.png";
import Footer from "../Components/Footer.jsx";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission here
    alert("Thank you for your message! We will get back to you soon.");
  };

  return (
    <div className="min-h-screen bg-white text-start">
      {/* Top Section */}
      <div className="bg-white p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">
                DISCOVER US
              </h2>
              <p className="text-gray-700 mb-2">Flick is here to help you;</p>
              <p className="text-gray-700 mb-2">
                Our experts are available to answer any questions you
              </p>
              <p className="text-gray-700 mb-4">
                might have. We've got the answers.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-black mb-2">VISIT US</h3>
              <p className="text-gray-700">
                Times mall, Kachbowl, Hyderabad 530032
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-black mb-2">EMAIL US</h3>
              <p className="text-red-800">info@gmail.com</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-black mb-2">CALL US</h3>
              <p className="text-gray-700">+91 8178973587</p>
              <p className="text-gray-700">+91 7744778648</p>
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="space-y-4">
            {/* Map placeholder */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={img1}
                  alt="Store Interior 1"
                  className="w-full h-40 object-cover"
                />
              </div>
              <div className="bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={img2}
                  alt="Store Interior 2"
                  className="w-full h-40 object-cover"
                />
              </div>
            </div>

            {/* Store images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={img3}
                  alt="Store Interior 1"
                  className="w-full h-40 object-cover"
                />
              </div>
              <div className="bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={img4}
                  alt="Store Interior 2"
                  className="w-full h-40 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Contact Form */}
      <div className="bg-red-100 py-16">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Large Text */}
            <div>
              <h1 className="text-6xl lg:text-8xl font-bold text-amber-500 opacity-50 leading-none">
                contact us
              </h1>
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-black mb-2">
                  Let's discuss !
                </h2>
                <p className="text-gray-700 mb-1">
                  Thanks for scrolling this far !
                </p>
                <p className="text-gray-700 mb-1">Kindly,</p>
                <p className="text-gray-700">
                  Fill the form, have a great day!
                </p>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Your Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  ></textarea>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-red-800 hover:bg-red-900 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
