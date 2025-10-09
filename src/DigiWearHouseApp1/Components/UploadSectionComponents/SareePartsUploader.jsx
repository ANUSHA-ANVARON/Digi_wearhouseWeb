// import React, { useState, useEffect } from 'react';
// import { Upload, X, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
// import { uploadToCloudinary } from '../../utilities/cloudinary';

// const SareePartsUploader = ({ formData = {}, onChange = () => {} }) => {
//   const [uploading, setUploading] = useState(false);
//   const [draggedPart, setDraggedPart] = useState(null);
//   const [error, setError] = useState(null);
//   const [generatingComplete, setGeneratingComplete] = useState(false);

//   const partLabels = {
//     blouse: { name: 'Blouse', description: 'The fitted upper garment/top part', icon: '👚' },
//     pleats: { name: 'pleates', description: 'The folded front portion of the saree', icon: '📏' },
//     pallu: { name: 'pallu', description: 'The decorative end piece over shoulder', icon: '🎨' },
//     shoulder: { name: 'shoulder', description: 'The shoulder draping portion', icon: '💫' }
//   };

//   const sareeParts = formData.sareeParts || {
//     blouse: { file: null, preview: null, url: null },
//     pleats: { file: null, preview: null, url: null },
//     pallu: { file: null, preview: null, url: null },
//     shoulder: { file: null, preview: null, url: null }
//   };

//   useEffect(() => {
//     const allPartsUploaded = Object.values(sareeParts).every(part => part.file);
//     const noGeneratedImage = !formData.generatedSareeImage;
    
//     if (allPartsUploaded && noGeneratedImage && !generatingComplete) {
//       console.log('All 4 parts uploaded, auto-generating complete saree...');
//       handleAutoGenerateCompleteSaree();
//     }
//   }, [sareeParts, formData.generatedSareeImage]);

//   const handleDrag = (e, partName) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDraggedPart(partName);
//     } else if (e.type === "dragleave") {
//       setDraggedPart(null);
//     }
//   };

//   const handleDrop = (e, partName) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDraggedPart(null);
    
//     const files = e.dataTransfer.files;
//     if (files && files[0]) {
//       handleFile(files[0], partName);
//     }
//   };

//   const handleFile = async (file, partName) => {
//     if (!file.type.startsWith('image/')) {
//       setError(`Please select a valid image file for ${partLabels[partName].name}`);
//       return;
//     }

//     setUploading(true);
//     setError(null);

//     try {
//       const previewUrl = URL.createObjectURL(file);
//       console.log(`Uploading ${partName} to Cloudinary...`);
//       const cloudinaryUrl = await uploadToCloudinary(file);
//       console.log(`${partName} uploaded:`, cloudinaryUrl);
      
//       const updatedParts = {
//         ...sareeParts,
//         [partName]: { 
//           file, 
//           preview: previewUrl, 
//           url: cloudinaryUrl 
//         }
//       };

//       onChange('sareeParts', updatedParts);
      
//       const currentImageUrls = formData.imageUrls || [];
//       const partIndex = Object.keys(partLabels).indexOf(partName);
//       const newImageUrls = [...currentImageUrls];
//       newImageUrls[partIndex + 1] = cloudinaryUrl;
//       onChange('imageUrls', newImageUrls);
      
//       console.log(`Updated imageUrls[${partIndex + 1}] with ${partName}:`, cloudinaryUrl);
//       setError(null);
//     } catch (err) {
//       console.error(`Upload failed for ${partName}:`, err);
//       setError(`Upload failed for ${partLabels[partName].name}: ${err.message}`);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleFileInput = (e, partName) => {
//     const file = e.target.files[0];
//     if (file) {
//       handleFile(file, partName);
//     }
//   };

//   const handleAutoGenerateCompleteSaree = async () => {
//     if (!getAllPartsUploaded()) {
//       console.log('Not all parts uploaded yet');
//       return;
//     }

//     setGeneratingComplete(true);
//     setError(null);
//     console.log('Starting AI saree generation...');

//     try {
//       const formDataToSend = new FormData();
      
//       Object.entries(sareeParts).forEach(([partName, partData]) => {
//         if (partData.file) {
//           formDataToSend.append(partName, partData.file);
//         }
//       });

//       console.log('Sending 4 saree parts to AI backend...');
      
