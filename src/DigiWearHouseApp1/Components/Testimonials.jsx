import React from "react";
import { motion } from "framer-motion";
import person_img from "../../assets/Overlay+Shadow.png";

const TestimonialCard = ({
  name,
  title,
  testimonial,
  image,
  reached,
  expanded,
  className,
}) => (
  <div
    className={`bg-red-50 rounded-lg p-6 shadow-md max-w-md mx-auto mb-17 transition-transform duration-300 ${className}`}
  >
    <div className="flex items-center mb-4">
      <img src={image} alt={name} className="w-12 h-12 rounded-full mr-4" />
      <div>
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-gray-600 text-sm">{title}</p>
      </div>
    </div>
    <p className="text-gray-700 italic">&quot;{testimonial}&quot;</p>
    <div className="flex justify-between mt-4 text-red-800 text-sm">
      {reached && <span>Reached {reached}</span>}
      {expanded && <span>Expanded reach to {expanded}</span>}
    </div>
  </div>
);

const Testimonials = () => {
  const testimonials = [
    {
      name: "sree",
      title: "Sree Fashions Owner, Bengal",
      testimonial:
        "Managing my textile business became so much easier with DVYB. Online orders and customer management boosted my monthly revenue significantly.",
      image: person_img,
      reached: "500+ new customers",
    },
    {
      name: "Rajesh Kumar",
      title: "Devyani Fashions Owner, Mumbai",
      testimonial:
        "DVYB transformed my small store into a digital powerhouse. My customers can now order online, and I've expanded my reach beyond my neighborhood.",
      image: person_img,
      expanded: "5+ cities",
    },
    {
      name: "Anita Sharma",
      title: "Kiran Textiles Owner, Delhi",
      testimonial:
        "With DVYB, my online sales have doubled, and managing inventory has never been easier.",
      image: person_img,
      reached: "300+ new customers",
    },
    {
      name: "Vikram Patel",
      title: "Sutra Fabrics Owner, Ahmedabad",
      testimonial:
        "DVYB's customer support and tools helped me grow my business exponentially.",
      image: person_img,
      expanded: "4+ cities",
    },
    {
      name: "Priya Menon",
      title: "Lakshmi Silks Owner, Chennai",
      testimonial:
        "Online orders through DVYB have transformed my small shop into a thriving business.",
      image: person_img,
      reached: "400+ new customers",
    },
    {
      name: "Sunil Reddy",
      title: "Sai Textiles Owner, Hyderabad",
      testimonial:
        "DVYB's platform made it simple to reach new markets and increase my profits.",
      image: person_img,
      expanded: "6+ cities",
    },
  ];

  const getRotateClass = (idx) =>
    idx % 2 === 0 ? "rotate-[0eg]" : "rotate-[0deg]";

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-red-900">
          Why Vendors Love <span className="text-amber-600">DVYB</span>
        </h2>
        <p className="text-gray-600 text-sm md:text-base mt-1">
          Join thousands of successful vendors who've transformed their business
        </p>

        {/* Stats Boxes */}
        {/* <div className="mt-6 mb-4 inline-flex rounded-full overflow-hidden border border-gray-200 shadow-sm">
          <div className="bg-red-100 px-6 py-3 text-center">
            <p className="text-2xl font-semibold text-red-800">3,157+</p>
            <p className="text-xs text-gray-600">Active Vendors</p>
          </div>
          <div className="border-l border-r border-gray-200 bg-green-100 px-6 py-3 text-center">
            <p className="text-2xl font-semibold text-green-700">₹47Cr+</p>
            <p className="text-xs text-gray-600">Monthly Sales</p>
          </div>
          <div className="bg-yellow-100 px-6 py-3 text-center">
            <p className="text-2xl font-semibold text-amber-600">4.8/5</p>
            <p className="text-xs text-gray-600">App Rating</p>
          </div>
        </div> */}
        <div className="mt-6 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-0 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <div className="bg-red-100 px-4 sm:px-6 py-3 text-center">
            <p className="text-xl sm:text-2xl font-semibold text-red-800">
              3,157+
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Active Vendors</p>
          </div>

          <div className="border-t sm:border-t-0 sm:border-l sm:border-r border-gray-200 bg-green-100 px-4 sm:px-6 py-3 text-center">
            <p className="text-xl sm:text-2xl font-semibold text-green-700">
              ₹47Cr+
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Monthly Sales</p>
          </div>

          <div className="bg-yellow-50 px-4 sm:px-6 py-3 text-center">
            <p className="text-xl sm:text-2xl font-semibold text-amber-600">
              4.8/5
            </p>
            <p className="text-xs sm:text-sm text-gray-600">App Rating</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
            className={getRotateClass(index)}
          >
            <TestimonialCard {...testimonial} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
