import React, { useState } from "react";
import { ArrowLeft, Package, Edit } from "lucide-react";
import { useApp } from "../../context/Context";
import { useNavigate } from "react-router-dom";

// Import hooks
import { useTryOnLogic } from "../../../hooks/useTryOnLogic";
import { useProductSubmission } from "../../CustomHooks/useProductSubmission";

// Import components
import { SubmitStatusAlert } from "../../Components/TryOnPreviewPageComps/SubmitStatusAlert";
import { ProductDetailsCard } from "../../Components/TryOnPreviewPageComps/ProductDetailsCard";
import { InventoryCard } from "../../Components/TryOnPreviewPageComps/InventoryCard";
import { PricingCard } from "../../Components/TryOnPreviewPageComps/PricingCard";
import { StatsCard } from "../../Components/TryOnPreviewPageComps/StatsCard";
import { VariantsCard } from "../../Components/TryOnPreviewPageComps/VariantsCard";
import { TryOnViewer } from "../../Components/TryOnPreviewPageComps/TryOnViewer";

// Import utils
import { productUtils } from "../../utilities/ProductUtils";

export default function TryonPreview() {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { productData, currentUser } = useApp();
  const navigate = useNavigate();

  const tryOnLogic = useTryOnLogic();
  const submissionLogic = useProductSubmission();

  const ProductOverviewPage = () => (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <SubmitStatusAlert
        submitStatus={submissionLogic.submitStatus}
        submitMessage={submissionLogic.submitMessage}
      />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 mr-2 text-gray-600" />
          <span className="text-gray-800 font-medium">Product Overview</span>
          {currentUser && (
            <span className="ml-auto text-sm text-gray-500">
              User: {currentUser.email}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ProductDetailsCard productData={productData} />
            <InventoryCard productData={productData} />
          </div>

          <div className="space-y-6">
            <PricingCard productData={productData} />
            <StatsCard productData={productData} />
            <VariantsCard productData={productData} />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
              <span className="text-green-800 font-medium">
                Ready to Publish
              </span>
            </div>
            <p className="text-sm text-start text-green-700 mt-1">
              This product will be saved to your account and can be made live
              for customers to purchase.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsPreviewMode(true)}
              className="bg-[#7DBBD1]  text-white px-6 py-2 rounded-lg font-medium transition-colors"
              disabled={submissionLogic.isSubmitting}
            >
              Preview
            </button>
            <button
              onClick={() => submissionLogic.handleSubmit(productData)}
              disabled={submissionLogic.isSubmitting || !currentUser}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                submissionLogic.isSubmitting || !currentUser
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {submissionLogic.isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                "Save Product"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ProductPreviewPage = () => {
    const isSaree = productUtils.isSareeProduct(productData);

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <SubmitStatusAlert
          submitStatus={submissionLogic.submitStatus}
          submitMessage={submissionLogic.submitMessage}
        />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => setIsPreviewMode(false)}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="font-medium">Product Preview</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <span className="text-sm text-gray-500">
                  User: {currentUser.email}
                </span>
              )}
              <button className="flex items-center text-gray-600 hover:text-gray-800">
                <Edit className="w-4 h-4 mr-1" />
                <span className="text-sm">Edit</span>
              </button>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-6">
            {isSaree
              ? "Click on the complete saree to see try-on results"
              : "Click on garment images to see try-on results"}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    Product Details
                  </span>
                </div>
                <div className="space-y-2 text-start p-3">
                  <div className="text-lg font-semibold text-gray-900">
                    {productData.title || "Untitled Product"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {productData.category || "No Category"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {productData.dressType || "No Type"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {productData.fabric || "No Fabric"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Type: {productData.productType || "Ready to Wear"}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    Pricing & Inventory
                  </span>
                </div>
                <div className="space-y-2 text-start p-5">
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{productData.price || "0"}
                  </div>
                  <div className="text-sm text-gray-500">Base Price</div>
                  {!isSaree && (
                    <>
                      <div className="text-sm text-blue-600">
                        Available Sizes:{" "}
                        {productData.selectedSizes?.join(", ") || "None"}
                      </div>
                      <div className="text-sm text-blue-600">
                        Available Colors:{" "}
                        {productData.selectedColors
                          ?.map(productUtils.getColorDisplayName)
                          .join(", ") || "None"}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <TryOnViewer
                productData={productData}
                isProcessing={tryOnLogic.isProcessing}
                tryOnResult={tryOnLogic.tryOnResult}
                setTryOnResult={tryOnLogic.setTryOnResult}
                selectedImageIndex={tryOnLogic.selectedImageIndex}
                handleTryOn={tryOnLogic.handleTryOn}
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => submissionLogic.handleSubmit(productData)}
              disabled={submissionLogic.isSubmitting || !currentUser}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                submissionLogic.isSubmitting || !currentUser
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-[#7DBBD1] text-white"
              }`}
            >
              {submissionLogic.isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving to Firebase...
                </div>
              ) : (
                "Submit Product"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {isPreviewMode ? <ProductPreviewPage /> : <ProductOverviewPage />}
    </div>
  );
}

//old

// import React, { useState } from "react";
// import { ArrowLeft, Package, Edit, CheckCircle, AlertCircle } from "lucide-react";
// import { useApp } from "../../context/Context";
// import firebaseService from "../../../SERVICES/firebaseService";
// import { useNavigate } from "react-router-dom";

// export default function TryonPreview() {
//   const [isPreviewMode, setIsPreviewMode] = useState(false);
//   const [selectedImageIndex, setSelectedImageIndex] = useState(0);
//   const [tryOnResult, setTryOnResult] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitStatus, setSubmitStatus] = useState(null);
//   const [submitMessage, setSubmitMessage] = useState("");
//   const { productData, updateProductData, currentUser } = useApp();
//   const navigate = useNavigate();

//   const staticModelImage = "https://res.cloudinary.com/doiezptnn/image/upload/v1754996630/qgxzm85zvkchgssliiww.png";

//   // Helper function to check if it's a saree product
//   const isSareeProduct = () => {
//     const dressType = productData?.dressType?.toLowerCase() || '';
//     return dressType.includes('saree') || dressType.includes('sari');
//   };

//   // Helper function to get saree images
//   const getSareeImages = () => {
//     if (!productData.sareeParts) return [];

//     const sareeImages = [];

//     if (productData.generatedSareeImage) {
//       sareeImages.push({
//         url: productData.generatedSareeImage,
//         type: 'generated',
//         name: 'complete_saree',
//         label: 'Complete Saree'
//       });
//     }
//     // Add individual saree parts first
//     Object.entries(productData.sareeParts).forEach(([partName, partData]) => {
//       if (partData.preview || partData.url) {
//         sareeImages.push({
//           url: partData.preview || partData.url,
//           type: 'part',
//           name: partName,
//           label: partName.charAt(0).toUpperCase() + partName.slice(1)
//         });
//       }
//     });

//     // Add generated saree image last (this is the main one for try-on)

//     return sareeImages;
//   };

//   // Get display images based on product type
//   const getDisplayImages = () => {
//     if (isSareeProduct()) {
//       return getSareeImages();
//     }
//     return productData.imageUrls?.map((url, index) => ({
//       url,
//       type: 'regular',
//       name: `image_${index}`,
//       label: `Image ${index + 1}`
//     })) || [];
//   };

//   const TestFirebaseButton = () => {
//     const runFirestoreTests = async () => {
//       if (!currentUser) {
//         alert("Please log in first");
//         return;
//       }
//       try {
//         const testResult = await firebaseService.testFirestoreConnection(currentUser.uid);
//         if (testResult.success) {
//           console.log("All tests passed!", testResult);
//           alert("All Firestore tests passed! Check console for details.");
//         } else {
//           console.error("Tests failed:", testResult);
//           alert("Tests failed: " + testResult.error);
//         }
//       } catch (error) {
//         console.error("Test execution failed:", error);
//         alert("Test execution failed: " + error.message);
//       }
//     };

//     return (
//       <button
//         onClick={runFirestoreTests}
//         className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors z-50"
//       >
//         Test Firestore
//       </button>
//     );
//   };

//   const handleThumbnailClick = async (index, imageData = null) => {
//     setSelectedImageIndex(index);

//     let garmentImageUrl;

//     if (imageData) {
//       // For saree products, only allow try-on for generated complete saree
//       if (isSareeProduct() && imageData.type !== 'generated') {
//         console.log("Try-on only available for complete saree");
//         return;
//       }
//       garmentImageUrl = imageData.url;
//     } else if (productData.imageUrls && productData.imageUrls[index]) {
//       // Regular product images
//       garmentImageUrl = productData.imageUrls[index];
//     } else {
//       console.log("No garment image available");
//       return;
//     }

//     setIsProcessing(true);
//     setTryOnResult(null);

//     try {
//       const response = await fetch("/api/tryon", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           modelImage: staticModelImage,
//           garmentImage: garmentImageUrl,
//         }),
//       });

//       if (!response.ok) throw new Error(`Backend error: ${response.status}`);

//       const data = await response.json();
//       if (data.output && data.output.length > 0) {
//         setTryOnResult(data.output[0]);
//       } else {
//         console.error("No output received from try-on API");
//         alert("Try-on failed. Please try again.");
//       }
//     } catch (error) {
//       console.error("Try-on failed:", error);
//       alert(`Try-on failed: ${error.message}`);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleSubmitProduct = async () => {
//     if (!productData.title || productData.title.trim() === "") {
//       setSubmitStatus("error");
//       setSubmitMessage("Product title is required");
//       setTimeout(() => setSubmitStatus(null), 5000);
//       return;
//     }
//     if (!productData.price || productData.price === "0") {
//       setSubmitStatus("error");
//       setSubmitMessage("Product price is required");
//       setTimeout(() => setSubmitStatus(null), 5000);
//       return;
//     }
//     if (!currentUser) {
//       setSubmitStatus("error");
//       setSubmitMessage("User not authenticated. Please log in again.");
//       setTimeout(() => setSubmitStatus(null), 5000);
//       return;
//     }

//     setIsSubmitting(true);
//     setSubmitStatus(null);

//     try {
//       console.log("Submitting product for user:", currentUser.uid);
//       console.log("Product data:", productData);
//       const result = await firebaseService.saveProduct(productData, currentUser.uid);
//       if (result.success) {
//         setSubmitStatus("success");
//         setSubmitMessage(`Product saved successfully! ID: ${result.productId}`);
//         updateProductData({ ...productData, id: result.productId });
//         console.log("Product saved successfully:", result);
//         setTimeout(() => navigate("/dashboard"), 2000);
//       } else {
//         throw new Error(result.message || "Failed to save product");
//       }
//     } catch (error) {
//       console.error("Error submitting product:", error);
//       setSubmitStatus("error");
//       setSubmitMessage(error.message || "Failed to save product. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//       setTimeout(() => setSubmitStatus(null), submitStatus === "success" ? 10000 : 5000);
//     }
//   };

//   const calculateTotalUnits = (units, selectedSizes, selectedColors) => {
//     if (!units || !selectedSizes || !selectedColors || selectedColors.length === 0) return 0;
//     let total = 0;
//     selectedColors.forEach((color) => {
//       if (units[color]) {
//         selectedSizes.forEach((size) => {
//           if (units[color][size]) {
//             total += parseInt(units[color][size]) || 0;
//           }
//         });
//       }
//     });
//     return total;
//   };

//   const getColorDisplayName = (colorCode) => {
//     if (colorCode.includes('_')) {
//       const [baseName] = colorCode.split('_');
//       return baseName.charAt(0).toUpperCase() + baseName.slice(1) + ' Shade';
//     }
//     return colorCode.charAt(0).toUpperCase() + colorCode.slice(1);
//   };

//   const SubmitStatusAlert = () => {
//     if (!submitStatus) return null;
//     return (
//       <div
//         className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg border ${
//           submitStatus === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
//         }`}
//       >
//         <div className="flex items-center">
//           {submitStatus === "success" ? (
//             <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
//           ) : (
//             <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
//           )}
//           <div>
//             <div className="font-medium">{submitStatus === "success" ? "Success!" : "Error"}</div>
//             <div className="text-sm mt-1">{submitMessage}</div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const ProductOverviewPage = () => (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <SubmitStatusAlert />
//       <div className="max-w-6xl mx-auto">
//         <div className="flex items-center mb-6" onClick={() => navigate(-1)}>
//           <ArrowLeft className="w-5 h-5 mr-2 text-gray-600" />
//           <span className="text-gray-800 font-medium">Product Overview</span>
//           {currentUser && (
//             <span className="ml-auto text-sm text-gray-500">User: {currentUser.email}</span>
//           )}
//         </div>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <div className="space-y-6">
//             <div className="bg-white rounded-lg border border-gray-200 p-6">
//               <div className="flex items-center mb-4">
//                 <Package className="w-5 h-5 text-[#800000] mr-2" />
//                 <span className="text-gray-700 font-medium">Product Details</span>
//               </div>
//               <div className="space-y-1">
//                 <p className="text-sm text-gray-600">Category: <span className="font-semibold">{productData.category || "No Category"}</span></p>
//                 <p className="text-sm text-gray-600">Dress Type: <span className="font-semibold">{productData.dressType || "No Type"}</span></p>
//                 <p className="text-sm text-gray-600">Fabric: <span className="font-semibold">{productData.fabric || "No Fabric"}</span></p>
//                 <p className="text-sm text-gray-600">Craft: <span className="font-semibold">{productData.craft || "No Craft"}</span></p>
//               </div>
//               {productData.description && (
//                 <div className="mt-4">
//                   <h3 className="text-sm font-medium text-gray-700 mb-2">Description:</h3>
//                   <p className="text-sm text-gray-600"><span className="font-semibold">{productData.description}</span></p>
//                 </div>
//               )}
//             </div>

// <div className="bg-white rounded-lg border border-gray-200 p-6">
//   <h3 className="text-gray-700 font-medium mb-4">Inventory by color</h3>
//   <div className="space-y-3">
//     {productData.selectedColors?.length > 0 ? (
//       productData.selectedColors.map((colorCode) => {
//         const colorName = getColorDisplayName(colorCode);
//         const colorMap = {
//           red: { name: "Red", bg: "bg-red-500" },
//           pink: { name: "Pink", bg: "bg-pink-500" },
//           blue: { name: "Blue", bg: "bg-blue-500" },
//           green: { name: "Green", bg: "bg-green-500" },
//           orange: { name: "Orange", bg: "bg-orange-500" },
//           purple: { name: "Purple", bg: "bg-purple-500" },
//           black: { name: "Black", bg: "bg-black" },
//         };
//         const color = colorMap[colorCode.split('_')[0].toLowerCase()] || {
//           name: colorName,
//           bg: "bg-gray-500",
//         };
//         return (
//           <div key={colorCode} className="flex items-center justify-between">
//             <div className="flex items-center">
//               <div className={`w-3 h-3 rounded-full ${color.bg} mr-3`}></div>
//               <span className="text-sm text-gray-700">{color.name}</span>
//             </div>
//             <span className="text-sm text-gray-500">
//               {isSareeProduct() ?
//                 // For sarees, show units if available, otherwise show "1 set"
//                 (productData.units && productData.units[colorCode] ?
//                   Object.values(productData.units[colorCode]).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0) :
//                   1
//                 ) :
//                 // For regular products, show units as before
//                 (productData.units[colorCode] ?
//                   Object.values(productData.units[colorCode]).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0) :
//                   0
//                 )
//               } {isSareeProduct() ? 'sets' : 'pcs'}
//             </span>
//           </div>
//         );
//       })
//     ) : (
//       <div className="flex items-center justify-between">
//         <div className="flex items-center">
//           <div className="w-3 h-3 rounded-full bg-gray-300 mr-3"></div>
//           <span className="text-sm text-gray-700">No colors selected</span>
//         </div>
//         <span className="text-sm text-gray-500">0 {isSareeProduct() ? 'sets' : 'pcs'}</span>
//       </div>
//     )}
//   </div>
// </div>
//           </div>

//           <div className="space-y-6">
//             <div className="bg-white rounded-lg border border-gray-200 p-6">
//               <div className="text-3xl font-bold text-gray-900 mb-1">₹ {productData.price || "0"}</div>
//               <div className="text-sm text-gray-500">Base Price</div>
//             </div>

//             <div className="bg-white rounded-lg border border-gray-200 p-6">
//               <div className="text-3xl font-bold text-gray-900 mb-1">
//                 {isSareeProduct() ?
//                   getSareeImages().length :
//                   calculateTotalUnits(productData.units, productData.selectedSizes, productData.selectedColors)
//                 }
//               </div>
//               <div className="text-sm text-gray-500">
//                 {isSareeProduct() ? "Total Components" : "Total Units"}
//               </div>
//             </div>

//             <div className="bg-white rounded-lg border border-gray-200 p-6">
//               <div className="flex items-center mb-4">
//                 <div className="w-5 h-5 text-[#800000] mr-2">
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <circle cx="12" cy="12" r="3" />
//                     <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
//                   </svg>
//                 </div>
//                 <span className="text-gray-700 font-medium">
//                   {isSareeProduct() ? "Saree Details" : "Variants & Inventory"}
//                 </span>
//               </div>

//               {!isSareeProduct() && (
//                 <div className="grid grid-cols-2 gap-4 mb-6">
//                   <div>
//                     <label className="text-sm text-gray-600 mb-1 block">Sizes</label>
//                     <div className="flex flex-wrap gap-1">
//                       {productData.selectedSizes?.length > 0 ? (
//                         productData.selectedSizes.map((size) => (
//                           <button key={size} className="px-2 py-1 text-xs border border-gray-300 rounded">
//                             {size}
//                           </button>
//                         ))
//                       ) : (
//                         <button className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-500">No sizes</button>
//                       )}
//                     </div>
//                   </div>
//                   <div>
//                     <label className="text-sm text-gray-600 mb-1 block">Colors</label>
//                     <div className="flex flex-wrap gap-1">
//                       {productData.selectedColors?.length > 0 ? (
//                         productData.selectedColors.map((colorCode) => (
//                           <div key={colorCode} className="px-2 py-1 text-xs border border-gray-300 rounded capitalize">
//                             {getColorDisplayName(colorCode)}
//                           </div>
//                         ))
//                       ) : (
//                         <button className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-500">No colors</button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="grid grid-cols-3 gap-4 text-center">
//                 <div>
//                   <div className="text-2xl font-bold text-gray-900">
//                     {isSareeProduct() ?
//                       getSareeImages().filter(img => img.type === 'part').length :
//                       (productData.selectedSizes?.length || 0) * (productData.selectedColors?.length || 1)
//                     }
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     {isSareeProduct() ? "Parts" : "Total Variants"}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold text-gray-900">
//                     {isSareeProduct() ?
//                       getSareeImages().length :
//                       (productData.imageUrls?.length || 0)
//                     }
//                   </div>
//                   <div className="text-xs text-gray-500">Images</div>
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold text-gray-900">{productData.price ? `₹${productData.price}` : "0"}</div>
//                   <div className="text-xs text-gray-500">Est. Value</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="mt-8 space-y-4">
//           <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//             <div className="flex items-center">
//               <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
//               <span className="text-green-800 font-medium">Ready to Publish</span>
//             </div>
//             <p className="text-sm text-green-700 mt-1">
//               This product will be saved to your account and can be made live for customers to purchase.
//             </p>
//           </div>
//           <div className="flex flex-col sm:flex-row gap-3">
//             <button
//               onClick={() => setIsPreviewMode(true)}
//               className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
//               disabled={isSubmitting}
//             >
//               Preview
//             </button>
//             <button
//               onClick={handleSubmitProduct}
//               disabled={isSubmitting || !currentUser}
//               className={`px-6 py-2 rounded-lg font-medium transition-colors ${
//                 isSubmitting || !currentUser ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"
//               }`}
//             >
//               {isSubmitting ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Saving...
//                 </div>
//               ) : (
//                 "Save Product"
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const ProductPreviewPage = () => {
//     const displayImages = getDisplayImages();

//     return (
//       <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//         <SubmitStatusAlert />
//         <div className="max-w-6xl mx-auto">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center">
//               <button
//                 onClick={() => setIsPreviewMode(false)}
//                 className="flex items-center text-gray-600 hover:text-gray-800"
//               >
//                 <ArrowLeft className="w-5 h-5 mr-2" />
//                 <span className="font-medium">Product Preview</span>
//               </button>
//             </div>
//             <div className="flex items-center space-x-4">
//               {currentUser && (
//                 <span className="text-sm text-gray-500">User: {currentUser.email}</span>
//               )}
//               <button className="flex items-center text-gray-600 hover:text-gray-800">
//                 <Edit className="w-4 h-4 mr-1" />
//                 <span className="text-sm">Edit</span>
//               </button>
//             </div>
//           </div>

//           <p className="text-gray-600 text-sm mb-6">
//             {isSareeProduct() ?
//               "Click on the complete saree to see try-on results" :
//               "Click on garment images to see try-on results"
//             }
//           </p>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <div className="space-y-6">
//               <div className="bg-white rounded-lg border border-gray-200 p-6">
//                 <div className="flex items-center mb-4">
//                   <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
//                     <Package className="w-4 h-4 text-blue-600" />
//                   </div>
//                   <span className="text-gray-700 font-medium">Product Details</span>
//                 </div>
//                 <div className="space-y-2">
//                   <div className="text-lg font-semibold text-gray-900">{productData.title || "Untitled Product"}</div>
//                   <div className="text-sm text-gray-600">{productData.category || "No Category"}</div>
//                   <div className="text-sm text-gray-600">{productData.dressType || "No Type"}</div>
//                   <div className="text-sm text-gray-600">{productData.fabric || "No Fabric"}</div>
//                   <div className="text-sm text-gray-600">Type: {productData.productType || "Ready to Wear"}</div>
//                 </div>
//               </div>

//               <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
//                 <div className="flex items-center mb-4">
//                   <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
//                     <Package className="w-4 h-4 text-blue-600" />
//                   </div>
//                   <span className="text-gray-700 font-medium">Pricing & Inventory</span>
//                 </div>
//                 <div className="space-y-2">
//                   <div className="text-2xl font-bold text-gray-900">₹{productData.price || "0"}</div>
//                   <div className="text-sm text-gray-500">Base Price</div>
//                   {!isSareeProduct() && (
//                     <>
//                       <div className="text-sm text-blue-600">Available Sizes: {productData.selectedSizes?.join(", ") || "None"}</div>
//                       <div className="text-sm text-blue-600">Available Colors: {productData.selectedColors?.map(getColorDisplayName).join(", ") || "None"}</div>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="lg:col-span-1">
//               <div className="bg-blue-50 rounded-lg p-6">
//                 <div className="flex gap-4">
//                   <div className="flex-1">
//                     <div className="rounded-lg overflow-hidden aspect-[3/4] relative">
//                       {isProcessing ? (
//                         <div className="absolute inset-0 flex flex-col items-center justify-center">
//                           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
//                           <div className="font-medium text-white">Processing Try-On...</div>
//                         </div>
//                       ) : tryOnResult ? (
//                         <div className="w-full h-full relative">
//                           <img src={tryOnResult} alt="Try-on Result" className="w-full h-full object-cover object-top" />
//                           <button
//                             onClick={() => setTryOnResult(null)}
//                             className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs hover:bg-opacity-70 transition-opacity"
//                           >
//                             Reset
//                           </button>
//                         </div>
//                       ) : (
//                         <div className="w-full h-full relative flex items-center justify-center">
//                           <img src={staticModelImage} alt="Model" className="w-full h-full object-cover object-top" />
//                           <div className="absolute bottom-4 left-4 right-4 text-center">
//                             <div className="text-white font-medium">Front view</div>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="w-20 space-y-3">
//                     <span className="pb-2 font-bold">Try Preview</span>
//                     {displayImages.length > 0 ? (
//                       displayImages.map((imageData, index) => (
//                         <div key={`${imageData.type}-${imageData.name}`} className="relative">
//                           <button
//                             onClick={() => handleThumbnailClick(index, imageData)}
//                             disabled={isProcessing || (isSareeProduct() && imageData.type === 'part')}
//                             className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
//                               selectedImageIndex === index ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"
//                             } ${
//                               isProcessing || (isSareeProduct() && imageData.type === 'part')
//                                 ? "opacity-50 cursor-not-allowed"
//                                 : "cursor-pointer hover:scale-105"
//                             }`}
//                           >
//                             <img
//                               src={imageData.url}
//                               alt={imageData.label}
//                               className="w-full h-full object-cover"
//                             />
//                           </button>

//                           {isSareeProduct() && (
//                             <>
//                               <div className="absolute -bottom-1 left-0 right-0">
//                                 <div className="bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded text-center">
//                                   {imageData.label}
//                                 </div>
//                               </div>
//                               {imageData.type === 'generated' && (
//                                 <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
//                               )}
//                             </>
//                           )}
//                         </div>
//                       ))
//                     ) : (
//                       Array.from({ length: 4 }).map((_, i) => (
//                         <div key={i} className="w-full aspect-square bg-pink-300 rounded-lg flex items-center justify-center">
//                           <span className="text-white text-lg">👗</span>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="mt-8">
//             <button
//               onClick={handleSubmitProduct}
//               disabled={isSubmitting || !currentUser}
//               className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
//                 isSubmitting || !currentUser ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
//               }`}
//             >
//               {isSubmitting ? (
//                 <div className="flex items-center justify-center">
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                   Saving to Firebase...
//                 </div>
//               ) : (
//                 "Submit Product"
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div>
//       {/* <TestFirebaseButton /> */}
//       {isPreviewMode ? <ProductPreviewPage /> : <ProductOverviewPage />}
//     </div>
//   );
// }

// import React, { useState } from "react";
// import { ArrowLeft, Package, Edit, CheckCircle, AlertCircle } from "lucide-react";
// import { useApp } from "../../context/Context";
// import firebaseService from "../../../SERVICES/firebaseService";
// import { useNavigate } from "react-router-dom";

// export default function TryonPreview() {
//   const [isPreviewMode, setIsPreviewMode] = useState(false);
//   const [selectedImageIndex, setSelectedImageIndex] = useState(0);
//   const [tryOnResult, setTryOnResult] = useState(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitStatus, setSubmitStatus] = useState(null);
//   const [submitMessage, setSubmitMessage] = useState("");
//   const { productData, updateProductData, currentUser } = useApp();
//   const navigate = useNavigate();

//   const TestFirebaseButton = () => {
//     const runFirestoreTests = async () => {
//       if (!currentUser) {
//         alert("Please log in first");
//         return;
//       }
//       try {
//         const testResult = await firebaseService.testFirestoreConnection(currentUser.uid);
//         if (testResult.success) {
//           console.log("All tests passed!", testResult);
//           alert("All Firestore tests passed! Check console for details.");
//         } else {
//           console.error("Tests failed:", testResult);
//           alert("Tests failed: " + testResult.error);
//         }
//       } catch (error) {
//         console.error("Test execution failed:", error);
//         alert("Test execution failed: " + error.message);
//       }
//     };

//     return (
//       <button
//         onClick={runFirestoreTests}
//         className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors z-50"
//       >
//         Test Firestore
//       </button>
//     );
//   };

//   const staticModelImage = "https://res.cloudinary.com/doiezptnn/image/upload/v1754996630/qgxzm85zvkchgssliiww.png";

//   const handleThumbnailClick = async (index) => {
//     setSelectedImageIndex(index);
//     if (!productData.imageUrls || !productData.imageUrls[index]) {
//       console.log("No garment image available");
//       return;
//     }
//     setIsProcessing(true);
//     setTryOnResult(null);
//     try {
//       const response = await fetch("/api/tryon", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           modelImage: staticModelImage,
//           garmentImage: productData.imageUrls[index],
//         }),
//       });
//       if (!response.ok) throw new Error(`Backend error: ${response.status}`);
//       const data = await response.json();
//       if (data.output && data.output.length > 0) {
//         setTryOnResult(data.output[0]);
//       } else {
//         console.error("No output received from try-on API");
//         alert("Try-on failed. Please try again.");
//       }
//     } catch (error) {
//       console.error("Try-on failed:", error);
//       alert(`Try-on failed: ${error.message}`);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleSubmitProduct = async () => {
//     if (!productData.title || productData.title.trim() === "") {
//       setSubmitStatus("error");
//       setSubmitMessage("Product title is required");
//       setTimeout(() => setSubmitStatus(null), 5000);
//       return;
//     }
//     if (!productData.price || productData.price === "0") {
//       setSubmitStatus("error");
//       setSubmitMessage("Product price is required");
//       setTimeout(() => setSubmitStatus(null), 5000);
//       return;
//     }
//     if (!currentUser) {
//       setSubmitStatus("error");
//       setSubmitMessage("User not authenticated. Please log in again.");
//       setTimeout(() => setSubmitStatus(null), 5000);
//       return;
//     }
//     setIsSubmitting(true);
//     setSubmitStatus(null);
//     try {
//       console.log("Submitting product for user:", currentUser.uid);
//       console.log("Product data:", productData);
//       const result = await firebaseService.saveProduct(productData, currentUser.uid);
//       if (result.success) {
//         setSubmitStatus("success");
//         setSubmitMessage(`Product saved successfully! ID: ${result.productId}`);
//         updateProductData({ ...productData, id: result.productId });
//         console.log("Product saved successfully:", result);
//         setTimeout(() => navigate("/dashboard"), 2000);
//       } else {
//         throw new Error(result.message || "Failed to save product");
//       }
//     } catch (error) {
//       console.error("Error submitting product:", error);
//       setSubmitStatus("error");
//       setSubmitMessage(error.message || "Failed to save product. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//       setTimeout(() => setSubmitStatus(null), submitStatus === "success" ? 10000 : 5000);
//     }
//   };

//   const calculateTotalUnits = (units, selectedSizes, selectedColors) => {
//     if (!units || !selectedSizes || !selectedColors || selectedColors.length === 0) return 0;
//     let total = 0;
//     selectedColors.forEach((color) => {
//       if (units[color]) {
//         selectedSizes.forEach((size) => {
//           if (units[color][size]) {
//             total += parseInt(units[color][size]) || 0;
//           }
//         });
//       }
//     });
//     return total;
//   };

//   const getColorDisplayName = (colorCode) => {
//     if (colorCode.includes('_')) {
//       const [baseName] = colorCode.split('_');
//       return baseName.charAt(0).toUpperCase() + baseName.slice(1) + ' Shade';
//     }
//     return colorCode.charAt(0).toUpperCase() + colorCode.slice(1);
//   };

//   const SubmitStatusAlert = () => {
//     if (!submitStatus) return null;
//     return (
//       <div
//         className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg border ${
//           submitStatus === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
//         }`}
//       >
//         <div className="flex items-center">
//           {submitStatus === "success" ? (
//             <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
//           ) : (
//             <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
//           )}
//           <div>
//             <div className="font-medium">{submitStatus === "success" ? "Success!" : "Error"}</div>
//             <div className="text-sm mt-1">{submitMessage}</div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const ProductOverviewPage = () => (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <SubmitStatusAlert />
//       <div className="max-w-6xl mx-auto">
//         <div className="flex items-center mb-6" onClick={() => navigate(-1)}>
//           <ArrowLeft className="w-5 h-5 mr-2 text-gray-600" />
//           <span className="text-gray-800 font-medium">Product Overview</span>
//           {currentUser && (
//             <span className="ml-auto text-sm text-gray-500">User: {currentUser.email}</span>
//           )}
//         </div>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <div className="space-y-6">
//            {/* // Ensure this div is properly closed */}
// <div className="bg-white rounded-lg border border-gray-200 p-6">
//   <div className="flex items-center mb-4">
//     <Package className="w-5 h-5 text-[#800000] mr-2" />
//     <span className="text-gray-700 font-medium">Product Details</span>
//   </div>
//   <div className="space-y-1">
//     <p className="text-sm text-gray-600">Category: <span className="font-semibold">{productData.category || "No Category"}</span></p>
//     <p className="text-sm text-gray-600">Dress Type: <span className="font-semibold">{productData.dressType || "No Type"}</span></p>
//     <p className="text-sm text-gray-600">Fabric: <span className="font-semibold">{productData.fabric || "No Fabric"}</span></p>
//     <p className="text-sm text-gray-600">Craft: <span className="font-semibold">{productData.craft || "No Craft"}</span></p>
//   </div>
//   {productData.description && (
//     <div className="mt-4">
//       <h3 className="text-sm font-medium text-gray-700 mb-2">Description:</h3>
//       <p className="text-sm text-gray-600"><span className="font-semibold">{productData.description}</span></p>
//     </div>
//   )}
// </div> {/* Ensure this closing tag exists */}
//             <div className="bg-white rounded-lg border border-gray-200 p-6">
//               <h3 className="text-gray-700 font-medium mb-4">Inventory by color</h3>
//               <div className="space-y-3">
//                 {productData.selectedColors?.length > 0 ? (
//                   productData.selectedColors.map((colorCode) => {
//                     const colorName = getColorDisplayName(colorCode);
//                     const colorMap = {
//                       red: { name: "Red", bg: "bg-red-500" },
//                       pink: { name: "Pink", bg: "bg-pink-500" },
//                       blue: { name: "Blue", bg: "bg-blue-500" },
//                       green: { name: "Green", bg: "bg-green-500" },
//                       orange: { name: "Orange", bg: "bg-orange-500" },
//                       purple: { name: "Purple", bg: "bg-purple-500" },
//                       black: { name: "Black", bg: "bg-black" },
//                     };
//                     const color = colorMap[colorCode.split('_')[0].toLowerCase()] || {
//                       name: colorName,
//                       bg: "bg-gray-500",
//                     };
//                     return (
//                       <div key={colorCode} className="flex items-center justify-between">
//                         <div className="flex items-center">
//                           <div className={`w-3 h-3 rounded-full ${color.bg} mr-3`}></div>
//                           <span className="text-sm text-gray-700">{color.name}</span>
//                         </div>
//                         <span className="text-sm text-gray-500">
//                           {productData.units[colorCode] ? Object.values(productData.units[colorCode]).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0) : 0} pcs
//                         </span>
//                       </div>
//                     );
//                   })
//                 ) : (
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center">
//                       <div className="w-3 h-3 rounded-full bg-gray-300 mr-3"></div>
//                       <span className="text-sm text-gray-700">No colors selected</span>
//                     </div>
//                     <span className="text-sm text-gray-500">0 pcs</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//           <div className="space-y-6">
//             <div className="bg-white rounded-lg border border-gray-200 p-6">
//               <div className="text-3xl font-bold text-gray-900 mb-1">₹ {productData.price || "0"}</div>
//               <div className="text-sm text-gray-500">Base Price</div>
//             </div>
//             <div className="bg-white rounded-lg border border-gray-200 p-6">
//               <div className="text-3xl font-bold text-gray-900 mb-1">
//                 {calculateTotalUnits(productData.units, productData.selectedSizes, productData.selectedColors)}
//               </div>
//               <div className="text-sm text-gray-500">Total Units</div>
//             </div>
//             <div className="bg-white rounded-lg border border-gray-200 p-6">
//               <div className="flex items-center mb-4">
//                 <div className="w-5 h-5 text-[#800000] mr-2">
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <circle cx="12" cy="12" r="3" />
//                     <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
//                   </svg>
//                 </div>
//                 <span className="text-gray-700 font-medium">Variants & Inventory</span>
//               </div>
//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 <div>
//                   <label className="text-sm text-gray-600 mb-1 block">Sizes</label>
//                   <div className="flex flex-wrap gap-1">
//                     {productData.selectedSizes?.length > 0 ? (
//                       productData.selectedSizes.map((size) => (
//                         <button key={size} className="px-2 py-1 text-xs border border-gray-300 rounded">
//                           {size}
//                         </button>
//                       ))
//                     ) : (
//                       <button className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-500">No sizes</button>
//                     )}
//                   </div>
//                 </div>
//                 <div>
//                   <label className="text-sm text-gray-600 mb-1 block">Colors</label>
//                   <div className="flex flex-wrap gap-1">
//                     {productData.selectedColors?.length > 0 ? (
//                       productData.selectedColors.map((colorCode) => (
//                         <div key={colorCode} className="px-2 py-1 text-xs border border-gray-300 rounded capitalize">
//                           {getColorDisplayName(colorCode)}
//                         </div>
//                       ))
//                     ) : (
//                       <button className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-500">No colors</button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="grid grid-cols-3 gap-4 text-center">
//                 <div>
//                   <div className="text-2xl font-bold text-gray-900">
//                     {(productData.selectedSizes?.length || 0) * (productData.selectedColors?.length || 1)}
//                   </div>
//                   <div className="text-xs text-gray-500">Total Variants</div>
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold text-gray-900">{productData.imageUrls?.length || 0}</div>
//                   <div className="text-xs text-gray-500">Images</div>
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold text-gray-900">{productData.price ? `₹${productData.price}` : "0"}</div>
//                   <div className="text-xs text-gray-500">Est. Value</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="mt-8 space-y-4">
//           <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//             <div className="flex items-center">
//               <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
//               <span className="text-green-800 font-medium">Ready to Publish</span>
//             </div>
//             <p className="text-sm text-green-700 mt-1">
//               This product will be saved to your account and can be made live for customers to purchase.
//             </p>
//           </div>
//           <div className="flex flex-col sm:flex-row gap-3">
//             <button
//               onClick={() => setIsPreviewMode(true)}
//               className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
//               disabled={isSubmitting}
//             >
//               Preview
//             </button>
//             <button
//               onClick={handleSubmitProduct}
//               disabled={isSubmitting || !currentUser}
//               className={`px-6 py-2 rounded-lg font-medium transition-colors ${
//                 isSubmitting || !currentUser ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"
//               }`}
//             >
//               {isSubmitting ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Saving...
//                 </div>
//               ) : (
//                 "Save Product"
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const ProductPreviewPage = () => (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <SubmitStatusAlert />
//       <div className="max-w-6xl mx-auto">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center">
//             <button
//               onClick={() => setIsPreviewMode(false)}
//               className="flex items-center text-gray-600 hover:text-gray-800"
//             >
//               <ArrowLeft className="w-5 h-5 mr-2" />
//               <span className="font-medium">Product Preview</span>
//             </button>
//           </div>
//           <div className="flex items-center space-x-4">
//             {currentUser && (
//               <span className="text-sm text-gray-500">User: {currentUser.email}</span>
//             )}
//             <button className="flex items-center text-gray-600 hover:text-gray-800">
//               <Edit className="w-4 h-4 mr-1" />
//               <span className="text-sm">Edit</span>
//             </button>
//           </div>
//         </div>
//         <p className="text-gray-600 text-sm mb-6">Click on garment images to see try-on results</p>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <div className="space-y-6">
//             <div className="bg-white rounded-lg border border-gray-200 p-6">
//               <div className="flex items-center mb-4">
//                 <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
//                   <Package className="w-4 h-4 text-blue-600" />
//                 </div>
//                 <span className="text-gray-700 font-medium">Product Details</span>
//               </div>
//               <div className="space-y-2">
//                 <div className="text-lg font-semibold text-gray-900">{productData.title || "Untitled Product"}</div>
//                 <div className="text-sm text-gray-600">{productData.category || "No Category"}</div>
//                 <div className="text-sm text-gray-600">{productData.dressType || "No Type"}</div>
//                 <div className="text-sm text-gray-600">{productData.fabric || "No Fabric"}</div>
//                 <div className="text-sm text-gray-600">Type: {productData.productType || "Ready to Wear"}</div>
//               </div>
//             </div>
//             <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
//               <div className="flex items-center mb-4">
//                 <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
//                   <Package className="w-4 h-4 text-blue-600" />
//                 </div>
//                 <span className="text-gray-700 font-medium">Pricing & Inventory</span>
//               </div>
//               <div className="space-y-2">
//                 <div className="text-2xl font-bold text-gray-900">₹{productData.price || "0"}</div>
//                 <div className="text-sm text-gray-500">Base Price</div>
//                 <div className="text-sm text-blue-600">Available Sizes: {productData.selectedSizes?.join(", ") || "None"}</div>
//                 <div className="text-sm text-blue-600">Available Colors: {productData.selectedColors?.map(getColorDisplayName).join(", ") || "None"}</div>
//               </div>
//             </div>
//           </div>
//           <div className="lg:col-span-1">
//             <div className="bg-blue-50 rounded-lg p-6">
//               <div className="flex gap-4">
//                 <div className="flex-1">
//                   <div className="rounded-lg overflow-hidden aspect-[3/4] relative">
//                     {isProcessing ? (
//                       <div className="absolute inset-0 flex flex-col items-center justify-center">
//                         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
//                         <div className="font-medium text-white">Processing Try-On...</div>
//                       </div>
//                     ) : tryOnResult ? (
//                       <div className="w-full h-full relative">
//                         <img src={tryOnResult} alt="Try-on Result" className="w-full h-full object-cover object-top" />
//                         <button
//                           onClick={() => setTryOnResult(null)}
//                           className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs hover:bg-opacity-70 transition-opacity"
//                         >
//                           Reset
//                         </button>
//                       </div>
//                     ) : (
//                       <div className="w-full h-full relative flex items-center justify-center">
//                         <img src={staticModelImage} alt="Model" className="w-full h-full object-cover object-top" />
//                         <div className="absolute bottom-4 left-4 right-4 text-center">
//                           <div className="text-white font-medium">Front view</div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 <div className="w-20 space-y-3">
//                   <span className="pb-2 font-bold">Try Preview</span>
//                   {productData.imageUrls?.length > 0 ? (
//                     productData.imageUrls.map((imageUrl, index) => (
//                       <button
//                         key={index}
//                         onClick={() => handleThumbnailClick(index)}
//                         disabled={isProcessing}
//                         className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
//                           selectedImageIndex === index ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"
//                         } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}`}
//                       >
//                         <img src={imageUrl} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
//                       </button>
//                     ))
//                   ) : (
//                     Array.from({ length: 4 }).map((_, i) => (
//                       <div key={i} className="w-full aspect-square bg-pink-300 rounded-lg flex items-center justify-center">
//                         <span className="text-white text-lg">👗</span>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="mt-8">
//           <button
//             onClick={handleSubmitProduct}
//             disabled={isSubmitting || !currentUser}
//             className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
//               isSubmitting || !currentUser ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
//             }`}
//           >
//             {isSubmitting ? (
//               <div className="flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                 Saving to Firebase...
//               </div>
//             ) : (
//               "Submit Product"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div>
//       {/* <TestFirebaseButton /> */}
//       {isPreviewMode ? <ProductPreviewPage /> : <ProductOverviewPage />}
//     </div>
//   );
// }
