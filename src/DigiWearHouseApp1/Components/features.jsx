import React from "react";
import { motion } from "framer-motion";
import { UsersRound, BarChartBig, Upload } from "lucide-react";

// This is a reusable component for the card's visual style.
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="flex h-[300px] w-full flex-col items-start bg-gradient-to-br from-red-100 to-red-200 p-8 text-start rounded-2xl shadow-lg border border-white/40">
      <div className="mb-4 text-black bg-[#FEC601] p-2 text-start rounded-2xl">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-start text-red-800">
        {title}
      </h3>
      <p className="mb-6 text-slate-600">{description}</p>
      {/* <button className="mt-auto rounded-full border border-white px-6 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white/50">
        Try Feature →
      </button> */}
    </div>
  );
};

const FeatureSection = () => {
  const features = [
    {
      icon: <UsersRound size={36} strokeWidth={1.5} />,
      title: "Customer Management ",
      description:
        "Build lasting relationships with customer profiles, purchase history.",
    },
    {
      icon: <BarChartBig size={36} strokeWidth={1.5} />,
      title: "Real-time Analytics",
      description:
        "Track sales, inventory levels, and profits in real-time with beautiful dashboards.",
    },
    {
      icon: <Upload size={36} strokeWidth={1.5} />,
      title: "Upload 1000+ Products",
      description:
        "Upload your entire inventory in minutes using Excel files or Upload images.",
    },
  ];

  const centerCardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const sideCardVariants = (direction) => ({
    hidden: {
      opacity: 0,
      scale: 0.8,
      x: "-50%",
      y: "-50%",
      zIndex: 10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: direction === "left" ? "-165%" : "65%",
      y: "-50%",
      zIndex: 20,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  });

  return (
    <>
      <div>
        <div className="text-center my-8">
          <h2 className="text-4xl md:text-5xl font-bold text-[#284F5E] mb-3">
            Powerful Features for Indian Businesses
          </h2>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed">
            Everything you need to digitize and grow your business, designed
            specifically for
            <br />
            Indian market needs
          </p>
        </div>
      </div>

      {/* Wrapper container flex with mobile column and desktop relative */}
      <div className="flex flex-col md:flex-wrap md:flex-row md:justify-center md:items-center md:pb-10 md:relative md:h-[380px] md:w-full">
        {/* Mobile stacked cards */}
        <div className="flex flex-col gap-6 md:hidden">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        {/* Desktop animated cards */}
        <motion.div
          className="hidden md:block relative h-[380px] w-[320px]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
        >
          {/* Left Card */}
          <motion.div
            className="absolute left-1/2 top-1/2"
            variants={sideCardVariants("left")}
          >
            <div className="h-[380px] w-[320px]">
              <FeatureCard {...features[0]} />
            </div>
          </motion.div>

          {/* Center Card */}
          <motion.div className="relative z-30" variants={centerCardVariants}>
            <div className="h-[380px] w-[320px]">
              <FeatureCard {...features[1]} />
            </div>
          </motion.div>

          {/* Right Card */}
          <motion.div
            className="absolute left-1/2 top-1/2"
            variants={sideCardVariants("right")}
          >
            <div className="h-[380px] w-[320px]">
              <FeatureCard {...features[2]} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default FeatureSection;