//       const response = await fetch('/api/drape-saree-parts', {
//         method: 'POST',
//         body: formDataToSend,
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
//       }

//       const data = await response.json();

//       if (data.success) {
//         console.log('AI generation successful! Uploading to Cloudinary...');
        
//         const generatedImageBase64 = `data:${data.generatedImage.mimeType};base64,${data.generatedImage.data}`;
        
//         try {
//           const blob = await base64ToBlob(generatedImageBase64);
//           const generatedImageFile = new File([blob], 'generated-complete-saree.png', { type: 'image/png' });
          
//           console.log('Uploading generated saree to Cloudinary...');
//           const cloudinaryUrl = await uploadToCloudinary(generatedImageFile);
//           console.log('Generated saree uploaded:', cloudinaryUrl);
          
//           const currentImageUrls = formData.imageUrls || [];
//           const updatedImageUrls = [cloudinaryUrl, ...currentImageUrls.slice(1)];
          
//           onChange('generatedSareeImage', cloudinaryUrl);
//           onChange('imageUrls', updatedImageUrls);
          
//           if (data.uploadedParts) {
//             onChange('uploadedParts', data.uploadedParts);
//           }
          
//           console.log('Complete saree process finished!');
//           console.log('Final imageUrls:', updatedImageUrls);
          
//         } catch (uploadError) {
//           console.error('Cloudinary upload failed:', uploadError);
//           onChange('generatedSareeImage', generatedImageBase64);
//           setError('Generated saree created but upload failed. Saved temporarily.');
//         }
        
//       } else {
//         setError(data.error || 'Failed to generate complete saree from parts');
//         console.error('AI Backend error:', data);
//       }
//     } catch (err) {
//       console.error('Network/API error:', err);
//       setError(`API Error: ${err.message || 'Failed to connect to AI service'}`);
//     } finally {
//       setGeneratingComplete(false);
//     }
//   };

//   const clearPart = (partName) => {
//     if (sareeParts[partName].preview) {
//       URL.revokeObjectURL(sareeParts[partName].preview);
//     }
    
//     const updatedParts = {
//       ...sareeParts,
//       [partName]: { file: null, preview: null, url: null }
//     };
    
//     onChange('sareeParts', updatedParts);
    
//     const currentImageUrls = formData.imageUrls || [];
//     const partIndex = Object.keys(partLabels).indexOf(partName);
//     const newImageUrls = [...currentImageUrls];
//     newImageUrls[partIndex + 1] = null;
//     onChange('imageUrls', newImageUrls);
//   };

//   const clearAllParts = () => {
//     Object.keys(sareeParts).forEach(partName => {
//       if (sareeParts[partName].preview) {
//         URL.revokeObjectURL(sareeParts[partName].preview);
//       }
//     });
    
//     const clearedParts = {
//       blouse: { file: null, preview: null, url: null },
//       pleats: { file: null, preview: null, url: null },
//       pallu: { file: null, preview: null, url: null },
//       shoulder: { file: null, preview: null, url: null }
//     };
    
//     onChange('sareeParts', clearedParts);
//     onChange('generatedSareeImage', null);
//     onChange('imageUrls', []);
//     onChange('uploadedParts', null);
//     setError(null);
//   };

//   const getUploadedPartsCount = () => {
//     return Object.values(sareeParts).filter(part => part.file).length;
//   };

//   const getAllPartsUploaded = () => {
//     return Object.values(sareeParts).every(part => part.file);
//   };

//   const base64ToBlob = async (base64String) => {
//     const response = await fetch(base64String);
//     return response.blob();
//   };


//   const FashionLoader = () => {
//   return (
//     <div className="flex flex-col items-center justify-center p-6 animate-pulse">
//       <div className="w-20 h-20 rounded-full border-4 border-t-transparent border-pink-400 animate-spin mb-4"></div>
//       <p className="text-pink-600 font-medium text-sm tracking-wide">
//         Draping your Saree in style... ✨
//       </p>
//       <p className="text-gray-500 text-xs mt-1">AI is stitching the elegance</p>
//     </div>
//   );
// };

