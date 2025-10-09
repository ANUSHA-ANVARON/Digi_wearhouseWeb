import React from "react";
import { useNavigate } from "react-router-dom";
import dos1 from "../../assets/instructions/dos1.png"
import dos2 from "../../assets/instructions/dos2.png"
import dos3 from "../../assets/instructions/dos3.png"
import donts1 from "../../assets/instructions/donts1.png"
import donts2 from "../../assets/instructions/donts2.png"
import donts3 from "../../assets/instructions/donts3.png"

export default function ViewInstructionsPage() {
  const navigate = useNavigate();
  const handlenavigateback = () => {
    navigate(-1);
  };
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="flex gap-10 mb-6">
        {/* Back Button */}
        <div>
        <span
          className="text-[20px] font-medium hover:underline cursor-pointer"
          onClick={handlenavigateback}
        >
          ← Back
        </span>
        </div>

        {/* Heading + Description */}
        <div className="text-center sm:text-left mt-2 sm:mt-0">
          <h2 className="text-xl font-semibold text-gray-800">DO’S & DON’TS</h2>
          <p className="text-sm text-gray-600">
            Follow these tips for the best photos!
          </p>
        </div>
      </div>

      {/* Do's Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <span className="text-green-500 text-2xl mr-2">✔</span>
          <h3 className="text-lg font-semibold text-gray-800">Do’s</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Do Item */}
          <div className="bg-green-50 p-4 rounded-xl flex flex-col items-center text-center shadow-sm">
            <img
              src={dos1}
              alt="neutral background"
              className="w-full h-52 object-contain mb-3 rounded-lg"
            />
            <h4 className="font-medium text-gray-800">
              Use a neutral background
            </h4>
            <p className="text-sm text-gray-600">
              Keep the background simple and clean.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-xl flex flex-col items-center text-center shadow-sm">
            <img
                src={dos2}
              alt="show entire item"
              className="w-full h-52 object-contain mb-3 rounded-lg"
            />
            <h4 className="font-medium text-gray-800">Show the entire item</h4>
            <p className="text-sm text-gray-600">
              Capture the full product without cropping.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-xl flex flex-col items-center text-center shadow-sm">
            <img
              src={dos3}
              alt="clear and well lit"
              className="w-full h-52 object-contain mb-3 rounded-lg"
            />
            <h4 className="font-medium text-gray-800">Clear and well-lit</h4>
            <p className="text-sm text-gray-600">
              Ensure your photos are sharp and bright.
            </p>
          </div>
        </div>
      </div>

      {/* Don’ts Section */}
      <div>
        <div className="flex items-center mb-4">
          <span className="text-red-500 text-2xl mr-2">✘</span>
          <h3 className="text-lg font-semibold text-gray-800">Don’ts</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-red-50 p-4 rounded-xl flex flex-col items-center text-center shadow-sm">
            <img
                src={donts1}
              alt="poor lighting"
              className="w-full h-52 object-contain mb-3 rounded-lg"
            />
            <h4 className="font-medium text-gray-800">Avoid poor lighting</h4>
            <p className="text-sm text-gray-600">
              Ensure your photos are well-lit and bright.
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-xl flex flex-col items-center text-center shadow-sm">
            <img
              src={donts2}
              alt="cluttered background"
              className="w-full h-52 object-contain mb-3 rounded-lg"
            />
            <h4 className="font-medium text-gray-800">Cluttered background</h4>
            <p className="text-sm text-gray-600">
              Keep the background simple and clean.
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-xl flex flex-col items-center text-center shadow-sm">
            <img
            src={donts3}
              alt="blurry photos"
              className="w-full h-52 object-contain mb-3 rounded-lg"
            />
            <h4 className="font-medium text-gray-800">Avoid blurry photos</h4>
            <p className="text-sm text-gray-600">
              Ensure your photos are sharp and in focus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
