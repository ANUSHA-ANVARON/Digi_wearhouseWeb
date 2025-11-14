import React from "react";

const NavigationButtons = ({
  onBack,
  onNext,
  isLastTab,
  onSubmit,
  isFirstTab = false,
  disableSubmit = false,
}) => (
  <div className="flex justify-between pt-6 md:pt-8 border-gray-200">
    {!isFirstTab && (
      <button
        onClick={onBack}
        className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Back</span>
      </button>
    )}

    <button
      onClick={isLastTab ? onSubmit : onNext}
      disabled={isLastTab && disableSubmit}
      className="flex items-center space-x-2 bg-[#800000] hover:bg-[#800000] text-white px-6 py-3 rounded-lg font-medium transition-colors ml-auto"
    >
      <span>{isLastTab ? "Submit" : "Next"}</span>
      {!isLastTab && (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      )}
    </button>
  </div>
);

export default NavigationButtons;
