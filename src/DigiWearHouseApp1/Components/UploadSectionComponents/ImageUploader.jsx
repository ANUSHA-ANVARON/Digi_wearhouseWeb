// // import React from 'react';
// // import { useImageUpload } from '../../CustomHooks/useImageUpload';
// // import { UPLOAD_CONFIG } from '../../constants/productConstants';

// // components/products/upload/components/upload/ImageUploader.jsx
// import React, { useState } from 'react';
// import { useImageUpload } from '../../CustomHooks/useImageUpload';
// import { uploadToCloudinary } from '../../utilities/cloudinary';
//  import { UPLOAD_CONFIG } from '../../constants/productConstants'

// const ImageUploader = ({ formData, onChange, onUploadClick }) => {
//   const [uploading, setUploading] = useState(false);
//   const [showModal, setShowModal] = useState(false);

//   const { error, canUpload } = useImageUpload(
//     formData.imageUrls,
//     (urls) => onChange("imageUrls", urls)
//   );

//   const handleUploadClick = () => {
//     setShowModal(true);
//   };

//   const handleModalChoice = (choice) => {
//     setShowModal(false);
//     if (choice === "single") {
//       document.getElementById("file-input").click();
//     } else if (choice === "bulk") {
//       // Handle bulk upload - you can pass this up or handle it here
//       if (onUploadClick) {
//         onUploadClick("bulk");
//       }
//     }
//   };

//   const handleFileUpload = async (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;

//     if (formData.imageUrls.length + files.length > UPLOAD_CONFIG.MAX_IMAGES) {
//       alert(`You can only upload ${UPLOAD_CONFIG.MAX_IMAGES - formData.imageUrls.length} more images. Maximum ${UPLOAD_CONFIG.MAX_IMAGES} images allowed.`);
//       return;
//     }

//     setUploading(true);
//     try {
//       const uploadedUrls = [];
//       for (const file of files) {
//         const url = await uploadToCloudinary(file);
//         uploadedUrls.push(url);
//       }

//       const newImageUrls = [...formData.imageUrls, ...uploadedUrls];
//       onChange("imageUrls", newImageUrls);
//     } catch (error) {
//       alert(`Upload failed: ${error.message}. Please try again.`);
//     } finally {
//       setUploading(false);
//       e.target.value = "";
//     }
//   };

//   const handleRemoveImage = (index) => {
//     const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
//     onChange("imageUrls", newImageUrls);
//   };

//   return (
//     <div>
//       <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
//         Upload Photos
//       </h3>
//       <p className="text-gray-600 text-sm md:text-base mb-6">
//         Add photos of your product ({formData.imageUrls.length}/{UPLOAD_CONFIG.MAX_IMAGES} images)
//       </p>
      
//       <div
//         className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
//           canUpload ? "border-gray-300 hover:border-blue-400 cursor-pointer" : "border-gray-200 bg-gray-50"
//         }`}
//         onClick={canUpload ? handleUploadClick : undefined}
//       >
//         <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
//           <svg
//             className="w-8 h-8 text-gray-400"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={1.5}
//               d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
//             />
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={1.5}
//               d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
//             />
//           </svg>
//         </div>
        
//         {canUpload ? (
//           <div className="text-gray-700 font-medium hover:text-gray-900">
//             {uploading ? "Uploading..." : "Click to add photos"}
//           </div>
//         ) : (
//           <div className="text-gray-500">
//             {uploading ? "Uploading..." : "Maximum images reached"}
//           </div>
//         )}
//       </div>

//       {/* Hidden file input */}
//       <input
//         id="file-input"
//         type="file"
//         multiple
//         accept="image/*"
//         onChange={handleFileUpload}
//         className="hidden"
//         disabled={uploading}
//       />

//       {error && (
//         <p className="mt-2 text-sm text-red-500">{error}</p>
//       )}

//       <div className="mt-4 text-sm text-gray-500 text-center">
//         <p>• Accepted formats: JPG, PNG, GIF</p>
//         <p>• Maximum file size: 5MB per image</p>
//         <p>• You can select multiple images at once</p>
//       </div>

//       {formData.imageUrls?.length > 0 && (
//         <div className="mt-6">
//           <h4 className="text-sm font-medium text-gray-700 mb-3">
//             Uploaded Images ({formData.imageUrls.length}/{UPLOAD_CONFIG.MAX_IMAGES})
//           </h4>
//           <div className="grid grid-cols-2 gap-4">
//             {formData.imageUrls.map((imageUrl, index) => (
//               <div key={index} className="relative group">
//                 <img
//                   src={imageUrl}
//                   alt={`Product ${index + 1}`}
//                   className="w-full h-32 object-cover rounded-lg border border-gray-200"
//                 />
//                 <button
//                   onClick={() => handleRemoveImage(index)}
//                   className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
//                   title="Remove image"
//                 >
//                   ×
//                 </button>
//                 <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
//                   {index + 1}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       <CaptureInstructions />

