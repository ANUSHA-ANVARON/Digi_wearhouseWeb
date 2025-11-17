// import React from "react";
// import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
// import Footerlog1 from "../../assets/footerlog1.png";
// import Footerlog2 from "../../assets/footerlog2.png";
// import Footerlog3 from "../../assets/footerlog3.png";

// const Footer = () => {
//   return (
//     <footer className="bg-white text-start text-gray-700 pt-8 pb-6">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex flex-col md:flex-row justify-between space-y-8 md:space-y-0 md:space-x-12">
//           {/* SELL ONLINE */}
//           <div className="flex flex-col space-y-3">
//             <h3 className=" font-semibold text-gray-900 uppercase tracking-wide">
//               SELL ONLINE
//             </h3>
//             <a href="#" className="text-gray-600 hover:text-gray-900">
//               ADD YOUR PRODUCT
//             </a>
//             <a href="#" className="text-gray-600 hover:text-gray-900">
//               GROW
//             </a>
//           </div>

//           {/* OUR COMPANY */}
//           <div className="flex flex-col space-y-3">
//             <h3 className="font-semibold text-gray-900 uppercase tracking-wide">
//               OUR COMPANY
//             </h3>
//             <a
//               href="#"
//               className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
//             >
//               <span>CONTACT US</span>
//             </a>
//             <a href="#" className="text-gray-600 hover:text-gray-900">
//               FAQ
//             </a>
//             <a href="#" className="text-gray-600 hover:text-gray-900">
//               TERMS &amp; CONDITIONS
//             </a>
//             <a href="#" className="text-gray-600 hover:text-gray-900">
//               PRIVACY POLICY
//             </a>
//           </div>

//           {/* EXPERIENCE APP */}
//           <div className="flex flex-col space-y-3 max-w-xs">
//             <h3 className="font-semibold text-gray-900 uppercase tracking-wide">
//               EXPERIENCE DVYB APP ON MOBILE
//             </h3>
//             <div className="flex space-x-4 mt-2">
//               <a
//                 href="#"
//                 aria-label="Download on the App Store"
//                 className="inline-block"
//               >
//                 <img
//                   src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
//                   alt="App Store"
//                   className="h-12"
//                 />
//               </a>
//               <a
//                 href="#"
//                 aria-label="Get it on Google Play"
//                 className="inline-block"
//               >
//                 <img
//                   src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
//                   alt="Google Play"
//                   className="h-14"
//                 />
//               </a>
//             </div>
//           </div>

//           {/* KEEP IN TOUCH */}
//           <div className="flex flex-col space-y-3">
//             <h3 className="font-semibold text-gray-900 uppercase tracking-wide">
//               KEEP IN TOUCH
//             </h3>
//             <div className="flex space-x-4 mt-2 text-gray-600">
//               <a href="#" aria-label="Facebook" className="hover:text-gray-900">
//                 <FaFacebookF size={20} />
//               </a>
//               <a
//                 href="#"
//                 aria-label="Instagram"
//                 className="hover:text-gray-900"
//               >
//                 <FaInstagram size={20} />
//               </a>
//               <a href="#" aria-label="Twitter" className="hover:text-gray-900">
//                 <FaTwitter size={20} />
//               </a>
//               <a href="#" aria-label="YouTube" className="hover:text-gray-900">
//                 <FaYoutube size={20} />
//               </a>
//             </div>
//           </div>
//         </div>

//         {/* Logos and copyright */}
//         {/* <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col items-center md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
//           <div className="flex flex-wrap justify-center md:justify-start items-center pl-0 md:pl-96 space-x-6">
//             <img src={Footerlog1} alt="DVYB" className="h-10" />
//             <img src={Footerlog2} alt="DVYB DIGI WAREHOUSE" className="h-10" />
//             <img src={Footerlog3} alt="DVYB WHOLESALE" className="h-6" />
//           </div>

//           <p className="text-center text-gray-500 text-sm">COPYRIGHT © 2025</p>
//           <p className="text-center text-gray-400 text-xs">dvyb.in</p>
//         </div> */}
//       </div>
//     </footer>
//   );
// };

// export default Footer;
import React from "react";
// 1. Import Link from react-router-dom
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import Footerlog1 from "../../assets/footerlog1.png";
import Footerlog2 from "../../assets/footerlog2.png";
import Footerlog3 from "../../assets/footerlog3.png";

const Footer = () => {
  return (
    <footer className="bg-white text-start text-gray-700 pt-8 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between space-y-8 md:space-y-0 md:space-x-12">
          {/* SELL ONLINE */}
          <div className="flex flex-col space-y-3">
            <h3 className=" font-semibold text-gray-900 uppercase tracking-wide">
              SELL ONLINE
            </h3>
            {/* 2. Changed <a> to <Link> and href to to */}
            {/* <Link
              to="/upload-products"
              className="text-gray-600 hover:text-gray-900"
            >
              ADD YOUR PRODUCT
            </Link> */}
            {/* This will now link to the dashboard */}
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              GROW
            </Link>
          </div>

          {/* OUR COMPANY */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-semibold text-gray-900 uppercase tracking-wide">
              OUR COMPANY
            </h3>
            {/* 2. Changed <a> to <Link> and href to to */}
            <Link
              to="/contact-us"
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <span>CONTACT US</span>
            </Link>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              FAQ
            </a>
            {/* 2. Changed <a> to <Link> and href to to */}
            <Link
              to="/terms-and-conditions"
              className="text-gray-600 hover:text-gray-900"
            >
              TERMS &amp; CONDITIONS
            </Link>
            {/* 2. Changed <a> to <Link> and href to to */}
            <Link
              to="/privacy-policy"
              className="text-gray-600 hover:text-gray-900"
            >
              PRIVACY POLICY
            </Link>
          </div>

          {/* EXPERIENCE APP */}
          <div className="flex flex-col space-y-3 max-w-xs">
            <h3 className="font-semibold text-gray-900 uppercase tracking-wide">
              EXPERIENCE DVYB APP ON MOBILE
            </h3>
            <div className="flex space-x-4 mt-2">
              <a
                href="#" // Keep as <a> since these are external links
                aria-label="Download on the App Store"
                className="inline-block"
              >
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="App Store"
                  className="h-12"
                />
              </a>
              <a
                href="#" // Keep as <a> since these are external links
                aria-label="Get it on Google Play"
                className="inline-block"
              >
                <img
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  alt="Google Play"
                  className="h-14"
                />
              </a>
            </div>
          </div>

          {/* KEEP IN TOUCH */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-semibold text-gray-900 uppercase tracking-wide">
              KEEP IN TOUCH
            </h3>
            <div className="flex space-x-4 mt-2 text-gray-600">
              {/* Keep as <a> for external social links */}
              <a href="#" aria-label="Facebook" className="hover:text-gray-900">
                <FaFacebookF size={20} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="hover:text-gray-900"
              >
                <FaInstagram size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-gray-900">
                <FaTwitter size={20} />
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-gray-900">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Logos and copyright */}
        {/* <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col items-center md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
          <div className="flex flex-wrap justify-center md:justify-start items-center pl-0 md:pl-96 space-x-6">
            <img src={Footerlog1} alt="DVYB" className="h-10" />
            <img src={Footerlog2} alt="DVYB DIGI WAREHOUSE" className="h-10" />
            <img src={Footerlog3} alt="DVYB WHOLESALE" className="h-6" />
          </div>

          <p className="text-center text-gray-500 text-sm">COPYRIGHT © 2025</p>
          <p className="text-center text-gray-400 text-xs">dvyb.in</p>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
