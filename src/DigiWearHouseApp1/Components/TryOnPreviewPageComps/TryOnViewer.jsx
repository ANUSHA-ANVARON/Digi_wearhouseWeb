// import React from 'react';
// import { productUtils, STATIC_MODEL_IMAGE } from '../../utilities/ProductUtils';

// export const TryOnViewer = ({ 
//   productData, 
//   isProcessing, 
//   tryOnResult, 
//   setTryOnResult, 
//   selectedImageIndex, 
//   handleTryOn 
// }) => {
//   const displayImages = productUtils.getDisplayImages(productData);
//   const isSaree = productUtils.isSareeProduct(productData);
  
//   return (
//     <div className="bg-blue-50 rounded-lg p-6">
//       <div className="flex gap-4">
//         <div className="flex-1">
//           <div className="rounded-lg overflow-hidden aspect-[3/4] relative">
//             {isProcessing ? (
//               <div className="absolute inset-0 flex flex-col items-center justify-center">
//                 <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
//                 <div className="font-medium text-white">Processing Try-On...</div>
//               </div>
//             ) : tryOnResult ? (
//               <div className="w-full h-full relative">
//                 <img src={tryOnResult} alt="Try-on Result" className="w-full h-full object-cover object-top" />
//                 <button
//                   onClick={() => setTryOnResult(null)}
//                   className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs hover:bg-opacity-70 transition-opacity"
//                 >
//                   Reset
//                 </button>
//               </div>
//             ) : (
//               <div className="w-full h-full relative flex items-center justify-center">
//                 <img src={STATIC_MODEL_IMAGE} alt="Model" className="w-full h-full object-cover object-top" />
//                 <div className="absolute bottom-4 left-4 right-4 text-center">
//                   <div className="text-white font-medium">Front view</div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
        
//         <div className="w-20 space-y-3">
//           {/* <span className="pb-2 font-bold">Try Preview</span> */}
//           {displayImages.length > 0 ? (
//             displayImages.map((imageData, index) => (
//               <div key={`${imageData.type}-${imageData.name}`} className="relative">
//                 <button
//                   onClick={() => handleTryOn(index, imageData, productData)}
//                   disabled={isProcessing || (isSaree && imageData.type === 'part')}
//                   className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
//                     selectedImageIndex === index ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"
//                   } ${
//                     isProcessing || (isSaree && imageData.type === 'part') 
//                       ? "opacity-50 cursor-not-allowed" 
//                       : "cursor-pointer hover:scale-105"
//                   }`}
//                 >
//                   <img 
//                     src={imageData.url} 
//                     alt={imageData.label} 
//                     className="w-full h-full object-cover" 
//                   />
//                 </button>
                
//                 {isSaree && (
//                   <>
//                     <div className="absolute -bottom-1 left-0 right-0">
//                       <div className="bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded text-center">
//                         {imageData.label}
//                       </div>
//                     </div>
//                     {imageData.type === 'generated' && (
//                       <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
//                     )}
//                   </>
//                 )}
//               </div>
//             ))
//           ) : (
//             Array.from({ length: 4 }).map((_, i) => (
//               <div key={i} className="w-full aspect-square bg-pink-300 rounded-lg flex items-center justify-center">
//                 <span className="text-white text-lg">👗</span>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
import React from 'react';
import { productUtils, STATIC_MODEL_IMAGE } from '../../utilities/ProductUtils';

export const TryOnViewer = ({ 
  productData, 
  isProcessing, 
  tryOnResult, 
  setTryOnResult, 
  selectedImageIndex, 
  handleTryOn 
}) => {
  const displayImages = productUtils.getDisplayImages(productData);
  const isSaree = productUtils.isSareeProduct(productData);
  const defaultPreview = displayImages[0]?.url || STATIC_MODEL_IMAGE;
  
  return (
    <div className="bg-blue-50 rounded-lg p-6">
      <div className="flex gap-4">
        <div className="flex-1">
                    <span className="pb-2 font-bold font">Preview</span>
          <div className="rounded-lg overflow-hidden aspect-[3/4] relative">
            {isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
                <div className="font-medium text-white">Processing Try-On...</div>
              </div>
            ) : tryOnResult ? (
              <div className="w-full h-full relative">
                
                <img src={tryOnResult} alt="Try-on Result" className="w-full h-full object-cover object-top" />
                <button
                  onClick={() => setTryOnResult(null)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs hover:bg-opacity-70 transition-opacity"
                >
                  Model
                </button>
              </div>
            ) : (
              
              <div className="w-full h-full relative flex items-center justify-center">
                
                <img src={defaultPreview} alt="Preview" className="w-full h-full object-cover object-top" />
              </div>
            )}
          </div>
        </div>
        
        <div className="w-20 space-y-3">

          {displayImages.length > 0 ? (
            displayImages.map((imageData, index) => (
              <div key={`${imageData.type}-${imageData.name}`} className="relative">
         <button
  onClick={() => {
    setTryOnResult(imageData.url);
  }}
  disabled={isProcessing || (isSaree && imageData.type === 'part')}
  className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
    selectedImageIndex === index
      ? "border-blue-500 ring-2 ring-blue-200"
      : "border-gray-200 hover:border-gray-300"
  } ${
    isProcessing || (isSaree && imageData.type === 'part')
      ? "opacity-50 cursor-not-allowed"
      : "cursor-pointer hover:scale-105"
  }`}
>
  <img
    src={imageData.url}
    alt={imageData.label}
    className="w-full h-full object-cover"
  />
</button>

                {isSaree && (
                  <>
                    {imageData.type === 'generated' && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </>
                )}
              </div>
            ))
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-full aspect-square bg-pink-300 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">👗</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};