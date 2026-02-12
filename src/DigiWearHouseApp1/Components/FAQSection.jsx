import React, { useState } from "react";
import {
  FaWhatsapp,
  FaGlobe,
  FaClock,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { ChevronDown, ChevronUp } from "lucide-react"; // for arrow toggle

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const faqs = [
    {
      q: "How long does setup take?",
      a: "Setup takes less than 30 seconds! Just enter your details, verify your details, and you're ready to start uploading products and selling online.",
    },
    {
      q: "How will DVYB help my business grow?",
      a: "On average, DVYB vendors see a 35% revenue increase in the first 90 days—thanks to better inventory management and faster sales.",
    },
    {
      q: "Is there a cost or commission?",
      a: "DVYB offers zero-commission onboarding and transparent pricing—no hidden fees. Try it free!",
    },
    {
      q: "Can I use DVYB on any mobile device?",
      a: "Yes, the app works on Android and iOS. Our mobile-first design ensures a smooth experience on all smartphones.",
    },
    {
      q: "Do I need technical knowledge or special training?",
      a: "Not at all! DVYB is designed for business owners who may be new to digital tools. The average user completes setup and starts selling in under 10 minutes!",
    },
  ];

  return (
    <section
      className="w-full bg-gradient-to-b from-white to-sky-50 py-12 px-6 md:px-16"
      id="faq"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Left Side - FAQ */}
        <div className="md:col-span-2">
          <h2
            className="text-3xl font-bold text-center md:text-left"
            style={{ color: "#4F8396" }}
          >
            FAQ & Support
          </h2>

          <p className="text-gray-600 text-center md:text-left mt-2">
            Got questions? We’ve got answers. Plus 24/7 support in your
            language.
          </p>

          <div className="mt-8 space-y-4">
            {faqs.map((item, idx) => (
              <div
                key={idx}
                className="bg-white shadow-md rounded-xl border border-gray-100 hover:shadow-lg transition"
              >
                {/* Question Row */}
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex justify-between items-center p-5 text-left"
                >
                  <h3 className="font-semibold text-gray-900">{item.q}</h3>
                  {openIndex === idx ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {/* Answer (show/hide) */}
                {openIndex === idx && (
                  <div className="px-5 pb-5 text-gray-600 text-sm text-start">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Support Box */}
        <div className="space-y-6">
          {/* Personal Help */}
          <div className="bg-gradient-to-br from-white to-red-50 p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Need Personal Help?
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Our expert team is here to help you succeed. Get personalized
              support in your preferred language.
            </p>

            <div className="mt-4 space-y-3">
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border hover:bg-green-50 transition">
                <div className="flex items-center gap-2">
                  <FaWhatsapp className="text-green-500" />
                  <span>WhatsApp Support</span>
                </div>
                <span className="text-sm text-gray-500">Chat Now</span>
              </button>

              <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border hover:bg-purple-50 transition">
                <div className="flex items-center gap-2">
                  <FaGlobe className="text-purple-500" />
                  <span>Local Language Help</span>
                </div>
                <span className="text-sm text-gray-500">Get Help</span>
              </button>
            </div>
          </div>

          {/* Support Hours */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaClock className="text-green-500" /> Support Hours
            </h3>

            <p className="text-sm text-gray-600 mt-2">WhatsApp Support: 24/7</p>
            <p className="text-sm text-gray-600">Phone Support: 9 AM - 9 PM</p>

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <FaEnvelope className="text-red-800" /> support@dvyb.com
              </p>
              <p className="flex items-center gap-2">
                <FaPhone className="text-red-800" /> +91-9876543210
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