//   return (
//     <div className="max-w-6xl mx-auto p-6 bg-gray-50 ">
//       {/* Header */}
//       <div className="text-center mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Photos</h1>
//         <p className="text-gray-600 mb-4">Add a Photo of your product</p>
//         <div className="flex justify-end">
//           {/* <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2">
//             View Instructions
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//             </svg>
//           </button> */}
//         </div>
//       </div>

//       {/* Progress Bar */}
  
//   <div className="flex items-center justify-between mb-2">
//     <span className="text-sm font-medium text-gray-700">
//       Progress: {getUploadedPartsCount()}/4 parts uploaded
//       {formData.generatedSareeImage && (
//         <span className="ml-2 text-green-600">
//           (+ AI Complete Saree ✨)
//         </span>
//       )}
//     </span>

//     {getUploadedPartsCount() > 0 && (
//       <button
//         onClick={clearAllParts}
//         className="text-sm text-red-600 hover:text-red-800 font-medium"
//       >
//         Clear All
//       </button>
//     )}
//   </div>

//   {/* Progress Bar */}
  




//       {/* Upload Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//         {Object.entries(partLabels).map(([partName, partInfo]) => (
//           <div key={partName} className="bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-200">
//             {!sareeParts[partName].file ? (
//               <div
//                 className={`p-8 text-center transition-all duration-200 ${
//                   draggedPart === partName 
//                     ? 'border-blue-400 bg-blue-50' 
//                     : 'hover:bg-gray-50'
//                 }`}
//                 onDragEnter={(e) => handleDrag(e, partName)}
//                 onDragLeave={(e) => handleDrag(e, partName)}
//                 onDragOver={(e) => handleDrag(e, partName)}
//                 onDrop={(e) => handleDrop(e, partName)}
//               >
//                 <div className="flex flex-col items-center">
//                   <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                   </svg>
//                   <h3 className="text-lg font-semibold text-gray-800 mb-3">{partInfo.name}</h3>
//                   <label className="inline-flex items-center px-6 py-2 bg-[#75B4CB] text-white rounded-lg cursor-pointer  transition-colors font-medium">
//                     Upload
//                     <input
//                       type="file"
//                       className="hidden"
//                       accept="image/*"
//                       onChange={(e) => handleFileInput(e, partName)}
//                       disabled={uploading || generatingComplete}
//                     />
//                   </label>
//                 </div>
//               </div>
//             ) : (
//               <div className="relative p-4">
//                 <div className="relative rounded-lg overflow-hidden bg-gray-100">
//                   <img
//                     src={sareeParts[partName].preview}
//                     alt={`${partInfo.name} preview`}
//                     className="w-full h-48 object-cover"
//                   />
//                   <button
//                     onClick={() => clearPart(partName)}
//                     className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
//                     disabled={uploading || generatingComplete}
//                   >
//                     <X size={16} />
//                   </button>
//                 </div>
//                 <div className="mt-3 text-center">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-2">{partInfo.name}</h3>
//                   <div className="flex items-center justify-center gap-2">
//                     <CheckCircle className="text-green-500" size={16} />
//                     <span className="text-sm text-green-600 font-medium">Uploaded ✓</span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//   <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-sm font-medium text-gray-700">
//             Progress: {getUploadedPartsCount()}/4 parts uploaded
//             {formData.generatedSareeImage && (
//               <span className="ml-2 text-green-600">
//                 {generatingComplete ? '(Generating...)' : '(+ AI Complete Saree ✨)'}
//               </span>
//             )}
//           </span>
//           {getUploadedPartsCount() > 0 && (
//             <button
//               onClick={clearAllParts}
//               className="text-sm text-red-600 hover:text-red-800 font-medium"
//             >
//               Clear All
//             </button>
//           )}
//         </div>
//         <div className="w-full bg-gray-200 rounded-full h-2">
//           <div 
//             className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
//             style={{ width: `${(getUploadedPartsCount() / 4) * 100}%` }}
//           />
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 mb-6">
//           <AlertCircle className="text-red-500" size={20} />
//           <p className="text-red-700">{error}</p>
//         </div>
//       )}
// {/* Loader only while AI is generating */}
// {generatingComplete && (
//   <div className="mt-4">
//     <FashionLoader />
//   </div>
// )}

