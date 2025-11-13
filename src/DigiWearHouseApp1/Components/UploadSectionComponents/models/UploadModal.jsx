import React from "react";

const UploadModal = ({ show, onClose, onChoice }) => {
  if (!show) return null;

  return (
    <div className="fixed bg-black/20 backdrop-blur-sm inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Select one
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onChoice("single")}
              className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">
                Add One Product
              </span>
            </button>

            <button
              onClick={() => onChoice("bulk")}
              className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">
                Add Bulk Products
              </span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-sm text-[#800000] hover:text-blue-600 flex items-center justify-center space-x-1"
            >
              <span>Need help</span>
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
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
