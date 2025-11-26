import React, { useState } from "react";
import { uploadToCloudinary } from "../../utilities/cloudinary";
import { useNavigate } from "react-router-dom";



const UPLOAD_SECTIONS = [
  { id: "neckline", label: "Neckline Close-up view" },
  { id: "backNeckline", label: "Back Neckline Close-up view" },
  { id: "sleeve", label: "Sleeve Close-up View" },
  { id: "embroidery", label: "Embroidery/Work Detail view" },
];

const ImageUploader = ({ formData, onChange }) => {
  const [uploading, setUploading] = useState({});
  // const [showInstructions, setShowInstructions] = useState(false);
  const navigate = useNavigate();
  const [uploadedImages, setUploadedImages] = useState({
    neckline: null,
    backNeckline: null,
    sleeve: null,
    embroidery: null,
  });

  const handleFileUpload = async (sectionId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, [sectionId]: true }));

    try {
      const url = await uploadToCloudinary(file);
      setUploadedImages((prev) => ({ ...prev, [sectionId]: url }));

      // Update formData if needed
      const currentUrls = formData.imageUrls || [];
      onChange("imageUrls", [...currentUrls, url]);
    } catch (error) {
      alert(`Upload failed: ${error.message}. Please try again.`);
    } finally {
      setUploading((prev) => ({ ...prev, [sectionId]: false }));
      e.target.value = "";
    }
  };

  const handleRemoveImage = (sectionId) => {
    const imageUrl = uploadedImages[sectionId];
    if (imageUrl) {
      const newUrls = (formData.imageUrls || []).filter(
        (url) => url !== imageUrl
      );
      onChange("imageUrls", newUrls);
      setUploadedImages((prev) => ({ ...prev, [sectionId]: null }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Photos</h2>
        <p className="text-gray-600 mb-4">Add a Photo of your product</p>

        <button
          onClick={() => navigate("/instructions")}
          className="text-[#800000] hover:text-[#600000] font-medium flex items-center space-x-2" // <-- Changed
        >
          <span>View Instructions</span>
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
        </button>
      </div>



      {/* Upload Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {UPLOAD_SECTIONS.map((section) => (
          <div key={section.id} className="relative">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[180px] bg-white hover:border-[#800000] transition-colors">
              {" "}
              {/* <-- Changed */}
              {uploadedImages[section.id] ? (
                <>
                  <img
                    src={uploadedImages[section.id]}
                    alt={section.label}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <button
                    onClick={() => handleRemoveImage(section.id)}
                    className="text-red-500 text-sm hover:text-red-600"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-3">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 text-center mb-3">
                    {section.label}
                  </p>
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(section.id, e)}
                      className="hidden"
                      disabled={uploading[section.id]}
                    />
                    <span className="inline-block px-6 py-2  text-black border-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-sm">
                      {" "}
                      {/* <-- Changed */}
                      {uploading[section.id] ? "Uploading..." : "Upload"}
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
