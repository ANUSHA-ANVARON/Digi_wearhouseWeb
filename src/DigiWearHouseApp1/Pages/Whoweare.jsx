import React from "react";
import heroimg from "../../assets/whoweImg1.png";
// import sideimg1 from "../../assets/sideimg1.png"; // Commented out as unused
// import sideimg2 from "../../assets/sideimg2.png"; // Commented out as unused
// import sideimg3 from "../../assets/sideimg3.png"; // Commented out as unused
import Roundcorner from "../../assets/roundcorner.png";
import Tailor1 from "../../assets/tailor1.png";
import Tailor2 from "../../assets/tailor2.png";
import Tailor3 from "../../assets/tailor3.png";
import Tailor4 from "../../assets/tailor4.png";
import Service1 from "../../assets/service1.png";
import Service2 from "../../assets/service2.png";
import Service3 from "../../assets/service3.png";
import Footer from "../Components/Footer.jsx";
import Group from "../../assets/Group.png";

function Whoweare() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Side by Side for Mobile */}
      <div className=" py-4   lg:py-8">
        <div className="flex flex-row gap-3 sm:gap-4 lg:gap-10 items-center">
          <div className="w-1/2 flex justify-center">
            {/* <img
              src={heroimg}
              className="w-full max-w-[140px] sm:max-w-[200px]   lg:max-w-full h-auto object-contain"
              alt="Hero"
            /> */}
            <img
              src={heroimg}
              alt="Hero"
              className="h-80  md:h-72 lg:h-auto w-auto object-contain"
            />
          </div>
          <div className="w-1/2 text-left">
            <h1
              className="text-base sm:text-xl lg:text-4xl font-bold mb-2 lg:mb-4"
              style={{ color: "#4F9EBB" }}
            >
              Who We Are
            </h1>

            <div className="space-y-2 lg:space-y-4">
              <p className="text-xs sm:text-sm lg:text-base leading-relaxed text-gray-700">
                DVYB Vendor App is built for small and medium-sized store
                owners, suppliers, and partners across Digi Warehouse networks.
              </p>
              <p className="text-xs sm:text-sm lg:text-base leading-relaxed text-gray-700">
                We believe in authentic success stories, effortless onboarding,
                and complete data privacy. By partnering with Digi Warehouse and
                integrating Indian payment systems (UPI, GST), DVYB helps
                thousands of vendors transform their businesses from paper to
                digital—boosting revenue, saving time, and growing confidently.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Side Images Section */}
      <div className="px-3 py-3 sm:px-4 lg:px-20 lg:py-8 justify-center">
        <img
          src={Group}
          alt=""
          className="w-full h-auto max-w-full object-contain"
        />

        {/* <div className="flex flex-row gap-2 sm:gap-2 lg:gap-10 justify-center items-center">
          <img
            src={sideimg1}
            className="w-1/3 max-w-[80px] sm:max-w-[100px] lg:max-w-xs h-auto object-contain"
            alt="Side 1"
          />
          <img
            src={sideimg2}
            className="w-1/3 max-w-[80px] sm:max-w-[100px] lg:max-w-xs h-auto object-contain"
            alt="Side 2"
          />
          <img
            src={sideimg3}
            className="w-1/3 max-w-[80px] sm:max-w-[100px] lg:max-w-xs h-auto object-contain"
            alt="Side 3"
          />
        </div> */}
      </div>

      {/* Why Us + Mission Section - Side by Side */}
      <div className=" py-4  lg:mt-20">
        <div className="flex flex-row lg:flex-row items-start gap-3 sm:gap-4 lg:gap-16">
          <div className="w-1/2 lg:w-1/2 sm:px-4 lg:px-12 px-3 space-y-4 sm:space-y-4 lg:space-y-6">
            {/* Why Us */}
            <div className="text-left">
              <h2 className="text-sm sm:text-xl lg:text-4xl font-bold mb-2 sm:mb-3 lg:mb-6"
              style={{ color: "#4F9EBB" }}
              >
                Why Us
              </h2>
              <ul className="space-y-1 sm:space-y-1 lg:space-y-2 text-xs sm:text-xs lg:text-base text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-800 mr-1 mt-1 text-xs">•</span>
                  <span>
                    Trusted by over 3,200+ local businesses nationwide
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-800 mr-1 mt-1 text-xs">•</span>
                  <span>
                    Designed specifically for the Indian market—supporting
                    multiple languages
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-800 mr-1 mt-1 text-xs">•</span>
                  <span>Dedicated team support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-800 mr-1 mt-1 text-xs">•</span>
                  <span>
                    Your data stays 100% secure and private, always. Join us and
                    discover how DVYB makes it easy
                  </span>
                </li>
              </ul>
            </div>

            {/* Mission */}
            {/* // Replace your mission section with this: */}

            <div className="">
              <h2 className="text-sm text-start sm:text-lg lg:text-3xl font-bold mb-2 sm:mb-2 lg:mb-4"
              style={{ color: "#4F9EBB" }}>
                Mission
              </h2>

              {/* Desktop/Tablet version */}
              <p className="hidden sm:block text-xs sm:text-xs lg:text-base leading-relaxed text-gray-700 max-w-[330px] sm:max-w-none">
                <span className="text-amber-600 font-medium">
                  Our mission is simple:{" "}
                </span>
                help every business owner turn chaos into growth with easy,
                digital inventory management, fast onboarding, and real-time
                business analytics—no technical expertise required.
              </p>

              {/* Mobile version - 4 lines */}
              <div className="block sm:hidden text-xs leading-relaxed text-gray-700 space-y-0.5">
                <div className="whitespace-nowrap overflow-hidden">
                  <span className="text-amber-600 font-medium">
                    Our mission is simple:
                  </span>{" "}
                  help every
                </div>
                <div className="whitespace-nowrap overflow-hidden">
                  business owner turn chaos into growth
                </div>
                <div className="whitespace-nowrap overflow-hidden">
                  with easy, digital inventory management,
                </div>
                <div className="whitespace-nowrap overflow-hidden">
                  fast onboarding, and real-time business analytics.
                </div>
              </div>
            </div>
          </div>

          <div className="w-1/2 lg:w-1/2 flex  justify-end">
            <img
              src={Roundcorner}
              className="w-full max-w-[140px] sm:max-w-[200px] lg:max-w-md h-auto object-contain"
              alt="Round Corner"
            />
          </div>
        </div>
      </div>

      {/* Tailor Images Section */}
      {/* <div className="px-4 py-6 sm:py-4 lg:py-8"> */}
      {/* Tailor Images Section */}
      <div className="   px-9   mt-5 relative ">
        <div className=" grid grid-cols-2 md:grid-cols-2  lg:flex lg:flex-row lg:justify-center gap-4 sm:gap-4 max-w-md mx-auto lg:max-w-none">
          {[Tailor1, Tailor2, Tailor3, Tailor4].map((img, idx) => (
            <div
              key={idx}
              className="flex items-center lg:transform lg:-translate-y-56 justify-center aspect-square w-full sm:w-32 lg:w-64 md:h-40 md:w-48 rounded-xl overflow-hidden shadow-md bg-white lg:h-72  mx-auto"
            >
              <img
                src={img}
                alt={`Tailor${idx + 1}`}
                className="w-full h-full  object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* </div> */}
      {/* Our Services Section */}
      <div className="px-4 py-8 sm:py-4 lg:-mt-40 mt-8 lg:py-8">
        <h2 className="text-2xl sm:text-xl lg:text-4xl font-bold mb-6 sm:mb-4 lg:mb-8 text-center text-gray-800">
          Our Services
        </h2>

        {/* Layout */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-4 md:gap-6 lg:gap-8 items-center justify-center">
          {/* Service 1 */}
          <div className="flex justify-center w-full sm:w-1/2 md:w-1/3">
            <div className="max-w-[280px] md:max-w-sm lg:max-w-xs text-center">
              <img
                src={Service1}
                className="w-full h-auto object-contain mb-3"
                alt="Digital Inventory"
              />
              <h3 className="font-semibold text-lg mb-2" style={{ color: "#4F9EBB" }}>
                Digital Inventory
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tracking and organizing products at various locations across our
                fleet <br />
                tracking solutions.
              </p>
            </div>
          </div>

          {/* Service 2 */}
          <div className="flex justify-center w-full sm:w-1/2 md:w-1/3">
            <div className="max-w-[280px] md:max-w-sm lg:max-w-xs text-center">
              <img
                src={Service2}
                className="w-full h-auto object-contain mb-3"
                alt="Sales Analytics"
              />
              <h3 className="font-semibold text-lg mb-2" style={{ color: "#4F9EBB" }}>
                Sales Analytics
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Provides interactive real-time graphs and sales stats to boost
                performance <br />
                insights .
              </p>
            </div>
          </div>

          {/* Service 3 */}
          <div className="flex justify-center w-full sm:w-1/2 md:w-1/3">
            <div className="max-w-[280px] md:max-w-sm lg:max-w-xs text-center">
              <img
                src={Service3}
                className="w-full h-auto object-contain mb-3"
                alt="Dashboards"
              />
              <h3 className="font-semibold text-lg mb-2" style={{ color: "#4F9EBB" }}>
                Dashboards
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Real-time status about any dashboard providing informative
                insights into day-to-day operations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Placeholder */}
      <div className="bg-gray-100 py-8">
        <div className="text-center text-gray-600">
          {/* <p>Footer Component Here</p> */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Whoweare;
