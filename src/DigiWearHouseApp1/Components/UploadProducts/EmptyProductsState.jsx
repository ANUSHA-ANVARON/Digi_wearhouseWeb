import React from "react";
import BackButton from "../UploadSectionComponents/BackButton";

const EmptyProductsState = ({ onAddProduct }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    {/* Header */}
    <div className="flex items-center p-4 md:p-6">
      <BackButton onClick={() => window.history.back()} />
    </div>

    {/* Main Content */}
    <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
      <div className="text-center max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold text-[#80000]-500 mb-4">
          Your Products
        </h1>
        <p className="text-gray-700 text-base md:text-lg mb-12">
          Looks like you don't have any products yet!
        </p>

        {/* Empty Box Illustration */}
        <div className="mb-12 flex justify-center">
          <div className="relative">
            <div className="w-32 h-24 md:w-40 md:h-28 bg-gray-300 rounded-lg shadow-lg relative">
              <div className="absolute -top-2 left-2 right-2 h-4 bg-gray-400 rounded-t-lg"></div>
              <div className="absolute -top-1 left-4 right-4 h-3 bg-gray-200 rounded-t-lg"></div>
              <div className="absolute bottom-2 right-2 w-3 h-3 bg-blue-400 rounded"></div>
            </div>
            <div className="absolute -bottom-2 left-2 right-2 h-2 bg-gray-200 rounded-full opacity-50"></div>
          </div>
        </div>

        <button
          onClick={onAddProduct}
          className="bg-[#80000]-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-medium text-base md:text-lg transition-colors flex items-center space-x-3 mx-auto"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>Add Product</span>
        </button>
      </div>
    </div>
  </div>
);

export default EmptyProductsState;