//       {/* Generated Saree Display */}
//       {formData.generatedSareeImage && (
//         <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
//           <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//             <CheckCircle className="text-green-600" />
//             AI Generated Complete Saree
//             <span className="text-sm text-green-600 font-normal">(Set as Primary Image)</span>
//           </h4>
//           <div className="relative rounded-xl overflow-hidden mb-4">
//             <img
//               src={formData.generatedSareeImage}
//               alt="AI generated complete draped saree"
//               className="w-full h-64 object-cover"
//             />
//           </div>
//           <div className="flex gap-3 items-center">
//             <button
//               onClick={() => {
//                 const link = document.createElement('a');
//                 link.href = formData.generatedSareeImage;
//                 link.download = 'ai-generated-complete-saree.png';
//                 link.click();
//               }}
//               className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
//               </svg>
//               Download AI Saree
//             </button>
//             <div className="text-xs text-gray-600 flex items-center px-3 bg-white rounded-lg py-2">
//               📊 Total Images: {formData.imageUrls?.length || 0}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SareePartsUploader;



import React, { useState, useEffect } from 'react';
import { Upload, X, CheckCircle, Sparkles, AlertCircle, Download } from 'lucide-react';
import { uploadToCloudinary } from '../../utilities/cloudinary';
import { useNavigate } from 'react-router-dom';