//       {/* Upload Choice Modal */}
//       {showModal && (
//         <div className="fixed bg-black/20 backdrop-blur-sm inset-0 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
//             <button
//               onClick={() => setShowModal(false)}
//               className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//             <div className="text-center">
//               <h3 className="text-lg font-semibold text-gray-900 mb-6">Select one</h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <button
//                   onClick={() => handleModalChoice("single")}
//                   className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
//                 >
//                   <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
//                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                     </svg>
//                   </div>
//                   <span className="text-sm font-medium text-gray-700">Add One Product</span>
//                 </button>
//                 <button
//                   onClick={() => handleModalChoice("bulk")}
//                   className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
//                 >
//                   <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center mb-3">
//                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                   </div>
//                   <span className="text-sm font-medium text-gray-700">Add Bulk Products</span>
//                 </button>
//               </div>
//               <div className="mt-6 text-center">
//                 <a href="#" className="text-sm text-blue-500 hover:text-blue-600 flex items-center justify-center space-x-1">
//                   <span>Need help</span>
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const CaptureInstructions = () => (
//   <div className="mt-8">
//     <div className="flex items-center justify-between mb-4">
//       <h4 className="text-base md:text-lg font-medium text-gray-900">
//         Capture Instructions
//       </h4>
//       <button className="text-blue-500 text-sm hover:text-blue-600 flex items-center space-x-1">
//         <span>View</span>
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//         </svg>
//       </button>
//     </div>
    
//     <ul className="space-y-3 text-sm md:text-base text-gray-600">
//       {[
//         "Click 'Upload Photo beside the product name.",
//         "Include Image details in the description.",
//         "Set the price before uploading the image",
//         "If multiple images are allowed, specify the number.",
//         "Select the right category for your image",
//         "Choose the brand linked to the product image."
//       ].map((instruction, index) => (
//         <li key={index} className="flex items-start space-x-2">
//           <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
//           <span>{instruction}</span>
//         </li>
//       ))}
//     </ul>
//   </div>
// );

// export default ImageUploader;





import React, { useState } from 'react';
import { uploadToCloudinary } from '../../utilities/cloudinary';
import { useNavigate } from 'react-router-dom';

const BLOUSE_TYPES = [
  "Round Neck Blouse",
  "Boat Neck Blouse",
  "Halter Neck Blouse",
  "Collar Blouse",
  "Backless",
  "Off-Shoulder Blouse",
  "Cape Style Blouse"
];

const UPLOAD_SECTIONS = [
  { id: 'neckline', label: 'Neckline Close-up view' },
  { id: 'backNeckline', label: 'Back Neckline Close-up view' },
  { id: 'sleeve', label: 'Sleeve Close-up View' },
  { id: 'embroidery', label: 'Embroidery/Work Detail view' }
];

const ImageUploader = ({ formData, onChange }) => {
  const [uploading, setUploading] = useState({});
  const [selectedBlouseType, setSelectedBlouseType] = useState('');
  // const [showInstructions, setShowInstructions] = useState(false);
  const navigate=useNavigate()
  const [uploadedImages, setUploadedImages] = useState({
    neckline: null,
    backNeckline: null,
    sleeve: null,
    embroidery: null
  });

  const handleFileUpload = async (sectionId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [sectionId]: true }));
    
    try {
      const url = await uploadToCloudinary(file);
      setUploadedImages(prev => ({ ...prev, [sectionId]: url }));
      
      // Update formData if needed
      const currentUrls = formData.imageUrls || [];
      onChange("imageUrls", [...currentUrls, url]);
    } catch (error) {
      alert(`Upload failed: ${error.message}. Please try again.`);
    } finally {
      setUploading(prev => ({ ...prev, [sectionId]: false }));
      e.target.value = "";
    }
  };

  const handleRemoveImage = (sectionId) => {
    const imageUrl = uploadedImages[sectionId];
    if (imageUrl) {
      const newUrls = (formData.imageUrls || []).filter(url => url !== imageUrl);
      onChange("imageUrls", newUrls);
      setUploadedImages(prev => ({ ...prev, [sectionId]: null }));
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
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
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

    

      {/* Blouse Types Dropdown */}
      <div className="mb-6">
        <div className="relative">
          <select
            value={selectedBlouseType}
            onChange={(e) => setSelectedBlouseType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Blouse Types</option>
            {BLOUSE_TYPES.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg 
              className="w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Upload Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {UPLOAD_SECTIONS.map((section) => (
          <div key={section.id} className="relative">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[180px] bg-white hover:border-blue-400 transition-colors">
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
                    <span className="inline-block px-6 py-2 bg-blue-400 text-white rounded-lg cursor-pointer hover:bg-blue-500 transition-colors text-sm">
                      {uploading[section.id] ? 'Uploading...' : 'Upload'}
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