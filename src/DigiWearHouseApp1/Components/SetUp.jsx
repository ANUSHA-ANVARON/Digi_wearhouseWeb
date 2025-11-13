import React, { useEffect, useState } from "react";
import { Play, Star } from "lucide-react";
import heroimg from "../../assets/hero-section-img.jpg";
import image1 from "../../assets/home_Create1.mp4";
import image2 from "../../assets/appareldevelopmentsoftware2.mp4";
import image3 from "../../assets/home_Scale3.mp4";

function SetUp() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-gray-200 z-50">
        {/* <div
          className="h-full bg-gradient-to-r from-red-700 to-red-800 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        ></div> */}
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Badges */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start">
          <div className="bg-green-50 border border-green-200 rounded-full px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-700 text-sm font-medium">
              Trusted by 3,200+ Vendors
            </span>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-full px-4 py-2 flex items-center gap-1">
            <Star className="w-4 h-4 text-orange-500 fill-current" />
            <span className="text-orange-700 text-sm font-medium">
              4.8/5 Rating
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Manage Your <br />
              <span className="bg-gradient-to-r from-red-800 via-red-700 to-[#FEC601] bg-clip-text text-transparent whitespace-nowrap text-xl sm:text-3xl lg:text-6xl">
                Digi Warehouse
              </span>
              <span className="text-gray-700"> — Anywhere, Anytime</span>
            </h2>

            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Join thousands of successful vendors who've digitized their
              business. No technical knowledge required. Start selling online
              today!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-red-800 hover:bg-red-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Download Free App
              </button>
              <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 hover:bg-gray-50">
                <Play className="w-5 h-5" />
                Watch 2-min Demo
              </button>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="order-first lg:order-last">
            <div className="relative w-full max-w-xl mx-auto">
              <img
                src={heroimg}
                alt="hero-img"
                className="w-full h-auto object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <p className="text-gray-500 text-sm mb-6">
            Trusted by businesses across India
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                3,247+
              </div>
              <div className="text-gray-500 text-sm">Active Vendors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ₹2.5Cr+
              </div>
              <div className="text-gray-500 text-sm">Revenue Managed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">15+</div>
              <div className="text-gray-500 text-sm">States Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Start Selling in 3 Simple Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get your business online and start earning in minutes with our
              streamlined onboarding process.
            </p>
            <button className="bg-red-800 mt-4 hover:bg-red-900 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
              <a href="/register">LOG IN</a>
            </button>
          </div>

          {/* Steps */}
          <div className="space-y-20">
            {/* Step 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Video */}
              <div className="order-2 lg:order-1">
                <div className="relative aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-lg">
                  <video
                    src={image1}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Text */}
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Setup</h3>
                </div>
                <p className="text-lg text-gray-600 mb-8">
                  Download and Register in 2 minutes. Enter your mobile number,
                  verify OTP, and get started immediately.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    Start Selling
                  </h3>
                </div>
                <p className="text-lg text-gray-600 mb-8">
                  Add your products in 3 easy steps. Upload photos, set prices,
                  and start receiving orders instantly.
                </p>
              </div>
              {/* Video */}
              <div>
                <div className="relative aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-lg">
                  <video
                    src={image2}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Video */}
              <div className="order-2 lg:order-1">
                <div className="relative aspect-[4/3] w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-lg">
                  <video
                    src={image3}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Text */}
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    Grow Business
                  </h3>
                </div>
                <p className="text-lg text-gray-600 mb-8">
                  Track sales and scale up your business with detailed analytics
                  and insights.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-20">
            <p className="text-[28px] sm:text-[35px] text-gray-600 mb-8">
              Start selling your products!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetUp;