const SareePartsUploader = ({ formData = {}, onChange = () => {} }) => {
  const [uploading, setUploading] = useState(false);
  const [draggedPart, setDraggedPart] = useState(null);
  const [error, setError] = useState(null);
  const [generatingComplete, setGeneratingComplete] = useState(false);
const navigate=useNavigate()
  const partLabels = {
    blouse: { name: 'Blouse', description: 'The fitted upper garment/top part', icon: '👚' },
    pleats: { name: 'pleates', description: 'The folded front portion of the saree', icon: '📏' },
    pallu: { name: 'pallu', description: 'The decorative end piece over shoulder', icon: '🎨' },
    shoulder: { name: 'shoulder', description: 'The shoulder draping portion', icon: '💫' }
  };

  // View labels for the 4 generated views
  const viewLabels = {
    front: { name: 'Front View', description: 'Standing front pose', icon: '👗' },
    back: { name: 'Back View', description: 'Back draping view', icon: '🔄' },
    side: { name: 'Side View', description: 'Side profile pose', icon: '↔️' },
    sitting: { name: 'Sitting View', description: 'Front sitting pose', icon: '🪑' }
  };

  const sareeParts = formData.sareeParts || {
    blouse: { file: null, preview: null, url: null },
    pleats: { file: null, preview: null, url: null },
    pallu: { file: null, preview: null, url: null },
    shoulder: { file: null, preview: null, url: null }
  };

  useEffect(() => {
    const allPartsUploaded = Object.values(sareeParts).every(part => part.file);
    const noGeneratedViews = !formData.generatedSareeViews;
    
    if (allPartsUploaded && noGeneratedViews && !generatingComplete) {
      console.log('All 4 parts uploaded, auto-generating complete saree views...');
      handleAutoGenerateCompleteSaree();
    }
  }, [sareeParts, formData.generatedSareeViews]);

  const handleDrag = (e, partName) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDraggedPart(partName);
    } else if (e.type === "dragleave") {
      setDraggedPart(null);
    }
  };

  const handleDrop = (e, partName) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedPart(null);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0], partName);
    }
  };

  const handleFile = async (file, partName) => {
    if (!file.type.startsWith('image/')) {
      setError(`Please select a valid image file for ${partLabels[partName].name}`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const previewUrl = URL.createObjectURL(file);
      console.log(`Uploading ${partName} to Cloudinary...`);
      const cloudinaryUrl = await uploadToCloudinary(file);
      console.log(`${partName} uploaded:`, cloudinaryUrl);
      
      const updatedParts = {
        ...sareeParts,
        [partName]: { 
          file, 
          preview: previewUrl, 
          url: cloudinaryUrl 
        }
      };

      onChange('sareeParts', updatedParts);
      
      const currentImageUrls = formData.imageUrls || [];
      const partIndex = Object.keys(partLabels).indexOf(partName);
      const newImageUrls = [...currentImageUrls];
      newImageUrls[partIndex + 1] = cloudinaryUrl;
      onChange('imageUrls', newImageUrls);
      
      console.log(`Updated imageUrls[${partIndex + 1}] with ${partName}:`, cloudinaryUrl);
      setError(null);
    } catch (err) {
      console.error(`Upload failed for ${partName}:`, err);
      setError(`Upload failed for ${partLabels[partName].name}: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e, partName) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file, partName);
    }
  };

  const handleAutoGenerateCompleteSaree = async () => {
    if (!getAllPartsUploaded()) {
      console.log('Not all parts uploaded yet');
      return;
    }

    setGeneratingComplete(true);
    setError(null);
    console.log('Starting AI saree generation for all 4 views...');

    try {
      const formDataToSend = new FormData();
      
      Object.entries(sareeParts).forEach(([partName, partData]) => {
        if (partData.file) {
          formDataToSend.append(partName, partData.file);
        }
      });

      console.log('Sending 4 saree parts to AI backend...');
      
      const response = await fetch('/api/drape-saree-parts', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('AI generation successful for all views!');
        
        // Store all generated views and URLs
        onChange('generatedSareeViews', data.generatedViews);
        onChange('generatedSareeUrls', data.generatedUrls);
        
        // Set the front view as the primary image (index 0)
        // const frontViewUrl = data.generatedUrls.front;
        // if (frontViewUrl) {
        //   const currentImageUrls = formData.imageUrls || [];
        //   const updatedImageUrls = [frontViewUrl, ...currentImageUrls.slice(1)];
        //   onChange('imageUrls', updatedImageUrls);
        // }

        const generatedUrls = [
  data.generatedUrls.front,
  data.generatedUrls.back, 
  data.generatedUrls.side,
  data.generatedUrls.sitting
];

const partUrls = [
  sareeParts.blouse?.url,
  sareeParts.pleats?.url, 
  sareeParts.pallu?.url,
  sareeParts.shoulder?.url
];

const updatedImageUrls = [...generatedUrls, ...partUrls];
onChange('imageUrls', updatedImageUrls);
        
        if (data.uploadedParts) {
          onChange('uploadedParts', data.uploadedParts);
        }
        
        console.log('Complete saree generation process finished!');
        console.log('Generated views:', Object.keys(data.generatedViews));
        
      } else {
        setError(data.error || 'Failed to generate complete saree from parts');
        console.error('AI Backend error:', data);
      }
    } catch (err) {
      console.error('Network/API error:', err);
      setError(`API Error: ${err.message || 'Failed to connect to AI service'}`);
    } finally {
      setGeneratingComplete(false);
    }
  };

  const clearPart = (partName) => {
    if (sareeParts[partName].preview) {
      URL.revokeObjectURL(sareeParts[partName].preview);
    }
    
    const updatedParts = {
      ...sareeParts,
      [partName]: { file: null, preview: null, url: null }
    };
    
    onChange('sareeParts', updatedParts);
    
    const currentImageUrls = formData.imageUrls || [];
    const partIndex = Object.keys(partLabels).indexOf(partName);
    const newImageUrls = [...currentImageUrls];
    newImageUrls[partIndex + 1] = null;
    onChange('imageUrls', newImageUrls);
  };

  const clearAllParts = () => {
    Object.keys(sareeParts).forEach(partName => {
      if (sareeParts[partName].preview) {
        URL.revokeObjectURL(sareeParts[partName].preview);
      }
    });
    
    const clearedParts = {
      blouse: { file: null, preview: null, url: null },
      pleats: { file: null, preview: null, url: null },
      pallu: { file: null, preview: null, url: null },
      shoulder: { file: null, preview: null, url: null }
    };
    
    onChange('sareeParts', clearedParts);
    onChange('generatedSareeViews', null);
    onChange('generatedSareeUrls', null);
    onChange('imageUrls', []);
    onChange('uploadedParts', null);
    setError(null);
  };

  const getUploadedPartsCount = () => {
    return Object.values(sareeParts).filter(part => part.file).length;
  };

  const getAllPartsUploaded = () => {
    return Object.values(sareeParts).every(part => part.file);
  };

  const getGeneratedViewsCount = () => {
    return formData.generatedSareeViews ? Object.keys(formData.generatedSareeViews).length : 0;
  };

  // const base64ToBlob = async (base64String) => {
  //   const response = await fetch(base64String);
  //   return response.blob();
  // };

  const downloadView = (viewType) => {
    const viewData = formData.generatedSareeViews?.[viewType];
    const viewUrl = formData.generatedSareeUrls?.[viewType];
    
    if (viewUrl) {
      const link = document.createElement('a');
      link.href = viewUrl;
      link.download = `ai-generated-saree-${viewType}-view.png`;
      link.click();
    }
  };

  const FashionLoader = () => {
    return (
      <div className="flex flex-col items-center justify-center p-6 animate-pulse">
        <div className="w-20 h-20 rounded-full border-4 border-t-transparent border-pink-400 animate-spin mb-4"></div>
        <p className="text-pink-600 font-medium text-sm tracking-wide">
          Generating 4 stunning saree views... ✨
        </p>
        <p className="text-gray-500 text-xs mt-1">AI is creating multiple angles</p>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Photos</h1>
        <p className="text-gray-600 mb-4">Add Photos of your saree parts</p>
      </div>
      <div className='pb-6'>
        <button
            onClick={() => navigate("/instructions")}
          className="text-blue-600 cursor-pointer hover:text-blue-700 font-medium flex items-center space-x-2"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {Object.entries(partLabels).map(([partName, partInfo]) => (
          <div key={partName} className="bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-200">
            {!sareeParts[partName].file ? (
              <div
                className={`p-8 text-center transition-all duration-200 ${
                  draggedPart === partName 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onDragEnter={(e) => handleDrag(e, partName)}
                onDragLeave={(e) => handleDrag(e, partName)}
                onDragOver={(e) => handleDrag(e, partName)}
                onDrop={(e) => handleDrop(e, partName)}
              >
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">{partInfo.name}</h3>
                  <label className="inline-flex items-center px-6 py-2 bg-[#75B4CB] text-white rounded-lg cursor-pointer transition-colors font-medium">
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileInput(e, partName)}
                      disabled={uploading || generatingComplete}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="relative p-4">
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={sareeParts[partName].preview}
                    alt={`${partInfo.name} preview`}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => clearPart(partName)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    disabled={uploading || generatingComplete}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{partInfo.name}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <span className="text-sm text-green-600 font-medium">Uploaded ✓</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress: {getUploadedPartsCount()}/4 parts uploaded
            {formData.generatedSareeViews && (
              <span className="ml-2 text-green-600">
                {generatingComplete ? '(Generating...)' : `(+ ${getGeneratedViewsCount()} AI Views ✨)`}
              </span>
            )}
          </span>
          {getUploadedPartsCount() > 0 && (
            <button
              onClick={clearAllParts}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(getUploadedPartsCount() / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 mb-6">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loader while AI is generating */}
      {generatingComplete && (
        <div className="mt-4">
          <FashionLoader />
        </div>
      )}

      {/* Generated Saree Views Display */}
      {formData.generatedSareeViews && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" />
            AI Generated Saree Views ({getGeneratedViewsCount()}/4)
            <span className="text-sm text-green-600 font-normal">(Front set as Primary)</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {Object.entries(formData.generatedSareeViews).map(([viewType, viewData]) => {
              const viewUrl = formData.generatedSareeUrls?.[viewType];
              const viewLabel = viewLabels[viewType];
              
              return (
                <div key={viewType} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="relative rounded-lg overflow-hidden mb-3">
                    <img
                      src={viewUrl || `data:${viewData.mimeType};base64,${viewData.data}`}
                      alt={`AI generated ${viewLabel?.name || viewType} saree`}
                      className="w-full h-48 object-cover"
                    />
                    {viewType === 'front' && (
                      <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Primary
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-800">{viewLabel?.name || viewType}</h5>
                      <p className="text-xs text-gray-500">{viewLabel?.description || ''}</p>
                    </div>
                    
                    <button
                      onClick={() => downloadView(viewType)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title={`Download ${viewLabel?.name || viewType}`}
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={() => {
                // Download all views as a zip would be ideal, but for now just download front view
                const frontUrl = formData.generatedSareeUrls?.front;
                if (frontUrl) {
                  const link = document.createElement('a');
                  link.href = frontUrl;
                  link.download = 'ai-generated-saree-front-view.png';
                  link.click();
                }
              }}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Primary View
            </button>
            <div className="text-xs text-gray-600 flex items-center px-3 bg-white rounded-lg py-2">
              📊 Total Generated: {getGeneratedViewsCount()} views
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SareePartsUploader;